import React from "react";
import { Text, Image as DreiImage } from "@react-three/drei";
import { HtmlImage, getVideoTexture, isGifAsset } from "../../templates/text/shared";
import { SlideSceneProps } from "./schemas/slide";

export function SlideScene({
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
  disableSlideAnimation,
  backgroundEnabled,
  backgroundOpacity,
  backgroundScale,
  backgroundVideoAspect,
  backgroundColor,
  background, // Replaces backgroundAsset
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

  const backgroundAsset = background;

  return (
    <group>
      {backgroundEnabled && backgroundAsset?.src && (backgroundAsset.type === "image" || backgroundAsset.type === "svg") ? (
        <group position={[0, 0, -120]}>
          {isGifAsset(backgroundAsset) ? (
            <HtmlImage
              url={backgroundAsset.src}
              scale={[backgroundScale, backgroundScale]}
              opacity={Math.min(1, Math.max(0, backgroundOpacity))}
            />
          ) : (
            <DreiImage
              url={backgroundAsset.src}
              scale={[backgroundScale, backgroundScale]}
              transparent
              opacity={Math.min(1, Math.max(0, backgroundOpacity))}
            />
          )}
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
          const progress = disableSlideAnimation ? 1 : Math.min(1, Math.max(0, itemFrame / duration));
          const ease = disableSlideAnimation ? 1 : 1 - Math.pow(1 - progress, 3);

          const currentX = disableSlideAnimation ? 0 : startX * (1 - ease);
          const currentY = disableSlideAnimation ? 0 : startY * (1 - ease);

          // Calculate layout position
          const offset = axisCenters[index] ?? 0;

          const posX = layout === "row" ? offset : 0;
          const posY = layout === "column" ? -offset : 0; // -offset because Y goes up

          const scaleX = imageSize * (Number(imageScaleXBySlot[slotId]) || 1);
          const scaleY = imageSize * (Number(imageScaleYBySlot[slotId]) || 1);

          return (
            <group key={asset.id} position={[posX + currentX, posY + currentY, 0]}>
              {(asset.type === "image" || asset.type === "svg") && asset.src ? (
                isGifAsset(asset) ? (
                  <HtmlImage url={asset.src} scale={[scaleX, scaleY]} />
                ) : (
                  <DreiImage url={asset.src} scale={[scaleX, scaleY]} />
                )
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
