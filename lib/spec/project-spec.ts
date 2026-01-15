import { z } from "zod";
import { AssetRefSchema, type AssetRef, isAssetRef, extractAssetRefs, resolveAssetRefs, convertToAssetRefs, globalAssetRef, projectAssetRef } from "./asset-ref";
import type { Project, ProjectSettings } from "@/types/project";
import type { Track, Asset } from "@/types/timeline";
import type { AnimationTemplate } from "@/types/template";

export const SPEC_VERSION = 1;

/**
 * TrackSpec schema - represents a track in the ProjectSpec
 */
export const TrackSpecSchema = z.object({
  name: z.string().optional(),
  template: z.string(),
  duration: z.number().optional(),
  templateProps: z.record(z.string(), z.any()),
});

export type TrackSpec = z.infer<typeof TrackSpecSchema>;

/**
 * ProjectSpec schema - the full export format
 */
export const ProjectSpecSchema = z.object({
  specVersion: z.number(),
  project: z.object({
    name: z.string(),
    description: z.string().optional(),
  }),
  settings: z.object({
    fps: z.number().default(30),
    width: z.number().default(1920),
    height: z.number().default(1080),
    globalFontUrl: z.string().optional(),
    globalFontPreset: z.string().optional(),
  }),
  tracks: z.array(TrackSpecSchema),
});

export type ProjectSpec = z.infer<typeof ProjectSpecSchema>;

/**
 * Import result with details about what was resolved/missing
 */
export interface ImportResult {
  project: Project;
  report: {
    tracksImported: number;
    globalAssetsResolved: number;
    projectAssetsCopied: number;
    missingGlobalAssets: string[];
    missingProjectAssets: string[];
  };
}

/**
 * Asset resolution context for import
 */
export interface AssetResolver {
  globalAssetIds: Set<string>;
  copyProjectAssets: (fromProjectId: string, assetIds: string[]) => Promise<Map<string, string>>;
}

/**
 * Export a project to ProjectSpec format
 */
export function exportProjectToSpec(
  project: Project,
  templateRegistry: Record<string, AnimationTemplate>,
  assetScopeMap: Map<string, { scope: "global" | "project"; projectId?: string }>
): ProjectSpec {
  const tracks: TrackSpec[] = project.tracks.map((track) => {
    const template = templateRegistry[track.template];
    const fileSlotIds = new Set<string>();

    if (template) {
      template.slots.forEach((slot) => {
        if (slot.type === "file") {
          fileSlotIds.add(slot.id);
        }
      });
    }

    const templateProps = convertToAssetRefs(track.templateProps, fileSlotIds, assetScopeMap);

    return {
      name: track.name,
      template: track.template,
      duration: track.duration,
      templateProps,
    };
  });

  return {
    specVersion: SPEC_VERSION,
    project: {
      name: project.metadata.name,
      description: project.metadata.description,
    },
    settings: {
      fps: project.settings.fps,
      width: project.settings.width,
      height: project.settings.height,
      globalFontUrl: project.settings.globalFontUrl,
      globalFontPreset: project.settings.globalFontPreset,
    },
    tracks,
  };
}

/**
 * Generate a new project ID
 */
function generateProjectId(): string {
  return `proj_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

/**
 * Generate a new track ID
 */
function generateTrackId(): string {
  return Math.random().toString(36).substr(2, 9);
}

/**
 * Import a ProjectSpec into a new project
 */
export async function importSpecToProject(
  spec: ProjectSpec,
  templateRegistry: Record<string, AnimationTemplate>,
  resolver: AssetResolver
): Promise<ImportResult> {
  const projectId = generateProjectId();
  const now = Date.now();

  const report = {
    tracksImported: 0,
    globalAssetsResolved: 0,
    projectAssetsCopied: 0,
    missingGlobalAssets: [] as string[],
    missingProjectAssets: [] as string[],
  };

  const allAssetRefs: AssetRef[] = [];
  spec.tracks.forEach((trackSpec) => {
    allAssetRefs.push(...extractAssetRefs(trackSpec.templateProps));
  });

  const globalRefs = allAssetRefs.filter((r) => r.scope === "global");
  const projectRefs = allAssetRefs.filter((r) => r.scope === "project");

  const idMap = new Map<string, string>();

  for (const ref of globalRefs) {
    if (resolver.globalAssetIds.has(ref.id)) {
      idMap.set(ref.id, ref.id);
      report.globalAssetsResolved++;
    } else {
      report.missingGlobalAssets.push(ref.id);
    }
  }

  const projectAssetsBySource = new Map<string, string[]>();
  for (const ref of projectRefs) {
    const sourceProjectId = ref.projectId ?? "";
    if (!projectAssetsBySource.has(sourceProjectId)) {
      projectAssetsBySource.set(sourceProjectId, []);
    }
    projectAssetsBySource.get(sourceProjectId)!.push(ref.id);
  }

  for (const [sourceProjectId, assetIds] of projectAssetsBySource) {
    if (!sourceProjectId) {
      assetIds.forEach((id) => report.missingProjectAssets.push(id));
      continue;
    }

    try {
      const copyResult = await resolver.copyProjectAssets(sourceProjectId, assetIds);
      for (const [oldId, newId] of copyResult) {
        idMap.set(oldId, newId);
        report.projectAssetsCopied++;
      }

      const copiedIds = new Set(copyResult.keys());
      assetIds.forEach((id) => {
        if (!copiedIds.has(id)) {
          report.missingProjectAssets.push(id);
        }
      });
    } catch {
      assetIds.forEach((id) => report.missingProjectAssets.push(id));
    }
  }

  const tracks: Track[] = [];
  let currentFrame = 0;

  for (const trackSpec of spec.tracks) {
    const template = templateRegistry[trackSpec.template];
    if (!template) {
      continue;
    }

    const duration = trackSpec.duration ?? 90;
    const resolvedProps = resolveAssetRefs(trackSpec.templateProps, idMap);

    const track: Track = {
      id: generateTrackId(),
      name: trackSpec.name,
      assetId: "",
      template: trackSpec.template,
      startFrame: currentFrame,
      duration,
      position: { x: 0, y: 0 },
      templateProps: resolvedProps,
    };

    tracks.push(track);
    currentFrame += duration;
    report.tracksImported++;
  }

  const project: Project = {
    metadata: {
      id: projectId,
      name: spec.project.name,
      description: spec.project.description,
      createdAt: now,
      updatedAt: now,
      version: "1.0.0",
    },
    settings: {
      fps: spec.settings.fps,
      width: spec.settings.width,
      height: spec.settings.height,
      globalFontUrl: spec.settings.globalFontUrl,
      globalFontPreset: spec.settings.globalFontPreset ?? "custom",
    },
    assets: [],
    tracks,
  };

  return { project, report };
}

/**
 * Validate a ProjectSpec JSON object
 */
export function validateProjectSpec(data: unknown): { success: true; spec: ProjectSpec } | { success: false; error: string } {
  const result = ProjectSpecSchema.safeParse(data);
  if (result.success) {
    return { success: true, spec: result.data };
  }
  return { success: false, error: result.error.message };
}

/**
 * Serialize a ProjectSpec to JSON string
 */
export function serializeProjectSpec(spec: ProjectSpec): string {
  return JSON.stringify(spec, null, 2);
}

/**
 * Parse a ProjectSpec from JSON string
 */
export function parseProjectSpec(json: string): { success: true; spec: ProjectSpec } | { success: false; error: string } {
  try {
    const data = JSON.parse(json);
    return validateProjectSpec(data);
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : "Invalid JSON" };
  }
}
