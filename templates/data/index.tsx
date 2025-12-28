import { z } from "zod";
import type { AnimationTemplate, RenderProps } from "../../types/template";
import { Text, Image as DreiImage } from "@react-three/drei";
import React from "react";
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

/**
 * CounterTemplate: Animated number interpolation.
 */
export const CounterTemplate: AnimationTemplate = {
  id: "counter",
  name: "Counter",
  slots: [
    { id: "label", name: "Label Text", type: "text" }
  ],
  propsSchema: z.object({
    startValue: z.number().default(0),
    endValue: z.number().default(100),
    duration: z.number().default(60),
    prefix: z.string().optional(),
    suffix: z.string().optional(),
  }),
  render: ({ assets, frame, props }: RenderProps) => {
    const p = (props ?? {}) as Record<string, unknown>;
    const startValue = typeof p.startValue === "number" ? p.startValue : 0;
    const endValue = typeof p.endValue === "number" ? p.endValue : 100;
    const duration = typeof p.duration === "number" ? p.duration : 60;
    const prefix = typeof p.prefix === "string" ? p.prefix : "";
    const suffix = typeof p.suffix === "string" ? p.suffix : "";
    const progress = Math.min(1, frame / duration);
    const value = Math.floor(startValue + (endValue - startValue) * progress);
    const label = typeof assets.label === "string" ? assets.label : "";
    
    return (
      <group>
        <Text fontSize={80} color="#0f172a" position={[0, 0, 0]}>
          {`${prefix}${value}${suffix}`}
        </Text>
        {label ? (
          <Text fontSize={30} color="#60a5fa" position={[0, -80, 0]}>
            {label}
          </Text>
        ) : null}
      </group>
    );
  },
};

/**
 * TimelineRevealTemplate: Progressive horizontal/vertical reveal.
 */
export const TimelineRevealTemplate: AnimationTemplate = {
  id: "timeline-reveal",
  name: "Timeline Reveal",
  slots: [
    { id: "label1", name: "Item 1 Label", type: "text" },
    { id: "image1", name: "Item 1 Image", type: "file" },
    { id: "label2", name: "Item 2 Label", type: "text" },
    { id: "image2", name: "Item 2 Image", type: "file" },
    { id: "label3", name: "Item 3 Label", type: "text" },
    { id: "image3", name: "Item 3 Image", type: "file" },
    { id: "label4", name: "Item 4 Label", type: "text" },
    { id: "image4", name: "Item 4 Image", type: "file" },
    { id: "label5", name: "Item 5 Label", type: "text" },
    { id: "image5", name: "Item 5 Image", type: "file" }
  ],
  propsSchema: z.object({
    itemCount: z.number().min(1).max(5).optional(),
    accentColor: z.string().default("#6366f1"),
    lineColor: z.string().default("#94a3b8"),
    textColor: z.string().default("#0b1220"),
    glowStrength: z.number().min(0).max(1).default(0.45),
    spacing: z.number().min(120).max(360).default(180),
    nodeRadius: z.number().min(10).max(40).default(18),
    imageSize: z.number().min(60).max(220).default(110),
    labelSize: z.number().min(18).max(72).default(34),
    cardOffset: z.number().min(60).max(260).default(120),
    lineWidth: z.number().min(2).max(16).default(6),
    introFrames: z.number().min(1).max(60).default(24),
    perItemFrames: z.number().min(10).max(160).default(44),
    panStrength: z.number().min(0).max(1).default(0.82),
    zoomStrength: z.number().min(0).max(1).default(0.14),
  }),
  render: ({ assets, frame, duration, props }: RenderProps) => {
    const p = (props ?? {}) as Record<string, unknown>;

    const itemCountCap = typeof p.itemCount === "number" ? Math.max(1, Math.min(5, p.itemCount)) : 5;
    const accentColor = typeof p.accentColor === "string" ? p.accentColor : "#6366f1";
    const lineColor = typeof p.lineColor === "string" ? p.lineColor : "#94a3b8";
    const textColor = typeof p.textColor === "string" ? p.textColor : "#0b1220";
    const glowStrength = typeof p.glowStrength === "number" ? p.glowStrength : 0.45;
    const spacing = typeof p.spacing === "number" ? p.spacing : 180;
    const nodeRadius = typeof p.nodeRadius === "number" ? p.nodeRadius : 18;
    const imageSize = typeof p.imageSize === "number" ? p.imageSize : 110;
    const labelSize = typeof p.labelSize === "number" ? p.labelSize : 34;
    const cardOffset = typeof p.cardOffset === "number" ? p.cardOffset : 120;
    const lineWidth = typeof p.lineWidth === "number" ? p.lineWidth : 6;
    const introFrames = typeof p.introFrames === "number" ? p.introFrames : 24;
    const perItemFramesProp = typeof p.perItemFrames === "number" ? p.perItemFrames : undefined;
    const panStrength = typeof p.panStrength === "number" ? p.panStrength : 0.82;
    const zoomStrength = typeof p.zoomStrength === "number" ? p.zoomStrength : 0.14;

    const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
    const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
    const easeInOutCubic = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
    const easeInOutSine = (t: number) => -(Math.cos(Math.PI * t) - 1) / 2;

    const items: Array<{ label: string; image?: Asset }> = [];
    for (let i = 1; i <= itemCountCap; i += 1) {
      const labelVal = assets[`label${i}`];
      const imgVal = assets[`image${i}`];
      const label = typeof labelVal === "string" ? labelVal : "";
      const image = isAsset(imgVal) ? imgVal : undefined;

      const isActive = label.trim().length > 0 || !!image;
      if (!isActive) continue;
      items.push({ label, image });
    }

    if (items.length === 0) return null;

    const n = items.length;
    const spacingEffective = n <= 3 ? Math.min(360, Math.max(spacing, 260)) : spacing;
    const totalLineWidth = (n - 1) * spacingEffective;
    const leftX = -totalLineWidth / 2;

    // Auto timing: ensure the sequence always progresses through all items within the track duration.
    // 1) If the track is short, compress intro so we don't starve later items.
    // 2) If perItemFrames is not explicitly provided, derive it from duration across ALL n items.
    const durationSafe = Math.max(1, duration);
    const introFramesEffective = Math.min(introFrames, Math.max(8, Math.floor(durationSafe * 0.25)));
    const outroFramesEffective = Math.min(24, Math.max(8, Math.floor(durationSafe * 0.12)));
    const segmentCount = Math.max(1, n - 1);
    const availableSegmentFrames = Math.max(1, durationSafe - introFramesEffective - outroFramesEffective);
    const autoSegmentFrames = Math.max(10, Math.floor(availableSegmentFrames / segmentCount));
    const perItemFrames = perItemFramesProp ?? autoSegmentFrames;

    const tGlobal = clamp01(duration > 0 ? frame / duration : 0);

    const introT = clamp01(frame / Math.max(1, introFramesEffective));
    const introEase = easeOutCubic(introT);

    const segmentsT = clamp01(
      (frame - introFramesEffective) /
        Math.max(1, availableSegmentFrames)
    );
    const lineProgress = segmentsT;
    const activeIdxFloat = lineProgress * (n - 1);
    const activeIdx = Math.max(0, Math.min(n - 1, Math.floor(activeIdxFloat)));
    const activeLocal = activeIdxFloat - activeIdx;
    const focusT = easeInOutCubic(activeLocal);

    const focusXFrom = leftX + activeIdx * spacingEffective;
    const focusXTo = leftX + Math.min(n - 1, activeIdx + 1) * spacingEffective;
    const focusX = lerp(focusXFrom, focusXTo, focusT);

    const panX = -focusX * panStrength;

    // Cinematic camera: focus-tied zoom pulse (avoid constant breathing)
    const zoomPulse = easeInOutSine(1 - Math.abs(activeLocal - 0.5) * 2);
    const zoom = 1 + zoomStrength * (0.35 + 0.65 * zoomPulse);

    const drawnWidth = totalLineWidth * lineProgress;

    const lineCenterX = leftX + drawnWidth / 2;

    const glowAlpha = clamp01(glowStrength);

    return (
      <group scale={[zoom, zoom, 1]} position={[panX * introEase, 0, 0]}>
        <group>
          <mesh position={[lineCenterX, 0, -1]}>
            <planeGeometry args={[Math.max(1, drawnWidth), lineWidth]} />
            <meshBasicMaterial
              color={lineColor}
              transparent
              opacity={0.55}
              depthWrite={false}
            />
          </mesh>
        </group>

        {items.map((item, idx) => {
          const x = leftX + idx * spacingEffective;
          const itemRevealFrames = Math.max(10, Math.min(perItemFrames, 90));
          const itemStartRaw = introFramesEffective + idx * perItemFrames;
          const itemStart = Math.min(itemStartRaw, durationSafe - itemRevealFrames);
          const itemT = clamp01((frame - itemStart) / Math.max(1, itemRevealFrames));
          const itemEase = easeOutCubic(itemT);

          // Cinematic spotlight: smooth falloff around the current focus index
          const spotlight = clamp01(1 - Math.abs(activeIdxFloat - idx));
          const spotlightEase = easeInOutSine(spotlight);

          const nodeScale = lerp(0.8, 1.0, itemEase) * lerp(1.0, 1.12, spotlightEase);
          const labelOpacity = lerp(0, 1, itemEase);

          const img = item.image;
          const hasImg = !!(img && (img.type === "image" || img.type === "svg") && img.src);
          const hasLabel = !!item.label;
          const cardY = (idx % 2 === 0 ? 1 : -1) * cardOffset;
          const contentLift = lerp(cardY + (idx % 2 === 0 ? 14 : -14), cardY, itemEase);

          const glowScale = nodeRadius * 3.2 * lerp(0.7, 1.0, itemEase) * lerp(1.0, 1.25, spotlightEase);
          const glowOpacity = (0.12 + 0.25 * spotlightEase) * glowAlpha;

          return (
            <group key={idx} position={[x, 0, 0]}>
              <mesh scale={[glowScale, glowScale, 1]}>
                <circleGeometry args={[1, 64]} />
                <meshBasicMaterial
                  color={accentColor}
                  transparent
                  opacity={glowOpacity}
                  blending={THREE.AdditiveBlending}
                  depthWrite={false}
                />
              </mesh>
              <mesh scale={[nodeRadius * 1.35 * nodeScale, nodeRadius * 1.35 * nodeScale, 1]}>
                <circleGeometry args={[1, 64]} />
                <meshBasicMaterial
                  color={accentColor}
                  transparent
                  opacity={0.95}
                  depthWrite={false}
                />
              </mesh>
              <mesh scale={[nodeRadius * 2.3 * nodeScale, nodeRadius * 2.3 * nodeScale, 1]}>
                <circleGeometry args={[1, 64]} />
                <meshBasicMaterial
                  color={accentColor}
                  transparent
                  opacity={0.08 + 0.12 * spotlightEase}
                  blending={THREE.AdditiveBlending}
                  depthWrite={false}
                />
              </mesh>

              {(hasImg || hasLabel) && (
                <group position={[0, contentLift, 0]}>
                  <mesh position={[0, 0, -3]}>
                    <planeGeometry args={[Math.max(180, imageSize * 1.9), Math.max(90, imageSize * 1.1)]} />
                    <meshBasicMaterial
                      color={accentColor}
                      transparent
                      opacity={(0.04 + 0.08 * spotlightEase) * glowAlpha}
                      blending={THREE.AdditiveBlending}
                      depthWrite={false}
                    />
                  </mesh>
                  {hasImg && img?.src ? (
                    <group position={[0, hasLabel ? 26 : 0, 2]}>
                      <DreiImage url={img.src} scale={[imageSize, imageSize]} />
                    </group>
                  ) : null}

                  {hasLabel ? (
                    <Text
                      fontSize={labelSize}
                      color={textColor}
                      anchorX="center"
                      anchorY="middle"
                      position={[0, hasImg ? -(imageSize * 0.72) : 0, 3]}
                      fillOpacity={labelOpacity}
                    >
                      {item.label}
                    </Text>
                  ) : null}
                </group>
              )}
            </group>
          );
        })}
      </group>
    );
  },
};