import { z } from "zod";
import { Asset, AssetSchema } from "./timeline";
import { Track, TrackSchema } from "./timeline";

/**
 * Project metadata and configuration
 */
export const ProjectMetadataSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  createdAt: z.number(),
  updatedAt: z.number(),
  version: z.string().default("1.0.0"),
});

export type ProjectMetadata = z.infer<typeof ProjectMetadataSchema>;

/**
 * Global project settings
 */
export const ProjectSettingsSchema = z.object({
  fps: z.number().default(30),
  width: z.number().default(1920),
  height: z.number().default(1080),
  globalFontUrl: z.string().optional(),
  globalFontPreset: z.string().default("custom"),
});

export type ProjectSettings = z.infer<typeof ProjectSettingsSchema>;

/**
 * Complete project structure
 */
export const ProjectSchema = z.object({
  metadata: ProjectMetadataSchema,
  settings: ProjectSettingsSchema,
  assets: z.array(AssetSchema),
  tracks: z.array(TrackSchema),
});

export type Project = z.infer<typeof ProjectSchema>;

/**
 * Project list item (for listing projects without loading full data)
 */
export const ProjectListItemSchema = ProjectMetadataSchema.pick({
  id: true,
  name: true,
  description: true,
  createdAt: true,
  updatedAt: true,
  version: true,
}).extend({
  trackCount: z.number(),
  assetCount: z.number(),
});

export type ProjectListItem = z.infer<typeof ProjectListItemSchema>;

/**
 * Project creation parameters
 */
export interface CreateProjectParams {
  name: string;
  description?: string;
  settings?: Partial<ProjectSettings>;
}

/**
 * Project update parameters
 */
export interface UpdateProjectParams {
  name?: string;
  description?: string;
  settings?: Partial<ProjectSettings>;
}
