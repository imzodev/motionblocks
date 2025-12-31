"use client";

import React from "react";
import type { Track, Asset } from "@/types/timeline";
import type { AnimationTemplate } from "@/types/template";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { DetailsPanelHeader } from "@/components/details-panel/DetailsPanelHeader";
import { DetailsPanelSlotsSection } from "@/components/details-panel/DetailsPanelSlotsSection";
import { DetailsPanelTimingSection } from "@/components/details-panel/DetailsPanelTimingSection";
import { CounterTemplateSection } from "@/components/details-panel/CounterTemplateSection";
import { TimelineRevealTemplateSection } from "@/components/details-panel/TimelineRevealTemplateSection";
import { HighlightTemplateSection } from "@/components/details-panel/HighlightTemplateSection";
import { KineticTextTemplateSection } from "@/components/details-panel/KineticTextTemplateSection";

interface DetailsPanelProps {
  selectedTrack?: Track;
  template?: AnimationTemplate;
  assets: Asset[];
  onUpdateTrack: (track: Track) => void;
  className?: string;
}

export function DetailsPanel({
  selectedTrack,
  template,
  assets: _assets,
  onUpdateTrack,
  className
}: DetailsPanelProps) {
  if (!selectedTrack) {
    return (
      <Card className={cn("flex items-center justify-center h-full text-muted-foreground p-6 text-center border-dashed bg-card/60", className)}>
        <p className="text-sm">Select a block to configure its slots and timing.</p>
      </Card>
    );
  }

  const handleSlotUpdate = (slotId: string, value: unknown) => {
    const nextTemplateProps = {
      ...selectedTrack.templateProps,
      [slotId]: value,
    };

    let nextDuration = selectedTrack.duration;
    if (selectedTrack.template === "timeline-reveal") {
      const filled = new Set<number>();
      for (let i = 1; i <= 5; i += 1) {
        const labelVal = nextTemplateProps[`label${i}`];
        const imageVal = nextTemplateProps[`image${i}`];
        const hasLabel = typeof labelVal === "string" && labelVal.trim().length > 0;
        const hasImage = typeof imageVal === "string" && imageVal.trim().length > 0;
        if (hasLabel || hasImage) filled.add(i);
      }

      const itemCount = Math.max(1, filled.size);
      const perItemFrames =
        typeof nextTemplateProps.perItemFrames === "number"
          ? nextTemplateProps.perItemFrames
          : 110;
      const intro = 24;
      const outro = 18;
      const segments = Math.max(1, itemCount - 1);
      nextDuration = Math.max(80, Math.min(600, intro + outro + segments * perItemFrames));
    }

    if (selectedTrack.template === "kinetic-text") {
      const script = typeof nextTemplateProps.script === "string" ? nextTemplateProps.script : "";
      const lines = script
        .split(/\r?\n/)
        .map((l) => l.trim())
        .filter((l) => l.length > 0);
      const per =
        typeof nextTemplateProps.perSegmentFrames === "number"
          ? nextTemplateProps.perSegmentFrames
          : 45;
      const count = Math.max(1, lines.length);
      nextDuration = Math.max(60, count * Math.max(12, Math.floor(per)));
    }

    onUpdateTrack({
      ...selectedTrack,
      duration: nextDuration,
      templateProps: nextTemplateProps,
    });
  };

  return (
    <Card className={cn("overflow-hidden", className)}>
      <DetailsPanelHeader selectedTrack={selectedTrack} />

      <Separator />

      <CardContent className="p-3 space-y-4">
        <DetailsPanelSlotsSection
          selectedTrack={selectedTrack}
          template={template}
          onSlotUpdate={handleSlotUpdate}
        />

        <CounterTemplateSection selectedTrack={selectedTrack} onSlotUpdate={handleSlotUpdate} />
        <TimelineRevealTemplateSection selectedTrack={selectedTrack} onSlotUpdate={handleSlotUpdate} />
        <HighlightTemplateSection selectedTrack={selectedTrack} onSlotUpdate={handleSlotUpdate} />
        <KineticTextTemplateSection
          selectedTrack={selectedTrack}
          onSlotUpdate={handleSlotUpdate}
          onUpdateTrack={onUpdateTrack}
        />

        <Separator />

        <DetailsPanelTimingSection selectedTrack={selectedTrack} onUpdateTrack={onUpdateTrack} />
      </CardContent>
    </Card>
  );
}