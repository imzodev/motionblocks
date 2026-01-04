"use client";

import React from "react";
import { Text, Image as DreiImage } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import type { Asset } from "../../types/timeline";
import { getVideoTexture } from "../../templates/text/shared";

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

export interface ChapterItem {
  title: string;
  subtitle?: string;
}

export interface ChaptersProps {
  data: ChapterItem[];
  startNumber?: number;
  showNumber?: boolean;
  frame: number;
  introFrames?: number;
  framesPerChapter?: number;
  accentColor?: string;
  textColor?: string;
  fontUrl?: string;
  // Background
  backgroundEnabled?: boolean;
  backgroundOpacity?: number;
  backgroundScale?: number;
  backgroundVideoAspect?: number;
  backgroundColor?: string;
  backgroundAsset?: Asset;
}

// --- Component ---

export function Chapters({
  data,
  startNumber = 1,
  showNumber = true,
  frame,
  introFrames = 30,
  framesPerChapter = 60, // Default duration per chapter
  accentColor = "#00d09c",
  textColor = "#1a1a1a",
  fontUrl,
  backgroundEnabled = false,
  backgroundOpacity = 1,
  backgroundScale = 6000,
  backgroundVideoAspect = 1.77,
  backgroundColor = "#ffffff",
  backgroundAsset,
}: ChaptersProps) {
  const { viewport } = useThree();
  
  // 1. Determine active chapter
  const currentIndex = Math.floor(frame / framesPerChapter);
  
  // Guard: If out of range, show nothing
  if (currentIndex < 0 || currentIndex >= data.length) return null;

  const currentItem = data[currentIndex];
  const currentNumber = startNumber + currentIndex;
  
  // 2. Local animation progress
  const localFrame = frame % framesPerChapter;
  
  // Entrance (0 -> 1)
  const enterProgress = clamp01(localFrame / introFrames);
  
  // Exit (1 -> 0)
  // Start exiting 15 frames before the end to fit in tight 60f budget
  const outroFrames = 15;
  const exitStart = framesPerChapter - outroFrames;
  const exitProgress = clamp01((localFrame - exitStart) / outroFrames); // 0 to 1 during exit
  
  // Combined Opacity/Scale for Entrance & Exit
  // We want to enter fully, stay, then exit.
  // Ease in/out logic
  
  const isExiting = localFrame >= exitStart;

  // --- Animation Curves ---

  // Number: Pop in (Elastic) -> Stay -> Scale down (Exit)
  const numEnter = easeOutBack(clamp01(localFrame / (introFrames * 0.8)));
  const numExit = isExiting ? easeOutExpo(exitProgress) : 0;
  const numberScale = numEnter * (1 - numExit); // Scale up then scale down to 0
  
  // Title: Slide in Right -> Stay -> Slide out Up (Exit)
  // Enter
  const titleStart = introFrames * 0.2;
  const titleEnterP = clamp01((localFrame - titleStart) / (introFrames * 0.8));
  const titleSlideIn = easeOutExpo(titleEnterP); // 0 to 1
  
  // Exit
  const titleExitP = isExiting ? easeOutExpo(exitProgress) : 0;
  
  // Position Logic
  // Enter: From x=150 to x=50
  // Exit: From y=20 to y=100 (float up) & Fade out
  const titleX = 50 + (1 - titleSlideIn) * 100;
  const titleY = 20 + titleExitP * 50; 
  const titleAlpha = titleEnterP * (1 - titleExitP);

  // Subtitle: Fade in -> Stay -> Fade out
  const subStart = introFrames * 0.4;
  const subEnterP = clamp01((localFrame - subStart) / (introFrames * 0.8));
  const subAlphaIn = easeOutExpo(subEnterP);
  const subAlphaOut = isExiting ? easeOutExpo(exitProgress) : 0;
  const subAlpha = subAlphaIn * (1 - subAlphaOut);

  // Layout Constants
  const numberSize = 250;
  const titleSize = 60;
  const subtitleSize = 30;

  return (
    <group>
      {/* Background Layer */}
      {backgroundEnabled && backgroundAsset?.src && (backgroundAsset.type === "image" || backgroundAsset.type === "svg") ? (
        <group position={[0, 0, -120]}>
          <DreiImage
            url={backgroundAsset.src}
            scale={[backgroundScale, backgroundScale]}
            transparent
            opacity={clamp01(backgroundOpacity)}
          />
        </group>
      ) : null}

      {backgroundEnabled && backgroundAsset?.src && backgroundAsset.type === "video" ? (
        <mesh position={[0, 0, -120]} renderOrder={-10}>
          <planeGeometry args={[backgroundScale, backgroundScale / backgroundVideoAspect]} />
          <meshBasicMaterial
            map={getVideoTexture(backgroundAsset.src)}
            transparent={backgroundOpacity < 1}
            opacity={clamp01(backgroundOpacity)}
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
            opacity={clamp01(backgroundOpacity)}
            depthWrite={false}
          />
        </mesh>
      ) : null}

      {/* Chapter Number - Left Side */}
      {showNumber && (
        <group position={[-200, 0, 0]} scale={[numberScale, numberScale, numberScale]}>
          <Text
            font={fontUrl}
            fontSize={numberSize}
            color={accentColor}
            anchorX="right"
            anchorY="middle"
            outlineWidth={numberSize * 0.05}
            outlineColor="black"
          >
            {currentNumber}
          </Text>
        </group>
      )}

      {/* Text Content - Right Side */}
      <group position={showNumber ? [-150, 0, 0] : [0, 0, 0]}>
        
        {/* Title */}
        <group position={[titleX, titleY, 0]}>
           <Text
            font={fontUrl}
            fontSize={titleSize}
            maxWidth={600}
            color={textColor}
            anchorX="left"
            anchorY="bottom"
            fillOpacity={titleAlpha}
          >
            {currentItem.title}
          </Text>
        </group>

        {/* Subtitle */}
        {currentItem.subtitle && (
          <group position={[50, -10, 0]}>
            <Text
              font={fontUrl}
              fontSize={subtitleSize}
              maxWidth={600}
              color={textColor}
              anchorX="left"
              anchorY="top"
              fillOpacity={subAlpha}
            >
              {currentItem.subtitle}
            </Text>
          </group>
        )}
      </group>
    </group>
  );
}
