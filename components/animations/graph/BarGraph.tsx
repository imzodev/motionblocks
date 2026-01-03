"use client";

import React, { useMemo } from "react";
import { Text, Float } from "@react-three/drei";
import * as THREE from "three";

import type { GraphDataPoint } from "../Graph3D";

// --- Utils ---

function clamp01(v: number) {
  return Math.min(1, Math.max(0, v));
}

// --- Types ---

export interface BarGraphProps {
  data: GraphDataPoint[];
  frame: number;
  introFrames: number;
  perItemFrames: number;
  barWidth?: number;
  barGap?: number;
  colors?: string[];
  fontUrl?: string;
  textColor?: string;
}

// --- Main Component ---

export function BarGraph({
  data,
  frame,
  introFrames,
  perItemFrames,
  barWidth = 60,
  barGap = 40,
  colors = ["#3b82f6"],
  fontUrl,
  textColor = "white",
}: BarGraphProps) {
  const maxValue = useMemo(() => Math.max(...data.map((d) => d.value), 1), [data]);
  const totalWidth = data.length * (barWidth + barGap) - barGap;
  const startX = -totalWidth / 2;

  // Animation constants derived from perItemFrames
  // Duration does NOT include buffer for bar graph (completes within set frame duration)
  const duration = perItemFrames;
  // Stagger equal to perItemFrames keeps the sequence rhythm matching the configuration
  const stagger = perItemFrames;

  return (
    <group>
      {data.map((item, i) => {
        const start = introFrames + i * stagger;
        const local = frame - start;
        const growT = clamp01(local / duration);
        // Use easeOutQuad for a smooth settling that remains perceptible longer than Cubic/Back
        const grow = 1 - (1 - growT) * (1 - growT);

        const height = (item.value / maxValue) * 400; // Max height 400
        const color = colors[i % colors.length];

        return (
          <group key={i} position={[startX + i * (barWidth + barGap), 0, 0]}>
            {/* Bar */}
            <group scale={[1, grow, 1]}>
              <mesh position={[0, height / 2, 0]} castShadow receiveShadow>
                <boxGeometry args={[barWidth, height, barWidth]} />
                <meshStandardMaterial
                  color={color}
                  roughness={0.2}
                  metalness={0.8}
                  emissive={color}
                  emissiveIntensity={0.2 + 0.3 * grow} // Pulse on entry
                />
              </mesh>
            </group>

            {/* Label - Bottom */}
            <Text
              font={fontUrl}
              position={[0, -40, 0]}
              fontSize={18}
              color={textColor}
              anchorX="center"
              anchorY="top"
              fillOpacity={clamp01((local - duration * 0.3) / (duration * 0.5))}
            >
              {item.label}
            </Text>

            {/* Value - Top */}
            <group position={[0, height * grow + 30, 0]}>
              <Float speed={2} rotationIntensity={0.1} floatIntensity={0.5}>
                <Text
                  font={fontUrl}
                  fontSize={24}
                  color={textColor}
                  anchorX="center"
                  anchorY="bottom"
                  fillOpacity={clamp01((local - duration * 0.5) / (duration * 0.3))}
                >
                  {Math.round(item.value * grow)}
                </Text>
              </Float>
            </group>
          </group>
        );
      })}
    </group>
  );
}
