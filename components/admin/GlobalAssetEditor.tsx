"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader2, Image, Video, FileText, FileCode } from "lucide-react";
import { useAssetMetadataUpdate } from "@/lib/admin/hooks";
import type { GlobalAsset, AssetMetadata } from "@/lib/admin/types";

interface GlobalAssetEditorProps {
  asset: GlobalAsset | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

const typeIcons = {
  image: Image,
  video: Video,
  text: FileText,
  svg: FileCode,
};

export function GlobalAssetEditor({ asset, open, onOpenChange, onSuccess }: GlobalAssetEditorProps) {
  const [metadata, setMetadata] = useState<AssetMetadata>({
    name: "",
    description: "",
    whenToUse: "",
    tags: [],
  });
  const [tagsInput, setTagsInput] = useState("");

  const { updateMetadata, isUpdating, error } = useAssetMetadataUpdate();

  useEffect(() => {
    if (asset) {
      setMetadata({
        name: asset.name || "",
        description: asset.description || "",
        whenToUse: asset.whenToUse || "",
        tags: asset.tags || [],
      });
      setTagsInput(asset.tags?.join(", ") || "");
    }
  }, [asset]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!asset) return;

    const tags = tagsInput
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    const success = await updateMetadata(asset.id, { ...metadata, tags });
    if (success) {
      onSuccess();
      onOpenChange(false);
    }
  };

  if (!asset) return null;

  const TypeIcon = typeIcons[asset.type] || Image;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit Asset Metadata</DialogTitle>
          <DialogDescription>
            Update the AI-friendly metadata for this global asset.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="border rounded-lg overflow-hidden">
            {asset.type === "image" && (
              <img src={asset.src} alt={asset.name} className="w-full h-40 object-cover" />
            )}
            {asset.type === "video" && (
              <video src={asset.src} className="w-full h-40 object-cover" controls />
            )}
            {(asset.type === "svg" || asset.type === "text") && (
              <div className="w-full h-40 bg-muted flex items-center justify-center">
                <TypeIcon className="h-12 w-12 text-muted-foreground" />
              </div>
            )}
          </div>

          <div className="bg-muted/50 rounded-md p-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">ID</span>
              <code className="text-xs bg-background px-2 py-0.5 rounded">{asset.id}</code>
            </div>
            <div className="flex justify-between mt-1">
              <span className="text-muted-foreground">Original Name</span>
              <span>{asset.originalName}</span>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-name">Name</Label>
            <Input
              id="edit-name"
              value={metadata.name}
              onChange={(e) => setMetadata((prev) => ({ ...prev, name: e.target.value }))}
              placeholder="Asset name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-description">Description</Label>
            <Textarea
              id="edit-description"
              value={metadata.description}
              onChange={(e) => setMetadata((prev) => ({ ...prev, description: e.target.value }))}
              placeholder="Brief description of the asset"
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-whenToUse">When to Use</Label>
            <Textarea
              id="edit-whenToUse"
              value={metadata.whenToUse}
              onChange={(e) => setMetadata((prev) => ({ ...prev, whenToUse: e.target.value }))}
              placeholder="Describe when AI should use this asset"
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-tags">Tags (comma-separated)</Label>
            <Input
              id="edit-tags"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="meme, funny, reaction"
            />
          </div>

          {error && (
            <div className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md p-3">
              {error}
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isUpdating}>
              {isUpdating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
