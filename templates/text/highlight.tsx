import { z } from "zod";
import type { AnimationTemplate, RenderProps } from "../../types/template";
import { Text, Image as DreiImage } from "@react-three/drei";
import React, { useMemo, useState, useEffect } from "react";
import { useThree } from "@react-three/fiber";
import type { Asset } from "../../types/timeline";
import { getVideoTexture, isAsset, preserveEdgeSpaces, readTextWidth } from "./shared";

function HighlightScene(props: {
  frame: number;
  duration: number;
  fullText: string;
  highlightText: string;
  highlightColor: string;
  fontColor: string;
  highlightFontColor: string;
  fontSize: number;
  highlightPadding: number;
  highlightXOffset: number;
  highlightYOffset: number;
  globalFontUrl?: string;
  backgroundEnabled: boolean;
  backgroundOpacity: number;
  backgroundScale: number;
  backgroundVideoAspect: number;
  backgroundColor: string;
  backgroundAsset?: Asset;
  cameraPosition?: [number, number, number];
  cameraTarget?: [number, number, number];
}) {
  const {
    frame,
    duration,
    fullText,
    highlightText,
    highlightColor,
    fontColor,
    highlightFontColor,
    fontSize,
    highlightPadding,
    highlightXOffset,
    highlightYOffset,
    globalFontUrl,
    backgroundEnabled,
    backgroundOpacity,
    backgroundScale,
    backgroundVideoAspect,
    backgroundColor,
    backgroundAsset,
    cameraPosition,
    cameraTarget,
  } = props;

  const { prefix, highlighted, suffix } = useMemo(() => {
    const safeFull = fullText || "Highlight Me";
    const safeNeedle = highlightText || "";
    if (!safeNeedle) return { prefix: safeFull, highlighted: "", suffix: "" };

    const idx = safeFull.toLowerCase().indexOf(safeNeedle.toLowerCase());
    if (idx < 0) return { prefix: safeFull, highlighted: "", suffix: "" };

    return {
      prefix: safeFull.slice(0, idx),
      highlighted: safeFull.slice(idx, idx + safeNeedle.length),
      suffix: safeFull.slice(idx + safeNeedle.length),
    };
  }, [fullText, highlightText]);

  const [prefixW, setPrefixW] = useState(0);
  const [hlW, setHlW] = useState(0);
  const [suffixW, setSuffixW] = useState(0);
  const [hlCoreW, setHlCoreW] = useState(0);
  const [hlLeftPadW, setHlLeftPadW] = useState(0);

  const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
  const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
  const denom = Math.max(1, duration - 1);
  const t = clamp01(frame / denom);
  const reveal = easeOutCubic(clamp01(t * 1.1));

  const totalW = prefixW + hlW + suffixW;
  const leftX = -totalW / 2;

  const padLeft = highlightPadding;
  const padRight = highlightPadding;
  const boxH = Math.max(32, fontSize * 0.92);
  const highlightCore = highlighted.trim();
  const highlightLeftPad = highlighted.slice(0, highlighted.length - highlighted.trimStart().length);

  const boxWTarget = highlighted ? Math.max(0, hlCoreW + padLeft + padRight) : 0;
  const boxW = boxWTarget * reveal;

  // Position logic for left-to-right reveal:
  // 1. Identify where the highlight starts (its left edge).
  // 2. The center of the box (boxX) must move as boxW grows to keep the left edge fixed.
  const highlightStart = leftX + prefixW + hlLeftPadW - padLeft + highlightXOffset;
  const boxX = highlightStart + boxW / 2;
  const boxY = 0 + highlightYOffset;

  const prefixDisplay = preserveEdgeSpaces(prefix);
  const highlightedDisplay = preserveEdgeSpaces(highlighted);
  const suffixDisplay = preserveEdgeSpaces(suffix);

  const { camera, controls } = useThree();

  useEffect(() => {
    if (cameraPosition && camera) {
      camera.position.set(...cameraPosition);
    }
    if (cameraTarget && controls) {
      (controls as any).target.set(...cameraTarget);
      (controls as any).update();
    }

    // Cleanup: Restore to scene defaults [0, 0, 1000]
    return () => {
      if (cameraPosition && camera) {
        camera.position.set(0, 0, 1000);
      }
      if (cameraTarget && controls) {
        (controls as any).target.set(0, 0, 0);
        (controls as any).update();
      }
    };
  }, [cameraPosition, cameraTarget, camera, controls]);

  return (
    <group>
      {backgroundEnabled && backgroundAsset?.src && (backgroundAsset.type === "image" || backgroundAsset.type === "svg") ? (
        <group position={[0, 0, -120]}>
          <DreiImage
            url={backgroundAsset.src}
            scale={[backgroundScale, backgroundScale]}
            transparent
            opacity={clamp01(backgroundOpacity)}
          />
        </group>
      ) : null}

      {backgroundEnabled && backgroundAsset?.src && backgroundAsset.type === "video" ? (
        <mesh position={[0, 0, -120]} renderOrder={-10}>
          <planeGeometry args={[backgroundScale, backgroundScale / backgroundVideoAspect]} />
          <meshBasicMaterial
            map={getVideoTexture(backgroundAsset.src)}
            transparent={backgroundOpacity < 1}
            opacity={clamp01(backgroundOpacity)}
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
            opacity={clamp01(backgroundOpacity)}
            depthWrite={false}
          />
        </mesh>
      ) : null}

      {highlighted ? (
        <mesh position={[boxX, boxY, -6]}>
          <boxGeometry args={[Math.max(0.001, boxW), boxH, 6]} />
          <meshBasicMaterial color={highlightColor} transparent opacity={0.85} toneMapped={false} />
        </mesh>
      ) : null}

      <group position={[leftX, 0, 0]}>
        {/* Hidden measurement text so highlight bar matches glyph width exactly (no trailing-space bar). */}
        <Text
          font={globalFontUrl}
          fontSize={fontSize}
          color={fontColor}
          anchorX="left"
          anchorY="middle"
          position={[0, -10000, 0]}
          fillOpacity={0}
          onSync={(tObj) => {
            const w = readTextWidth(tObj);
            if (w !== hlCoreW) setHlCoreW(w);
          }}
        >
          {preserveEdgeSpaces(highlightCore)}
        </Text>
        <Text
          font={globalFontUrl}
          fontSize={fontSize}
          color={fontColor}
          anchorX="left"
          anchorY="middle"
          position={[0, -10000, 0]}
          fillOpacity={0}
          onSync={(tObj) => {
            const w = readTextWidth(tObj);
            if (w !== hlLeftPadW) setHlLeftPadW(w);
          }}
        >
          {preserveEdgeSpaces(highlightLeftPad)}
        </Text>

        <Text
          font={globalFontUrl}
          fontSize={fontSize}
          color={fontColor}
          anchorX="left"
          anchorY="middle"
          onSync={(tObj) => {
            const w = readTextWidth(tObj);
            if (w !== prefixW) setPrefixW(w);
          }}
        >
          {prefixDisplay}
        </Text>

        <Text
          font={globalFontUrl}
          fontSize={fontSize}
          color={highlightFontColor}
          anchorX="left"
          anchorY="middle"
          position={[prefixW, 0, 0]}
          onSync={(tObj) => {
            const w = readTextWidth(tObj);
            if (w !== hlW) setHlW(w);
          }}
        >
          {highlightedDisplay}
        </Text>

        <Text
          font={globalFontUrl}
          fontSize={fontSize}
          color={fontColor}
          anchorX="left"
          anchorY="middle"
          position={[prefixW + hlW, 0, 0]}
          onSync={(tObj) => {
            const w = readTextWidth(tObj);
            if (w !== suffixW) setSuffixW(w);
          }}
        >
          {suffixDisplay}
        </Text>
      </group>
    </group>
  );
}

/**
 * HighlightTemplate: Animated text highlighting.
 */
export const HighlightTemplate: AnimationTemplate = {
  id: "highlight",
  name: "Text Highlight",
  slots: [
    { id: "background", name: "Background (Image/Video)", type: "file" },
    { id: "text", name: "Full Text", type: "text", required: true },
    { id: "highlight", name: "Text to Highlight", type: "text", required: true }
  ],
  propsSchema: z.object({
    highlightColor: z.string().default("#fde047"),
    fontColor: z.string().default("#0f172a"),
    highlightFontColor: z.string().default("#0f172a"),
    fontSize: z.number().min(18).max(140).default(60),
    highlightPadding: z.number().min(0).max(100).default(12),
    highlightXOffset: z.number().default(0),
    highlightYOffset: z.number().default(0),
    backgroundEnabled: z.boolean().default(false),
    backgroundColor: z.string().default("#ffffff"),
    backgroundOpacity: z.number().min(0).max(1).default(1),
    backgroundScale: z.number().min(1000).max(12000).default(6000),
    backgroundVideoAspect: z.number().min(0.2).max(5).default(16 / 9),
    cameraPosition: z.array(z.number()).length(3).optional(),
    cameraTarget: z.array(z.number()).length(3).optional(),
  }),
  render: ({ assets, frame, duration, props }: RenderProps) => {
    const p = (props ?? {}) as Record<string, unknown>;
    const globalFontUrl = typeof p.globalFontUrl === "string" ? p.globalFontUrl : undefined;
    const highlightColor = typeof p.highlightColor === "string" ? p.highlightColor : "#fde047";
    const fontColor = typeof p.fontColor === "string" ? p.fontColor : "#0f172a";
    const highlightFontColor = typeof p.highlightFontColor === "string" ? p.highlightFontColor : "#0f172a";
    const fontSize = typeof p.fontSize === "number" ? p.fontSize : 60;
    const highlightPadding = typeof p.highlightPadding === "number" ? p.highlightPadding : 12;
    const highlightXOffset = typeof p.highlightXOffset === "number" ? p.highlightXOffset : 0;
    const highlightYOffset = typeof p.highlightYOffset === "number" ? p.highlightYOffset : 0;

    const backgroundEnabled = typeof p.backgroundEnabled === "boolean" ? p.backgroundEnabled : false;
    const backgroundColor = typeof p.backgroundColor === "string" ? p.backgroundColor : "#ffffff";
    const backgroundOpacity = typeof p.backgroundOpacity === "number" ? p.backgroundOpacity : 1;
    const backgroundScale = typeof p.backgroundScale === "number" ? p.backgroundScale : 6000;
    const backgroundVideoAspectRaw = typeof p.backgroundVideoAspect === "number" ? p.backgroundVideoAspect : 16 / 9;
    const backgroundVideoAspect = Math.max(0.2, Math.min(5, backgroundVideoAspectRaw));

    const backgroundAsset = isAsset(assets.background) ? assets.background : undefined;

    const fullText = typeof assets.text === "string" ? assets.text : "";
    const highlightText = typeof assets.highlight === "string" ? assets.highlight : "";

    return (
      <HighlightScene
        frame={frame}
        duration={duration}
        fullText={fullText}
        highlightText={highlightText}
        highlightColor={highlightColor}
        fontColor={fontColor}
        highlightFontColor={highlightFontColor}
        fontSize={fontSize}
        highlightPadding={highlightPadding}
        highlightXOffset={highlightXOffset}
        highlightYOffset={highlightYOffset}
        globalFontUrl={globalFontUrl}
        backgroundEnabled={backgroundEnabled}
        backgroundOpacity={backgroundOpacity}
        backgroundScale={backgroundScale}
        backgroundVideoAspect={backgroundVideoAspect}
        backgroundColor={backgroundColor}
        backgroundAsset={backgroundAsset}
        cameraPosition={p.cameraPosition as [number, number, number] | undefined}
        cameraTarget={p.cameraTarget as [number, number, number] | undefined}
      />
    );
  },
};
