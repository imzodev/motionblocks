"use client";

import React from "react";
import type { Track } from "@/types/timeline";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import { DEFAULT_GRAPH_INTRO_FRAMES, DEFAULT_GRAPH_PER_ITEM_FRAMES } from "@/components/animations/Graph3D";

interface GraphTemplateSectionProps {
  selectedTrack: Track;
  onSlotUpdate: (slotId: string, value: unknown) => void;
}

export function GraphTemplateSection({
  selectedTrack,
  onSlotUpdate,
}: GraphTemplateSectionProps) {
  if (selectedTrack.template !== "graph") return null;

  const props = selectedTrack.templateProps as Record<string, unknown>;
  const type = (props.type as string) || "bar";

  return (
    <>
      <Separator />
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <h4 className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest">
            Graph Settings
          </h4>
        </div>

        {/* Graph Type */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium">Graph Type</label>
          <select
            className="h-9 w-full rounded-md border bg-background px-2 text-xs"
            value={type}
            onChange={(e) => onSlotUpdate("type", e.target.value)}
          >
            <option value="bar">Bar Chart</option>
            <option value="line">Line Chart</option>
            <option value="pie">Pie Chart</option>
          </select>
        </div>

        {/* Colors */}
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1.5">
            <label className="text-xs font-medium">Text Color</label>
            <div className="flex items-center gap-2 rounded-xl border bg-card/60 px-2 py-1.5">
              <input
                type="color"
                className="h-7 w-8 bg-transparent"
                value={String(props.textColor || "#ffffff")}
                onChange={(e) => onSlotUpdate("textColor", e.target.value)}
              />
              <Input
                value={String(props.textColor || "#ffffff")}
                onChange={(e) => onSlotUpdate("textColor", e.target.value)}
                className="h-7 text-xs"
              />
            </div>
          </div>
          
          <div className="space-y-1.5">
            <label className="text-xs font-medium">Palette (comma-sep)</label>
            <Input
              value={String(props.colors || "#3b82f6,#60a5fa,#93c5fd")}
              onChange={(e) => onSlotUpdate("colors", e.target.value)}
              className="h-9 text-xs"
              placeholder="#hex,#hex..."
            />
          </div>
        </div>



        {/* Type Specific Settings */}
        {type === "bar" && (
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1.5">
              <label className="text-xs font-medium">Bar Width</label>
              <Input
                type="number"
                min={10}
                max={200}
                value={Number(props.barWidth ?? 60)}
                onChange={(e) => onSlotUpdate("barWidth", Number(e.target.value))}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium">Bar Gap</label>
              <Input
                type="number"
                min={0}
                max={200}
                value={Number(props.barGap ?? 40)}
                onChange={(e) => onSlotUpdate("barGap", Number(e.target.value))}
              />
            </div>
          </div>
        )}

        {type === "line" && (
          <>
            <div className="space-y-1.5">
              <label className="text-xs font-medium">Line Thickness</label>
              <Input
                type="number"
                min={1}
                max={50}
                value={Number(props.lineThickness ?? 8)}
                onChange={(e) => onSlotUpdate("lineThickness", Number(e.target.value))}
              />
            </div>

            {/* Axis Settings */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium">Show Axes</label>
              <select
                className="h-9 w-full rounded-md border bg-background px-2 text-xs"
                value={String(props.showAxes ?? true)}
                onChange={(e) => onSlotUpdate("showAxes", e.target.value === "true")}
              >
                <option value="true">Yes</option>
                <option value="false">No</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1.5">
                <label className="text-xs font-medium">Axis Color</label>
                <div className="flex items-center gap-2 rounded-xl border bg-card/60 px-2 py-1.5">
                  <input
                    type="color"
                    className="h-7 w-8 bg-transparent"
                    value={String(props.axisColor ?? props.textColor ?? "#ffffff")}
                    onChange={(e) => onSlotUpdate("axisColor", e.target.value)}
                  />
                  <Input
                    value={String(props.axisColor ?? props.textColor ?? "#ffffff")}
                    onChange={(e) => onSlotUpdate("axisColor", e.target.value)}
                    className="h-7 text-xs"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium">Y Axis Ticks</label>
                <Input
                  type="number"
                  min={2}
                  max={10}
                  value={Number(props.yAxisTickCount ?? 5)}
                  onChange={(e) => onSlotUpdate("yAxisTickCount", Number(e.target.value))}
                  className="h-9 text-xs"
                />
              </div>
            </div>
          </>
        )}

        {type === "pie" && (
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1.5">
              <label className="text-xs font-medium">Radius</label>
              <Input
                type="number"
                min={50}
                max={500}
                value={Number(props.pieRadius ?? 200)}
                onChange={(e) => onSlotUpdate("pieRadius", Number(e.target.value))}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium">Height</label>
              <Input
                type="number"
                min={5}
                max={200}
                value={Number(props.pieHeight ?? 40)}
                onChange={(e) => onSlotUpdate("pieHeight", Number(e.target.value))}
              />
            </div>
          </div>
        )}

        {/* Animation Timing */}
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1.5">
            <label className="text-xs font-medium">Intro Frames</label>
            <Input
              type="number"
              min={0}
              max={120}
              value={Number(props.introFrames ?? DEFAULT_GRAPH_INTRO_FRAMES)}
              onChange={(e) => onSlotUpdate("introFrames", Number(e.target.value))}
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium">Per Item Frames</label>
            <Input
              type="number"
              min={10}
              max={120}
              value={Number(props.perItemFrames ?? DEFAULT_GRAPH_PER_ITEM_FRAMES)}
              onChange={(e) => onSlotUpdate("perItemFrames", Number(e.target.value))}
            />
          </div>
        </div>
      </div>
    </>
  );
}
