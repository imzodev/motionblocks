"use client";

import React, { useState } from "react";
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
import { Loader2, ArrowUpCircle } from "lucide-react";
import { useAssetPromotion } from "@/lib/admin/hooks";

interface PromoteAssetModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function PromoteAssetModal({ open, onOpenChange, onSuccess }: PromoteAssetModalProps) {
  const [projectId, setProjectId] = useState("");
  const [assetId, setAssetId] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [whenToUse, setWhenToUse] = useState("");
  const [tagsInput, setTagsInput] = useState("");

  const { promote, isPromoting, error } = useAssetPromotion();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const tags = tagsInput
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    const result = await promote(projectId, assetId, {
      name,
      description: description || undefined,
      whenToUse: whenToUse || undefined,
      tags: tags.length > 0 ? tags : undefined,
    });

    if (result) {
      resetForm();
      onSuccess();
      onOpenChange(false);
    }
  };

  const resetForm = () => {
    setProjectId("");
    setAssetId("");
    setName("");
    setDescription("");
    setWhenToUse("");
    setTagsInput("");
  };

  const handleClose = () => {
    resetForm();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ArrowUpCircle className="h-5 w-5 text-primary" />
            Promote to Global
          </DialogTitle>
          <DialogDescription>
            Promote a project asset to the global library. The asset will be copied and made available globally.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="projectId">Project ID *</Label>
              <Input
                id="projectId"
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                placeholder="proj_..."
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="assetId">Asset ID *</Label>
              <Input
                id="assetId"
                value={assetId}
                onChange={(e) => setAssetId(e.target.value)}
                placeholder="asset_..."
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="promote-name">Name *</Label>
            <Input
              id="promote-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Global asset name"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="promote-description">Description</Label>
            <Textarea
              id="promote-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of the asset"
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="promote-whenToUse">When to Use</Label>
            <Textarea
              id="promote-whenToUse"
              value={whenToUse}
              onChange={(e) => setWhenToUse(e.target.value)}
              placeholder="Describe when AI should use this asset"
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="promote-tags">Tags (comma-separated)</Label>
            <Input
              id="promote-tags"
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
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPromoting}>
              {isPromoting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Promoting...
                </>
              ) : (
                "Promote Asset"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
