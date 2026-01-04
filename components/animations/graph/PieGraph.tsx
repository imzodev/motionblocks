"use client";

import React, { useMemo } from "react";
import { Text, Extrude } from "@react-three/drei";
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

  // Intro animation: Spin and expand
  // Scale duration by number of items to respect "per item" setting
  const duration = Math.max(perItemFrames * data.length, 30);
  const introT = clamp01((frame - introFrames) / duration);
  const expand = easeOutBack(introT);
  const spin = (1 - easeInOutCubic(introT)) * Math.PI * 2;

  return (
    <group rotation={[Math.PI / 4, spin, 0]} scale={[expand, expand, expand]}>
      {data.map((item, i) => {
        const value = item.value;
        const angle = (value / total) * Math.PI * 2;
        const startAngle = currentAngle;
        currentAngle += angle;

        const color = item.color || colors[i % colors.length];

        // Calculate mid-angle for label placement
        const midAngle = startAngle + angle / 2;
        const labelRadius = radius + 60;
        const labelX = Math.cos(midAngle) * labelRadius;
        const labelZ = Math.sin(midAngle) * labelRadius; // Z because we will rotate shape to be flat-ish
        
        // Extrude shape
        const shape = useMemo(() => {
          const s = new THREE.Shape();
          s.moveTo(0, 0);
          s.arc(0, 0, radius, startAngle, startAngle + angle, false);
          s.lineTo(0, 0);
          return s;
        }, [radius, startAngle, angle]);

        // Explode effect - Constant separation for all items
        const explode = 5;
        // Correct for 45-degree tilt foreshortening on Y axis (approx 1.41)
        const scaleY = 1 / Math.cos(Math.PI / 4);
        
        const explodeX = Math.cos(midAngle) * explode;
        const explodeY = Math.sin(midAngle) * explode * scaleY;

        return (
          <group key={i} position={[explodeX, explodeY, 0]}>
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
            <group position={[labelX, labelZ, height/2]} rotation={[-Math.PI/4, 0, 0]}>
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
          </group>
        );
      })}
    </group>
  );
}
