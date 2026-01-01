"use client";

import React, { useMemo, useRef, useState } from "react";
import { Text, Float, Line, Extrude, RoundedBox } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { EffectComposer, Bloom } from "@react-three/postprocessing";

// Constants for defaults to avoid magic numbers
export const DEFAULT_GRAPH_INTRO_FRAMES = 15;
export const DEFAULT_GRAPH_PER_ITEM_FRAMES = 20;
export const DEFAULT_GRAPH_BUFFER_FRAMES = 60;

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
  bufferFrames?: number;
  // Visual config
  barWidth?: number;
  barGap?: number;
  lineThickness?: number;
  pieRadius?: number;
  pieHeight?: number;
  colors?: string[];
  textColor?: string;
  glowStrength?: number;
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

const BarGraph = ({
  data,
  frame,
  introFrames,
  perItemFrames,
  bufferFrames,
  barWidth = 60,
  barGap = 40,
  colors = ["#3b82f6"],
  fontUrl,
  textColor = "white",
}: {
  data: GraphDataPoint[];
  frame: number;
  introFrames: number;
  perItemFrames: number;
  bufferFrames: number;
  barWidth?: number;
  barGap?: number;
  colors?: string[];
  fontUrl?: string;
  textColor?: string;
}) => {
  const maxValue = useMemo(() => Math.max(...data.map((d) => d.value), 1), [data]);
  const totalWidth = data.length * (barWidth + barGap) - barGap;
  const startX = -totalWidth / 2;

  // Animation constants derived from perItemFrames
  // Duration includes the buffer from the track calculation to ensure smooth settling until the end
  const duration = perItemFrames + bufferFrames;
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
};

const LineGraph = ({
  data,
  frame,
  introFrames,
  perItemFrames,
  bufferFrames,
  colors = ["#3b82f6"],
  fontUrl,
  textColor = "white",
  thickness = 8,
}: {
  data: GraphDataPoint[];
  frame: number;
  introFrames: number;
  perItemFrames: number;
  bufferFrames: number;
  colors?: string[];
  fontUrl?: string;
  textColor?: string;
  thickness?: number;
}) => {
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
  // Make drawing duration depend on perItemFrames, plus buffer to fill track
  const drawDuration = Math.max(totalPoints * perItemFrames + bufferFrames, 1);
  const drawT = clamp01((frame - introFrames) / drawDuration);
  const currentDrawIndex = Math.floor(drawT * (totalPoints - 1));
  
  // Create visible points subset for the line
  const visiblePoints = points.slice(0, currentDrawIndex + 2); // +2 to include the one being drawn to

  // Only render if we have points
  if (visiblePoints.length < 2) return null;

  const color = colors[0];

  return (
    <group>
      {/* The Line */}
      {points.slice(0, -1).map((pt, i) => {
        const next = points[i + 1];
        // Calculate progress for this specific segment
        // The total animation covers indices 0 to totalPoints-1
        // This segment is index i.
        const segStart = i / (totalPoints - 1);
        const segEnd = (i + 1) / (totalPoints - 1);
        
        // Map drawT (0..1) to local segment progress (0..1)
        let localProgress = (drawT - segStart) / (segEnd - segStart);
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
        const ptProgress = i / (totalPoints - 1);
        const isReached = drawT >= ptProgress;
        const localFrame = frame - (introFrames + ptProgress * drawDuration);
        
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
};

const PieGraph = ({
  data,
  frame,
  introFrames,
  perItemFrames,
  bufferFrames,
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
  bufferFrames: number;
  colors?: string[];
  fontUrl?: string;
  textColor?: string;
  radius?: number;
  height?: number;
}) => {
  const total = useMemo(() => data.reduce((acc, curr) => acc + curr.value, 0), [data]);
  
  let currentAngle = 0;
  
  // Intro animation: Spin and expand
  // Scale duration by number of items to respect "per item" setting, plus buffer to fill track
  const duration = Math.max(perItemFrames * data.length + bufferFrames, 30);
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
        const shape = useMemo(() => {
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
  bufferFrames = DEFAULT_GRAPH_BUFFER_FRAMES,
  barWidth,
  barGap,
  lineThickness,
  pieRadius,
  pieHeight,
  colors,
  textColor = "#ffffff",
  glowStrength = 1.0,
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
                bufferFrames={bufferFrames}
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
                bufferFrames={bufferFrames}
                thickness={lineThickness}
                colors={colors}
                fontUrl={globalFontUrl}
                textColor={textColor}
            />
            )}
            {type === "pie" && (
            <PieGraph
                data={data}
                frame={frame}
                introFrames={introFrames}
                perItemFrames={perItemFrames}
                bufferFrames={bufferFrames}
                radius={pieRadius}
                height={pieHeight}
                colors={colors}
                fontUrl={globalFontUrl}
                textColor={textColor}
            />
            )}
        </group>
      </group>

      {/* Post Processing for Glows */}
      <EffectComposer>
        <Bloom 
            luminanceThreshold={1} // Only very bright things glow
            mipmapBlur 
            intensity={glowStrength} 
            radius={0.4}
        />
      </EffectComposer>
    </>
  );
}
