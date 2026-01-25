import { z } from "zod";
import type { AnimationTemplate, RenderProps } from "../../types/template";
import { Text, Image as DreiImage } from "@react-three/drei";
import React from "react";
import { HtmlImage, isGifAsset, isAsset } from "../shared";

export const GlowTemplate: AnimationTemplate = {
  id: "glow",
  name: "Glow",
  slots: [
    { id: "asset", name: "Main Asset", type: "file", required: true }
  ],
  propsSchema: z.object({
    color: z.string().default("#ffffff"),
    radius: z.number().default(20),
  }),
  render: ({ assets, props }: RenderProps) => {
    const p = (props ?? {}) as Record<string, unknown>;
    const globalFontUrl = typeof p.globalFontUrl === "string" ? p.globalFontUrl : undefined;
    const asset = isAsset(assets.asset) ? assets.asset : undefined;
    if (!asset) return null;
    return (
      <group>
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
