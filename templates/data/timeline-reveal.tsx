import { z } from "zod";
import type { AnimationTemplate, RenderProps } from "../../types/template";
import { Sparkles, Text, Image as DreiImage } from "@react-three/drei";
import type { Asset } from "../../types/timeline";
import * as THREE from "three";

let cachedNodeGlowTexture: THREE.Texture | null = null;
let cachedNodeDiscTexture: THREE.Texture | null = null;

function getNodeTextures() {
  if (!cachedNodeGlowTexture) cachedNodeGlowTexture = radialTexture(256);
  if (!cachedNodeDiscTexture) cachedNodeDiscTexture = discTexture(256);
  return {
    nodeGlowTexture: cachedNodeGlowTexture,
    nodeDiscTexture: cachedNodeDiscTexture,
  };
}

function radialTexture(size: number) {
  if (typeof document === "undefined") return new THREE.Texture();
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    const fallback = new THREE.Texture();
    return fallback;
  }
  const r = size / 2;
  const g = ctx.createRadialGradient(r, r, 0, r, r, r);
  g.addColorStop(0, "rgba(255,255,255,1)");
  g.addColorStop(0.25, "rgba(255,255,255,0.85)");
  g.addColorStop(0.55, "rgba(255,255,255,0.25)");
  g.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  const tex = new THREE.CanvasTexture(canvas);
  tex.needsUpdate = true;
  tex.wrapS = THREE.ClampToEdgeWrapping;
  tex.wrapT = THREE.ClampToEdgeWrapping;
  tex.magFilter = THREE.LinearFilter;
  tex.minFilter = THREE.LinearMipmapLinearFilter;
  return tex;
}

function discTexture(size: number) {
  if (typeof document === "undefined") return new THREE.Texture();
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    const fallback = new THREE.Texture();
    return fallback;
  }
  const r = size / 2;
  // Mostly-solid disc with a tiny feather so it doesn't alias too harshly.
  const g = ctx.createRadialGradient(r, r, 0, r, r, r);
  g.addColorStop(0, "rgba(255,255,255,1)");
  g.addColorStop(0.88, "rgba(255,255,255,1)");
  g.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  const tex = new THREE.CanvasTexture(canvas);
  tex.needsUpdate = true;
  tex.wrapS = THREE.ClampToEdgeWrapping;
  tex.wrapT = THREE.ClampToEdgeWrapping;
  tex.magFilter = THREE.LinearFilter;
  tex.minFilter = THREE.LinearMipmapLinearFilter;
  return tex;
}

function isAsset(value: unknown): value is Asset {
  return (
    typeof value === "object" &&
    value !== null &&
    "id" in value &&
    "type" in value
  );
}

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
    nodeRadius: z.number().min(10).max(40).default(26),
    imageSize: z.number().min(60).max(220).default(110),
    labelSize: z.number().min(18).max(72).default(34),
    cardOffset: z.number().min(60).max(260).default(120),
    lineWidth: z.number().min(2).max(16).default(6),
    introFrames: z.number().min(1).max(60).default(24),
    perItemFrames: z.number().min(70).max(150).default(110),
    itemZoom: z.number().min(0).max(1.2).default(0.35),
    panStrength: z.number().min(0).max(1).default(0.82),
    zoomStrength: z.number().min(0).max(1).default(0.14),
    backgroundEnabled: z.boolean().default(false),
    backgroundColor: z.string().default("#ffffff"),
    backgroundOpacity: z.number().min(0).max(1).default(1),
  }),
  render: ({ assets, frame, duration, props }: RenderProps) => {
    const p = (props ?? {}) as Record<string, unknown>;

    const itemCountCap = typeof p.itemCount === "number" ? Math.max(1, Math.min(5, p.itemCount)) : 5;
    const accentColor = typeof p.accentColor === "string" ? p.accentColor : "#6366f1";
    const lineColor = typeof p.lineColor === "string" ? p.lineColor : "#94a3b8";
    const textColor = typeof p.textColor === "string" ? p.textColor : "#0b1220";
    const glowStrength = typeof p.glowStrength === "number" ? p.glowStrength : 0.45;
    const spacing = typeof p.spacing === "number" ? p.spacing : 180;
    const nodeRadius = typeof p.nodeRadius === "number" ? p.nodeRadius : 26;
    const imageSize = typeof p.imageSize === "number" ? p.imageSize : 110;
    const labelSize = typeof p.labelSize === "number" ? p.labelSize : 34;
    const cardOffset = typeof p.cardOffset === "number" ? p.cardOffset : 120;
    const lineWidth = typeof p.lineWidth === "number" ? p.lineWidth : 6;
    const introFrames = typeof p.introFrames === "number" ? p.introFrames : 24;
    const perItemFramesProp = typeof p.perItemFrames === "number" ? p.perItemFrames : undefined;
    const itemZoom = typeof p.itemZoom === "number" ? p.itemZoom : 0.35;
    const panStrength = typeof p.panStrength === "number" ? p.panStrength : 0.82;
    const zoomStrength = typeof p.zoomStrength === "number" ? p.zoomStrength : 0.14;
    const backgroundEnabled = typeof p.backgroundEnabled === "boolean" ? p.backgroundEnabled : false;
    const backgroundColor = typeof p.backgroundColor === "string" ? p.backgroundColor : "#ffffff";
    const backgroundOpacity = typeof p.backgroundOpacity === "number" ? p.backgroundOpacity : 1;

    const { nodeGlowTexture, nodeDiscTexture } = getNodeTextures();

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
    const headX = leftX + totalLineWidth * lineProgress;

    const glowAlpha = clamp01(glowStrength);

    return (
      <group scale={[zoom, zoom, 1]} position={[panX * introEase, 0, 0]}>
        {backgroundEnabled && (
          <mesh position={[0, 0, -50]}>
            <planeGeometry args={[6000, 6000]} />
            <meshBasicMaterial
              color={backgroundColor}
              transparent={backgroundOpacity < 1}
              opacity={clamp01(backgroundOpacity)}
              depthWrite={false}
            />
          </mesh>
        )}
        <group>
          <mesh position={[lineCenterX, 0, -80]} renderOrder={0}>
            <planeGeometry args={[Math.max(1, drawnWidth), lineWidth]} />
            <meshBasicMaterial
              color={lineColor}
              transparent
              opacity={0.55}
              depthWrite={false}
            />
          </mesh>
          <mesh position={[headX, 0, -70]} renderOrder={1}>
            <circleGeometry args={[Math.max(6, lineWidth * 1.45), 64]} />
            <meshBasicMaterial
              color={accentColor}
              transparent
              opacity={(0.45 + 0.25 * zoomPulse) * glowAlpha}
              blending={THREE.AdditiveBlending}
              depthWrite={false}
            />
          </mesh>
          <mesh position={[headX, 0, -72]} renderOrder={1}>
            <circleGeometry args={[Math.max(10, lineWidth * 2.6), 64]} />
            <meshBasicMaterial
              color={accentColor}
              transparent
              opacity={0.12 * glowAlpha}
              blending={THREE.AdditiveBlending}
              depthWrite={false}
            />
          </mesh>
        </group>

        <group position={[focusX, 0, -20]} renderOrder={1}>
          <Sparkles
            count={18}
            scale={[120, 90, 1]}
            size={2.4}
            speed={0.55}
            color={accentColor}
            opacity={0.6 * glowAlpha}
          />
        </group>

        {items.map((item, idx) => {
          const x = leftX + idx * spacingEffective;
          const itemRevealFrames = Math.max(10, Math.min(perItemFrames, 90));
          const itemStartRaw = introFramesEffective + idx * perItemFrames;
          const itemStart = Math.min(itemStartRaw, durationSafe - itemRevealFrames);
          const itemT = clamp01((frame - itemStart) / Math.max(1, itemRevealFrames));
          const itemEase = easeOutCubic(itemT);
          const burstT = clamp01((frame - itemStart) / Math.max(1, Math.min(16, itemRevealFrames)));
          const burstEase = easeOutCubic(burstT);

          // Cinematic spotlight: smooth falloff around the current focus index
          const spotlight = clamp01(1 - Math.abs(activeIdxFloat - idx));
          const spotlightEase = easeInOutSine(spotlight);

          const focusZoom = lerp(1.0, 1.0 + Math.max(0, itemZoom) * 1.8, spotlightEase);
          const nodeScale = lerp(0.85, 1.0, itemEase);
          const labelOpacity = lerp(0, 1, itemEase);

          const img = item.image;
          const hasImg = !!(img && (img.type === "image" || img.type === "svg") && img.src);
          const hasLabel = !!item.label;
          const cardY = (idx % 2 === 0 ? 1 : -1) * cardOffset;
          const contentLift = lerp(cardY + (idx % 2 === 0 ? 14 : -14), cardY, itemEase);

          const glowScale = nodeRadius * 3.2 * lerp(0.7, 1.0, itemEase) * lerp(1.0, 1.25, spotlightEase);

          return (
            <group
              key={idx}
              position={[x, 0, lerp(0, -18, spotlightEase)]}
              scale={[1, 1, 1]}
              renderOrder={2}
            >
              <sprite
                scale={[
                  glowScale * 1.95 * lerp(1.0, 1.12, spotlightEase),
                  glowScale * 1.95 * lerp(1.0, 1.12, spotlightEase),
                  1,
                ]}
              >
                <spriteMaterial
                  map={nodeGlowTexture}
                  color={accentColor}
                  transparent
                  opacity={Math.min(0.7, (0.28 + 0.62 * spotlightEase) * glowAlpha) * itemEase}
                  blending={THREE.AdditiveBlending}
                  depthWrite={false}
                />
              </sprite>

              <group
                scale={[focusZoom, focusZoom, 1]}
                position={[0, 0, lerp(0, -10, spotlightEase)]}
              >
                <mesh scale={[nodeRadius * (2.0 + 2.8 * burstEase), nodeRadius * (2.0 + 2.8 * burstEase), 1]}>
                  <ringGeometry args={[0.72, 1, 64]} />
                  <meshBasicMaterial
                    color={accentColor}
                    transparent
                    opacity={(1 - burstEase) * 0.35 * glowAlpha * itemEase}
                    blending={THREE.AdditiveBlending}
                    depthWrite={false}
                  />
                </mesh>

                <sprite scale={[nodeRadius * 2.9 * nodeScale, nodeRadius * 2.9 * nodeScale, 1]}>
                  <spriteMaterial
                    map={nodeDiscTexture}
                    color={accentColor}
                    transparent
                    opacity={0.98}
                    blending={THREE.NormalBlending}
                    depthWrite={false}
                  />
                </sprite>

                <sprite scale={[nodeRadius * 5.4 * nodeScale, nodeRadius * 5.4 * nodeScale, 1]}>
                  <spriteMaterial
                    map={nodeGlowTexture}
                    color={accentColor}
                    transparent
                    opacity={(0.12 + 0.28 * spotlightEase) * glowAlpha * itemEase}
                    blending={THREE.AdditiveBlending}
                    depthWrite={false}
                  />
                </sprite>

              {(hasImg || hasLabel) && (
                <group position={[0, contentLift, 0]}>
                  <mesh position={[0, 0, -3]}>
                    <planeGeometry args={[Math.max(180, imageSize * 1.9), Math.max(90, imageSize * 1.1)]} />
                    <meshBasicMaterial
                      color={accentColor}
                      transparent
                      opacity={0}
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
            </group>
          );
        })}
      </group>
    );
  },
};