"use client";

import React, { useState, useRef } from "react";
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
import { Upload, Loader2, X, Image } from "lucide-react";
import { useAssetUpload } from "@/lib/admin/hooks";
import type { AssetMetadata } from "@/lib/admin/types";

interface GlobalAssetUploadProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function GlobalAssetUpload({ open, onOpenChange, onSuccess }: GlobalAssetUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [metadata, setMetadata] = useState<AssetMetadata>({
    name: "",
    description: "",
    whenToUse: "",
    tags: [],
  });
  const [tagsInput, setTagsInput] = useState("");

  const { upload, isUploading, error } = useAssetUpload();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    setMetadata((prev) => ({ ...prev, name: file.name.replace(/\.[^/.]+$/, "") }));

    if (file.type.startsWith("image/") || file.type.startsWith("video/")) {
      const url = URL.createObjectURL(file);
      setPreview(url);
    } else {
      setPreview(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return;

    const tags = tagsInput
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    const result = await upload(selectedFile, { ...metadata, tags });
    if (result) {
      resetForm();
      onSuccess();
      onOpenChange(false);
    }
  };

  const resetForm = () => {
    setSelectedFile(null);
    setPreview(null);
    setMetadata({ name: "", description: "", whenToUse: "", tags: [] });
    setTagsInput("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleClose = () => {
    resetForm();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Upload Global Asset</DialogTitle>
          <DialogDescription>
            Upload a new asset to the global library with AI-friendly metadata.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,video/*,.svg"
            className="hidden"
            onChange={handleFileSelect}
          />

          {!selectedFile ? (
            <div
              className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 transition-colors"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                Click to select or drag and drop
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Images, videos, or SVG files
              </p>
            </div>
          ) : (
            <div className="relative border rounded-lg overflow-hidden">
              {preview ? (
                selectedFile.type.startsWith("video/") ? (
                  <video src={preview} className="w-full h-40 object-cover" controls />
                ) : (
                  <img src={preview} alt="Preview" className="w-full h-40 object-cover" />
                )
              ) : (
                <div className="w-full h-40 bg-muted flex items-center justify-center">
                  <Image className="h-12 w-12 text-muted-foreground" />
                </div>
              )}
              <Button
                type="button"
                size="icon"
                variant="destructive"
                className="absolute top-2 right-2 h-8 w-8"
                onClick={() => {
                  setSelectedFile(null);
                  setPreview(null);
                  if (fileInputRef.current) fileInputRef.current.value = "";
                }}
              >
                <X className="h-4 w-4" />
              </Button>
              <div className="absolute bottom-2 left-2 bg-background/80 px-2 py-1 rounded text-xs">
                {selectedFile.name}
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              value={metadata.name}
              onChange={(e) => setMetadata((prev) => ({ ...prev, name: e.target.value }))}
              placeholder="Asset name"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={metadata.description}
              onChange={(e) => setMetadata((prev) => ({ ...prev, description: e.target.value }))}
              placeholder="Brief description of the asset"
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="whenToUse">When to Use</Label>
            <Textarea
              id="whenToUse"
              value={metadata.whenToUse}
              onChange={(e) => setMetadata((prev) => ({ ...prev, whenToUse: e.target.value }))}
              placeholder="Describe when AI should use this asset"
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="tags">Tags (comma-separated)</Label>
            <Input
              id="tags"
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
            <Button type="submit" disabled={!selectedFile || isUploading}>
              {isUploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                "Upload Asset"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
