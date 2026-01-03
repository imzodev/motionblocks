"use client";

import React, { useMemo } from "react";
import { Text, Line } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

import type { GraphDataPoint } from "../Graph3D";

// --- Utils ---

function clamp01(v: number) {
  return Math.min(1, Math.max(0, v));
}

function easeOutBack(t: number, overshoot = 1.0) {
  const x = clamp01(t);
  const c1 = overshoot;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2);
}

function easeInOutCubic(t: number) {
  const x = clamp01(t);
  return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
}

// --- Types ---

export interface LineGraphProps {
  data: GraphDataPoint[];
  frame: number;
  introFrames: number;
  perItemFrames: number;
  colors?: string[];
  fontUrl?: string;
  textColor?: string;
  thickness?: number;
  showAxes?: boolean;
  axisColor?: string;
  yAxisTickCount?: number;
}

// --- Axis Components ---

interface YAxisProps {
  maxValue: number;
  startX: number;
  totalWidth: number;
  fontUrl?: string;
  axisColor?: string;
  tickCount?: number;
  padding?: number;
}

const YAxis = ({
  maxValue,
  startX,
  totalWidth,
  fontUrl,
  axisColor = "white",
  tickCount = 5,
  padding = 80,
}: YAxisProps) => {
  const axisX = startX - padding;
  const axisHeight = 400;

  return (
    <group>
      {/* Vertical axis line */}
      <Line
        points={[
          new THREE.Vector3(axisX, 0, 0),
          new THREE.Vector3(axisX, axisHeight, 0),
        ]}
        color={axisColor}
        lineWidth={2}
      />

      {/* Ticks and labels */}
      {Array.from({ length: tickCount }).map((_, i) => {
        const value = (maxValue * i) / (tickCount - 1);
        const y = (axisHeight * i) / (tickCount - 1);
        const labelValue = Math.round(value * 10) / 10; // Round to 1 decimal place

        return (
          <group key={i}>
            {/* Tick mark */}
            <Line
              points={[
                new THREE.Vector3(axisX, y, 0),
                new THREE.Vector3(axisX - 10, y, 0),
              ]}
              color={axisColor}
              lineWidth={2}
            />
            {/* Label */}
            <Text
              font={fontUrl}
              position={[axisX - 20, y, 0]}
              fontSize={16}
              color={axisColor}
              anchorX="right"
              anchorY="middle"
            >
              {labelValue}
            </Text>
          </group>
        );
      })}
    </group>
  );
};

interface XAxisProps {
  startX: number;
  totalWidth: number;
  fontUrl?: string;
  axisColor?: string;
  padding?: number;
}

const XAxis = ({
  startX,
  totalWidth,
  fontUrl,
  axisColor = "white",
  padding = 80,
}: XAxisProps) => {
  const axisY = -20;
  const axisStartX = startX - padding;
  const axisEndX = startX + totalWidth + padding;

  return (
    <group>
      {/* Horizontal axis line */}
      <Line
        points={[
          new THREE.Vector3(axisStartX, axisY, 0),
          new THREE.Vector3(axisEndX, axisY, 0),
        ]}
        color={axisColor}
        lineWidth={2}
      />
    </group>
  );
};

// --- Main Component ---

export function LineGraph({
  data,
  frame,
  introFrames,
  perItemFrames,
  colors = ["#3b82f6"],
  fontUrl,
  textColor = "white",
  thickness = 8,
  showAxes = true,
  axisColor,
  yAxisTickCount = 5,
}: LineGraphProps) {
  const maxValue = useMemo(() => Math.max(...data.map((d) => d.value), 1), [data]);
  const widthPerPoint = 150;
  const totalWidth = (data.length - 1) * widthPerPoint;
  const startX = -totalWidth / 2;

  const points = useMemo(() => {
    return data.map((d, i) => {
      const x = startX + i * widthPerPoint;
      const y = (d.value / maxValue) * 400;
      return new THREE.Vector3(x, y, 0);
    });
  }, [data, maxValue, startX]);

  // Animate line drawing
  const totalPoints = points.length;
  // Total animation duration: intro + segments drawing (no buffer for line graph)
  const segmentsToDraw = totalPoints - 1;
  const drawDuration = introFrames + segmentsToDraw * perItemFrames;
  const drawT = clamp01((frame - introFrames) / drawDuration);

  // Only render if we have at least 2 points
  if (totalPoints < 2) return null;

  const color = colors[0];
  const effectiveAxisColor = axisColor || textColor;

  return (
    <group>
      {/* Axes - appear immediately */}
      {showAxes && (
        <>
          <YAxis
            maxValue={maxValue}
            startX={startX}
            totalWidth={totalWidth}
            fontUrl={fontUrl}
            axisColor={effectiveAxisColor}
            tickCount={yAxisTickCount}
          />
          <XAxis
            startX={startX}
            totalWidth={totalWidth}
            fontUrl={fontUrl}
            axisColor={effectiveAxisColor}
          />
        </>
      )}

      {/* The Line */}
      {points.slice(0, -1).map((pt, i) => {
        const next = points[i + 1];
        // Calculate progress for this specific segment
        // Each segment has its own time window based on perItemFrames
        const segStartFrame = introFrames + i * perItemFrames;
        const segEndFrame = introFrames + (i + 1) * perItemFrames;

        // Map current frame to local segment progress (0..1)
        // Clamp to 0..1 to handle frames after segment is complete
        let localProgress = (frame - segStartFrame) / (segEndFrame - segStartFrame);
        localProgress = clamp01(localProgress);
        localProgress = easeInOutCubic(localProgress);

        if (localProgress <= 0) return null;

        const endPos = new THREE.Vector3().lerpVectors(pt, next, localProgress);

        return (
          <group key={i}>
            <Line
              points={[pt, endPos]}
              color={color}
              lineWidth={thickness}
              toneMapped={false}
            />
            {/* Glowing joint at start */}
            <mesh position={pt}>
              <sphereGeometry args={[thickness * 1.5, 16, 16]} />
              <meshBasicMaterial color={color} toneMapped={false} />
            </mesh>
             {/* Glowing joint at end (only if fully drawn) */}
             {localProgress >= 1 && (
                <mesh position={next}>
                  <sphereGeometry args={[thickness * 1.5, 16, 16]} />
                  <meshBasicMaterial color={color} toneMapped={false} />
                </mesh>
             )}
          </group>
        );
      })}

      {/* Labels and values (pop up as line passes) */}
      {data.map((item, i) => {
        // Trigger when the line reaches this point
        const ptStartFrame = introFrames + i * perItemFrames;
        const isReached = frame >= ptStartFrame;
        const localFrame = frame - ptStartFrame;

        if (!isReached) return null;

        const alpha = clamp01(localFrame / 20);
        const scale = easeOutBack(alpha);
        const pos = points[i];

        return (
          <group key={i} position={pos}>
            <group scale={[scale, scale, scale]}>
              {/* Point Glow */}
              <mesh>
                 <sphereGeometry args={[12, 16, 16]} />
                 <meshStandardMaterial
                    color={color}
                    emissive={color}
                    emissiveIntensity={2}
                    toneMapped={false}
                 />
              </mesh>
              {/* Label */}
              <Text
                font={fontUrl}
                position={[0, -40, 0]}
                fontSize={18}
                color={textColor}
                anchorX="center"
                anchorY="top"
              >
                {item.label}
              </Text>
               {/* Value */}
               <Text
                font={fontUrl}
                position={[0, 40, 0]}
                fontSize={24}
                color={textColor}
                anchorX="center"
                anchorY="bottom"
              >
                {item.value}
              </Text>
            </group>
          </group>
        )
      })}
    </group>
  );
}
