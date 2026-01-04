"use client";

import React, { useMemo } from "react";
import { Text } from "@react-three/drei";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";

// --- Utils ---

function clamp01(v: number) {
  return Math.min(1, Math.max(0, v));
}

function easeOutExpo(t: number) {
  return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
}

function easeOutBack(t: number, overshoot = 1.0) {
  const x = clamp01(t);
  const c1 = overshoot;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2);
}

// --- Props ---

export type BulletType = "none" | "bullet" | "number" | "arrow";

export interface ListProps {
  items: string[];
  title?: string;
  frame: number;
  introFrames?: number;     // How long the entry animation takes
  perItemFrames?: number;   // Delay between items
  textColor?: string;
  bulletColor?: string;
  fontUrl?: string;
  fontSize?: number;
  gap?: number;
  bulletType?: BulletType;
}

// --- Component ---

export function List({
  items,
  title,
  frame,
  introFrames = 30,
  perItemFrames = 60,
  textColor = "#1a1a1a",
  bulletColor = "#00d09c",
  fontUrl,
  fontSize = 40,
  gap = 60,
  bulletType = "bullet",
}: ListProps) {
  const { viewport } = useThree();

  // Layout calculations
  const totalHeight = (items.length - 1) * gap + (title ? gap * 1.5 : 0);
  const startY = totalHeight / 2;

  // Title Animation
  const titleIntro = introFrames;
  const titleProgress = clamp01(frame / titleIntro);
  const titleAlpha = easeOutExpo(titleProgress);
  const titleSlide = easeOutExpo(titleProgress);
  const titleY = startY + (1 - titleSlide) * 50;

  return (
    <group>
      {/* Title */}
      {title && (
        <group position={[0, titleY, 0]}>
          <Text
            font={fontUrl}
            fontSize={fontSize * 1.5}
            color={textColor}
            anchorX="center"
            anchorY="middle"
            fillOpacity={titleAlpha}
            maxWidth={800}
          >
            {title}
          </Text>
        </group>
      )}

      {/* List Items */}
      <group position={[0, title ? startY - gap * 1.5 : startY, 0]}>
        {items.map((item, index) => {
          // Staggered start time for each item
          // If title exists, start items after title finishes (or overlaps slightly)
          const startTime = (title ? introFrames * 0.5 : 0) + index * perItemFrames;
          
          const localFrame = frame - startTime;
          const progress = clamp01(localFrame / introFrames);
          
          const alpha = easeOutExpo(progress);
          const slide = easeOutExpo(progress);
          const scale = easeOutBack(progress, 0.8);

          // Position
          const y = -index * gap;
          const xOffset = (1 - slide) * -50; // Slide from left

          if (progress <= 0) return null;

          const showBullet = bulletType !== "none";
          const bulletOffset = 30;

          return (
            <group key={index} position={[xOffset, y, 0]}>
              {/* Bullet / Number / Arrow */}
              {showBullet && (
                <group position={[-bulletOffset, 0, 0]} scale={[scale, scale, scale]}>
                  {bulletType === "bullet" && (
                    <mesh>
                      <circleGeometry args={[fontSize * 0.15, 32]} />
                      <meshBasicMaterial color={bulletColor} transparent opacity={alpha} />
                    </mesh>
                  )}
                  {bulletType === "arrow" && (
                     <mesh rotation={[0, 0, -Math.PI / 2]}>
                      <circleGeometry args={[fontSize * 0.15, 3]} />
                      <meshBasicMaterial color={bulletColor} transparent opacity={alpha} />
                    </mesh>
                  )}
                  {bulletType === "number" && (
                    <Text
                        font={fontUrl}
                        fontSize={fontSize}
                        color={bulletColor}
                        anchorX="center"
                        anchorY="middle"
                        fillOpacity={alpha}
                    >
                        {index + 1}.
                    </Text>
                  )}
                </group>
              )}

              {/* Text */}
              <Text
                font={fontUrl}
                fontSize={fontSize}
                color={textColor}
                anchorX="left"
                anchorY="middle"
                fillOpacity={alpha}
                maxWidth={700}
                position={[showBullet ? 20 : 0, 0, 0]} // Offset if bullet exists
              >
                {item}
              </Text>
            </group>
          );
        })}
      </group>
    </group>
  );
}
