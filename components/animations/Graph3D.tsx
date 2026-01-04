"use client";

import React, { useRef } from "react";
import { Text } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

import { LineGraph } from "./graph/LineGraph";
import { BarGraph } from "./graph/BarGraph";
import { PieGraph } from "./graph/PieGraph";


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

// --- Components ---

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
