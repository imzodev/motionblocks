import { z } from "zod";
import type { AnimationTemplate, RenderProps } from "../../types/template";
import { Text, Image } from "@react-three/drei";
import React from "react";

export const PulseTemplate: AnimationTemplate = {
  id: "pulse",
  name: "Pulse",
  slots: [
    { id: "asset", name: "Main Asset", type: "file", required: true }
  ],
  propsSchema: z.object({
    intensity: z.number().default(1.1),
    duration: z.number().default(60),
  }),
  render: ({ assets, frame }: RenderProps) => {
    const asset = assets.asset;
    if (!asset) return null;
    const scale = 1 + Math.sin(frame * 0.2) * 0.1;
    
    return (
      <group scale={[scale, scale, scale]}>
        {asset.type === 'image' || asset.type === 'svg' ? 
          <Image url={asset.src} scale={[400, 400, 1]} /> : 
          <Text fontSize={60} color="white">{asset.content || "Text"}</Text>
        }
      </group>
    );
  },
};

export const GlowTemplate: AnimationTemplate = {
  id: "glow",
  name: "Glow",
  slots: [
    { id: "asset", name: "Main Asset", type: "file", required: true }
  ],
  propsSchema: z.object({
    color: z.string().default("#ffffff"),
    radius: z.number().default(20),
  }),
  render: ({ assets }: RenderProps) => {
    const asset = assets.asset;
    if (!asset) return null;
    return (
      <group>
        {asset.type === 'image' || asset.type === 'svg' ? 
          <Image url={asset.src} scale={[400, 400, 1]} /> : 
          <Text fontSize={60} color="white">{asset.content || "Text"}</Text>
        }
      </group>
    );
  },
};

export const BounceTemplate: AnimationTemplate = {
  id: "bounce",
  name: "Bounce",
  slots: [
    { id: "asset", name: "Main Asset", type: "file", required: true }
  ],
  propsSchema: z.object({
    height: z.number().default(50),
  }),
  render: ({ assets, frame }: RenderProps) => {
    const asset = assets.asset;
    if (!asset) return null;
    const y = Math.abs(Math.sin(frame * 0.1)) * 100;
    
    return (
      <group position={[0, y, 0]}>
        {asset.type === 'image' || asset.type === 'svg' ? 
          <Image url={asset.src} scale={[400, 400, 1]} /> : 
          <Text fontSize={60} color="white">{asset.content || "Text"}</Text>
        }
      </group>
    );
  },
};

export const ShakeTemplate: AnimationTemplate = {
  id: "shake",
  name: "Shake",
  slots: [
    { id: "asset", name: "Main Asset", type: "file", required: true }
  ],
  propsSchema: z.object({
    intensity: z.number().default(5),
  }),
  render: ({ assets, frame }: RenderProps) => {
    const asset = assets.asset;
    if (!asset) return null;
    const x = (Math.random() - 0.5) * 20;
    
    return (
      <group position={[x, 0, 0]}>
        {asset.type === 'image' || asset.type === 'svg' ? 
          <Image url={asset.src} scale={[400, 400, 1]} /> : 
          <Text fontSize={60} color="white">{asset.content || "Text"}</Text>
        }
      </group>
    );
  },
};