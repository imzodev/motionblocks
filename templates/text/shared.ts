import type { Asset } from "../../types/timeline";
import * as THREE from "three";
import React from "react";
import { Html } from "@react-three/drei";

export function isAsset(value: unknown): value is Asset {
  return (
    typeof value === "object" &&
    value !== null &&
    "id" in value &&
    "type" in value
  );
}

export function isGifAsset(asset: Asset): boolean {
  if (asset.mimeType === "image/gif") return true;
  const src = asset.src?.toLowerCase() || "";
  const name = asset.originalName?.toLowerCase() || "";
  return src.endsWith(".gif") || name.endsWith(".gif");
}

export function HtmlImage({
  url,
  scale,
  opacity,
}: {
  url: string;
  scale: [number, number];
  opacity?: number;
}) {
  const o = typeof opacity === "number" ? opacity : 1;
  const w = Number.isFinite(scale[0]) ? scale[0] : 1;
  const h = Number.isFinite(scale[1]) ? scale[1] : 1;

  const BASE_SCALE = 0.1;

  // Use a fixed-size DOM baseline and scale it in 3D so it respects template sizing.
  // Baseline: 100px @ distanceFactor 100 ~= 1 world unit.
  return React.createElement(
    "group" as unknown as React.ComponentType<any>,
    { scale: [w * BASE_SCALE, h * BASE_SCALE, 1] },
    React.createElement(
      Html as unknown as React.ComponentType<any>,
      { transform: true, center: true, distanceFactor: 100, style: { pointerEvents: "none" } },
      React.createElement(
        "div",
        { style: { width: "100px", height: "100px", opacity: o } },
        React.createElement("img", {
          src: url,
          draggable: false,
          style: { width: "100%", height: "100%", objectFit: "contain", display: "block" },
        })
      )
    )
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
