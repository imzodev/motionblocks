import { z } from "zod";
import type { AnimationTemplate, RenderProps } from "../../types/template";
import { Text, Image as DreiImage } from "@react-three/drei";
import React from "react";
import type { Asset } from "../../types/timeline";
import { getVideoTexture } from "../text/shared";

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
  items: { slotId: "asset" | "asset2" | "asset3"; asset: Asset }[];
  frame: number;
  duration: number;
  direction: "left" | "right" | "top" | "bottom";
  layout: "row" | "column";
  gap: number;
  globalFontUrl?: string;
  fontSize: number;
  textColor: string;
  imageSize: number;
  imageScaleXBySlot: Record<"asset" | "asset2" | "asset3", number>;
  imageScaleYBySlot: Record<"asset" | "asset2" | "asset3", number>;
  staggerFrames: number;
  backgroundEnabled: boolean;
  backgroundOpacity: number;
  backgroundScale: number;
  backgroundVideoAspect: number;
  backgroundColor: string;
  backgroundAsset?: Asset;
}

function SlideScene({
  items,
  frame,
  duration,
  direction,
  layout,
  gap,
  globalFontUrl,
  fontSize,
  textColor,
  imageSize,
  imageScaleXBySlot,
  imageScaleYBySlot,
  staggerFrames,
  backgroundEnabled,
  backgroundOpacity,
  backgroundScale,
  backgroundVideoAspect,
  backgroundColor,
  backgroundAsset,
}: SlideSceneProps) {
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
      {backgroundEnabled && backgroundAsset?.src && (backgroundAsset.type === "image" || backgroundAsset.type === "svg") ? (
        <group position={[0, 0, -120]}>
          <DreiImage
            url={backgroundAsset.src}
            scale={[backgroundScale, backgroundScale]}
            transparent
            opacity={Math.min(1, Math.max(0, backgroundOpacity))}
          />
        </group>
      ) : null}

      {backgroundEnabled && backgroundAsset?.src && backgroundAsset.type === "video" ? (
        <mesh position={[0, 0, -120]} renderOrder={-10}>
          <planeGeometry args={[backgroundScale, backgroundScale / backgroundVideoAspect]} />
          <meshBasicMaterial
            map={getVideoTexture(backgroundAsset.src)}
            transparent={backgroundOpacity < 1}
            opacity={Math.min(1, Math.max(0, backgroundOpacity))}
            depthWrite={false}
          />
        </mesh>
      ) : null}

      {backgroundEnabled && !backgroundAsset ? (
        <mesh position={[0, 0, -120]} renderOrder={-10}>
          <planeGeometry args={[backgroundScale, backgroundScale]} />
          <meshBasicMaterial
            color={backgroundColor}
            transparent={backgroundOpacity < 1}
            opacity={Math.min(1, Math.max(0, backgroundOpacity))}
            depthWrite={false}
          />
        </mesh>
      ) : null}

      {(() => {
        const sizes = items.map(({ slotId }) => {
          const sx = Number(imageScaleXBySlot[slotId]) || 1;
          const sy = Number(imageScaleYBySlot[slotId]) || 1;
          return imageSize * Math.max(0.01, Math.max(sx, sy));
        });

        const totalAxisSize = sizes.reduce((sum, s) => sum + s, 0) + Math.max(0, items.length - 1) * gap;
        let cursor = -totalAxisSize / 2;
        const axisCenters = sizes.map((s) => {
          const center = cursor + s / 2;
          cursor += s + gap;
          return center;
        });

        return items.map(({ asset, slotId }, index) => {
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
          const offset = axisCenters[index] ?? 0;

          const posX = layout === "row" ? offset : 0;
          const posY = layout === "column" ? -offset : 0; // -offset because Y goes up

          const scaleX = imageSize * (Number(imageScaleXBySlot[slotId]) || 1);
          const scaleY = imageSize * (Number(imageScaleYBySlot[slotId]) || 1);

          return (
            <group key={asset.id} position={[posX + currentX, posY + currentY, 0]}>
              {(asset.type === "image" || asset.type === "svg") && asset.src ? (
                <DreiImage url={asset.src} scale={[scaleX, scaleY]} />
              ) : (
                <Text font={globalFontUrl} fontSize={fontSize} color={textColor} anchorX="center" anchorY="middle">
                  {asset.content || "Text"}
                </Text>
              )}
            </group>
          );
        });
      })()}
    </group>
  );
}

export const SlideTemplate: AnimationTemplate = {
  id: "slide-in",
  name: "Slide In",
  slots: [
    { id: "background", name: "Background (Image/Video)", type: "file" },
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
    assetScaleX: z.number().default(1),
    assetScaleY: z.number().default(1),
    asset2ScaleX: z.number().default(1),
    asset2ScaleY: z.number().default(1),
    asset3ScaleX: z.number().default(1),
    asset3ScaleY: z.number().default(1),
    staggerFrames: z.number().default(0),
    backgroundEnabled: z.boolean().default(false),
    backgroundColor: z.string().default("#ffffff"),
    backgroundOpacity: z.number().min(0).max(1).default(1),
    backgroundScale: z.number().min(1000).max(12000).default(6000),
    backgroundVideoAspect: z.number().min(0.2).max(5).default(16 / 9),
  }),
  render: ({ assets, frame, props }: RenderProps) => {
    const p = (props ?? {}) as Record<string, unknown>;
    const globalFontUrl = typeof p.globalFontUrl === "string" ? p.globalFontUrl : undefined;
    
    // Gather assets
    const items: { slotId: "asset" | "asset2" | "asset3"; asset: Asset }[] = [];
    if (isAsset(assets.asset)) items.push({ slotId: "asset", asset: assets.asset });
    if (isAsset(assets.asset2)) items.push({ slotId: "asset2", asset: assets.asset2 });
    if (isAsset(assets.asset3)) items.push({ slotId: "asset3", asset: assets.asset3 });

    if (items.length === 0) return null;

    const backgroundEnabled = typeof p.backgroundEnabled === "boolean" ? p.backgroundEnabled : false;
    const backgroundColor = typeof p.backgroundColor === "string" ? p.backgroundColor : "#ffffff";
    const backgroundOpacity = typeof p.backgroundOpacity === "number" ? p.backgroundOpacity : 1;
    const backgroundScale = typeof p.backgroundScale === "number" ? p.backgroundScale : 6000;
    const backgroundVideoAspectRaw = typeof p.backgroundVideoAspect === "number" ? p.backgroundVideoAspect : 16 / 9;
    const backgroundVideoAspect = Math.max(0.2, Math.min(5, backgroundVideoAspectRaw));
    const backgroundAsset = isAsset(assets.background) ? assets.background : undefined;

    const direction = (p.direction as "left" | "right" | "top" | "bottom") || "left";
    const duration = Number(p.duration) || 30;
    const layout = (p.layout as "row" | "column") || "row";
    const gap = Number(p.gap) || 50;
    const fontSize = Number(p.fontSize) || 60;
    const textColor = String(p.textColor || "#0f172a");
    const imageSize = Number(p.imageSize) || 400;
    const staggerFrames = Number(p.staggerFrames) || 0;

    const imageScaleXBySlot: Record<"asset" | "asset2" | "asset3", number> = {
      asset: typeof p.assetScaleX === "number" ? p.assetScaleX : 1,
      asset2: typeof p.asset2ScaleX === "number" ? p.asset2ScaleX : 1,
      asset3: typeof p.asset3ScaleX === "number" ? p.asset3ScaleX : 1,
    };

    const imageScaleYBySlot: Record<"asset" | "asset2" | "asset3", number> = {
      asset: typeof p.assetScaleY === "number" ? p.assetScaleY : 1,
      asset2: typeof p.asset2ScaleY === "number" ? p.asset2ScaleY : 1,
      asset3: typeof p.asset3ScaleY === "number" ? p.asset3ScaleY : 1,
    };

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
        imageScaleXBySlot={imageScaleXBySlot}
        imageScaleYBySlot={imageScaleYBySlot}
        staggerFrames={staggerFrames}
        backgroundEnabled={backgroundEnabled}
        backgroundOpacity={backgroundOpacity}
        backgroundScale={backgroundScale}
        backgroundVideoAspect={backgroundVideoAspect}
        backgroundColor={backgroundColor}
        backgroundAsset={backgroundAsset}
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