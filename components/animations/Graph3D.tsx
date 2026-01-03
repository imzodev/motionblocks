"use client";

import React, { useRef } from "react";
import { Text, Extrude } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

import { LineGraph } from "./graph/LineGraph";
import { BarGraph } from "./graph/BarGraph";


// Constants for defaults to avoid magic numbers
export const DEFAULT_GRAPH_INTRO_FRAMES = 15;
export const DEFAULT_GRAPH_PER_ITEM_FRAMES = 20;

// --- Types ---

export type GraphType = "bar" | "line" | "pie";

export interface GraphDataPoint {
  label: string;
  value: number;
  color?: string;
}

export interface Graph3DProps {
  data: GraphDataPoint[];
  type: GraphType;
  frame: number;
  title?: string;
  globalFontUrl?: string;
  // Animation config
  introFrames?: number;
  perItemFrames?: number;
  // Visual config
  barWidth?: number;
  barGap?: number;
  lineThickness?: number;
  pieRadius?: number;
  pieHeight?: number;
  colors?: string[];
  textColor?: string;
  // Axis config
  showAxes?: boolean;
  axisColor?: string;
  yAxisTickCount?: number;
}

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

// --- Components ---

const PieGraph = ({
  data,
  frame,
  introFrames,
  perItemFrames,
  colors = ["#3b82f6", "#60a5fa", "#93c5fd"],
  fontUrl,
  textColor = "white",
  radius = 200,
  height = 40,
}: {
  data: GraphDataPoint[];
  frame: number;
  introFrames: number;
  perItemFrames: number;
  colors?: string[];
  fontUrl?: string;
  textColor?: string;
  radius?: number;
  height?: number;
}) => {
  const total = React.useMemo(() => data.reduce((acc, curr) => acc + curr.value, 0), [data]);

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

        const color = colors[i % colors.length];

        // Calculate mid-angle for label placement
        const midAngle = startAngle + angle / 2;
        const labelRadius = radius + 60;
        const labelX = Math.cos(midAngle) * labelRadius;
        const labelZ = Math.sin(midAngle) * labelRadius; // Z because we will rotate shape to be flat-ish
        const labelYPos = 0; // Relative to the group

        // Extrude shape
        const shape = React.useMemo(() => {
          const s = new THREE.Shape();
          s.moveTo(0, 0);
          s.arc(0, 0, radius, startAngle, startAngle + angle, false);
          s.lineTo(0, 0);
          return s;
        }, [radius, startAngle, angle]);

        // Explode effect on hover/focus (we simulate focus loop)
        const isFocused = Math.floor((frame - introFrames - 60) / 60) % data.length === i;
        const explode = isFocused && frame > introFrames + 60 ? 20 : 0;
        const explodeX = Math.cos(midAngle) * explode;
        const explodeY = Math.sin(midAngle) * explode;

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
            {/* We need to counteract the parent rotation for the text to be readable?
                Actually, let's just place it. Drei's Text with billboard=true (default) faces camera.
            */}
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
};


// --- Main Component ---

export function Graph3D({
  data,
  type,
  frame,
  title,
  globalFontUrl,
  introFrames = 30,
  perItemFrames = 45,
  barWidth,
  barGap,
  lineThickness,
  pieRadius,
  pieHeight,
  colors,
  textColor = "#ffffff",
  showAxes = true,
  axisColor,
  yAxisTickCount = 5,
}: Graph3DProps) {
  const { camera } = useThree();
  const controls = useThree((state) => state.controls) as any;
  const groupRef = useRef<THREE.Group>(null);

  // Initial Camera Setup & Type Change handling
  React.useEffect(() => {
    if (type === "bar" || type === "line") {
      // Position camera to see the graph from a nice elevated angle
      camera.position.set(0, 400, 800);

      if (controls) {
        controls.target.set(0, 0, 0); // Look at visual center of the graph
        controls.update();
      } else {
        camera.lookAt(0, 0, 0);
      }
    } else if (type === "pie") {
       // Higher angle for pie chart
       camera.position.set(0, 500, 600);

       if (controls) {
         controls.target.set(0, 0, 0);
         controls.update();
       } else {
         camera.lookAt(0, 0, 0);
       }
    }
  }, [type, camera, controls]);

  // Animation: Gentle rotation of the graph itself instead of camera
  useFrame((state) => {
    if (groupRef.current) {
      const t = state.clock.getElapsedTime();
      // Gentle drift rotation
      groupRef.current.rotation.y = Math.sin(t * 0.1) * 0.1;
    }
  });

  const bottomY = type === 'pie' ? 0 : -200;

  return (
    <>
      <group ref={groupRef}>
        {/* Title */}
        {title && (
          <Text
            font={globalFontUrl}
            position={[0, type === 'pie' ? 400 : 350, type === 'pie' ? -200 : -100]}
            fontSize={50}
            color={textColor}
            anchorX="center"
            anchorY="middle"
          >
            {title}
          </Text>
        )}

        <group position={[0, bottomY, 0]}>
            {type === "bar" && (
            <BarGraph
                data={data}
                frame={frame}
                introFrames={introFrames}
                perItemFrames={perItemFrames}
                barWidth={barWidth}
                barGap={barGap}
                colors={colors}
                fontUrl={globalFontUrl}
                textColor={textColor}
            />
            )}
            {type === "line" && (
            <LineGraph
                data={data}
                frame={frame}
                introFrames={introFrames}
                perItemFrames={perItemFrames}
                thickness={lineThickness}
                colors={colors}
                fontUrl={globalFontUrl}
                textColor={textColor}
                showAxes={showAxes}
                axisColor={axisColor}
                yAxisTickCount={yAxisTickCount}
            />
            )}
            {type === "pie" && (
            <PieGraph
                data={data}
                frame={frame}
                introFrames={introFrames}
                perItemFrames={perItemFrames}
                radius={pieRadius}
                height={pieHeight}
                colors={colors}
                fontUrl={globalFontUrl}
                textColor={textColor}
            />
            )}
        </group>
      </group>
    </>
  );
}
