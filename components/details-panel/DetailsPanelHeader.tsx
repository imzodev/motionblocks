"use client";

import React from "react";
import type { Track } from "@/types/timeline";
import { Badge } from "@/components/ui/badge";
import { CardHeader, CardTitle } from "@/components/ui/card";

interface DetailsPanelHeaderProps {
  selectedTrack: Track;
}

export function DetailsPanelHeader({ selectedTrack }: DetailsPanelHeaderProps) {
  return (
    <CardHeader className="py-0">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Active Block</p>
          <CardTitle className="text-base truncate uppercase tracking-tight">{selectedTrack.template}</CardTitle>
        </div>
        <Badge variant="secondary" className="tabular-nums text-[10px] px-2 py-0 leading-none">
          {selectedTrack.duration}f
        </Badge>
      </div>
    </CardHeader>
  );
}
