"use client";

import React from "react";
import type { Track } from "@/types/timeline";
import { cn } from "@/lib/utils";
import { Clock, Hash, Layout } from "lucide-react";

interface DetailsPanelProps {
  selectedTrack?: Track;
  className?: string;
  assets?: Asset[];
  onUpdateTrack?: (track: Track) => void;
}

/**
 * DetailsPanel component displays computed timing and properties for a selected track.
 */
export function DetailsPanel({ selectedTrack, className, assets = [], onUpdateTrack }: DetailsPanelProps) {
  if (!selectedTrack) {
    return (
      <div
        className={cn(
          "flex items-center justify-center h-full text-muted-foreground p-6 text-center border rounded-lg bg-muted/30",
          className
        )}
      >
        <p className="text-sm">Select a block to view timing details and configure slots.</p>
      </div>
    );
  }

  const assignedAsset = assets.find(a => a.id === selectedTrack.assetId);

  return (
    <div className={cn("p-4 space-y-6 border rounded-lg bg-card", className)}>
      <header className="space-y-1">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Block Details
        </h3>
        <p className="text-lg font-bold truncate uppercase tracking-tight">{selectedTrack.template}</p>
      </header>

      {/* Slots Section */}
      <div className="space-y-3 pt-4 border-t">
        <h4 className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest">Slots</h4>
        <div className="p-3 bg-muted/30 border rounded-md space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-xs font-medium">Main Asset</span>
            <span className="text-[10px] text-muted-foreground italic">Required</span>
          </div>
          
          {assignedAsset ? (
            <div className="flex items-center gap-3 p-2 bg-background border rounded text-xs">
              <div className="w-8 h-8 bg-muted rounded flex items-center justify-center overflow-hidden">
                {assignedAsset.type === 'image' ? (
                  <img src={assignedAsset.src} className="w-full h-full object-contain" />
                ) : (
                  <Layout className="w-4 h-4" />
                )}
              </div>
              <span className="flex-1 truncate font-mono">{assignedAsset.id}</span>
              <button 
                onClick={() => onUpdateTrack?.({ ...selectedTrack, assetId: "" })}
                className="text-muted-foreground hover:text-destructive transition-colors px-1"
              >
                ×
              </button>
            </div>
          ) : (
            <div className="text-[10px] text-center py-3 border border-dashed rounded text-muted-foreground">
              Drop an asset here or select from library
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2 p-3 bg-muted/50 rounded-md">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Clock className="w-3.5 h-3.5" />
            <span className="text-[10px] uppercase font-bold tracking-tight">
              Start Frame
            </span>
          </div>
          <p className="text-xl font-mono font-bold leading-none">
            {selectedTrack.startFrame}
          </p>
        </div>

        <div className="space-y-2 p-3 bg-muted/50 rounded-md">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Layout className="w-3.5 h-3.5" />
            <span className="text-[10px] uppercase font-bold tracking-tight">
              Duration
            </span>
          </div>
          <p className="text-xl font-mono font-bold leading-none">
            {selectedTrack.duration}f
          </p>
        </div>
      </div>

      <div className="space-y-3 pt-2 border-t">
        <div className="flex justify-between items-center text-xs">
          <span className="text-muted-foreground">Track ID</span>
          <span className="font-mono bg-muted px-1.5 py-0.5 rounded">
            {selectedTrack.id}
          </span>
        </div>
        <div className="flex justify-between items-center text-xs">
          <span className="text-muted-foreground">Asset ID</span>
          <span className="font-mono bg-muted px-1.5 py-0.5 rounded">
            {selectedTrack.assetId}
          </span>
        </div>
        <div className="flex justify-between items-center text-xs">
          <span className="text-muted-foreground">End Frame</span>
          <span className="font-mono font-bold">
            {selectedTrack.startFrame + selectedTrack.duration}
          </span>
        </div>
      </div>
    </div>
  );
}
