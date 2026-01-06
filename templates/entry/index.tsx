import { z } from "zod";
import type { AnimationTemplate, RenderProps } from "../../types/template";
import { Text, Image as DreiImage } from "@react-three/drei";
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
  render: ({ assets, frame, props }: RenderProps) => {
    const p = (props ?? {}) as Record<string, unknown>;
    const globalFontUrl = typeof p.globalFontUrl === "string" ? p.globalFontUrl : undefined;
    const asset = isAsset(assets.asset) ? assets.asset : undefined;
    if (!asset) return null;
    const opacity = Math.min(1, frame / 30);

    if ((asset.type === "image" || asset.type === "svg") && asset.src) {
      return <DreiImage url={asset.src} transparent opacity={opacity} scale={[400, 400]} />;
    }
    return (
      <Text font={globalFontUrl} fontSize={60} color="#0f172a" fillOpacity={opacity}>
        {asset.content || "Text"}
      </Text>
    );
  },
};

interface SlideSceneProps {
  items: Asset[];
  frame: number;
  duration: number;
  direction: "left" | "right" | "top" | "bottom";
  layout: "row" | "column";
  gap: number;
  globalFontUrl?: string;
  fontSize: number;
  textColor: string;
  imageSize: number;
  staggerFrames: number;
}

function SlideScene({ items, frame, duration, direction, layout, gap, globalFontUrl, fontSize, textColor, imageSize, staggerFrames }: SlideSceneProps) {
  // Calculate offset based on direction
  // Start 800 units away
  const distance = 800;
  let startX = 0, startY = 0;

  switch (direction) {
    case "left": startX = -distance; break; // From left
    case "right": startX = distance; break; // From right
    case "top": startY = distance; break;   // From top
    case "bottom": startY = -distance; break; // From bottom
  }

  return (
    <group>
      {items.map((asset, index) => {
          // Calculate animation progress for this specific item
          // Each item starts after staggerFrames * index frames
          const itemStartFrame = staggerFrames * index;
          const itemFrame = frame - itemStartFrame;
          
          // Animation progress
          const progress = Math.min(1, Math.max(0, itemFrame / duration));
          // Ease out cubic
          const ease = 1 - Math.pow(1 - progress, 3);

          const currentX = startX * (1 - ease);
          const currentY = startY * (1 - ease);

          // Calculate layout position
          // Center the group of items by calculating total width/height including gaps
          const totalSize = (items.length - 1) * (imageSize + gap);
          const offset = -totalSize / 2 + index * (imageSize + gap);
          
          const posX = layout === "row" ? offset : 0;
          const posY = layout === "column" ? -offset : 0; // -offset because Y goes up

          return (
            <group key={asset.id} position={[posX + currentX, posY + currentY, 0]}>
              {(asset.type === "image" || asset.type === "svg") && asset.src ? (
                <DreiImage url={asset.src} scale={[imageSize, imageSize]} />
              ) : (
                <Text font={globalFontUrl} fontSize={fontSize} color={textColor} anchorX="center" anchorY="middle">
                  {asset.content || "Text"}
                </Text>
              )}
            </group>
          );
      })}
    </group>
  );
}

export const SlideTemplate: AnimationTemplate = {
  id: "slide-in",
  name: "Slide In",
  slots: [
    { id: "asset", name: "Asset 1", type: "file", required: true },
    { id: "asset2", name: "Asset 2 (Optional)", type: "file", required: false },
    { id: "asset3", name: "Asset 3 (Optional)", type: "file", required: false },
  ],
  propsSchema: z.object({
    direction: z.enum(["left", "right", "top", "bottom"]).default("left"),
    duration: z.number().default(30),
    layout: z.enum(["row", "column"]).default("row"),
    gap: z.number().default(100),
    fontSize: z.number().default(60),
    textColor: z.string().default("#0f172a"),
    imageSize: z.number().default(400),
    staggerFrames: z.number().default(0),
  }),
  render: ({ assets, frame, props }: RenderProps) => {
    const p = (props ?? {}) as Record<string, unknown>;
    const globalFontUrl = typeof p.globalFontUrl === "string" ? p.globalFontUrl : undefined;
    
    // Gather assets
    const items = [assets.asset, assets.asset2, assets.asset3]
      .filter(isAsset);

    if (items.length === 0) return null;

    const direction = (p.direction as "left" | "right" | "top" | "bottom") || "left";
    const duration = Number(p.duration) || 30;
    const layout = (p.layout as "row" | "column") || "row";
    const gap = Number(p.gap) || 50;
    const fontSize = Number(p.fontSize) || 60;
    const textColor = String(p.textColor || "#0f172a");
    const imageSize = Number(p.imageSize) || 400;
    const staggerFrames = Number(p.staggerFrames) || 0;

    return (
      <SlideScene
        items={items}
        frame={frame}
        duration={duration}
        direction={direction}
        layout={layout}
        gap={gap}
        globalFontUrl={globalFontUrl}
        fontSize={fontSize}
        textColor={textColor}
        imageSize={imageSize}
        staggerFrames={staggerFrames}
      />
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
  render: ({ assets, props }: RenderProps) => {
    const p = (props ?? {}) as Record<string, unknown>;
    const globalFontUrl = typeof p.globalFontUrl === "string" ? p.globalFontUrl : undefined;
    const asset = isAsset(assets.asset) ? assets.asset : undefined;
    if (!asset) return null;
    return (
      <group>
        {(asset.type === "image" || asset.type === "svg") && asset.src ? (
          <DreiImage url={asset.src} scale={[400, 400]} />
        ) : (
          <Text font={globalFontUrl} fontSize={60} color="#0f172a">{asset.content || "Text"}</Text>
        )}
      </group>
    );
  },
};