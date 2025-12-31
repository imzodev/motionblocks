"use client";

import React from "react";
import type { Track } from "@/types/timeline";
import { Clock } from "lucide-react";
import { Input } from "@/components/ui/input";

interface DetailsPanelTimingSectionProps {
  selectedTrack: Track;
  onUpdateTrack: (track: Track) => void;
}

export function DetailsPanelTimingSection({
  selectedTrack,
  onUpdateTrack,
}: DetailsPanelTimingSectionProps) {
  return (
    <div className="space-y-2.5">
      <div className="flex items-center gap-2">
        <Clock className="w-3.5 h-3.5 text-muted-foreground" />
        <h4 className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest">Timing</h4>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="rounded-xl border bg-card/60 px-3 py-2">
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground leading-none">Start</p>
          <p className="font-mono text-xs tabular-nums leading-tight mt-1">{selectedTrack.startFrame}</p>
        </div>
        <div className="rounded-xl border bg-card/60 px-3 py-2">
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground leading-none">End</p>
          <p className="font-mono text-xs tabular-nums leading-tight mt-1">
            {selectedTrack.startFrame + selectedTrack.duration}
          </p>
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-medium">Duration (frames)</label>
        <Input
          type="number"
          min={1}
          max={2000}
          value={String(selectedTrack.duration)}
          disabled={selectedTrack.template === "kinetic-text"}
          onChange={(e) => {
            if (selectedTrack.template === "kinetic-text") return;
            const nextDuration = Math.max(1, Number(e.target.value));
            onUpdateTrack({
              ...selectedTrack,
              duration: nextDuration,
            });
          }}
        />
      </div>
    </div>
  );
}
