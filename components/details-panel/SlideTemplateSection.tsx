"use client";

import React from "react";
import type { Track } from "@/types/timeline";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp, Columns, Rows } from "lucide-react";
import { cn } from "@/lib/utils";

interface SlideTemplateSectionProps {
  selectedTrack: Track;
  onSlotUpdate: (slotId: string, value: unknown) => void;
}

export function SlideTemplateSection({
  selectedTrack,
  onSlotUpdate,
}: SlideTemplateSectionProps) {
  if (selectedTrack.template !== "slide-in") return null;

  const direction = (selectedTrack.templateProps.direction as string) || "left";
  const layout = (selectedTrack.templateProps.layout as string) || "row";
  const gap = typeof selectedTrack.templateProps.gap === "number" ? selectedTrack.templateProps.gap : 100;
  const duration = typeof selectedTrack.templateProps.duration === "number" ? selectedTrack.templateProps.duration : 30;
  const staggerFrames = typeof selectedTrack.templateProps.staggerFrames === "number" ? selectedTrack.templateProps.staggerFrames : 0;

  return (
    <>
      <Separator />
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <h4 className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest">Slide Options</h4>
        </div>

        {/* Animation Duration */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium">Animation Duration (frames)</label>
          <Input
            type="number"
            min={1}
            max={120}
            value={duration}
            onChange={(e) => onSlotUpdate("duration", Number(e.target.value))}
          />
        </div>

        {/* Direction Control */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium">Direction</label>
          <div className="grid grid-cols-4 gap-1">
            <Button
              variant={direction === "left" ? "default" : "outline"}
              size="sm"
              className={cn("h-8 px-0", direction === "left" && "bg-primary text-primary-foreground")}
              onClick={() => onSlotUpdate("direction", "left")}
              title="Slide from Left"
            >
              <ArrowRight className="h-4 w-4" />
            </Button>
            <Button
              variant={direction === "right" ? "default" : "outline"}
              size="sm"
              className={cn("h-8 px-0", direction === "right" && "bg-primary text-primary-foreground")}
              onClick={() => onSlotUpdate("direction", "right")}
              title="Slide from Right"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <Button
              variant={direction === "top" ? "default" : "outline"}
              size="sm"
              className={cn("h-8 px-0", direction === "top" && "bg-primary text-primary-foreground")}
              onClick={() => onSlotUpdate("direction", "top")}
              title="Slide from Top"
            >
              <ArrowDown className="h-4 w-4" />
            </Button>
            <Button
              variant={direction === "bottom" ? "default" : "outline"}
              size="sm"
              className={cn("h-8 px-0", direction === "bottom" && "bg-primary text-primary-foreground")}
              onClick={() => onSlotUpdate("direction", "bottom")}
              title="Slide from Bottom"
            >
              <ArrowUp className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
           {/* Layout Control */}
           <div className="space-y-1.5">
            <label className="text-xs font-medium">Layout</label>
            <div className="flex gap-1">
              <Button
                variant={layout === "row" ? "default" : "outline"}
                size="sm"
                className="flex-1 h-8 px-0"
                onClick={() => onSlotUpdate("layout", "row")}
                title="Row"
              >
                <Columns className="h-4 w-4 rotate-90" />
              </Button>
              <Button
                variant={layout === "column" ? "default" : "outline"}
                size="sm"
                className="flex-1 h-8 px-0"
                onClick={() => onSlotUpdate("layout", "column")}
                title="Column"
              >
                <Rows className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Gap Control */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium">Gap</label>
            <Input
              type="number"
              min={0}
              max={500}
              value={gap}
              onChange={(e) => onSlotUpdate("gap", Number(e.target.value))}
            />
          </div>
        </div>

        {/* Appearance Controls */}
        <div className="grid grid-cols-2 gap-2">
           <div className="space-y-1.5">
            <label className="text-xs font-medium">Font Size</label>
            <Input
              type="number"
              min={10}
              max={200}
              value={Number(selectedTrack.templateProps.fontSize) || 60}
              onChange={(e) => onSlotUpdate("fontSize", Number(e.target.value))}
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium">Image Size</label>
            <Input
              type="number"
              min={50}
              max={1000}
              value={Number(selectedTrack.templateProps.imageSize) || 400}
              onChange={(e) => onSlotUpdate("imageSize", Number(e.target.value))}
            />
          </div>
        </div>

        <div className="space-y-1.5">
            <label className="text-xs font-medium">Text Color</label>
            <div className="flex items-center gap-2 rounded-xl border bg-card/60 px-2 py-1.5">
              <input
                type="color"
                className="h-7 w-8 bg-transparent"
                value={String(selectedTrack.templateProps.textColor || "#0f172a")}
                onChange={(e) => onSlotUpdate("textColor", e.target.value)}
              />
              <Input
                value={String(selectedTrack.templateProps.textColor || "#0f172a")}
                onChange={(e) => onSlotUpdate("textColor", e.target.value)}
              />
            </div>
        </div>

        {/* Stagger Frames Control */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium">Stagger Frames (0 = all at once)</label>
          <Input
            type="number"
            min={0}
            max={120}
            step={5}
            value={staggerFrames}
            onChange={(e) => onSlotUpdate("staggerFrames", Number(e.target.value))}
          />
          <p className="text-[10px] text-muted-foreground">
            Each image appears {staggerFrames === 0 ? "at the same time" : `${staggerFrames} frames apart`}
          </p>
        </div>

      </div>
    </>
  );
}
