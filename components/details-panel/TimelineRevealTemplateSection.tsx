"use client";

import React from "react";
import type { Track } from "@/types/timeline";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";

interface TimelineRevealTemplateSectionProps {
  selectedTrack: Track;
  onSlotUpdate: (slotId: string, value: unknown) => void;
}

export function TimelineRevealTemplateSection({
  selectedTrack,
  onSlotUpdate,
}: TimelineRevealTemplateSectionProps) {
  if (selectedTrack.template !== "timeline-reveal") return null;

  return (
    <>
      <Separator />
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <h4 className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest">Template</h4>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-medium">Per-item frames</label>
            <Badge variant="secondary" className="tabular-nums text-[10px] px-2 py-0 leading-none">
              {typeof selectedTrack.templateProps.perItemFrames === "number" ? selectedTrack.templateProps.perItemFrames : 110}
              f
            </Badge>
          </div>
          <Slider
            min={70}
            max={150}
            step={1}
            value={[
              typeof selectedTrack.templateProps.perItemFrames === "number" ? selectedTrack.templateProps.perItemFrames : 110,
            ]}
            onValueChange={(v) => onSlotUpdate("perItemFrames", v[0])}
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-medium">Item zoom</label>
            <Badge variant="secondary" className="tabular-nums text-[10px] px-2 py-0 leading-none">
              {(
                typeof selectedTrack.templateProps.itemZoom === "number" ? selectedTrack.templateProps.itemZoom : 0.35
              ).toFixed(2)}
            </Badge>
          </div>
          <Slider
            min={0}
            max={2}
            step={0.01}
            value={[
              typeof selectedTrack.templateProps.itemZoom === "number" ? selectedTrack.templateProps.itemZoom : 0.35,
            ]}
            onValueChange={(v) => onSlotUpdate("itemZoom", v[0])}
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1.5">
            <label className="text-xs font-medium">Dot color</label>
            <div className="flex items-center gap-2 rounded-xl border bg-card/60 px-2 py-1.5">
              <input
                type="color"
                className="h-7 w-8 bg-transparent"
                value={String(selectedTrack.templateProps.accentColor || "#6366f1")}
                onChange={(e) => onSlotUpdate("accentColor", e.target.value)}
              />
              <Input value={String(selectedTrack.templateProps.accentColor || "#6366f1")}
                onChange={(e) => onSlotUpdate("accentColor", e.target.value)} />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium">Line color</label>
            <div className="flex items-center gap-2 rounded-xl border bg-card/60 px-2 py-1.5">
              <input
                type="color"
                className="h-7 w-8 bg-transparent"
                value={String(selectedTrack.templateProps.lineColor || "#94a3b8")}
                onChange={(e) => onSlotUpdate("lineColor", e.target.value)}
              />
              <Input value={String(selectedTrack.templateProps.lineColor || "#94a3b8")}
                onChange={(e) => onSlotUpdate("lineColor", e.target.value)} />
            </div>
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium">Label color</label>
          <div className="flex items-center gap-2 rounded-xl border bg-card/60 px-2 py-1.5">
            <input
              type="color"
              className="h-7 w-8 bg-transparent"
              value={String(selectedTrack.templateProps.labelColor || selectedTrack.templateProps.textColor || "#0b1220")}
              onChange={(e) => onSlotUpdate("labelColor", e.target.value)}
            />
            <Input
              value={String(selectedTrack.templateProps.labelColor || selectedTrack.templateProps.textColor || "#0b1220")}
              onChange={(e) => onSlotUpdate("labelColor", e.target.value)}
            />
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
