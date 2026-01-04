"use client";

import React from "react";
import type { Track } from "@/types/timeline";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";

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
              value={String(selectedTrack.templateProps.introFrames ?? 45)}
              onChange={(e) => onSlotUpdate("introFrames", Number(e.target.value))}
            />
        </div>
      </div>
    </>
  );
}
