"use client";

import React from "react";
import type { Track } from "@/types/timeline";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";

import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";

interface ChaptersTemplateSectionProps {
  selectedTrack: Track;
  onSlotUpdate: (slotId: string, value: unknown) => void;
}

export function ChaptersTemplateSection({
  selectedTrack,
  onSlotUpdate,
}: ChaptersTemplateSectionProps) {
  if (selectedTrack.template !== "chapters") return null;

  return (
    <>
      <Separator />
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <h4 className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest">Chapter Config</h4>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1.5">
            <label className="text-xs font-medium">Start #</label>
            <Input
              type="number"
              min={1}
              value={String(selectedTrack.templateProps.startNumber ?? 1)}
              onChange={(e) => onSlotUpdate("startNumber", Number(e.target.value))}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium">Show Number</label>
            <div className="flex h-9 items-center">
                <Button
                    variant="outline"
                    size="sm"
                    className="w-full text-xs"
                    onClick={() => onSlotUpdate("showNumber", !(selectedTrack.templateProps.showNumber ?? true))}
                >
                    {(selectedTrack.templateProps.showNumber ?? true) ? "Visible" : "Hidden"}
                </Button>
            </div>
          </div>
        </div>

        <div className="space-y-1.5">
            <label className="text-xs font-medium">Frames / Chapter</label>
            <Input
              type="number"
              min={30}
              max={600}
              value={String(selectedTrack.templateProps.framesPerChapter ?? 60)}
              onChange={(e) => onSlotUpdate("framesPerChapter", Number(e.target.value))}
            />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1.5">
            <label className="text-xs font-medium">Accent Color</label>
            <div className="flex items-center gap-2 rounded-xl border bg-card/60 px-2 py-1.5">
              <input
                type="color"
                className="h-7 w-8 bg-transparent"
                value={String(selectedTrack.templateProps.accentColor || "#00d09c")}
                onChange={(e) => onSlotUpdate("accentColor", e.target.value)}
              />
              <Input
                value={String(selectedTrack.templateProps.accentColor || "#00d09c")}
                onChange={(e) => onSlotUpdate("accentColor", e.target.value)}
                className="h-7 text-xs"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium">Text Color</label>
            <div className="flex items-center gap-2 rounded-xl border bg-card/60 px-2 py-1.5">
              <input
                type="color"
                className="h-7 w-8 bg-transparent"
                value={String(selectedTrack.templateProps.textColor || "#1a1a1a")}
                onChange={(e) => onSlotUpdate("textColor", e.target.value)}
              />
              <Input
                value={String(selectedTrack.templateProps.textColor || "#1a1a1a")}
                onChange={(e) => onSlotUpdate("textColor", e.target.value)}
                className="h-7 text-xs"
              />
            </div>
          </div>
        </div>

        <div className="space-y-1.5">
            <label className="text-xs font-medium">Intro Frames</label>
            <Input
              type="number"
              min={10}
              max={120}
              value={String(selectedTrack.templateProps.introFrames ?? 30)}
              onChange={(e) => onSlotUpdate("introFrames", Number(e.target.value))}
            />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium">Camera</label>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="flex-1 h-8 text-xs font-bold"
              onClick={() => {
                window.dispatchEvent(new CustomEvent("motionblocks:save-camera"));
              }}
            >
              Save Camera
            </Button>
            {selectedTrack.templateProps.cameraPosition && (
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 px-0 text-muted-foreground hover:text-destructive"
                onClick={() => {
                  onSlotUpdate("cameraPosition", undefined);
                  onSlotUpdate("cameraTarget", undefined);
                }}
                title="Reset Camera"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
          <p className="text-[10px] text-muted-foreground leading-snug">
            {selectedTrack.templateProps.cameraPosition 
              ? "✓ Custom camera saved" 
              : "Using default scene camera"}
          </p>
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
