"use client";

import React, { useMemo } from "react";
import { Text, Extrude, Billboard } from "@react-three/drei";
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

export interface PieGraphProps {
  data: GraphDataPoint[];
  frame: number;
  introFrames: number;
  perItemFrames: number;
  colors?: string[];
  fontUrl?: string;
  textColor?: string;
  radius?: number;
  height?: number;
}

// --- Sub-components ---

interface PieSliceProps {
  item: GraphDataPoint;
  index: number;
  total: number;
  startAngle: number;
  fullAngle: number;
  frame: number;
  introFrames: number;
  perItemFrames: number;
  colors: string[];
  radius: number;
  height: number;
  fontUrl?: string;
  textColor: string;
}

function PieSlice({
  item,
  index,
  total,
  startAngle,
  fullAngle,
  frame,
  introFrames,
  perItemFrames,
  colors,
  radius,
  height,
  fontUrl,
  textColor,
}: PieSliceProps) {
  const value = item.value;

  // Animation progress for this slice
  const itemStart = introFrames + index * perItemFrames;
  const itemDuration = perItemFrames;
  const progress = clamp01((frame - itemStart) / itemDuration);
  const easedProgress = easeInOutCubic(progress);

  const angle = fullAngle * easedProgress;

  // Extrude shape (animates with angle)
  const shape = useMemo(() => {
    const s = new THREE.Shape();
    s.moveTo(0, 0);
    s.arc(0, 0, radius, startAngle, startAngle + angle, false);
    s.lineTo(0, 0);
    return s;
  }, [radius, startAngle, angle]);

  if (progress <= 0) return null;

  const color = item.color || colors[index % colors.length];

  // Calculate mid-angle for label placement (based on FULL angle for stability)
  const midAngle = startAngle + fullAngle / 2;
  const labelRadius = radius + 60;
  const labelX = Math.cos(midAngle) * labelRadius;
  const labelZ = Math.sin(midAngle) * labelRadius; // Z because we will rotate shape to be flat-ish

  // Explode effect - Constant separation for all items
  const explode = 5;
  // Correct for 45-degree tilt foreshortening on Y axis (approx 1.41)
  const scaleY = 1 / Math.cos(Math.PI / 4);

  const explodeX = Math.cos(midAngle) * explode;
  const explodeY = Math.sin(midAngle) * explode * scaleY;

  return (
    <group position={[explodeX, explodeY, 0]}>
      <Extrude
        args={[shape, { depth: height, bevelEnabled: true, bevelSize: 2, bevelThickness: 2 }]}
        rotation={[0, 0, 0]} // Shape is in XY plane
      >
        <meshStandardMaterial
          color={color}
          roughness={0.2}
          metalness={0.6}
          emissive={color}
          emissiveIntensity={0.1}
        />
      </Extrude>

      {/* Label - positioned in 3D space around the pie */}
      <Billboard position={[labelX, labelZ, height/2]}>
        <group scale={[easedProgress, easedProgress, easedProgress]}>
          <Text
            font={fontUrl}
            fontSize={24}
            color={textColor}
            anchorX={Math.cos(midAngle) > 0 ? "left" : "right"}
            anchorY="middle"
          >
            {item.label} ({Math.round((value / total) * 100)}%)
          </Text>
        </group>
      </Billboard>
    </group>
  );
}

// --- Component ---

export function PieGraph({
  data,
  frame,
  introFrames,
  perItemFrames,
  colors = [
    "#3b82f6", // Blue
    "#ef4444", // Red
    "#10b981", // Emerald
    "#f59e0b", // Amber
    "#8b5cf6", // Violet
    "#ec4899", // Pink
    "#06b6d4", // Cyan
    "#84cc16", // Lime
  ],
  fontUrl,
  textColor = "white",
  radius = 200,
  height = 40,
}: PieGraphProps) {
  const total = useMemo(() => data.reduce((acc, curr) => acc + curr.value, 0), [data]);

  let currentAngle = 0;

  // Intro animation: Sequential fill
  // Remove global spin/expand. Fixed rotation for view.
  
  return (
    <group rotation={[Math.PI / 4, 0, 0]}>
      {data.map((item, i) => {
        const fullAngle = (item.value / total) * Math.PI * 2;
        const startAngle = currentAngle;
        currentAngle += fullAngle;

        return (
          <PieSlice
            key={i}
            item={item}
            index={i}
            total={total}
            startAngle={startAngle}
            fullAngle={fullAngle}
            frame={frame}
            introFrames={introFrames}
            perItemFrames={perItemFrames}
            colors={colors}
            radius={radius}
            height={height}
            fontUrl={fontUrl}
            textColor={textColor}
          />
        );
      })}
    </group>
  );
}
