import { z } from "zod";
import type { AnimationTemplate, RenderProps } from "../../types/template";
import { Text, Image as DreiImage } from "@react-three/drei";
import React from "react";
import { HtmlImage, isGifAsset, isAsset } from "../shared";

export const FadeInTemplate: AnimationTemplate = {
  id: "fade-in",
  name: "Fade In",
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
    const opacity = Math.min(1, frame / 30);

    if ((asset.type === "image" || asset.type === "svg") && asset.src) {
      if (isGifAsset(asset)) {
        return <HtmlImage url={asset.src} scale={[400, 400]} opacity={opacity} />;
      }
      return <DreiImage url={asset.src} transparent opacity={opacity} scale={[400, 400]} />;
    }
    return (
      <Text font={globalFontUrl} fontSize={60} color="#0f172a" fillOpacity={opacity}>
        {asset.content || "Text"}
      </Text>
    );
  },
};
