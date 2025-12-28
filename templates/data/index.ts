import { z } from "zod";
import type { AnimationTemplate, RenderProps } from "../../types/template";
import { Text, Image } from "@react-three/drei";
import React from "react";

/**
 * CounterTemplate: Animated number interpolation.
 */
export const CounterTemplate: AnimationTemplate = {
  id: "counter",
  name: "Counter",
  slots: [
    { id: "label", name: "Label Text", type: "text" }
  ],
  propsSchema: z.object({
    startValue: z.number().default(0),
    endValue: z.number().default(100),
    duration: z.number().default(60),
    prefix: z.string().optional(),
    suffix: z.string().optional(),
  }),
  render: ({ assets, frame, props }: RenderProps) => {
    const { startValue = 0, endValue = 100, duration = 60, prefix = "", suffix = "" } = props;
    const progress = Math.min(1, frame / duration);
    const value = Math.floor(startValue + (endValue - startValue) * progress);
    
    return (
      <group>
        <Text fontSize={80} color="white" position={[0, 0, 0]}>
          {`${prefix}${value}${suffix}`}
        </Text>
        {assets.label && (
          <Text fontSize={30} color="#60a5fa" position={[0, -80, 0]}>
            {assets.label}
          </Text>
        )}
      </group>
    );
  },
};

/**
 * TimelineRevealTemplate: Progressive horizontal/vertical reveal.
 */
export const TimelineRevealTemplate: AnimationTemplate = {
  id: "timeline-reveal",
  name: "Timeline Reveal",
  slots: [
    { id: "asset", name: "Asset to Reveal", type: "file", required: true }
  ],
  propsSchema: z.object({
    direction: z.enum(["ltr", "rtl", "ttb", "btt"]).default("ltr"),
    duration: z.number().default(60),
  }),
  render: ({ assets }: RenderProps) => {
    const asset = assets.asset;
    if (!asset) return null;
    return (
      <group>
        {asset.type === 'image' || asset.type === 'svg' ? 
          <Image url={asset.src} scale={[400, 400, 1]} /> : 
          <Text fontSize={60} color="white">{asset.content || "Text"}</Text>
        }
      </group>
    );
  },
};