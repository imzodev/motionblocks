import { z } from "zod";

/**
 * Asset reference schema for ProjectSpec
 * Used to represent asset references in templateProps that can be resolved during import
 */
export const AssetRefSchema = z.object({
  _ref: z.literal("asset"),
  scope: z.enum(["global", "project"]),
  id: z.string(),
  projectId: z.string().optional(),
});

export type AssetRef = z.infer<typeof AssetRefSchema>;

/**
 * Check if a value is an asset reference object
 */
export function isAssetRef(value: unknown): value is AssetRef {
  if (typeof value !== "object" || value === null) return false;
  const obj = value as Record<string, unknown>;
  return obj._ref === "asset" && typeof obj.scope === "string" && typeof obj.id === "string";
}

/**
 * Create a global asset reference
 */
export function globalAssetRef(id: string): AssetRef {
  return { _ref: "asset", scope: "global", id };
}

/**
 * Create a project asset reference
 */
export function projectAssetRef(id: string, projectId: string): AssetRef {
  return { _ref: "asset", scope: "project", id, projectId };
}

/**
 * Extract all asset references from a templateProps object
 */
export function extractAssetRefs(templateProps: Record<string, unknown>): AssetRef[] {
  const refs: AssetRef[] = [];

  function walk(value: unknown): void {
    if (isAssetRef(value)) {
      refs.push(value);
    } else if (Array.isArray(value)) {
      value.forEach(walk);
    } else if (typeof value === "object" && value !== null) {
      Object.values(value).forEach(walk);
    }
  }

  walk(templateProps);
  return refs;
}

/**
 * Replace asset references in templateProps with resolved asset IDs
 * @param templateProps The original templateProps object
 * @param idMap Map from old asset IDs to new asset IDs
 * @returns New templateProps with resolved asset IDs
 */
export function resolveAssetRefs(
  templateProps: Record<string, unknown>,
  idMap: Map<string, string>
): Record<string, unknown> {
  function resolve(value: unknown): unknown {
    if (isAssetRef(value)) {
      const newId = idMap.get(value.id);
      return newId ?? value.id;
    }
    if (Array.isArray(value)) {
      return value.map(resolve);
    }
    if (typeof value === "object" && value !== null) {
      const result: Record<string, unknown> = {};
      for (const [k, v] of Object.entries(value)) {
        result[k] = resolve(v);
      }
      return result;
    }
    return value;
  }

  return resolve(templateProps) as Record<string, unknown>;
}

/**
 * Convert raw asset ID strings in templateProps to asset references
 * Used during export to create portable asset references
 */
export function convertToAssetRefs(
  templateProps: Record<string, unknown>,
  fileSlotIds: Set<string>,
  assetScopeMap: Map<string, { scope: "global" | "project"; projectId?: string }>
): Record<string, unknown> {
  const result: Record<string, unknown> = { ...templateProps };

  for (const slotId of fileSlotIds) {
    const value = result[slotId];
    if (typeof value === "string" && value.startsWith("asset_")) {
      const scopeInfo = assetScopeMap.get(value);
      if (scopeInfo) {
        if (scopeInfo.scope === "global") {
          result[slotId] = globalAssetRef(value);
        } else {
          result[slotId] = projectAssetRef(value, scopeInfo.projectId ?? "");
        }
      } else {
        result[slotId] = projectAssetRef(value, "");
      }
    }
  }

  return result;
}
