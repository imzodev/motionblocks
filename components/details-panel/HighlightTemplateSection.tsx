"use client";

import React from "react";
import type { Track } from "@/types/timeline";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";

interface HighlightTemplateSectionProps {
  selectedTrack: Track;
  onSlotUpdate: (slotId: string, value: unknown) => void;
}

export function HighlightTemplateSection({
  selectedTrack,
  onSlotUpdate,
}: HighlightTemplateSectionProps) {
  if (selectedTrack.template !== "highlight") return null;

  return (
    <>
      <Separator />
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <h4 className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest">Template</h4>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1.5">
            <label className="text-xs font-medium">Font size</label>
            <Input
              type="number"
              min={18}
              max={140}
              value={String(
                typeof selectedTrack.templateProps.fontSize === "number" ? selectedTrack.templateProps.fontSize : 60
              )}
              onChange={(e) => onSlotUpdate("fontSize", Number(e.target.value))}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium">Font color</label>
            <div className="flex items-center gap-2 rounded-xl border bg-card/60 px-2 py-1.5">
              <input
                type="color"
                className="h-7 w-8 bg-transparent"
                value={String(selectedTrack.templateProps.fontColor || "#0f172a")}
                onChange={(e) => onSlotUpdate("fontColor", e.target.value)}
              />
              <Input
                value={String(selectedTrack.templateProps.fontColor || "#0f172a")}
                onChange={(e) => onSlotUpdate("fontColor", e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium">Hl. padding</label>
            <Input
              type="number"
              min={0}
              max={100}
              value={String(
                typeof selectedTrack.templateProps.highlightPadding === "number" ? selectedTrack.templateProps.highlightPadding : 12
              )}
              onChange={(e) => onSlotUpdate("highlightPadding", Number(e.target.value))}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1.5">
            <label className="text-xs font-medium">X Offset</label>
            <Input
              type="number"
              value={String(
                typeof selectedTrack.templateProps.highlightXOffset === "number" ? selectedTrack.templateProps.highlightXOffset : 0
              )}
              onChange={(e) => onSlotUpdate("highlightXOffset", Number(e.target.value))}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium">Y Offset</label>
            <Input
              type="number"
              value={String(
                typeof selectedTrack.templateProps.highlightYOffset === "number" ? selectedTrack.templateProps.highlightYOffset : 0
              )}
              onChange={(e) => onSlotUpdate("highlightYOffset", Number(e.target.value))}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1.5">
            <label className="text-xs font-medium">Highlight color</label>
            <div className="flex items-center gap-2 rounded-xl border bg-card/60 px-2 py-1.5">
              <input
                type="color"
                className="h-7 w-8 bg-transparent"
                value={String(selectedTrack.templateProps.highlightColor || "#fde047")}
                onChange={(e) => onSlotUpdate("highlightColor", e.target.value)}
              />
              <Input
                value={String(selectedTrack.templateProps.highlightColor || "#fde047")}
                onChange={(e) => onSlotUpdate("highlightColor", e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium">Hl. font color</label>
            <div className="flex items-center gap-2 rounded-xl border bg-card/60 px-2 py-1.5">
              <input
                type="color"
                className="h-7 w-8 bg-transparent"
                value={String(selectedTrack.templateProps.highlightFontColor || "#0f172a")}
                onChange={(e) => onSlotUpdate("highlightFontColor", e.target.value)}
              />
              <Input
                value={String(selectedTrack.templateProps.highlightFontColor || "#0f172a")}
                onChange={(e) => onSlotUpdate("highlightFontColor", e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-medium">Background</label>
            <Button
              variant="outline"
              size="sm"
              className="h-7 px-2 text-xs"
              onClick={() => onSlotUpdate("backgroundEnabled", !(selectedTrack.templateProps.backgroundEnabled === true))}
            >
              {selectedTrack.templateProps.backgroundEnabled === true ? "On" : "Off"}
            </Button>
          </div>

          {selectedTrack.templateProps.backgroundEnabled === true && (
            <>
              <div className="flex items-center gap-2 rounded-xl border bg-card/60 px-2 py-1.5">
                <input
                  type="color"
                  className="h-7 w-8 bg-transparent"
                  value={String(selectedTrack.templateProps.backgroundColor || "#ffffff")}
                  onChange={(e) => onSlotUpdate("backgroundColor", e.target.value)}
                />
                <Input
                  value={String(selectedTrack.templateProps.backgroundColor || "#ffffff")}
                  onChange={(e) => onSlotUpdate("backgroundColor", e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium">Background scale</label>
                  <Input
                    type="number"
                    min={1000}
                    max={12000}
                    value={String(
                      typeof selectedTrack.templateProps.backgroundScale === "number"
                        ? selectedTrack.templateProps.backgroundScale
                        : 6000
                    )}
                    onChange={(e) => onSlotUpdate("backgroundScale", Number(e.target.value))}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium">Video aspect</label>
                  <Input
                    type="number"
                    min={0.2}
                    max={5}
                    step={0.01}
                    value={String(
                      typeof selectedTrack.templateProps.backgroundVideoAspect === "number"
                        ? selectedTrack.templateProps.backgroundVideoAspect
                        : 16 / 9
                    )}
                    onChange={(e) => onSlotUpdate("backgroundVideoAspect", Number(e.target.value))}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium">Background opacity</label>
                  <Badge variant="secondary" className="tabular-nums text-[10px] px-2 py-0 leading-none">
                    {(
                      typeof selectedTrack.templateProps.backgroundOpacity === "number"
                        ? selectedTrack.templateProps.backgroundOpacity
                        : 1
                    ).toFixed(2)}
                  </Badge>
                </div>
                <Slider
                  min={0}
                  max={1}
                  step={0.01}
                  value={[
                    typeof selectedTrack.templateProps.backgroundOpacity === "number"
                      ? selectedTrack.templateProps.backgroundOpacity
                      : 1,
                  ]}
                  onValueChange={(v) => onSlotUpdate("backgroundOpacity", v[0])}
                />
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
