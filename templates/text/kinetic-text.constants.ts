export const KINETIC_TEXT_CONSTANTS = {
  camera: {
    driftXFreq: 0.012,
    driftYFreq: 0.011,
    driftYScale: 0.55,

    phaseStep: 1.35,
    phaseLambda: 2.4,

    orbitYFreqScale: 0.82,
    orbitYPhaseScale: 0.6,
    orbitYPhaseOffset: 1.1,
    orbitYScale: 0.32,

    orbitPosScale: 0.18,
    orbitLookScale: 0.015,

    truckPosScale: 1.35,
    dollyPosScale: 1.45,

    dollyPhaseScale: 0.35,

    truckXFreq: 0.0039,
    truckYFreq: 0.0032,
    truckYPhaseScale: 0.7,
    truckYPhaseOffset: 0.8,
    truckYScale: 0.42,

    truckLookScale: 0.02,

    handheldFreqs: {
      x1: 0.13,
      x2: 0.071,
      y1: 0.11,
      y2: 0.067,
      xPhase1: 11.0,
      xPhase2: 3.3,
      yPhase1: 7.7,
      yPhase2: 9.1,
    },
    handheldPanScaleX: 0.08,
    handheldPanScaleY: 0.06,

    zBaseOffsetScale: 0.11,

    kick: {
      baseZScale: 0.22,
      baseFov: 2.1,
      zoomPunchZScale: 0.75,
      zoomPunchFov: 9.5,
      spinPopYScale: 0.06,
      slideKickScale: 0.18,
      settleFreq: 0.42,
      settleXScale: 0.03,
      settleYScale: 0.015,
      whipClampMin: 60,
      glitchShakeScale: 10,
    },

    breath: {
      w1: 0.55,
      w2: 0.45,
      f1: 0.006,
      f2: 0.0036,
      phaseScale1: 0.7,
      phaseScale2: 0.35,
      phaseOffset1: 0.4,
      phaseOffset2: 2.2,
      ampBase: 10,
      ampPunchScale: 0.004,
    },

    safeFraming: {
      planeZ: -120,
      safeMargin: 0.82,
      minFov: 12,
    },

    damping: {
      lambdaPosBase: 8,
      lambdaFovBase: 7,
      smoothMin: 0.02,
    },
  },

  effects: {
    popBounce: {
      overshoot: 1.7,
      posY: -24,
    },
    zoomBack: {
      scale0: 0.55,
      scale1: 0.45,
      posY: 10,
    },
    zoomPunch: {
      scale0: 2.25,
      scale1: 1.25,
      rotZ: -0.08,
    },
    slamZoom: {
      slamFrames: 10,
      s0Base: 0.35,
      s0Scale: 0.95,
      s1Base: 1.25,
      s1Scale: 0.25,
      s1Overshoot: 1.25,
      posY: 90,
      rotZ: 0.14,
    },
    slide: {
      scale0: 0.9,
      scale1: 0.1,
      posX: 140,
    },
    whip: {
      posX: 420,
      scale0: 1.15,
      scale1: 0.15,
      rotZ: 0.18,
    },
    spinPop: {
      overshoot: 1.85,
      minScale: 0.15,
      rotZ: -0.9,
      posY: -26,
    },
    glitchShake: {
      shakeScale: 18,
      posYScale: 0.6,
      rotZScale: 0.25,
      scale0: 1.05,
      scale1: 0.05,
      randF0: 1.7,
      randF1: 2.3,
      randP1: 11.1,
      randF2: 3.1,
      randP2: 7.7,
    },
    popThenType: {
      overshoot: 1.65,
      posY: -18,
    },
    slideThenType: {
      scale0: 0.9,
      scale1: 0.1,
      posX: 120,
    },
  },
} as const;
