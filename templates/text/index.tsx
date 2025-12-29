import { z } from "zod";
import type { AnimationTemplate, RenderProps } from "../../types/template";
import { Text } from "@react-three/drei";
import React, { useMemo, useState } from "react";

function readTextWidth(obj: unknown): number {
  if (typeof obj !== "object" || obj === null) return 0;
  const maybe = obj as {
    textRenderInfo?: {
      blockBounds?: number[];
    };
  };
  const w = maybe.textRenderInfo?.blockBounds?.[2];
  return typeof w === "number" && Number.isFinite(w) ? w : 0;
}

function preserveEdgeSpaces(value: string): string {
  if (!value) return value;
  // Troika may trim leading/trailing spaces and they don't reliably contribute to layout.
  // Convert edge spaces to NBSP so spacing between segment Text nodes stays consistent.
  return value
    .replace(/^ +/, (m) => "\u00A0".repeat(m.length))
    .replace(/ +$/, (m) => "\u00A0".repeat(m.length));
}

function HighlightScene(props: {
  frame: number;
  duration: number;
  fullText: string;
  highlightText: string;
  highlightColor: string;
  fontColor: string;
  fontSize: number;
  globalFontUrl?: string;
}) {
  const {
    frame,
    duration,
    fullText,
    highlightText,
    highlightColor,
    fontColor,
    fontSize,
    globalFontUrl,
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

  const padLeft = 0;
  const padRight = 0;
  const boxH = Math.max(32, fontSize * 0.92);
  const highlightCore = highlighted.trim();
  const highlightLeftPad = highlighted.slice(0, highlighted.length - highlighted.trimStart().length);

  const boxWTarget = highlighted ? Math.max(0, hlCoreW + padLeft + padRight) : 0;
  const boxW = boxWTarget * reveal;
  const boxX = leftX + prefixW + hlLeftPadW + boxW / 2;

  const prefixDisplay = preserveEdgeSpaces(prefix);
  const highlightedDisplay = preserveEdgeSpaces(highlighted);
  const suffixDisplay = preserveEdgeSpaces(suffix);

  return (
    <group>
      {highlighted ? (
        <mesh position={[boxX, 0, -6]}>
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
          color={fontColor}
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
    { id: "text", name: "Full Text", type: "text", required: true },
    { id: "highlight", name: "Text to Highlight", type: "text", required: true }
  ],
  propsSchema: z.object({
    highlightColor: z.string().default("#fde047"),
    fontColor: z.string().default("#0f172a"),
    fontSize: z.number().min(18).max(140).default(60),
  }),
  render: ({ assets, frame, duration, props }: RenderProps) => {
    const p = (props ?? {}) as Record<string, unknown>;
    const globalFontUrl = typeof p.globalFontUrl === "string" ? p.globalFontUrl : undefined;
    const highlightColor = typeof p.highlightColor === "string" ? p.highlightColor : "#fde047";
    const fontColor = typeof p.fontColor === "string" ? p.fontColor : "#0f172a";
    const fontSize = typeof p.fontSize === "number" ? p.fontSize : 60;

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
        fontSize={fontSize}
        globalFontUrl={globalFontUrl}
      />
    );
  },
};
