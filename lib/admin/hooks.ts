"use client";

import { useState, useEffect, useCallback } from "react";
import type { GlobalAsset, AssetMetadata, AssetFilter } from "./types";

/**
 * Hook for fetching and managing global assets
 * Single Responsibility: Data fetching and state management for global assets
 */
export function useGlobalAssets() {
  const [assets, setAssets] = useState<GlobalAsset[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAssets = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/assets/global");
      if (!res.ok) throw new Error("Failed to fetch assets");
      const data = await res.json();
      setAssets(data.assets || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAssets();
  }, [fetchAssets]);

  return { assets, isLoading, error, refetch: fetchAssets };
}

/**
 * Hook for filtering assets
 * Single Responsibility: Asset filtering logic
 */
export function useAssetFilter(assets: GlobalAsset[], filter: AssetFilter) {
  const filteredAssets = assets.filter((asset) => {
    if (filter.type !== "all" && asset.type !== filter.type) {
      return false;
    }

    if (filter.search) {
      const searchLower = filter.search.toLowerCase();
      const matchesName = asset.name?.toLowerCase().includes(searchLower);
      const matchesOriginal = asset.originalName?.toLowerCase().includes(searchLower);
      const matchesId = asset.id.toLowerCase().includes(searchLower);
      const matchesTags = asset.tags?.some((tag) => tag.toLowerCase().includes(searchLower));

      if (!matchesName && !matchesOriginal && !matchesId && !matchesTags) {
        return false;
      }
    }

    if (filter.tags.length > 0) {
      const hasMatchingTag = filter.tags.some((filterTag) =>
        asset.tags?.some((assetTag) => assetTag.toLowerCase() === filterTag.toLowerCase())
      );
      if (!hasMatchingTag) return false;
    }

    return true;
  });

  return filteredAssets;
}

/**
 * Hook for uploading global assets
 * Single Responsibility: Asset upload operations
 */
export function useAssetUpload() {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const upload = async (file: File, metadata: AssetMetadata): Promise<GlobalAsset | null> => {
    setIsUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      if (metadata.name) formData.append("name", metadata.name);
      if (metadata.description) formData.append("description", metadata.description);
      if (metadata.whenToUse) formData.append("whenToUse", metadata.whenToUse);
      if (metadata.tags) formData.append("tags", metadata.tags.join(","));

      const res = await fetch("/api/assets/global", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Upload failed");
      }

      const data = await res.json();
      return data.asset;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  return { upload, isUploading, error };
}

/**
 * Hook for updating asset metadata
 * Single Responsibility: Asset metadata update operations
 */
export function useAssetMetadataUpdate() {
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateMetadata = async (assetId: string, metadata: AssetMetadata): Promise<boolean> => {
    setIsUpdating(true);
    setError(null);

    try {
      const res = await fetch(`/api/assets/global/${assetId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(metadata),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Update failed");
      }

      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Update failed");
      return false;
    } finally {
      setIsUpdating(false);
    }
  };

  return { updateMetadata, isUpdating, error };
}

/**
 * Hook for promoting project assets to global
 * Single Responsibility: Asset promotion operations
 */
export function useAssetPromotion() {
  const [isPromoting, setIsPromoting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const promote = async (
    projectId: string,
    assetId: string,
    metadata: AssetMetadata & { name: string }
  ): Promise<GlobalAsset | null> => {
    setIsPromoting(true);
    setError(null);

    try {
      const res = await fetch("/api/assets/promote-to-global", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId, assetId, ...metadata }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Promotion failed");
      }

      const data = await res.json();
      return data.asset;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Promotion failed");
      return null;
    } finally {
      setIsPromoting(false);
    }
  };

  return { promote, isPromoting, error };
}
