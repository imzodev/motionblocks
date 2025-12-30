import { z } from "zod";
import type { AnimationTemplate, RenderProps } from "../../types/template";
import { Text, Image as DreiImage } from "@react-three/drei";
import React, { useState } from "react";
import type { Asset } from "../../types/timeline";
import { getVideoTexture, preserveEdgeSpaces, readTextWidth } from "./shared";
import { CameraRig } from "./kinetic-text.camera";
import { buildKineticTextRenderModel } from "./kinetic-text.render";
import {
  clamp,
  clamp01,
  easeInOutCubic,
  easeOutBack,
  type KineticEffect,
  computeKineticStyle,
  parseTwoPartSegment,
} from "./kinetic-text.utils";

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

  const { scale, posX, posY, rotZ, opacity } = computeKineticStyle({
    effect: seg.effect,
    enterT,
    localFrame: local,
    safePer,
    aliveAlpha,
    frame,
  });

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
      <CameraRig
        enabled={cameraMotionEnabled}
        frame={frame}
        segIndex={idx}
        localFrame={local}
        enterT={enterT}
        effect={seg.effect}
        cameraDrift={cameraDrift}
        cameraPunch={cameraPunch}
        cameraWhip={cameraWhip}
        cameraPan={cameraPan}
        cameraSmooth={cameraSmooth}
        cameraOrbit={cameraOrbit}
        cameraOrbitSpeed={cameraOrbitSpeed}
        cameraDolly={cameraDolly}
        cameraDollySpeed={cameraDollySpeed}
        cameraZBase={cameraZBase}
        cameraFovBase={cameraFovBase}
        backgroundScale={backgroundScale}
        backgroundPlaneAspect={backgroundAsset?.type === "video" ? backgroundVideoAspect : 1}
      />
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

    <group scale={[scale, scale, 1]} position={[posX, posY, 0]} rotation={[0, 0, rotZ]}>
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
    cameraMotionEnabled: z.boolean().default(true),
    cameraDrift: z.number().min(0).max(120).default(14),
    cameraPunch: z.number().min(0).max(600).default(260),
    cameraWhip: z.number().min(0).max(1000).default(320),
    cameraPan: z.number().min(0).max(800).default(220),
    cameraSmooth: z.number().min(0.02).max(0.6).default(0.2),
    cameraOrbit: z.number().min(0).max(1200).default(320),
    cameraOrbitSpeed: z.number().min(0).max(0.2).default(0.008),
    cameraDolly: z.number().min(0).max(1200).default(360),
    cameraDollySpeed: z.number().min(0).max(0.2).default(0.006),
    cameraZBase: z.number().min(200).max(4000).default(1000),
    cameraFovBase: z.number().min(20).max(100).default(36),
  }),
  render: ({ assets, frame, duration, props }: RenderProps) => {
    const model = buildKineticTextRenderModel({ assets, props });

    return (
      <KineticTextScene
        frame={frame}
        segments={model.segments}
        globalFontUrl={model.globalFontUrl}
        fontSize={model.fontSize}
        fontColor={model.fontColor}
        accentColor={model.accentColor}
        perSegmentFrames={model.perSegmentFrames}
        enterFrames={model.enterFrames}
        exitFrames={model.exitFrames}
        continuationDelayFrames={model.continuationDelayFrames}
        continuationTypeFrames={model.continuationTypeFrames}
        slidePx={model.slidePx}
        cameraMotionEnabled={model.cameraMotionEnabled}
        cameraDrift={model.cameraDrift}
        cameraPunch={model.cameraPunch}
        cameraWhip={model.cameraWhip}
        cameraPan={model.cameraPan}
        cameraSmooth={model.cameraSmooth}
        cameraOrbit={model.cameraOrbit}
        cameraOrbitSpeed={model.cameraOrbitSpeed}
        cameraDolly={model.cameraDolly}
        cameraDollySpeed={model.cameraDollySpeed}
        cameraZBase={model.cameraZBase}
        cameraFovBase={model.cameraFovBase}
        backgroundEnabled={model.backgroundEnabled}
        backgroundOpacity={model.backgroundOpacity}
        backgroundScale={model.backgroundScale}
        backgroundVideoAspect={model.backgroundVideoAspect}
        backgroundColor={model.backgroundColor}
        backgroundAsset={model.backgroundAsset}
      />
    );
  },
};
