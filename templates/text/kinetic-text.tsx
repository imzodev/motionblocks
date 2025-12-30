import { z } from "zod";
import type { AnimationTemplate, RenderProps } from "../../types/template";
import { Text, Image as DreiImage } from "@react-three/drei";
import React, { useState } from "react";
import type { Asset } from "../../types/timeline";
import { getVideoTexture, isAsset, preserveEdgeSpaces, readTextWidth } from "./shared";

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
