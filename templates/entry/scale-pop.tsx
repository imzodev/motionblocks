import { z } from "zod";
import type { AnimationTemplate, RenderProps } from "../../types/template";
import { Text, Image as DreiImage } from "@react-three/drei";
import React from "react";
import { isAsset } from "../shared";

export const ScalePopTemplate: AnimationTemplate = {
  id: "scale-pop",
  name: "Scale Pop",
  slots: [
    { id: "asset", name: "Main Asset", type: "file", required: true }
  ],
  propsSchema: z.object({
    duration: z.number().default(30),
  }),
  render: ({ assets, frame, props }: RenderProps) => {
    const p = (props ?? {}) as Record<string, unknown>;
    const globalFontUrl = typeof p.globalFontUrl === "string" ? p.globalFontUrl : undefined;
    const asset = isAsset(assets.asset) ? assets.asset : undefined;
    if (!asset) return null;
    const scale = Math.min(1, frame / 15) * 1.2; // Quick pop
    
    return (
      <group scale={[scale, scale, scale]}>
        {(asset.type === "image" || asset.type === "svg") && asset.src ? (
          <DreiImage url={asset.src} scale={[400, 400]} />
        ) : (
          <Text font={globalFontUrl} fontSize={60} color="#0f172a">{asset.content || "Text"}</Text>
        )}
      </group>
    );
  },
};
