import { z } from "zod";
import type { AnimationTemplate, RenderProps } from "../../types/template";
import { Text, Image as DreiImage } from "@react-three/drei";
import React from "react";
import { HtmlImage, isGifAsset, isAsset } from "../shared";

export const ShakeTemplate: AnimationTemplate = {
  id: "shake",
  name: "Shake",
  slots: [
    { id: "asset", name: "Main Asset", type: "file", required: true }
  ],
  propsSchema: z.object({
    intensity: z.number().default(5),
  }),
  render: ({ assets, frame, props }: RenderProps) => {
    const asset = isAsset(assets.asset) ? assets.asset : undefined;
    if (!asset) return null;
    const p = (props ?? {}) as Record<string, unknown>;
    const globalFontUrl = typeof p.globalFontUrl === "string" ? p.globalFontUrl : undefined;
    const intensity = typeof p.intensity === "number" ? p.intensity : 5;
    const x = Math.sin(frame * 0.9) * intensity;
    
    return (
      <group position={[x, 0, 0]}>
        {(asset.type === "image" || asset.type === "svg") && asset.src ? (
          isGifAsset(asset) ? (
            <HtmlImage url={asset.src} scale={[400, 400]} />
          ) : (
            <DreiImage url={asset.src} scale={[400, 400]} />
          )
        ) : (
          <Text font={globalFontUrl} fontSize={60} color="#0f172a">{asset.content || "Text"}</Text>
        )}
      </group>
    );
  },
};
