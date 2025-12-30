import { z } from "zod";
import type { AnimationTemplate, RenderProps } from "../../types/template";
import { Text, Image as DreiImage } from "@react-three/drei";
import React, { useMemo, useState } from "react";
import type { Asset } from "../../types/timeline";
import * as THREE from "three";

function isAsset(value: unknown): value is Asset {
  return (
    typeof value === "object" &&
    value !== null &&
    "id" in value &&
    "type" in value
  );
}

type CachedVideo = {
  el: HTMLVideoElement;
  tex: THREE.VideoTexture;
};

const cachedVideos = new Map<string, CachedVideo>();

function getVideoTexture(url: string) {
  if (typeof document === "undefined") return new THREE.Texture();
  const existing = cachedVideos.get(url);
  if (existing) return existing.tex;

  const el = document.createElement("video");
  el.src = url;
  el.crossOrigin = "anonymous";
  el.muted = true;
  el.loop = true;
  el.playsInline = true;
  void el.play().catch(() => {});

  const tex = new THREE.VideoTexture(el);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.minFilter = THREE.LinearFilter;
  tex.magFilter = THREE.LinearFilter;
  cachedVideos.set(url, { el, tex });
  return tex;
}

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
  return value
    .replace(/^ +/, (m) => "\u00A0".repeat(m.length))
    .replace(/ +$/, (m) => "\u00A0".repeat(m.length));
}

function easeOutBack(t: number, overshoot = 1.35) {
  const x = Math.min(1, Math.max(0, t));
  const c1 = overshoot;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2);
}

function easeInOutCubic(t: number) {
  const x = Math.min(1, Math.max(0, t));
  return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
}

function clamp01(v: number) {
  return Math.min(1, Math.max(0, v));
}

type KineticEffect =
  | "pop_bounce"
  | "zoom_back"
  | "slide_left"
  | "slide_right"
  | "typewriter"
  | "pop_then_type"
  | "slide_then_type";

function splitWordsForContinuation(text: string): { a: string; b: string } {
  const tokens = (text || "")
    .trim()
    .split(/\s+/)
    .filter((t) => t.length > 0);

  if (tokens.length <= 1) return { a: tokens.join(" "), b: "" };
  const aCount = Math.ceil(tokens.length / 2);
  return {
    a: tokens.slice(0, aCount).join(" "),
    b: tokens.slice(aCount).join(" "),
  };
}

function parseTwoPartSegment(text: string, effect: KineticEffect): { a: string; b: string } {
  const raw = text || "";
  const idx = raw.indexOf("|");
  if (idx >= 0) {
    const a = raw.slice(0, idx).trim();
    const b = raw.slice(idx + 1).trim();
    return { a, b };
  }

  if (effect === "pop_then_type" || effect === "slide_then_type") {
    return splitWordsForContinuation(raw);
  }

  return { a: raw.trim(), b: "" };
}

function KineticTextScene(props: {
  frame: number;
  segments: Array<{ text: string; effect: KineticEffect }>;
  globalFontUrl?: string;
  fontSize: number;
  fontColor: string;
  accentColor: string;
  perSegmentFrames: number;
  enterFrames: number;
  exitFrames: number;
  continuationDelayFrames: number;
  continuationTypeFrames: number;
  slidePx: number;
  backgroundEnabled: boolean;
  backgroundOpacity: number;
  backgroundScale: number;
  backgroundVideoAspect: number;
  backgroundColor: string;
  backgroundAsset?: Asset;
}) {
  const {
    frame,
    segments,
    globalFontUrl,
    fontSize,
    fontColor,
    accentColor,
    perSegmentFrames,
    enterFrames,
    exitFrames,
    continuationDelayFrames,
    continuationTypeFrames,
    slidePx,
    backgroundEnabled,
    backgroundOpacity,
    backgroundScale,
    backgroundVideoAspect,
    backgroundColor,
    backgroundAsset,
  } = props;

  const safePer = Math.max(12, Math.floor(perSegmentFrames));
  const count = Math.max(1, segments.length);
  const idx = Math.min(count - 1, Math.floor(frame / safePer));
  const local = frame - idx * safePer;
  const seg = segments[idx] ?? { text: "", effect: "pop_bounce" };

  const enterT = clamp01(local / Math.max(1, enterFrames));
  const exitT = clamp01((local - (safePer - exitFrames)) / Math.max(1, exitFrames));
  const aliveAlpha = 1 - easeInOutCubic(exitT);

  const base = seg.text || "";
  const parsed = parseTwoPartSegment(base, seg.effect);
  const aText = parsed.a;
  const bText = parsed.b;

  const [aW, setAW] = useState(0);

  let scale = 1;
  let posX = 0;
  let posY = 0;
  let opacity = aliveAlpha;

  if (seg.effect === "pop_bounce") {
    scale = easeOutBack(enterT, 1.7);
    posY = (1 - enterT) * -24;
    opacity = easeInOutCubic(enterT) * aliveAlpha;
  } else if (seg.effect === "zoom_back") {
    scale = 0.55 + 0.45 * easeInOutCubic(enterT);
    posY = (1 - enterT) * 10;
    opacity = easeInOutCubic(enterT) * aliveAlpha;
  } else if (seg.effect === "slide_left") {
    scale = 0.9 + 0.1 * easeInOutCubic(enterT);
    posX = (1 - enterT) * 140;
    opacity = easeInOutCubic(enterT) * aliveAlpha;
  } else if (seg.effect === "slide_right") {
    scale = 0.9 + 0.1 * easeInOutCubic(enterT);
    posX = (1 - enterT) * -140;
    opacity = easeInOutCubic(enterT) * aliveAlpha;
  } else if (seg.effect === "typewriter") {
    scale = 1;
    opacity = aliveAlpha;
  } else if (seg.effect === "pop_then_type" || seg.effect === "slide_then_type") {
    const t0 = enterT;
    scale = seg.effect === "pop_then_type" ? easeOutBack(t0, 1.65) : 0.9 + 0.1 * easeInOutCubic(t0);
    posY = seg.effect === "pop_then_type" ? (1 - t0) * -18 : 0;
    posX = seg.effect === "slide_then_type" ? (1 - t0) * 120 : 0;
    opacity = easeInOutCubic(t0) * aliveAlpha;
  }

  const typeT = seg.effect === "typewriter" ? clamp01((local - 2) / Math.max(1, safePer - 6)) : 1;
  const typeChars = Math.floor(typeT * base.trim().length);
  const typeShown = base.trim().slice(0, typeChars);

  const contStart = Math.max(0, Math.floor(continuationDelayFrames));
  const contTypeT = clamp01((local - contStart) / Math.max(1, continuationTypeFrames));
  const contChars = Math.floor(contTypeT * bText.length);
  const contShown = bText.slice(0, contChars);
  const contSlideT = easeOutBack(clamp01((local - contStart) / 12), 1.2);
  const contX = (1 - contSlideT) * slidePx;

  const aDisplay = preserveEdgeSpaces(aText);
  const bDisplay = preserveEdgeSpaces(aText ? " " + contShown : contShown);

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

      <group scale={[scale, scale, 1]} position={[posX, posY, 0]}>
        <group position={[-aW / 2, 0, 0]}>
          {seg.effect === "typewriter" ? (
            <Text
              font={globalFontUrl}
              fontSize={fontSize}
              color={fontColor}
              anchorX="left"
              anchorY="middle"
              fillOpacity={opacity}
              onSync={(tObj) => {
                const w = readTextWidth(tObj);
                if (w !== aW) setAW(w);
              }}
            >
              {preserveEdgeSpaces(typeShown)}
            </Text>
          ) : (
            <>
              <Text
                font={globalFontUrl}
                fontSize={fontSize}
                color={fontColor}
                anchorX="left"
                anchorY="middle"
                fillOpacity={opacity}
                onSync={(tObj) => {
                  const w = readTextWidth(tObj);
                  if (w !== aW) setAW(w);
                }}
              >
                {aDisplay}
              </Text>

              {(seg.effect === "pop_then_type" || seg.effect === "slide_then_type") && bText ? (
                <Text
                  font={globalFontUrl}
                  fontSize={fontSize}
                  color={accentColor}
                  anchorX="left"
                  anchorY="middle"
                  position={[aW + contX, 0, 0]}
                  fillOpacity={opacity}
                >
                  {bDisplay}
                </Text>
              ) : null}
            </>
          )}
        </group>
      </group>
    </group>
  );
}

export const KineticTextSequenceTemplate: AnimationTemplate = {
  id: "kinetic-text",
  name: "Kinetic Text",
  slots: [
    { id: "background", name: "Background (Image/Video)", type: "file" },
    { id: "script", name: "Script (one segment per line)", type: "text", required: true },
  ],
  propsSchema: z.object({
    fontSize: z.number().min(18).max(160).default(78),
    fontColor: z.string().default("#ffffff"),
    accentColor: z.string().default("#ffffff"),
    autoDuration: z.boolean().default(true),
    perSegmentFrames: z.number().min(12).max(240).default(45),
    enterFrames: z.number().min(4).max(60).default(14),
    exitFrames: z.number().min(0).max(60).default(10),
    continuationDelayFrames: z.number().min(0).max(90).default(10),
    continuationTypeFrames: z.number().min(4).max(120).default(16),
    slidePx: z.number().min(0).max(240).default(32),
    backgroundEnabled: z.boolean().default(false),
    backgroundColor: z.string().default("#0b1220"),
    backgroundOpacity: z.number().min(0).max(1).default(1),
    backgroundScale: z.number().min(1000).max(12000).default(6000),
    backgroundVideoAspect: z.number().min(0.2).max(5).default(16 / 9),
  }),
  render: ({ assets, frame, duration, props }: RenderProps) => {
    const p = (props ?? {}) as Record<string, unknown>;
    const globalFontUrl = typeof p.globalFontUrl === "string" ? p.globalFontUrl : undefined;

    const fontSize = typeof p.fontSize === "number" ? p.fontSize : 78;
    const fontColor = typeof p.fontColor === "string" ? p.fontColor : "#ffffff";
    const accentColor = typeof p.accentColor === "string" ? p.accentColor : "#ffffff";
    const perSegmentFrames = typeof p.perSegmentFrames === "number" ? p.perSegmentFrames : 45;
    const enterFrames = typeof p.enterFrames === "number" ? p.enterFrames : 14;
    const exitFrames = typeof p.exitFrames === "number" ? p.exitFrames : 10;
    const continuationDelayFrames = typeof p.continuationDelayFrames === "number" ? p.continuationDelayFrames : 10;
    const continuationTypeFrames = typeof p.continuationTypeFrames === "number" ? p.continuationTypeFrames : 16;
    const slidePx = typeof p.slidePx === "number" ? p.slidePx : 32;

    const backgroundEnabled = typeof p.backgroundEnabled === "boolean" ? p.backgroundEnabled : false;
    const backgroundColor = typeof p.backgroundColor === "string" ? p.backgroundColor : "#0b1220";
    const backgroundOpacity = typeof p.backgroundOpacity === "number" ? p.backgroundOpacity : 1;
    const backgroundScale = typeof p.backgroundScale === "number" ? p.backgroundScale : 6000;
    const backgroundVideoAspectRaw = typeof p.backgroundVideoAspect === "number" ? p.backgroundVideoAspect : 16 / 9;
    const backgroundVideoAspect = Math.max(0.2, Math.min(5, backgroundVideoAspectRaw));
    const backgroundAsset = isAsset(assets.background) ? assets.background : undefined;

    const script = typeof assets.script === "string" ? (assets.script as string) : "";
    const rawLines = script.split(/\r?\n/);
    const lines = rawLines
      .map((l) => l.trim())
      .filter((l) => l.length > 0);

    const rawEffects = Array.isArray(p.segmentEffects) ? (p.segmentEffects as unknown[]) : [];
    const segments: Array<{ text: string; effect: KineticEffect }> = lines.map((text, i) => {
      const eff = typeof rawEffects[i] === "string" ? (rawEffects[i] as string) : "pop_bounce";
      const effect = (eff as KineticEffect) || "pop_bounce";
      return { text, effect };
    });

    if (segments.length === 0) {
      segments.push({ text: "text animation | just works", effect: "pop_then_type" });
      segments.push({ text: "In this video", effect: "zoom_back" });
      segments.push({ text: "we will break down", effect: "slide_left" });
      segments.push({ text: "the essentials", effect: "typewriter" });
    }

    return (
      <KineticTextScene
        frame={frame}
        segments={segments}
        globalFontUrl={globalFontUrl}
        fontSize={fontSize}
        fontColor={fontColor}
        accentColor={accentColor}
        perSegmentFrames={perSegmentFrames}
        enterFrames={enterFrames}
        exitFrames={exitFrames}
        continuationDelayFrames={continuationDelayFrames}
        continuationTypeFrames={continuationTypeFrames}
        slidePx={slidePx}
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

function HighlightScene(props: {
  frame: number;
  duration: number;
  fullText: string;
  highlightText: string;
  highlightColor: string;
  fontColor: string;
  fontSize: number;
  globalFontUrl?: string;
  backgroundEnabled: boolean;
  backgroundOpacity: number;
  backgroundScale: number;
  backgroundVideoAspect: number;
  backgroundColor: string;
  backgroundAsset?: Asset;
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
    backgroundEnabled,
    backgroundOpacity,
    backgroundScale,
    backgroundVideoAspect,
    backgroundColor,
    backgroundAsset,
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
    { id: "background", name: "Background (Image/Video)", type: "file" },
    { id: "text", name: "Full Text", type: "text", required: true },
    { id: "highlight", name: "Text to Highlight", type: "text", required: true }
  ],
  propsSchema: z.object({
    highlightColor: z.string().default("#fde047"),
    fontColor: z.string().default("#0f172a"),
    fontSize: z.number().min(18).max(140).default(60),
    backgroundEnabled: z.boolean().default(false),
    backgroundColor: z.string().default("#ffffff"),
    backgroundOpacity: z.number().min(0).max(1).default(1),
    backgroundScale: z.number().min(1000).max(12000).default(6000),
    backgroundVideoAspect: z.number().min(0.2).max(5).default(16 / 9),
  }),
  render: ({ assets, frame, duration, props }: RenderProps) => {
    const p = (props ?? {}) as Record<string, unknown>;
    const globalFontUrl = typeof p.globalFontUrl === "string" ? p.globalFontUrl : undefined;
    const highlightColor = typeof p.highlightColor === "string" ? p.highlightColor : "#fde047";
    const fontColor = typeof p.fontColor === "string" ? p.fontColor : "#0f172a";
    const fontSize = typeof p.fontSize === "number" ? p.fontSize : 60;

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
        fontSize={fontSize}
        globalFontUrl={globalFontUrl}
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
