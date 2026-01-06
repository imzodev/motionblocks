"use client";

import React from "react";
import type { Track, Asset } from "@/types/timeline";
import type { AnimationTemplate, TemplateSlot } from "@/types/template";
import { Database, Layout, TypeIcon, FileIcon, VideoIcon, X } from "lucide-react";
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

            {slot.type === "file" && (
              <div className="space-y-2">
                {/* Selected Asset Preview */}
                {selectedTrack.templateProps[slot.id] ? (() => {
                  const selectedAsset = assets.find(a => a.id === selectedTrack.templateProps[slot.id]);
                  return (
                    <div className="rounded-xl border bg-muted/20 px-2 py-1.5">
                      <div className="flex items-center gap-2 text-xs">
                        <div className="w-10 h-10 bg-muted rounded-md overflow-hidden shrink-0 grid place-items-center">
                          {selectedAsset?.type === "image" && selectedAsset.src ? (
                            <img
                              src={selectedAsset.src}
                              alt={selectedAsset.id}
                              className="w-full h-full object-cover"
                            />
                          ) : selectedAsset?.type === "video" ? (
                            <VideoIcon className="w-4 h-4 text-muted-foreground" />
                          ) : selectedAsset?.type === "text" ? (
                            <TypeIcon className="w-4 h-4 text-muted-foreground" />
                          ) : (
                            <FileIcon className="w-4 h-4 text-muted-foreground" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-mono text-xs truncate">
                            {selectedAsset?.type === "image" || selectedAsset?.type === "svg"
                              ? selectedAsset.src?.split('/').pop() || selectedAsset.id
                              : selectedAsset?.content || selectedAsset?.id
                            }
                          </p>
                          <p className="text-[10px] text-muted-foreground capitalize">{selectedAsset?.type}</p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-muted-foreground hover:text-destructive h-7 w-7 shrink-0"
                          onClick={() => onSlotUpdate(slot.id, "")}
                          aria-label="Clear slot"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  );
                })() : (
                  <div className="rounded-xl border border-dashed bg-muted/10 px-2 py-1.5">
                    <p className="text-[10px] text-muted-foreground italic px-1">No asset selected</p>
                  </div>
                )}

                {/* Asset Selector Dropdown */}
                <div className="relative">
                  <select
                    className="w-full h-8 rounded-md border border-input bg-background px-2 py-1 text-xs shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
                    value={String(selectedTrack.templateProps[slot.id] || "")}
                    onChange={(e) => onSlotUpdate(slot.id, e.target.value || "")}
                  >
                    <option value="">Select an asset...</option>
                    {assets.map((asset) => (
                      <option key={asset.id} value={asset.id}>
                        {asset.type === "image" || asset.type === "svg"
                          ? `${asset.src?.split('/').pop() || asset.id} (${asset.type})`
                          : `${asset.content || asset.id} (${asset.type})`
                        }
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

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
