import type { Asset } from "../../types/timeline";
import type { RenderProps } from "../../types/template";
import { isAsset } from "./shared";
import type { KineticEffect } from "./kinetic-text.utils";

export type KineticTextRenderModel = {
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

  cameraMotionEnabled: boolean;
  cameraDrift: number;
  cameraPunch: number;
  cameraWhip: number;
  cameraPan: number;
  cameraSmooth: number;
  cameraOrbit: number;
  cameraOrbitSpeed: number;
  cameraDolly: number;
  cameraDollySpeed: number;
  cameraZBase: number;
  cameraFovBase: number;

  backgroundEnabled: boolean;
  backgroundColor: string;
  backgroundOpacity: number;
  backgroundScale: number;
  backgroundVideoAspect: number;
  backgroundAsset?: Asset;

  segments: Array<{ text: string; effect: KineticEffect }>;
};

export function buildKineticTextRenderModel(args: {
  assets: RenderProps["assets"];
  props: RenderProps["props"];
}): KineticTextRenderModel {
  const { assets, props } = args;
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

  const cameraMotionEnabled = typeof p.cameraMotionEnabled === "boolean" ? p.cameraMotionEnabled : true;
  const cameraDrift = typeof p.cameraDrift === "number" ? p.cameraDrift : 14;
  const cameraPunch = typeof p.cameraPunch === "number" ? p.cameraPunch : 260;
  const cameraWhip = typeof p.cameraWhip === "number" ? p.cameraWhip : 320;
  const cameraPan = typeof p.cameraPan === "number" ? p.cameraPan : 220;
  const cameraSmooth = typeof p.cameraSmooth === "number" ? p.cameraSmooth : 0.2;
  const cameraOrbit = typeof p.cameraOrbit === "number" ? p.cameraOrbit : 320;
  const cameraOrbitSpeed = typeof p.cameraOrbitSpeed === "number" ? p.cameraOrbitSpeed : 0.008;
  const cameraDolly = typeof p.cameraDolly === "number" ? p.cameraDolly : 360;
  const cameraDollySpeed = typeof p.cameraDollySpeed === "number" ? p.cameraDollySpeed : 0.006;
  const cameraZBase = typeof p.cameraZBase === "number" ? p.cameraZBase : 1000;
  const cameraFovBase = typeof p.cameraFovBase === "number" ? p.cameraFovBase : 36;

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

  return {
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

    cameraMotionEnabled,
    cameraDrift,
    cameraPunch,
    cameraWhip,
    cameraPan,
    cameraSmooth,
    cameraOrbit,
    cameraOrbitSpeed,
    cameraDolly,
    cameraDollySpeed,
    cameraZBase,
    cameraFovBase,

    backgroundEnabled,
    backgroundColor,
    backgroundOpacity,
    backgroundScale,
    backgroundVideoAspect,
    backgroundAsset,

    segments,
  };
}
