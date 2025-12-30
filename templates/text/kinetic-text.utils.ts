import { KINETIC_TEXT_CONSTANTS } from "./kinetic-text.constants";

export type KineticEffect =
  | "pop_bounce"
  | "zoom_back"
  | "zoom_punch"
  | "slam_zoom"
  | "slide_left"
  | "slide_right"
  | "whip_left"
  | "whip_right"
  | "typewriter"
  | "spin_pop"
  | "glitch_shake"
  | "pop_then_type"
  | "slide_then_type";

export function easeOutBack(t: number, overshoot = 1.35) {
  const x = Math.min(1, Math.max(0, t));
  const c1 = overshoot;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2);
}

export function easeInOutCubic(t: number) {
  const x = Math.min(1, Math.max(0, t));
  return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
}

export function clamp01(v: number) {
  return Math.min(1, Math.max(0, v));
}

export function easeOutExpo(t: number) {
  const x = clamp01(t);
  return x === 1 ? 1 : 1 - Math.pow(2, -10 * x);
}

export function easeInExpo(t: number) {
  const x = clamp01(t);
  return x === 0 ? 0 : Math.pow(2, 10 * x - 10);
}

export function expDamp(current: number, target: number, lambda: number, dt: number) {
  // Exponential smoothing that is stable across frame rates.
  const t = 1 - Math.exp(-lambda * Math.max(0, dt));
  return current + (target - current) * t;
}

export function clamp(min: number, v: number, max: number) {
  return Math.max(min, Math.min(max, v));
}

export function fract(v: number) {
  return v - Math.floor(v);
}

export function rand01(seed: number) {
  return fract(Math.sin(seed * 12.9898) * 43758.5453123);
}

export function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

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

export function parseTwoPartSegment(text: string, effect: KineticEffect): { a: string; b: string } {
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

export type KineticStyle = {
  scale: number;
  posX: number;
  posY: number;
  rotZ: number;
  opacity: number;
};

export function computeKineticStyle(args: {
  effect: KineticEffect;
  enterT: number;
  localFrame: number;
  safePer: number;
  aliveAlpha: number;
  frame: number;
}): KineticStyle {
  const { effect, enterT, localFrame, safePer, aliveAlpha, frame } = args;

  let scale = 1;
  let posX = 0;
  let posY = 0;
  let rotZ = 0;
  let opacity = aliveAlpha;

  if (effect === "pop_bounce") {
    scale = easeOutBack(enterT, KINETIC_TEXT_CONSTANTS.effects.popBounce.overshoot);
    posY = (1 - enterT) * KINETIC_TEXT_CONSTANTS.effects.popBounce.posY;
    opacity = easeInOutCubic(enterT) * aliveAlpha;
  } else if (effect === "zoom_back") {
    scale =
      KINETIC_TEXT_CONSTANTS.effects.zoomBack.scale0 +
      KINETIC_TEXT_CONSTANTS.effects.zoomBack.scale1 * easeInOutCubic(enterT);
    posY = (1 - enterT) * KINETIC_TEXT_CONSTANTS.effects.zoomBack.posY;
    opacity = easeInOutCubic(enterT) * aliveAlpha;
  } else if (effect === "zoom_punch") {
    const t0 = easeOutExpo(enterT);
    scale = KINETIC_TEXT_CONSTANTS.effects.zoomPunch.scale0 - KINETIC_TEXT_CONSTANTS.effects.zoomPunch.scale1 * t0;
    rotZ = (1 - t0) * KINETIC_TEXT_CONSTANTS.effects.zoomPunch.rotZ;
    opacity = easeInOutCubic(enterT) * aliveAlpha;
  } else if (effect === "slam_zoom") {
    const slam = clamp01(localFrame / KINETIC_TEXT_CONSTANTS.effects.slamZoom.slamFrames);
    const settle = clamp01(
      (localFrame - KINETIC_TEXT_CONSTANTS.effects.slamZoom.slamFrames) /
        Math.max(1, safePer - KINETIC_TEXT_CONSTANTS.effects.slamZoom.slamFrames),
    );
    const s0 =
      KINETIC_TEXT_CONSTANTS.effects.slamZoom.s0Base +
      KINETIC_TEXT_CONSTANTS.effects.slamZoom.s0Scale * easeOutExpo(slam);
    const s1 =
      KINETIC_TEXT_CONSTANTS.effects.slamZoom.s1Base -
      KINETIC_TEXT_CONSTANTS.effects.slamZoom.s1Scale *
        easeOutBack(settle, KINETIC_TEXT_CONSTANTS.effects.slamZoom.s1Overshoot);
    scale = slam < 1 ? s0 : s1;
    posY = (1 - easeOutExpo(slam)) * KINETIC_TEXT_CONSTANTS.effects.slamZoom.posY;
    rotZ = (1 - easeOutExpo(slam)) * KINETIC_TEXT_CONSTANTS.effects.slamZoom.rotZ;
    opacity = easeInOutCubic(enterT) * aliveAlpha;
  } else if (effect === "slide_left") {
    scale = KINETIC_TEXT_CONSTANTS.effects.slide.scale0 + KINETIC_TEXT_CONSTANTS.effects.slide.scale1 * easeInOutCubic(enterT);
    posX = (1 - enterT) * KINETIC_TEXT_CONSTANTS.effects.slide.posX;
    opacity = easeInOutCubic(enterT) * aliveAlpha;
  } else if (effect === "slide_right") {
    scale = KINETIC_TEXT_CONSTANTS.effects.slide.scale0 + KINETIC_TEXT_CONSTANTS.effects.slide.scale1 * easeInOutCubic(enterT);
    posX = (1 - enterT) * -KINETIC_TEXT_CONSTANTS.effects.slide.posX;
    opacity = easeInOutCubic(enterT) * aliveAlpha;
  } else if (effect === "whip_left") {
    const t0 = easeOutExpo(enterT);
    posX = (1 - t0) * KINETIC_TEXT_CONSTANTS.effects.whip.posX;
    scale = KINETIC_TEXT_CONSTANTS.effects.whip.scale0 - KINETIC_TEXT_CONSTANTS.effects.whip.scale1 * t0;
    rotZ = (1 - t0) * KINETIC_TEXT_CONSTANTS.effects.whip.rotZ;
    opacity = easeInOutCubic(enterT) * aliveAlpha;
  } else if (effect === "whip_right") {
    const t0 = easeOutExpo(enterT);
    posX = (1 - t0) * -KINETIC_TEXT_CONSTANTS.effects.whip.posX;
    scale = KINETIC_TEXT_CONSTANTS.effects.whip.scale0 - KINETIC_TEXT_CONSTANTS.effects.whip.scale1 * t0;
    rotZ = (1 - t0) * -KINETIC_TEXT_CONSTANTS.effects.whip.rotZ;
    opacity = easeInOutCubic(enterT) * aliveAlpha;
  } else if (effect === "typewriter") {
    scale = 1;
    opacity = aliveAlpha;
  } else if (effect === "spin_pop") {
    const t0 = easeOutBack(enterT, KINETIC_TEXT_CONSTANTS.effects.spinPop.overshoot);
    scale = Math.max(KINETIC_TEXT_CONSTANTS.effects.spinPop.minScale, t0);
    rotZ = (1 - easeOutExpo(enterT)) * KINETIC_TEXT_CONSTANTS.effects.spinPop.rotZ;
    posY = (1 - easeOutExpo(enterT)) * KINETIC_TEXT_CONSTANTS.effects.spinPop.posY;
    opacity = easeInOutCubic(enterT) * aliveAlpha;
  } else if (effect === "glitch_shake") {
    const t0 = easeOutExpo(enterT);
    const shakeAmt = (1 - t0) * KINETIC_TEXT_CONSTANTS.effects.glitchShake.shakeScale;
    const r0 = rand01(frame * KINETIC_TEXT_CONSTANTS.effects.glitchShake.randF0);
    const r1 = rand01(frame * KINETIC_TEXT_CONSTANTS.effects.glitchShake.randF1 + KINETIC_TEXT_CONSTANTS.effects.glitchShake.randP1);
    posX = (r0 - 0.5) * shakeAmt;
    posY = (r1 - 0.5) * shakeAmt * KINETIC_TEXT_CONSTANTS.effects.glitchShake.posYScale;
    rotZ =
      (rand01(frame * KINETIC_TEXT_CONSTANTS.effects.glitchShake.randF2 + KINETIC_TEXT_CONSTANTS.effects.glitchShake.randP2) - 0.5) *
      (1 - t0) *
      KINETIC_TEXT_CONSTANTS.effects.glitchShake.rotZScale;
    scale = KINETIC_TEXT_CONSTANTS.effects.glitchShake.scale0 - KINETIC_TEXT_CONSTANTS.effects.glitchShake.scale1 * t0;
    opacity = easeInOutCubic(enterT) * aliveAlpha;
  } else if (effect === "pop_then_type" || effect === "slide_then_type") {
    const t0 = enterT;
    scale =
      effect === "pop_then_type"
        ? easeOutBack(t0, KINETIC_TEXT_CONSTANTS.effects.popThenType.overshoot)
        : KINETIC_TEXT_CONSTANTS.effects.slideThenType.scale0 +
          KINETIC_TEXT_CONSTANTS.effects.slideThenType.scale1 * easeInOutCubic(t0);
    posY = effect === "pop_then_type" ? (1 - t0) * KINETIC_TEXT_CONSTANTS.effects.popThenType.posY : 0;
    posX = effect === "slide_then_type" ? (1 - t0) * KINETIC_TEXT_CONSTANTS.effects.slideThenType.posX : 0;
    opacity = easeInOutCubic(t0) * aliveAlpha;
  }

  return { scale, posX, posY, rotZ, opacity };
}
