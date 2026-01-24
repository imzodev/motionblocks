"use client";

import React, { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Plus,
  Search,
  ArrowUpCircle,
  Loader2,
  Image,
  Video,
  FileText,
  FileCode,
  RefreshCw,
  Sparkles,
} from "lucide-react";
import { useGlobalAssets, useAssetFilter } from "@/lib/admin/hooks";
import { GlobalAssetCard } from "./GlobalAssetCard";
import { GlobalAssetUpload } from "./GlobalAssetUpload";
import { GlobalAssetEditor } from "./GlobalAssetEditor";
import { PromoteAssetModal } from "./PromoteAssetModal";
import { MemeEditor } from "./meme";
import type { GlobalAsset, AssetFilter } from "@/lib/admin/types";

const typeFilters = [
  { value: "all", label: "All", icon: null },
  { value: "image", label: "Images", icon: Image },
  { value: "video", label: "Videos", icon: Video },
  { value: "svg", label: "SVG", icon: FileCode },
  { value: "text", label: "Text", icon: FileText },
] as const;

export function GlobalAssetsManager() {
  const { assets, isLoading, error, refetch } = useGlobalAssets();

  const [filter, setFilter] = useState<AssetFilter>({
    search: "",
    type: "all",
    tags: [],
  });

  const [showUpload, setShowUpload] = useState(false);
  const [showPromote, setShowPromote] = useState(false);
  const [editingAsset, setEditingAsset] = useState<GlobalAsset | null>(null);
  const [memeAsset, setMemeAsset] = useState<GlobalAsset | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [confirmDeleteAsset, setConfirmDeleteAsset] = useState<GlobalAsset | null>(null);
  const [confirmDeleteSelectedOpen, setConfirmDeleteSelectedOpen] = useState(false);

  const filteredAssets = useAssetFilter(assets, filter);

  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    assets.forEach((asset) => {
      asset.tags?.forEach((tag) => tagSet.add(tag));
    });
    return Array.from(tagSet).sort();
  }, [assets]);

  const handleCopyId = (id: string) => {
    navigator.clipboard.writeText(id);
  };

  const toggleSelected = (asset: GlobalAsset) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(asset.id)) {
        next.delete(asset.id);
      } else {
        next.add(asset.id);
      }
      return next;
    });
  };

  const requestDeleteOne = (asset: GlobalAsset) => {
    setDeleteError(null);
    setConfirmDeleteAsset(asset);
  };

  const handleDeleteOne = async (asset: GlobalAsset) => {
    setIsDeleting(true);
    setDeleteError(null);
    try {
      const res = await fetch(`/api/assets/global/${asset.id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as { message?: string; error?: string } | null;
        throw new Error(data?.message || data?.error || "Delete failed");
      }
      setSelectedIds((prev) => {
        const next = new Set(prev);
        next.delete(asset.id);
        return next;
      });
      await refetch();
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : "Delete failed");
      throw err;
    } finally {
      setIsDeleting(false);
    }
  };

  const requestDeleteSelected = () => {
    if (selectedIds.size === 0) return;
    setDeleteError(null);
    setConfirmDeleteSelectedOpen(true);
  };

  const handleDeleteSelected = async () => {
    const ids = Array.from(selectedIds);
    if (ids.length === 0) return;

    setIsDeleting(true);
    setDeleteError(null);
    try {
      const res = await fetch("/api/assets/global", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assetIds: ids }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as { message?: string; error?: string } | null;
        throw new Error(data?.message || data?.error || "Bulk delete failed");
      }
      setSelectedIds(new Set());
      await refetch();
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : "Bulk delete failed");
      throw err;
    } finally {
      setIsDeleting(false);
    }
  };

  const handleTagClick = (tag: string) => {
    setFilter((prev) => {
      const newTags = prev.tags.includes(tag)
        ? prev.tags.filter((t) => t !== tag)
        : [...prev.tags, tag];
      return { ...prev, tags: newTags };
    });
  };

  return (
    <div className="h-full flex flex-col">
      <div className="border-b p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Global Assets</h1>
            <p className="text-sm text-muted-foreground">
              Manage the global asset library for AI-generated projects
            </p>
          </div>
          <div className="flex items-center gap-2">
            {selectedIds.size > 0 && (
              <Button
                variant="destructive"
                disabled={isLoading || isDeleting}
                onClick={requestDeleteSelected}
              >
                Delete Selected ({selectedIds.size})
              </Button>
            )}
            <Button variant="outline" size="icon" onClick={refetch} disabled={isLoading}>
              <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            </Button>
            <Button variant="outline" onClick={() => setShowPromote(true)}>
              <ArrowUpCircle className="h-4 w-4 mr-2" />
              Promote
            </Button>
            <Button onClick={() => setShowUpload(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Upload
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, tags, or ID..."
              value={filter.search}
              onChange={(e) => setFilter((prev) => ({ ...prev, search: e.target.value }))}
              className="pl-10"
            />
          </div>

          <div className="flex items-center gap-1">
            {typeFilters.map(({ value, label, icon: Icon }) => (
              <Button
                key={value}
                variant={filter.type === value ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter((prev) => ({ ...prev, type: value }))}
              >
                {Icon && <Icon className="h-4 w-4 mr-1" />}
                {label}
              </Button>
            ))}
          </div>
        </div>

        {allTags.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-muted-foreground">Tags:</span>
            {allTags.map((tag) => (
              <Badge
                key={tag}
                variant={filter.tags.includes(tag) ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => handleTagClick(tag)}
              >
                {tag}
              </Badge>
            ))}
            {filter.tags.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="h-6 text-xs"
                onClick={() => setFilter((prev) => ({ ...prev, tags: [] }))}
              >
                Clear
              </Button>
            )}
          </div>
        )}
      </div>

      <ScrollArea className="flex-1 min-h-0">
        <div className="p-4">
          {deleteError && (
            <Card className="mb-4 bg-destructive/10 border-destructive/20">
              <CardContent className="py-3">
                <p className="text-sm text-destructive">{deleteError}</p>
              </CardContent>
            </Card>
          )}
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : error ? (
            <Card className="bg-destructive/10 border-destructive/20">
              <CardContent className="py-6 text-center">
                <p className="text-destructive">{error}</p>
                <Button variant="outline" className="mt-4" onClick={refetch}>
                  Try Again
                </Button>
              </CardContent>
            </Card>
          ) : filteredAssets.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Image className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">
                  {assets.length === 0
                    ? "No global assets yet. Upload your first asset!"
                    : "No assets match your filters."}
                </p>
                {assets.length === 0 && (
                  <Button className="mt-4" onClick={() => setShowUpload(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Upload Asset
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredAssets.map((asset) => (
                <GlobalAssetCard
                  key={asset.id}
                  asset={asset}
                  onEdit={setEditingAsset}
                  onCopyId={handleCopyId}
                  onCreateMeme={setMemeAsset}
                  onDelete={requestDeleteOne}
                  selected={selectedIds.has(asset.id)}
                  onToggleSelected={toggleSelected}
                />
              ))}
            </div>
          )}
        </div>
      </ScrollArea>

      <AlertDialog
        open={!!confirmDeleteAsset}
        onOpenChange={(open) => {
          if (!open) setConfirmDeleteAsset(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete asset?</AlertDialogTitle>
            <AlertDialogDescription>
              This cannot be undone.
              {confirmDeleteAsset && (
                <span className="block mt-2 break-all">
                  {confirmDeleteAsset.name || confirmDeleteAsset.originalName || confirmDeleteAsset.id}
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel asChild>
              <Button variant="outline" disabled={isDeleting}>
                Cancel
              </Button>
            </AlertDialogCancel>
            <AlertDialogAction asChild>
              <Button
                variant="destructive"
                disabled={!confirmDeleteAsset || isDeleting}
                onClick={async () => {
                  if (!confirmDeleteAsset) return;
                  try {
                    await handleDeleteOne(confirmDeleteAsset);
                    setConfirmDeleteAsset(null);
                  } catch {
                    // error handled via state
                  }
                }}
              >
                Delete
              </Button>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={confirmDeleteSelectedOpen} onOpenChange={setConfirmDeleteSelectedOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete selected assets?</AlertDialogTitle>
            <AlertDialogDescription>
              This cannot be undone.
              <span className="block mt-2">Selected: {selectedIds.size}</span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel asChild>
              <Button variant="outline" disabled={isDeleting}>
                Cancel
              </Button>
            </AlertDialogCancel>
            <AlertDialogAction asChild>
              <Button
                variant="destructive"
                disabled={selectedIds.size === 0 || isDeleting}
                onClick={async () => {
                  try {
                    await handleDeleteSelected();
                    setConfirmDeleteSelectedOpen(false);
                  } catch {
                    // error handled via state
                  }
                }}
              >
                Delete
              </Button>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="border-t p-3 bg-muted/30">
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>
            {filteredAssets.length} of {assets.length} assets
          </span>
          <span>Global Asset Library</span>
        </div>
      </div>

      <GlobalAssetUpload
        open={showUpload}
        onOpenChange={setShowUpload}
        onSuccess={refetch}
      />

      <GlobalAssetEditor
        asset={editingAsset}
        open={!!editingAsset}
        onOpenChange={(open) => !open && setEditingAsset(null)}
        onSuccess={refetch}
      />

      <PromoteAssetModal
        open={showPromote}
        onOpenChange={setShowPromote}
        onSuccess={refetch}
      />

      {memeAsset && (
        <MemeEditor
          asset={memeAsset}
          open={!!memeAsset}
          onOpenChange={(open) => !open && setMemeAsset(null)}
          onSaved={refetch}
        />
      )}
    </div>
  );
}
