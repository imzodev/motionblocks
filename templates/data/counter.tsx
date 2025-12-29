import { z } from "zod";
import type { AnimationTemplate, RenderProps } from "../../types/template";
import { Text, Image as DreiImage } from "@react-three/drei";
import * as THREE from "three";
import type { Asset } from "../../types/timeline";

let cachedGlowTexture: THREE.Texture | null = null;

function glowTexture(size: number) {
  if (typeof document === "undefined") return new THREE.Texture();
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) return new THREE.Texture();

  const r = size / 2;
  const g = ctx.createRadialGradient(r, r, 0, r, r, r);
  g.addColorStop(0, "rgba(255,255,255,1)");
  g.addColorStop(0.35, "rgba(255,255,255,0.6)");
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

function getGlowTexture() {
  if (!cachedGlowTexture) cachedGlowTexture = glowTexture(256);
  return cachedGlowTexture;
}

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
  // Try to play; browsers may require a user gesture, but preview click counts.
  void el.play().catch(() => {});

  const tex = new THREE.VideoTexture(el);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.minFilter = THREE.LinearFilter;
  tex.magFilter = THREE.LinearFilter;

  cachedVideos.set(url, { el, tex });
  return tex;
}

function clamp01(v: number) {
  return Math.min(1, Math.max(0, v));
}

function easeInOutCubic(t: number) {
  const x = clamp01(t);
  return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
}

function easeOutCubic(t: number) {
  const x = clamp01(t);
  return 1 - Math.pow(1 - x, 3);
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

export const CounterTemplate: AnimationTemplate = {
  id: "counter",
  name: "Counter",
  slots: [{ id: "background", name: "Background (Image/Video)", type: "file" }],
  propsSchema: z.object({
    startValue: z.number().default(0),
    endValue: z.number().default(100),
    digits: z.number().min(1).max(10).default(3),
    fontSize: z.number().min(24).max(160).default(96),
    digitSpacing: z.number().min(30).max(140).default(74),
    textColor: z.string().default("#e2e8f0"),
    glowColor: z.string().default("#60a5fa"),
    glowStrength: z.number().min(0).max(1).default(0.65),
    flipDepth: z.number().min(1).max(40).default(14),
    flipTilt: z.number().min(0).max(1).default(0.35),
    flipWindow: z.number().min(0.05).max(0.8).default(0.22),
    backgroundEnabled: z.boolean().default(false),
    backgroundOpacity: z.number().min(0).max(1).default(1),
    backgroundScale: z.number().min(1000).max(12000).default(6000),
    endFlourishFrames: z.number().min(0).max(120).default(18),
    endZoom: z.number().min(0).max(0.6).default(0.18),
    endGlowBoost: z.number().min(0).max(2).default(0.75),
    endBurstStrength: z.number().min(0).max(1).default(0.45),
  }),
  render: ({ assets, frame, duration, props }: RenderProps) => {
    const p = (props ?? {}) as Record<string, unknown>;
    const startValue = typeof p.startValue === "number" && Number.isFinite(p.startValue) ? p.startValue : 0;
    const endValue = typeof p.endValue === "number" && Number.isFinite(p.endValue) ? p.endValue : 100;
    const digits = typeof p.digits === "number" ? p.digits : 3;
    const fontSize = typeof p.fontSize === "number" ? p.fontSize : 96;
    const digitSpacing = typeof p.digitSpacing === "number" ? p.digitSpacing : 74;
    const textColor = typeof p.textColor === "string" ? p.textColor : "#e2e8f0";
    const glowColor = typeof p.glowColor === "string" ? p.glowColor : "#60a5fa";
    const glowStrength = typeof p.glowStrength === "number" ? p.glowStrength : 0.65;
    const flipDepth = typeof p.flipDepth === "number" ? p.flipDepth : 14;
    const flipTilt = typeof p.flipTilt === "number" ? p.flipTilt : 0.35;
    const flipWindow = typeof p.flipWindow === "number" ? p.flipWindow : 0.22;
    const backgroundEnabled = typeof p.backgroundEnabled === "boolean" ? p.backgroundEnabled : false;
    const backgroundOpacity = typeof p.backgroundOpacity === "number" ? p.backgroundOpacity : 1;
    const backgroundScale = typeof p.backgroundScale === "number" ? p.backgroundScale : 6000;
    const endFlourishFrames = typeof p.endFlourishFrames === "number" ? p.endFlourishFrames : 18;
    const endZoom = typeof p.endZoom === "number" ? p.endZoom : 0.18;
    const endGlowBoost = typeof p.endGlowBoost === "number" ? p.endGlowBoost : 0.75;
    const endBurstStrength = typeof p.endBurstStrength === "number" ? p.endBurstStrength : 0.45;

    const denom = Math.max(1, duration - 1);
    const progress = clamp01(frame / denom);
    const raw = startValue + (endValue - startValue) * progress;

    const sign = raw < 0 ? -1 : 1;
    const absRaw = Math.abs(raw);
    const absFrac = absRaw - Math.floor(absRaw);

    const pad = Math.max(1, Math.min(10, Math.floor(digits)));
    const display = Math.floor(absRaw)
      .toString()
      .padStart(pad, "0")
      .slice(-pad);

    const endFrames = Math.max(0, Math.min(120, Math.floor(endFlourishFrames)));
    const endStart = Math.max(0, duration - 1 - endFrames);
    const endT = endFrames > 0 ? clamp01((frame - endStart) / Math.max(1, endFrames)) : 0;
    const endEase = easeOutCubic(endT);
    const flourishScale = 1 + endZoom * endEase;
    const glowBoost = endGlowBoost * endEase;
    const burstAlpha = endBurstStrength * endEase;

    const glowStrengthEff = clamp01(glowStrength + glowBoost);

    const glowTex = getGlowTexture();

    // Slight camera-ish tilt so the flip reads as 3D.
    const baseTiltX = -0.18;
    const baseTiltY = 0.12;
    const tiltBoost = lerp(0.6, 1.2, easeInOutCubic(progress)) * flipTilt;

    const bgAsset = isAsset(assets.background) ? assets.background : undefined;

    return (
      <group>
        {backgroundEnabled && bgAsset?.src && (bgAsset.type === "image" || bgAsset.type === "svg") ? (
          <group position={[0, 0, -120]}>
            <DreiImage
              url={bgAsset.src}
              scale={[backgroundScale, backgroundScale]}
              transparent
              opacity={clamp01(backgroundOpacity)}
            />
          </group>
        ) : null}

        {backgroundEnabled && bgAsset?.src && bgAsset.type === "video" ? (
          <mesh position={[0, 0, -120]} renderOrder={-10}>
            <planeGeometry args={[backgroundScale, backgroundScale * (9 / 16)]} />
            <meshBasicMaterial
              map={getVideoTexture(bgAsset.src)}
              transparent={backgroundOpacity < 1}
              opacity={clamp01(backgroundOpacity)}
              depthWrite={false}
            />
          </mesh>
        ) : null}

        {burstAlpha > 0.001 ? (
          <sprite scale={[fontSize * (pad + 2) * 1.05, fontSize * 2.4, 1]} position={[0, 0, -8]} renderOrder={1}>
            <spriteMaterial
              map={glowTex}
              transparent
              opacity={burstAlpha}
              color={glowColor}
              blending={THREE.AdditiveBlending}
              depthWrite={false}
            />
          </sprite>
        ) : null}

        <group rotation={[baseTiltX * tiltBoost, baseTiltY * tiltBoost, 0]} scale={[flourishScale, flourishScale, 1]}>
          {display.split("").map((ch, idx) => {
            const place = Math.pow(10, pad - 1 - idx);
            const x = (idx - (pad - 1) / 2) * digitSpacing;

          // Odometer-like: digit only flips near its rollover moment.
          // For this digit "place", we look at how far we are into the current place-interval
          // and only animate during the last `flipWindow` fraction.
          const cycle = place * 10;
          const remainder = absRaw % cycle;
          const digitBase = Math.floor(remainder / place) % 10;
          const within = place === 1 ? absFrac : (remainder % place) / place; // 0..1 within this digit's interval
          const windowBoost = place === 1 ? 1.8 : place === 10 ? 1.35 : 1;
          const windowEff = Math.min(0.8, Math.max(0.05, flipWindow * windowBoost));
          const tGate = clamp01((within - (1 - windowEff)) / Math.max(0.0001, windowEff));
          const t = easeInOutCubic(tGate);

          const currentDigit = digitBase;
          const nextDigit = (digitBase + 1) % 10;

          const dir = sign >= 0 ? 1 : -1;
          const rotCurrent = lerp(0, -Math.PI / 2, t) * dir;
          const rotNext = lerp(Math.PI / 2, 0, t) * dir;

          const pop = Math.sin(t * Math.PI);
          const zPop = pop * (flipDepth * 0.22);

          const isFlipping = tGate > 0.001;
          const currentOpacity = isFlipping ? clamp01(1 - t) : 1;
          const nextOpacity = isFlipping ? clamp01(t) : 0;

          const glowOpacity = (0.18 + 0.45 * (1 - Math.abs(0.5 - tGate) * 2)) * glowStrengthEff;

          return (
            <group key={idx} position={[x, 0, 0]}>
              <sprite
                scale={[fontSize * 1.4, fontSize * 1.4, 1]}
                position={[0, 0, -6]}
                renderOrder={0}
              >
                <spriteMaterial
                  map={glowTex}
                  transparent
                  opacity={glowOpacity}
                  color={glowColor}
                  blending={THREE.AdditiveBlending}
                  depthWrite={false}
                />
              </sprite>

              <group position={[0, 0, 0]} renderOrder={2}>
                <group rotation={[rotCurrent, 0, 0]} position={[0, 0, zPop]}>
                  <Text
                    fontSize={fontSize}
                    color={textColor}
                    anchorX="center"
                    anchorY="middle"
                    position={[0, 0, 0]}
                    fillOpacity={currentOpacity}
                    outlineWidth={fontSize * 0.02}
                    outlineColor={glowColor}
                    outlineOpacity={0.65 * glowStrengthEff * currentOpacity}
                  >
                    {String(currentDigit)}
                  </Text>
                </group>

                {isFlipping ? (
                  <group rotation={[rotNext, 0, 0]} position={[0, 0, -flipDepth + zPop]}>
                    <Text
                      fontSize={fontSize}
                      color={textColor}
                      anchorX="center"
                      anchorY="middle"
                      position={[0, 0, 0]}
                      fillOpacity={nextOpacity}
                      outlineWidth={fontSize * 0.02}
                      outlineColor={glowColor}
                      outlineOpacity={0.65 * glowStrengthEff * nextOpacity}
                    >
                      {String(nextDigit)}
                    </Text>
                  </group>
                ) : null}
              </group>
            </group>
          );
          })}
        </group>
      </group>
    );
  },
};
