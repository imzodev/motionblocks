import { z } from "zod";
import type { AnimationTemplate, RenderProps } from "../../types/template";
import { Text, Image } from "@react-three/drei";
import React from "react";
import type { Asset } from "../../types/timeline";

function isAsset(value: unknown): value is Asset {
  return (
    typeof value === "object" &&
    value !== null &&
    "id" in value &&
    "type" in value
  );
}

export const FadeInTemplate: AnimationTemplate = {
  id: "fade-in",
  name: "Fade In",
  slots: [
    { id: "asset", name: "Main Asset", type: "file", required: true }
  ],
  propsSchema: z.object({
    duration: z.number().default(30),
  }),
  render: ({ assets, frame }: RenderProps) => {
    const asset = isAsset(assets.asset) ? assets.asset : undefined;
    if (!asset) return null;
    const opacity = Math.min(1, frame / 30);

    if ((asset.type === "image" || asset.type === "svg") && asset.src) {
      return <Image url={asset.src} transparent opacity={opacity} scale={[400, 400]} />;
    }
    return (
      <Text fontSize={60} color="#0f172a" fillOpacity={opacity}>
        {asset.content || "Text"}
      </Text>
    );
  },
};

export const SlideTemplate: AnimationTemplate = {
  id: "slide-in",
  name: "Slide In",
  slots: [
    { id: "asset", name: "Main Asset", type: "file", required: true }
  ],
  propsSchema: z.object({
    direction: z.enum(["left", "right", "top", "bottom"]).default("left"),
    duration: z.number().default(30),
  }),
  render: ({ assets, frame }: RenderProps) => {
    const asset = isAsset(assets.asset) ? assets.asset : undefined;
    if (!asset) return null;
    const offset = Math.max(0, 1 - frame / 30) * 800;
    
    return (
      <group position={[offset, 0, 0]}>
        {(asset.type === "image" || asset.type === "svg") && asset.src ? (
          <Image url={asset.src} scale={[400, 400]} />
        ) : (
          <Text fontSize={60} color="#0f172a">{asset.content || "Text"}</Text>
        )}
      </group>
    );
  },
};

export const ScalePopTemplate: AnimationTemplate = {
  id: "scale-pop",
  name: "Scale Pop",
  slots: [
    { id: "asset", name: "Main Asset", type: "file", required: true }
  ],
  propsSchema: z.object({
    duration: z.number().default(30),
  }),
  render: ({ assets, frame }: RenderProps) => {
    const asset = isAsset(assets.asset) ? assets.asset : undefined;
    if (!asset) return null;
    const scale = Math.min(1, frame / 15) * 1.2; // Quick pop
    
    return (
      <group scale={[scale, scale, scale]}>
        {(asset.type === "image" || asset.type === "svg") && asset.src ? (
          <Image url={asset.src} scale={[400, 400]} />
        ) : (
          <Text fontSize={60} color="#0f172a">{asset.content || "Text"}</Text>
        )}
      </group>
    );
  },
};

export const MaskRevealTemplate: AnimationTemplate = {
  id: "mask-reveal",
  name: "Mask Reveal",
  slots: [
    { id: "asset", name: "Main Asset", type: "file", required: true }
  ],
  propsSchema: z.object({
    direction: z.enum(["horizontal", "vertical"]).default("horizontal"),
    duration: z.number().default(30),
  }),
  render: ({ assets }: RenderProps) => {
    const asset = isAsset(assets.asset) ? assets.asset : undefined;
    if (!asset) return null;
    return (
      <group>
        {(asset.type === "image" || asset.type === "svg") && asset.src ? (
          <Image url={asset.src} scale={[400, 400]} />
        ) : (
          <Text fontSize={60} color="#0f172a">{asset.content || "Text"}</Text>
        )}
      </group>
    );
  },
};