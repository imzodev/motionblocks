"use client";

import React from "react";
import type { Track } from "@/types/timeline";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";

interface ListTemplateSectionProps {
  selectedTrack: Track;
  onSlotUpdate: (slotId: string, value: unknown) => void;
}

export function ListTemplateSection({
  selectedTrack,
  onSlotUpdate,
}: ListTemplateSectionProps) {
  if (selectedTrack.template !== "list") return null;

  return (
    <>
      <Separator />
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <h4 className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest">List Config</h4>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1.5">
            <label className="text-xs font-medium">Font Size</label>
            <Input
              type="number"
              min={10}
              max={100}
              value={String(selectedTrack.templateProps.fontSize ?? 40)}
              onChange={(e) => onSlotUpdate("fontSize", Number(e.target.value))}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium">Gap</label>
            <Input
              type="number"
              min={10}
              max={200}
              value={String(selectedTrack.templateProps.gap ?? 60)}
              onChange={(e) => onSlotUpdate("gap", Number(e.target.value))}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
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

          <div className="space-y-1.5">
            <label className="text-xs font-medium">Bullet Color</label>
            <div className="flex items-center gap-2 rounded-xl border bg-card/60 px-2 py-1.5">
              <input
                type="color"
                className="h-7 w-8 bg-transparent"
                value={String(selectedTrack.templateProps.bulletColor || "#00d09c")}
                onChange={(e) => onSlotUpdate("bulletColor", e.target.value)}
              />
              <Input
                value={String(selectedTrack.templateProps.bulletColor || "#00d09c")}
                onChange={(e) => onSlotUpdate("bulletColor", e.target.value)}
                className="h-7 text-xs"
              />
            </div>
          </div>
        </div>

        <div className="space-y-1.5">
            <label className="text-xs font-medium">Bullet Type</label>
            <select
                className="flex h-9 w-full rounded-md border border-input bg-transparent dark:bg-input/30 px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 text-foreground"
                value={String(selectedTrack.templateProps.bulletType ?? "bullet")}
                onChange={(e) => onSlotUpdate("bulletType", e.target.value)}
            >
                <option value="none" className="bg-background text-foreground">None</option>
                <option value="bullet" className="bg-background text-foreground">Bullet (•)</option>
                <option value="number" className="bg-background text-foreground">Number (1.)</option>
                <option value="arrow" className="bg-background text-foreground">Arrow (►)</option>
            </select>
        </div>

        <div className="grid grid-cols-2 gap-2">
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
                <label className="text-xs font-medium">Frames / Item</label>
                <Input
                type="number"
                min={5}
                max={120}
                value={String(selectedTrack.templateProps.perItemFrames ?? 60)}
                onChange={(e) => onSlotUpdate("perItemFrames", Number(e.target.value))}
                />
            </div>
        </div>
      </div>
    </>
  );
}
