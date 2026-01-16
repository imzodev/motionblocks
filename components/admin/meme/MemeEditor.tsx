"use client";

import React, { useState, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Plus, Save, Loader2, Type, Globe, FolderOpen } from "lucide-react";
import { MemeCanvas } from "./MemeCanvas";
import { TextOverlayControls } from "./TextOverlayControls";
import type { TextOverlay, MemeConfig, SaveMemeParams } from "@/lib/admin/meme-types";
import { DEFAULT_TEXT_OVERLAY } from "@/lib/admin/meme-types";
import type { GlobalAsset } from "@/lib/admin/types";

interface MemeEditorProps {
  asset: GlobalAsset;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved: () => void;
}

export function MemeEditor({ asset, open, onOpenChange, onSaved }: MemeEditorProps) {
  const [config, setConfig] = useState<MemeConfig>(() => ({
    sourceAssetId: asset.id,
    sourceAssetSrc: asset.src,
    sourceAssetType: asset.type as "image" | "video",
    textOverlays: [],
    width: 800,
    height: 600,
  }));

  const [selectedTextId, setSelectedTextId] = useState<string | null>(null);
  const [exportedImage, setExportedImage] = useState<string>("");
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [saveAs, setSaveAs] = useState<"global" | "project">("global");
  const [projectId, setProjectId] = useState("");
  const [metadata, setMetadata] = useState({
    name: "",
    description: "",
    whenToUse: "",
    tags: "",
  });
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    if (open && config.textOverlays.length === 0) {
      const firstOverlay: TextOverlay = {
        ...DEFAULT_TEXT_OVERLAY,
        id: `text_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        y: 10,
      };
      setConfig((prev) => ({
        ...prev,
        textOverlays: [firstOverlay],
      }));
      setSelectedTextId(firstOverlay.id);
    }
  }, [open]);

  const addTextOverlay = () => {
    const newOverlay: TextOverlay = {
      ...DEFAULT_TEXT_OVERLAY,
      id: `text_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      y: config.textOverlays.length === 0 ? 10 : 90 - config.textOverlays.length * 10,
    };
    setConfig((prev) => ({
      ...prev,
      textOverlays: [...prev.textOverlays, newOverlay],
    }));
    setSelectedTextId(newOverlay.id);
  };

  const updateTextOverlay = (updated: TextOverlay) => {
    setConfig((prev) => ({
      ...prev,
      textOverlays: prev.textOverlays.map((t) => (t.id === updated.id ? updated : t)),
    }));
  };

  const deleteTextOverlay = (id: string) => {
    setConfig((prev) => ({
      ...prev,
      textOverlays: prev.textOverlays.filter((t) => t.id !== id),
    }));
    if (selectedTextId === id) {
      setSelectedTextId(null);
    }
  };

  const handleTextMove = (id: string, x: number, y: number) => {
    setConfig((prev) => ({
      ...prev,
      textOverlays: prev.textOverlays.map((t) => (t.id === id ? { ...t, x, y } : t)),
    }));
  };

  const handleExport = useCallback((dataUrl: string) => {
    setExportedImage(dataUrl);
  }, []);

  const handleSave = async () => {
    if (!exportedImage) return;

    setIsSaving(true);
    setSaveError(null);

    try {
      const blob = await fetch(exportedImage).then((r) => r.blob());
      const file = new File([blob], `meme_${Date.now()}.png`, { type: "image/png" });

      const formData = new FormData();
      formData.append("file", file);
      formData.append("name", metadata.name || `Meme from ${asset.name || asset.originalName}`);
      if (metadata.description) formData.append("description", metadata.description);
      if (metadata.whenToUse) formData.append("whenToUse", metadata.whenToUse);
      if (metadata.tags) formData.append("tags", metadata.tags);

      let url = "/api/assets/global";
      if (saveAs === "project" && projectId) {
        url = `/api/assets/upload?projectId=${encodeURIComponent(projectId)}`;
      }

      const res = await fetch(url, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to save meme");
      }

      setShowSaveDialog(false);
      onSaved();
      onOpenChange(false);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setIsSaving(false);
    }
  };

  const selectedOverlay = config.textOverlays.find((t) => t.id === selectedTextId);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Meme Creator</DialogTitle>
          <DialogDescription>
            Add text overlays to create a meme from {asset.name || asset.originalName}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 grid grid-cols-[1fr_320px] gap-4 min-h-0">
          <div className="flex flex-col gap-4">
            <div className="flex-1 min-h-0 flex items-center justify-center bg-muted/30 rounded-lg p-4">
              <MemeCanvas
                config={config}
                selectedTextId={selectedTextId}
                onTextSelect={setSelectedTextId}
                onTextMove={handleTextMove}
                onExport={handleExport}
              />
            </div>
            <div className="flex items-center gap-2">
              <Button onClick={addTextOverlay}>
                <Plus className="h-4 w-4 mr-2" />
                Add Text
              </Button>
              <div className="flex-1" />
              <Button
                variant="default"
                onClick={() => {
                  setMetadata({
                    name: `Meme - ${asset.name || asset.originalName}`,
                    description: "",
                    whenToUse: "",
                    tags: "meme",
                  });
                  setShowSaveDialog(true);
                }}
                disabled={config.textOverlays.length === 0}
              >
                <Save className="h-4 w-4 mr-2" />
                Save Meme
              </Button>
            </div>
          </div>

          <ScrollArea className="h-full">
            <div className="space-y-4 pr-4">
              <Card>
                <CardHeader className="py-3 px-4">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Type className="h-4 w-4" />
                    Text Layers ({config.textOverlays.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-4 pb-4">
                  {config.textOverlays.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      Click "Add Text" to add your first text overlay
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {config.textOverlays.map((overlay) => (
                        <Button
                          key={overlay.id}
                          variant={selectedTextId === overlay.id ? "default" : "outline"}
                          className="w-full justify-start text-left h-auto py-2"
                          onClick={() => setSelectedTextId(overlay.id)}
                        >
                          <span className="truncate">{overlay.text || "(empty)"}</span>
                        </Button>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {selectedOverlay && (
                <TextOverlayControls
                  overlay={selectedOverlay}
                  onChange={updateTextOverlay}
                  onDelete={() => deleteTextOverlay(selectedOverlay.id)}
                />
              )}
            </div>
          </ScrollArea>
        </div>

        <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Save Meme</DialogTitle>
              <DialogDescription>
                Choose where to save your meme and add metadata.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="flex gap-2">
                <Button
                  variant={saveAs === "global" ? "default" : "outline"}
                  className="flex-1"
                  onClick={() => setSaveAs("global")}
                >
                  <Globe className="h-4 w-4 mr-2" />
                  Global Library
                </Button>
                <Button
                  variant={saveAs === "project" ? "default" : "outline"}
                  className="flex-1"
                  onClick={() => setSaveAs("project")}
                >
                  <FolderOpen className="h-4 w-4 mr-2" />
                  Project
                </Button>
              </div>

              {saveAs === "project" && (
                <div className="space-y-2">
                  <Label htmlFor="project-id">Project ID</Label>
                  <Input
                    id="project-id"
                    value={projectId}
                    onChange={(e) => setProjectId(e.target.value)}
                    placeholder="proj_..."
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="meme-name">Name *</Label>
                <Input
                  id="meme-name"
                  value={metadata.name}
                  onChange={(e) => setMetadata((p) => ({ ...p, name: e.target.value }))}
                  placeholder="Meme name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="meme-description">Description</Label>
                <Textarea
                  id="meme-description"
                  value={metadata.description}
                  onChange={(e) => setMetadata((p) => ({ ...p, description: e.target.value }))}
                  placeholder="Brief description"
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="meme-whenToUse">When to Use</Label>
                <Textarea
                  id="meme-whenToUse"
                  value={metadata.whenToUse}
                  onChange={(e) => setMetadata((p) => ({ ...p, whenToUse: e.target.value }))}
                  placeholder="When AI should use this meme"
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="meme-tags">Tags (comma-separated)</Label>
                <Input
                  id="meme-tags"
                  value={metadata.tags}
                  onChange={(e) => setMetadata((p) => ({ ...p, tags: e.target.value }))}
                  placeholder="meme, funny, reaction"
                />
              </div>

              {saveError && (
                <div className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md p-3">
                  {saveError}
                </div>
              )}
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowSaveDialog(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                disabled={isSaving || !metadata.name || (saveAs === "project" && !projectId)}
              >
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Meme"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </DialogContent>
    </Dialog>
  );
}
