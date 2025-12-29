"use client";

import React from "react";
import type { Track, Asset } from "@/types/timeline";
import { AnimationTemplate } from "@/types/template";

// Templates Registry
import { FadeInTemplate, SlideTemplate, ScalePopTemplate, MaskRevealTemplate } from "@/templates/entry";
import { PulseTemplate, GlowTemplate, BounceTemplate, ShakeTemplate } from "@/templates/emphasis";
import { CounterTemplate, TimelineRevealTemplate } from "@/templates/data";
import { MindMapTemplate, GraphTemplate } from "@/templates/visual";
import { HighlightTemplate } from "@/templates/text";

export const TEMPLATE_REGISTRY: Record<string, AnimationTemplate> = {
  "fade-in": FadeInTemplate,
  "slide-in": SlideTemplate,
  "scale-pop": ScalePopTemplate,
  "mask-reveal": MaskRevealTemplate,
  pulse: PulseTemplate,
  glow: GlowTemplate,
  bounce: BounceTemplate,
  shake: ShakeTemplate,
  counter: CounterTemplate,
  "timeline-reveal": TimelineRevealTemplate,
  "mind-map": MindMapTemplate,
  graph: GraphTemplate,
  highlight: HighlightTemplate,
};

interface Renderer3DProps {
  activeTrack?: Track;
  currentFrame: number;
  assets: Asset[];
  globalFontUrl?: string;
}

/**
 * Renderer3D component handles the logical mapping between tracks and animation templates.
 */
export function Renderer3D({ activeTrack, currentFrame, assets, globalFontUrl }: Renderer3DProps) {
  if (!activeTrack) return null;

  const template = TEMPLATE_REGISTRY[activeTrack.template];
  if (!template) return null;

  const resolveAssetById = (id: string) => assets.find((a) => a.id === id);

  // Resolve slot values
  const resolvedAssets: Record<string, unknown> = {};
  template.slots.forEach(slot => {
    const val = activeTrack.templateProps[slot.id];
    if (slot.type === 'file' && typeof val === 'string') {
      resolvedAssets[slot.id] = resolveAssetById(val);
    } else {
      resolvedAssets[slot.id] = val;
    }
  });

  return (
    <group key={activeTrack.id}>
      {template.render({
        frame: currentFrame - activeTrack.startFrame,
        duration: activeTrack.duration,
        assets: resolvedAssets,
        props: {
          ...(activeTrack.templateProps as Record<string, unknown>),
          globalFontUrl,
        }
      })}
    </group>
  );
}
