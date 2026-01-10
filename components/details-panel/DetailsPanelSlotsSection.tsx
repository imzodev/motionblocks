"use client";

import React, { useState } from "react";
import type { Track, Asset } from "@/types/timeline";
import type { AnimationTemplate, TemplateSlot } from "@/types/template";
import { Database, Layout, TypeIcon, FileIcon, VideoIcon, X, ChevronDown, Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

interface DetailsPanelSlotsSectionProps {
  selectedTrack: Track;
  template?: AnimationTemplate;
  assets: Asset[];
  onSlotUpdate: (slotId: string, value: unknown) => void;
}

function shouldRenderSlot(selectedTrack: Track, slot: TemplateSlot) {
  if (selectedTrack.template === "kinetic-text" && slot.id === "script") return false;
  return true;
}

export function DetailsPanelSlotsSection({
  selectedTrack,
  template,
  assets,
  onSlotUpdate,
}: DetailsPanelSlotsSectionProps) {
  const [openFileSlotId, setOpenFileSlotId] = useState<string | null>(null);

  const slideScaleKeysBySlotId: Record<"asset" | "asset2" | "asset3", { x: string; y: string }> = {
    asset: { x: "assetScaleX", y: "assetScaleY" },
    asset2: { x: "asset2ScaleX", y: "asset2ScaleY" },
    asset3: { x: "asset3ScaleX", y: "asset3ScaleY" },
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Database className="w-3.5 h-3.5 text-muted-foreground" />
          <h4 className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest">Slots</h4>
        </div>
        {!template && (
          <Badge variant="secondary" className="text-[10px] uppercase tracking-widest">
            none
          </Badge>
        )}
      </div>

      {template?.slots
        .filter((slot) => shouldRenderSlot(selectedTrack, slot))
        .map((slot) => (
          <div key={slot.id} className="space-y-1.5">
            <div className="flex items-center justify-between gap-2">
              <label className="text-xs font-medium truncate">{slot.name}</label>
              {slot.required && <Badge className="text-[10px] uppercase tracking-widest">required</Badge>}
            </div>

            {slot.type === "file" && (() => {
              const selectedAssetId = selectedTrack.templateProps[slot.id] as string;
              const selectedAsset = assets.find((a) => a.id === selectedAssetId);
              const isOpen = openFileSlotId === slot.id;

              const isSlideScaleSlot =
                selectedTrack.template === "slide-in" &&
                (slot.id === "asset" || slot.id === "asset2" || slot.id === "asset3");

              const scaleKeys = isSlideScaleSlot
                ? slideScaleKeysBySlotId[slot.id as "asset" | "asset2" | "asset3"]
                : undefined;

              const scaleX = scaleKeys && typeof selectedTrack.templateProps[scaleKeys.x] === "number"
                ? (selectedTrack.templateProps[scaleKeys.x] as number)
                : 1;
              const scaleY = scaleKeys && typeof selectedTrack.templateProps[scaleKeys.y] === "number"
                ? (selectedTrack.templateProps[scaleKeys.y] as number)
                : 1;

              return (
                <div className="space-y-2">
                  {selectedAsset ? (
                    <div className="rounded-xl border bg-muted/20 px-2 py-1.5">
                      <div className="flex items-center gap-2 text-xs">
                        <div className="w-10 h-10 bg-muted rounded-md overflow-hidden shrink-0 grid place-items-center">
                          {selectedAsset.type === "image" && selectedAsset.src ? (
                            <img
                              src={selectedAsset.src}
                              alt={selectedAsset.id}
                              className="w-full h-full object-cover"
                            />
                          ) : selectedAsset.type === "video" ? (
                            <VideoIcon className="w-4 h-4 text-muted-foreground" />
                          ) : selectedAsset.type === "text" ? (
                            <TypeIcon className="w-4 h-4 text-muted-foreground" />
                          ) : (
                            <FileIcon className="w-4 h-4 text-muted-foreground" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-mono text-xs truncate">
                            {selectedAsset.type === "image" || selectedAsset.type === "svg"
                              ? `Image ${assets.indexOf(selectedAsset) + 1}`
                              : selectedAsset.content || selectedAsset.id}
                          </p>
                          <p className="text-[10px] text-muted-foreground capitalize">{selectedAsset.type}</p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-muted-foreground hover:text-destructive h-7 w-7 shrink-0"
                          onClick={() => {
                            onSlotUpdate(slot.id, "");
                            if (openFileSlotId === slot.id) setOpenFileSlotId(null);
                          }}
                          aria-label="Clear slot"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="rounded-xl border border-dashed bg-muted/10 px-2 py-1.5">
                      <p className="text-[10px] text-muted-foreground italic px-1">No asset selected</p>
                    </div>
                  )}

                  <div className="relative">
                    <Button
                      variant="outline"
                      className="w-full h-8 justify-between text-xs font-normal"
                      onClick={() => setOpenFileSlotId(isOpen ? null : slot.id)}
                    >
                      <span>{selectedAsset ? `Image ${assets.indexOf(selectedAsset) + 1}` : "Select an asset..."}</span>
                      <ChevronDown className="w-4 h-4" />
                    </Button>

                    {isOpen && (
                      <div className="absolute z-50 w-full mt-1 max-h-60 overflow-y-auto rounded-md border bg-background shadow-lg">
                        <div className="grid grid-cols-2 gap-1 p-1">
                          {assets.map((asset) => (
                            <button
                              key={asset.id}
                              onClick={() => {
                                onSlotUpdate(slot.id, asset.id);
                                setOpenFileSlotId(null);
                              }}
                              className={cn(
                                "relative aspect-square rounded-md overflow-hidden border transition-all hover:border-primary",
                                selectedAssetId === asset.id && "ring-2 ring-primary"
                              )}
                            >
                              {asset.type === "image" && asset.src ? (
                                <img
                                  src={asset.src}
                                  alt={`Asset ${assets.indexOf(asset) + 1}`}
                                  className="w-full h-full object-cover"
                                />
                              ) : asset.type === "video" ? (
                                <div className="flex flex-col items-center justify-center h-full bg-muted">
                                  <VideoIcon className="w-6 h-6 text-muted-foreground" />
                                  <span className="text-[9px] mt-1 text-muted-foreground">Video</span>
                                </div>
                              ) : asset.type === "text" ? (
                                <div className="flex flex-col items-center justify-center h-full bg-muted">
                                  <TypeIcon className="w-6 h-6 text-muted-foreground" />
                                  <span className="text-[9px] mt-1 text-muted-foreground truncate px-1">
                                    {asset.content || "Text"}
                                  </span>
                                </div>
                              ) : (
                                <div className="flex items-center justify-center h-full bg-muted">
                                  <FileIcon className="w-6 h-6 text-muted-foreground" />
                                </div>
                              )}
                              {selectedAssetId === asset.id && (
                                <div className="absolute top-1 right-1 bg-primary text-primary-foreground rounded-full p-0.5">
                                  <Check className="w-3 h-3" />
                                </div>
                              )}
                              <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-[9px] px-1 py-0.5">
                                {asset.type === "image" || asset.type === "svg"
                                  ? `Image ${assets.indexOf(asset) + 1}`
                                  : asset.content || asset.id}
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {isSlideScaleSlot && scaleKeys && (
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-medium text-muted-foreground">Scale X</label>
                        <Input
                          type="number"
                          min={0.1}
                          max={5}
                          step={0.05}
                          value={scaleX}
                          onChange={(e) => onSlotUpdate(scaleKeys.x, Number(e.target.value))}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-medium text-muted-foreground">Scale Y</label>
                        <Input
                          type="number"
                          min={0.1}
                          max={5}
                          step={0.05}
                          value={scaleY}
                          onChange={(e) => onSlotUpdate(scaleKeys.y, Number(e.target.value))}
                        />
                      </div>
                    </div>
                  )}
                </div>
              );
            })()}

            {slot.type === "text" && (
              <Input
                placeholder={`Enter ${slot.name.toLowerCase()}...`}
                value={String(selectedTrack.templateProps[slot.id] || "")}
                onChange={(e) => onSlotUpdate(slot.id, e.target.value)}
              />
            )}

            {slot.type === "data-table" && (
              <Textarea
                className="font-mono text-[12px]"
                placeholder="Label, Value\nItem A, 10\nItem B, 20"
                value={String(selectedTrack.templateProps[slot.id] || "")}
                onChange={(e) => onSlotUpdate(slot.id, e.target.value)}
              />
            )}
          </div>
        ))}

      {!template && (
        <Card className="p-4 text-center border border-dashed bg-card/60">
          <p className="text-[10px] text-muted-foreground">No dynamic slots defined for this template yet.</p>
        </Card>
      )}

      {template && template.slots.filter((slot) => shouldRenderSlot(selectedTrack, slot)).length === 0 && (
        <Card className="p-4 text-center border border-dashed bg-card/60">
          <p className="text-[10px] text-muted-foreground">No slots available for this template.</p>
        </Card>
      )}
    </div>
  );
}
