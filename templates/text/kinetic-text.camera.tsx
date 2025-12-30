import React, { useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import {
  clamp,
  clamp01,
  easeOutExpo,
  expDamp,
  rand01,
  type KineticEffect,
} from "./kinetic-text.utils";
import { KINETIC_TEXT_CONSTANTS } from "./kinetic-text.constants";

export function CameraRig(props: {
  enabled: boolean;
  frame: number;
  segIndex: number;
  localFrame: number;
  enterT: number;
  effect: KineticEffect;
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
  backgroundScale: number;
  backgroundPlaneAspect: number;
}) {
  const {
    enabled,
    frame,
    segIndex,
    localFrame,
    enterT,
    effect,
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
    backgroundScale,
    backgroundPlaneAspect,
  } = props;

  const { camera, controls } = useThree();
  const baseCamPos = useRef<{ x: number; y: number; z: number } | null>(null);
  const baseCamFov = useRef<number | null>(null);
  const baseControlsEnabled = useRef<boolean | null>(null);

  const camState = useRef<{ x: number; y: number; z: number; fov: number } | null>(null);
  const phaseState = useRef<number>(0);

  useEffect(() => {
    if (!baseCamPos.current) {
      baseCamPos.current = { x: camera.position.x, y: camera.position.y, z: camera.position.z };
    }
    if (baseCamFov.current === null) {
      const camAny = camera as unknown as { fov?: number };
      baseCamFov.current = typeof camAny.fov === "number" ? camAny.fov : null;
    }
    if (!camState.current) {
      const camAny = camera as unknown as { fov?: number };
      camState.current = {
        x: camera.position.x,
        y: camera.position.y,
        z: camera.position.z,
        fov: typeof camAny.fov === "number" ? camAny.fov : cameraFovBase,
      };
    }
    const cAny = controls as unknown as { enabled?: boolean } | undefined;
    if (baseControlsEnabled.current === null) {
      baseControlsEnabled.current = typeof cAny?.enabled === "boolean" ? cAny.enabled : null;
    }

    if (enabled && typeof cAny?.enabled === "boolean") {
      cAny.enabled = false;
    }

    return () => {
      if (baseCamPos.current) {
        camera.position.set(baseCamPos.current.x, baseCamPos.current.y, baseCamPos.current.z);
      }

      const camAny = camera as unknown as { fov?: number; updateProjectionMatrix?: () => void };
      if (typeof camAny.fov === "number" && typeof baseCamFov.current === "number") {
        camAny.fov = baseCamFov.current;
        camAny.updateProjectionMatrix?.();
      }

      const cAny2 = controls as unknown as { enabled?: boolean } | undefined;
      if (typeof cAny2?.enabled === "boolean" && typeof baseControlsEnabled.current === "boolean") {
        cAny2.enabled = baseControlsEnabled.current;
      }
    };
  }, [camera, controls, enabled, cameraFovBase]);

  useFrame((_state, dt) => {
    if (!enabled) return;

    const base = baseCamPos.current ?? { x: 0, y: 0, z: cameraZBase };
    const state = camState.current ?? { x: base.x, y: base.y, z: base.z, fov: cameraFovBase };

    const driftX = Math.sin(frame * KINETIC_TEXT_CONSTANTS.camera.driftXFreq) * cameraDrift;
    const driftY =
      Math.cos(frame * KINETIC_TEXT_CONSTANTS.camera.driftYFreq) *
      cameraDrift *
      KINETIC_TEXT_CONSTANTS.camera.driftYScale;

    // IMPORTANT: avoid sudden jumps when segIndex changes.
    // We still want different "framing" vibes per segment, but we ease the phase.
    const phaseTarget = segIndex * KINETIC_TEXT_CONSTANTS.camera.phaseStep;
    phaseState.current = expDamp(
      phaseState.current,
      phaseTarget,
      KINETIC_TEXT_CONSTANTS.camera.phaseLambda,
      dt,
    );
    const phase = phaseState.current;

    const t = frame;

    // Pro-style continuous move stack:
    // - Arc shot (orbit) for parallax
    // - Push/pull (dolly)
    // - Parallax pan (truck)
    // - Subtle handheld (band-limited)

    const orbitT = t * cameraOrbitSpeed;
    const orbitX = Math.sin(orbitT + phase) * cameraOrbit;
    const orbitY =
      Math.sin(
        orbitT * KINETIC_TEXT_CONSTANTS.camera.orbitYFreqScale +
          phase * KINETIC_TEXT_CONSTANTS.camera.orbitYPhaseScale +
          KINETIC_TEXT_CONSTANTS.camera.orbitYPhaseOffset,
      ) *
      cameraOrbit *
      KINETIC_TEXT_CONSTANTS.camera.orbitYScale;

    // Reduce 3D skew: orbit can add a hint of life, but should not dominate.
    const orbitPosScale = KINETIC_TEXT_CONSTANTS.camera.orbitPosScale;
    const orbitLookScale = KINETIC_TEXT_CONSTANTS.camera.orbitLookScale;

    // Make motion prominent via safer channels (push-in + lateral sweep), not heavy tilt.
    const truckPosScale = KINETIC_TEXT_CONSTANTS.camera.truckPosScale;
    const dollyPosScale = KINETIC_TEXT_CONSTANTS.camera.dollyPosScale;

    const dollyT = t * cameraDollySpeed;
    const dollyZ =
      Math.sin(dollyT + phase * KINETIC_TEXT_CONSTANTS.camera.dollyPhaseScale) * cameraDolly * dollyPosScale;

    // Longer, more noticeable moves: slower frequency, larger amplitude (controlled via defaults).
    const truckX =
      Math.sin(t * KINETIC_TEXT_CONSTANTS.camera.truckXFreq + phase) * cameraPan * truckPosScale;
    const truckY =
      Math.sin(
        t * KINETIC_TEXT_CONSTANTS.camera.truckYFreq +
          phase * KINETIC_TEXT_CONSTANTS.camera.truckYPhaseScale +
          KINETIC_TEXT_CONSTANTS.camera.truckYPhaseOffset,
      ) *
      cameraPan *
      KINETIC_TEXT_CONSTANTS.camera.truckYScale *
      truckPosScale;

    // Reduce look swing so movement reads like a push-in + lateral sweep, not a heavy 3D tilt.
    const truckLookScale = KINETIC_TEXT_CONSTANTS.camera.truckLookScale;

    // Handheld: small, smooth, never jittery.
    const hhX =
      (Math.sin(t * KINETIC_TEXT_CONSTANTS.camera.handheldFreqs.x1 + KINETIC_TEXT_CONSTANTS.camera.handheldFreqs.xPhase1) +
        Math.sin(t * KINETIC_TEXT_CONSTANTS.camera.handheldFreqs.x2 + KINETIC_TEXT_CONSTANTS.camera.handheldFreqs.xPhase2)) *
      0.5;
    const hhY =
      (Math.sin(t * KINETIC_TEXT_CONSTANTS.camera.handheldFreqs.y1 + KINETIC_TEXT_CONSTANTS.camera.handheldFreqs.yPhase1) +
        Math.sin(t * KINETIC_TEXT_CONSTANTS.camera.handheldFreqs.y2 + KINETIC_TEXT_CONSTANTS.camera.handheldFreqs.yPhase2)) *
      0.5;
    const handheldX = hhX * (cameraPan * KINETIC_TEXT_CONSTANTS.camera.handheldPanScaleX);
    const handheldY = hhY * (cameraPan * KINETIC_TEXT_CONSTANTS.camera.handheldPanScaleY);

    const zBaseOffset = -cameraPunch * KINETIC_TEXT_CONSTANTS.camera.zBaseOffsetScale;

    const kickT = easeOutExpo(enterT);
    let kickX = 0;
    let kickY = 0;
    let kickZ = 0;
    let kickFov = 0;

    // Start wider/farther then ease back (reads as a push-in, not zoom-out).
    // Keep kicks restrained so motion feels premium, not jumpy.
    kickZ += cameraPunch * KINETIC_TEXT_CONSTANTS.camera.kick.baseZScale * (1 - kickT);
    kickFov += KINETIC_TEXT_CONSTANTS.camera.kick.baseFov * (1 - kickT);

    if (effect === "zoom_punch" || effect === "slam_zoom") {
      kickZ += cameraPunch * KINETIC_TEXT_CONSTANTS.camera.kick.zoomPunchZScale * (1 - kickT);
      kickFov += KINETIC_TEXT_CONSTANTS.camera.kick.zoomPunchFov * (1 - kickT);
    }

    if (effect === "whip_left") kickX += cameraWhip * (1 - kickT);
    if (effect === "whip_right") kickX += -cameraWhip * (1 - kickT);

    if (effect === "slide_left") kickX += cameraWhip * KINETIC_TEXT_CONSTANTS.camera.kick.slideKickScale * (1 - kickT);
    if (effect === "slide_right") kickX += -cameraWhip * KINETIC_TEXT_CONSTANTS.camera.kick.slideKickScale * (1 - kickT);
    if (effect === "spin_pop") {
      kickY +=
        cameraWhip *
        KINETIC_TEXT_CONSTANTS.camera.kick.spinPopYScale *
        Math.sin(localFrame * 0.35) *
        (1 - kickT);
    }

    if (effect === "glitch_shake") {
      const shakeAmt = (1 - kickT) * KINETIC_TEXT_CONSTANTS.camera.kick.glitchShakeScale;
      kickX += (rand01(frame * 4.2) - 0.5) * shakeAmt;
      kickY += (rand01(frame * 5.1 + 3.3) - 0.5) * shakeAmt;
    }

    const settle = Math.sin(localFrame * KINETIC_TEXT_CONSTANTS.camera.kick.settleFreq) * (1 - kickT);
    kickX += settle * (cameraWhip * KINETIC_TEXT_CONSTANTS.camera.kick.settleXScale);
    kickY += settle * (cameraWhip * KINETIC_TEXT_CONSTANTS.camera.kick.settleYScale);

    // Clamp whips to avoid sudden out-of-frame pops.
    const whipClamp = Math.max(KINETIC_TEXT_CONSTANTS.camera.kick.whipClampMin, cameraWhip);
    kickX = clamp(-whipClamp, kickX, whipClamp);

    let targetX = base.x + driftX + orbitX * orbitPosScale + truckX + handheldX + kickX;
    let targetY = base.y + driftY + orbitY * orbitPosScale + truckY + handheldY + kickY;
    const targetZ = (base.z || cameraZBase) + dollyZ + zBaseOffset + kickZ;

    // Continuous breathing zoom (biased toward push-in): keeps motion obvious even in calm segments.
    const breath =
      KINETIC_TEXT_CONSTANTS.camera.breath.w1 *
        Math.sin(
          t * KINETIC_TEXT_CONSTANTS.camera.breath.f1 +
            phase * KINETIC_TEXT_CONSTANTS.camera.breath.phaseScale1 +
            KINETIC_TEXT_CONSTANTS.camera.breath.phaseOffset1,
        ) +
      KINETIC_TEXT_CONSTANTS.camera.breath.w2 *
        Math.sin(
          t * KINETIC_TEXT_CONSTANTS.camera.breath.f2 +
            phase * KINETIC_TEXT_CONSTANTS.camera.breath.phaseScale2 +
            KINETIC_TEXT_CONSTANTS.camera.breath.phaseOffset2,
        );
    // One-way zoom: only allow breathing to zoom IN (smaller FOV), never zoom OUT (larger FOV).
    const breathIn = Math.max(0, breath);
    const breathFov =
      -breathIn *
      (KINETIC_TEXT_CONSTANTS.camera.breath.ampBase + cameraPunch * KINETIC_TEXT_CONSTANTS.camera.breath.ampPunchScale);

    let targetFov = cameraFovBase + kickFov + breathFov;

    // Safe framing clamp:
    // Prevent revealing background plane edges ("white stuff").
    // Background plane sits at z=-120 in scene. We clamp camera X/Y so that
    // the view rectangle at that depth stays inside the plane.
    const planeZ = KINETIC_TEXT_CONSTANTS.camera.safeFraming.planeZ;
    const d = Math.max(1, targetZ - planeZ);
    const camAnyForAspect = camera as unknown as { aspect?: number; fov?: number };
    const aspect = typeof camAnyForAspect.aspect === "number" ? camAnyForAspect.aspect : 16 / 9;
    // Use the intended target FOV (including breath/kicks) for safety computations.
    // Using the current camera.fov here can lag due to damping and let edges slip in.
    const fovDeg = targetFov;
    const fovTargetRad = (fovDeg * Math.PI) / 180;
    const viewHalfH0 = Math.tan(fovTargetRad / 2) * d;
    const viewHalfW0 = viewHalfH0 * aspect;

    const safeMargin = KINETIC_TEXT_CONSTANTS.camera.safeFraming.safeMargin;

    // Background plane half extents based on how we actually render it:
    // - Image/SVG/solid-color: square plane => aspect = 1
    // - Video: height = scale / aspect
    const planeHalfW = Math.max(1, backgroundScale * 0.5);
    const planeHalfH = Math.max(1, (backgroundScale / Math.max(0.2, backgroundPlaneAspect)) * 0.5);

    // Center-ray intersection point on the plane accounts for lookAt offset.
    // Ray: camera -> lookAt(z=0). Find intersection at z=planeZ.
    const lookXRaw = orbitX * orbitLookScale + truckX * truckLookScale;
    const lookYRaw = orbitY * orbitLookScale + truckY * truckLookScale;
    const cz = targetZ;
    const s = cz !== 0 ? (cz - planeZ) / cz : 1;
    const centerAtPlaneX = targetX + s * (lookXRaw - targetX);
    const centerAtPlaneY = targetY + s * (lookYRaw - targetY);

    // First clamp framing center so it doesn't point beyond the plane.
    const centerMaxX0 = Math.max(0, planeHalfW - viewHalfW0) * safeMargin;
    const centerMaxY0 = Math.max(0, planeHalfH - viewHalfH0) * safeMargin;

    // If the center is out of bounds, pull camera translation back.
    if (centerMaxX0 > 0 && Math.abs(centerAtPlaneX) > centerMaxX0) {
      targetX += clamp(-centerMaxX0, centerAtPlaneX, centerMaxX0) - centerAtPlaneX;
    }
    if (centerMaxY0 > 0 && Math.abs(centerAtPlaneY) > centerMaxY0) {
      targetY += clamp(-centerMaxY0, centerAtPlaneY, centerMaxY0) - centerAtPlaneY;
    }

    // Then dynamically zoom in (reduce FOV) so edges never enter frame.
    // Available space after centering:
    const centerAtPlaneX2 = targetX + s * (lookXRaw - targetX);
    const centerAtPlaneY2 = targetY + s * (lookYRaw - targetY);
    const availHalfW = Math.max(0.001, (planeHalfW - Math.abs(centerAtPlaneX2)) * safeMargin);
    const availHalfH = Math.max(0.001, (planeHalfH - Math.abs(centerAtPlaneY2)) * safeMargin);

    const fovMaxH = 2 * Math.atan(availHalfH / d);
    const fovMaxW = 2 * Math.atan(availHalfW / (d * aspect));
    const fovMax = Math.min(fovMaxH, fovMaxW);
    const fovMaxDeg = (fovMax * 180) / Math.PI;
    // Don't zoom out past current target; only zoom in when necessary.
    // Also cap the minimum FOV so we don't over-zoom into an unusable shot.
    targetFov = Math.max(KINETIC_TEXT_CONSTANTS.camera.safeFraming.minFov, Math.min(targetFov, fovMaxDeg));

    // Exponential damping for smooth, inertia-like motion.
    const lambdaPos =
      KINETIC_TEXT_CONSTANTS.camera.damping.lambdaPosBase *
      Math.max(KINETIC_TEXT_CONSTANTS.camera.damping.smoothMin, cameraSmooth);
    const lambdaFov =
      KINETIC_TEXT_CONSTANTS.camera.damping.lambdaFovBase *
      Math.max(KINETIC_TEXT_CONSTANTS.camera.damping.smoothMin, cameraSmooth);
    state.x = expDamp(state.x, targetX, lambdaPos, dt);
    state.y = expDamp(state.y, targetY, lambdaPos, dt);
    state.z = expDamp(state.z, targetZ, lambdaPos, dt);
    state.fov = expDamp(state.fov, targetFov, lambdaFov, dt);
    camState.current = state;

    camera.position.set(state.x, state.y, state.z);
    // LookAt also moves smoothly (parallax composition), no hard target jumps.
    camera.lookAt(lookXRaw, lookYRaw, 0);

    const camAny = camera as unknown as { fov?: number; updateProjectionMatrix?: () => void };
    if (typeof camAny.fov === "number") {
      camAny.fov = state.fov;
      camAny.updateProjectionMatrix?.();
    }
  });

  return null;
}
