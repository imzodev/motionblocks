"use client";

import React from "react";
import type { Track } from "@/types/timeline";
import { Separator } from "@/components/ui/separator";

interface MindMapTemplateSectionProps {
  selectedTrack: Track;
  onSlotUpdate: (slotId: string, value: unknown) => void;
}

type ZoomPreset = "slow" | "smooth" | "punchy" | "snappy" | "hyper";

const PRESETS: Record<ZoomPreset, { frames: number; strength: number; label: string }> = {
  slow: { frames: 20, strength: 0.18, label: "Slow" },
  smooth: { frames: 14, strength: 0.28, label: "Smooth" },
  punchy: { frames: 9, strength: 0.25, label: "Punchy" },
  snappy: { frames: 6, strength: 0.30, label: "Snappy" },
  hyper: { frames: 4, strength: 0.35, label: "Hyper" },
};

function inferPreset(props: Record<string, unknown>): ZoomPreset {
  const frames = typeof props.focusZoomFrames === "number" ? props.focusZoomFrames : 12;
  const strength = typeof props.focusZoomStrength === "number" ? props.focusZoomStrength : 0.14;

  let best: ZoomPreset = "smooth";
  let bestScore = Number.POSITIVE_INFINITY;
  (Object.keys(PRESETS) as ZoomPreset[]).forEach((k) => {
    const p = PRESETS[k];
    const score = Math.abs(p.frames - frames) * 1.5 + Math.abs(p.strength - strength) * 100;
    if (score < bestScore) {
      best = k;
      bestScore = score;
    }
  });
  return best;
}

export function MindMapTemplateSection({ selectedTrack, onSlotUpdate }: MindMapTemplateSectionProps) {
  if (selectedTrack.template !== "mind-map") return null;

  const raw = selectedTrack.templateProps as Record<string, unknown>;
  const stored = typeof raw.focusZoomPreset === "string" ? raw.focusZoomPreset : "";
  const preset: ZoomPreset = (Object.keys(PRESETS) as ZoomPreset[]).includes(stored as ZoomPreset)
    ? (stored as ZoomPreset)
    : inferPreset(raw);

  return (
    <>
      <Separator />
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <h4 className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest">Template</h4>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium">Focus zoom</label>
          <select
            className="h-9 w-full rounded-md border bg-background px-2 text-xs"
            value={preset}
            onChange={(e) => {
              const key = e.target.value as ZoomPreset;
              const next = PRESETS[key] ?? PRESETS.smooth;
              onSlotUpdate("focusZoomPreset", key);
              onSlotUpdate("focusZoomFrames", next.frames);
              onSlotUpdate("focusZoomStrength", next.strength);
            }}
          >
            {(Object.keys(PRESETS) as ZoomPreset[]).map((k) => (
              <option key={k} value={k}>
                {PRESETS[k].label}
              </option>
            ))}
          </select>
          <p className="text-[10px] text-muted-foreground leading-snug">
            Zoom-in beat after camera arrival.
          </p>
        </div>
      </div>
    </>
  );
}
