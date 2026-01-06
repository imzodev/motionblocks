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
import { MindMapTemplateSection } from "@/components/details-panel/MindMapTemplateSection";
import { GraphTemplateSection } from "@/components/details-panel/GraphTemplateSection";
import {
  DEFAULT_GRAPH_INTRO_FRAMES,
  DEFAULT_GRAPH_PER_ITEM_FRAMES
} from "@/components/animations/Graph3D";
import { ChaptersTemplateSection } from "./details-panel/ChaptersTemplateSection";
import { ListTemplateSection } from "./details-panel/ListTemplateSection";
import { SlideTemplateSection } from "./details-panel/SlideTemplateSection";

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

    if (selectedTrack.template === "mind-map") {
      const rawNodes = typeof nextTemplateProps.nodes === "string" ? nextTemplateProps.nodes : "";
      const lines = rawNodes
        .split(/\r?\n/)
        .map((l) => l.trim())
        .filter((l) => l.length > 0);

      const headerLike =
        lines.length > 0 &&
        (() => {
          const h = lines[0].toLowerCase();
          return h.includes("text") || h.includes("label") || h.includes("topic") || h.includes("node");
        })();

      const nodeCount = Math.max(0, lines.length - (headerLike ? 1 : 0));
      const intro = typeof nextTemplateProps.introHoldFrames === "number" ? nextTemplateProps.introHoldFrames : 24;
      const per = typeof nextTemplateProps.perNodeFrames === "number" ? nextTemplateProps.perNodeFrames : 50;
      const zoom = typeof nextTemplateProps.focusZoomFrames === "number" ? nextTemplateProps.focusZoomFrames : 12;
      const tail = 24;

      nextDuration = Math.max(60, Math.floor(intro) + nodeCount * (Math.max(1, Math.floor(per)) + Math.max(0, Math.floor(zoom))) + tail);
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

    if (selectedTrack.template === "graph") {
      const data = typeof nextTemplateProps.data === "string" ? nextTemplateProps.data : "";
      const lines = data.split(/\r?\n/).filter((l) => l.trim().length > 0);
      const count = Math.max(1, lines.length);
      const intro = typeof nextTemplateProps.introFrames === "number" ? nextTemplateProps.introFrames : DEFAULT_GRAPH_INTRO_FRAMES;
      const per = typeof nextTemplateProps.perItemFrames === "number" ? nextTemplateProps.perItemFrames : DEFAULT_GRAPH_PER_ITEM_FRAMES;
      
      // Intro + (Count - 1) * PerItem
      nextDuration = Math.max(90, intro + count * per);
    }

    if (selectedTrack.template === "list") {
      const data = typeof nextTemplateProps.data === "string" ? nextTemplateProps.data : "";
      const lines = data.split(/\r?\n/).filter((l) => l.trim().length > 0);
      const count = Math.max(1, lines.length);
      const perItem = typeof nextTemplateProps.perItemFrames === "number" ? nextTemplateProps.perItemFrames : 60;
      
      nextDuration = count * perItem;
    }

    if (selectedTrack.template === "chapters") {
      const data = typeof nextTemplateProps.data === "string" ? nextTemplateProps.data : "";
      const lines = data.split(/\r?\n/).filter((l) => l.trim().length > 0);
      const count = Math.max(1, lines.length);
      const framesPerChapter = typeof nextTemplateProps.framesPerChapter === "number" ? nextTemplateProps.framesPerChapter : 60;
      
      nextDuration = count * framesPerChapter;
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
          assets={_assets}
          onSlotUpdate={handleSlotUpdate}
        />

        <CounterTemplateSection selectedTrack={selectedTrack} onSlotUpdate={handleSlotUpdate} />
        <TimelineRevealTemplateSection selectedTrack={selectedTrack} onSlotUpdate={handleSlotUpdate} />
        <MindMapTemplateSection selectedTrack={selectedTrack} onSlotUpdate={handleSlotUpdate} />
        <GraphTemplateSection selectedTrack={selectedTrack} onSlotUpdate={handleSlotUpdate} />
        <HighlightTemplateSection selectedTrack={selectedTrack} onSlotUpdate={handleSlotUpdate} />
        <ChaptersTemplateSection selectedTrack={selectedTrack} onSlotUpdate={handleSlotUpdate} />
        <ListTemplateSection selectedTrack={selectedTrack} onSlotUpdate={handleSlotUpdate} />
        <SlideTemplateSection selectedTrack={selectedTrack} onSlotUpdate={handleSlotUpdate} />
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