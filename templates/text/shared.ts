import type { Asset } from "../../types/timeline";
import * as THREE from "three";

export function isAsset(value: unknown): value is Asset {
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

export function getVideoTexture(url: string) {
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

export function readTextWidth(obj: unknown): number {
  if (typeof obj !== "object" || obj === null) return 0;
  const maybe = obj as {
    textRenderInfo?: {
      blockBounds?: number[];
    };
  };
  const w = maybe.textRenderInfo?.blockBounds?.[2];
  return typeof w === "number" && Number.isFinite(w) ? w : 0;
}

export function preserveEdgeSpaces(value: string): string {
  if (!value) return value;
  return value
    .replace(/^ +/, (m) => "\u00A0".repeat(m.length))
    .replace(/ +$/, (m) => "\u00A0".repeat(m.length));
}
