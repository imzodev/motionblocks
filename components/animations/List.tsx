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
export type ListStyle = "classic" | "neon" | "3d";

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
  listStyle?: ListStyle;
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
  listStyle = "classic",
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

          // Helper to render text with style
          const renderStyledText = (txt: string, align: "left" | "center", pos: [number, number, number], col: string, glowCol: string, isBullet = false) => {
             const common = {
                font: fontUrl,
                fontSize: fontSize,
                anchorX: align,
                anchorY: "middle" as const,
                fillOpacity: alpha,
                position: pos,
             };

             // 3D Style Layers
             const depthLayers = listStyle === "3d" ? (
                <group>
                   {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                      <Text
                        key={i}
                        {...common}
                        position={[pos[0] + (i * 0.3), pos[1] - (i * 0.3), pos[2] - i * 0.1]}
                        color={col} // Use same color for "extrusion" look
                        fillOpacity={alpha * 0.6} // More solid look
                        renderOrder={-1} // Render behind
                      >
                        {txt}
                      </Text>
                   ))}
                </group>
             ) : null;

             // Neon Style Glow
             const neonGlow = listStyle === "neon" ? (
                <group>
                   {/* Smooth generated gradient glow (30 layers) for additive light */}
                   {Array.from({ length: 30 }).map((_, i) => {
                      // i=0 is outer/wide, i=29 is inner/tight
                      const t = i / 29; 
                      
                      // Width: Exponential falloff
                      // t=0 (outer) -> w ~ 0.4
                      // t=1 (inner) -> w = 0.02
                      const w = 0.4 * Math.pow(1 - t, 3) + 0.02; 
                      
                      // Opacity: Very low, accumulating with AdditiveBlending
                      // Outer layers are very faint, inner layers get slightly more opaque
                      const op = 0.01 + (0.05 * t); 

                      return (
                          <Text
                             key={i}
                             {...common}
                             position={[pos[0], pos[1], pos[2] - 0.01 - (i * 0.001)]} 
                             fillOpacity={0} 
                             outlineWidth={fontSize * w}
                             outlineColor={glowCol}
                             // @ts-ignore 
                             outlineOpacity={alpha * op}
                             // @ts-ignore - Runtime material props
                             depthWrite={false}
                             // @ts-ignore
                             blending={THREE.AdditiveBlending}
                             renderOrder={-20 + i} 
                          >
                             {txt}
                          </Text>
                      );
                   })}
                </group>
             ) : null;

             return (
                <group>
                    {depthLayers}
                    {neonGlow}
                    <Text
                        {...common}
                        color={col}
                        maxWidth={isBullet ? undefined : 700}
                    >
                        {txt}
                    </Text>
                </group>
             );
          };

          return (
            <group key={index} position={[xOffset, y, 0]}>
              {/* Bullet / Number / Arrow */}
              {showBullet && (
                <group position={[-bulletOffset, 0, 0]} scale={[scale, scale, scale]}>
                  {bulletType === "bullet" && (
                    <mesh>
                      <circleGeometry args={[fontSize * 0.15, 32]} />
                      <meshBasicMaterial color={bulletColor} transparent opacity={alpha} />
                      {/* Neon Glow for Bullet */}
                      {listStyle === "neon" && (
                         <group>
                            {Array.from({ length: 15 }).map((_, i) => {
                               const t = i / 14;
                               const s = 1.0 + (t * 0.8); // Scale from 1.0 to 1.8
                               const op = 0.05 + (0.1 * (1 - t)); 
                               return (
                                   <mesh key={i} position={[0, 0, -0.02 - (i * 0.002)]} scale={[s, s, 1]}>
                                      <circleGeometry args={[fontSize * 0.15, 32]} />
                                      <meshBasicMaterial 
                                          color={bulletColor} 
                                          transparent 
                                          opacity={alpha * op} 
                                          depthWrite={false}
                                          blending={THREE.AdditiveBlending}
                                      />
                                   </mesh>
                               )
                            })}
                         </group>
                      )}
                      {/* 3D Shadow for Bullet */}
                      {listStyle === "3d" && (
                         <group>
                            {[1, 2, 3].map(i => (
                                <mesh key={i} position={[i * 0.3, -i * 0.3, -i * 0.1]}>
                                    <circleGeometry args={[fontSize * 0.15, 32]} />
                                    <meshBasicMaterial color={bulletColor} transparent opacity={alpha * 0.6} />
                                </mesh>
                            ))}
                         </group>
                      )}
                    </mesh>
                  )}
                  {bulletType === "arrow" && (
                     <group>
                        <mesh rotation={[0, 0, -Math.PI / 2]}>
                            <circleGeometry args={[fontSize * 0.15, 3]} />
                            <meshBasicMaterial color={bulletColor} transparent opacity={alpha} />
                        </mesh>
                        {/* Styles for Arrow */}
                        {listStyle === "neon" && (
                            <group>
                                {Array.from({ length: 15 }).map((_, i) => {
                                   const t = i / 14;
                                   const s = 1.0 + (t * 0.8);
                                   const op = 0.05 + (0.1 * (1 - t));
                                   return (
                                       <mesh key={i} rotation={[0, 0, -Math.PI / 2]} position={[0, 0, -0.02 - (i * 0.002)]} scale={[s, s, 1]}>
                                           <circleGeometry args={[fontSize * 0.15, 3]} />
                                           <meshBasicMaterial 
                                               color={bulletColor} 
                                               transparent 
                                               opacity={alpha * op} 
                                               depthWrite={false}
                                               blending={THREE.AdditiveBlending}
                                           />
                                       </mesh>
                                   )
                                })}
                            </group>
                        )}
                        {listStyle === "3d" && (
                             <group>
                                {[1, 2, 3].map(i => (
                                    <mesh key={i} rotation={[0, 0, -Math.PI / 2]} position={[i * 0.1, -i * -0.1, -i * 0.1]}>
                                        <circleGeometry args={[fontSize * 0.15, 3]} />
                                        <meshBasicMaterial color={bulletColor} transparent opacity={alpha * 0.6} />
                                    </mesh>
                                ))}
                             </group>
                        )}
                     </group>
                  )}
                  {bulletType === "number" && (
                    renderStyledText(`${index + 1}.`, "center", [0,0,0], bulletColor, bulletColor, true)
                  )}
                </group>
              )}

              {/* Text */}
              <group position={[showBullet ? 20 : 0, 0, 0]}>
                 {renderStyledText(item, "left", [0, 0, 0], textColor, bulletColor)}
              </group>
            </group>
          );
        })}
      </group>
    </group>
  );
}
