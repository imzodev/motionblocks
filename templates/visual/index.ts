import { z } from "zod";
import type { AnimationTemplate, RenderProps } from "../../types/template";
import { MindMap3D } from "../../components/animations/MindMap3D";
import { Text } from "@react-three/drei";
import React from "react";

/**
 * MindMapTemplate: 3D Node-link diagram.
 */
export const MindMapTemplate: AnimationTemplate = {
  id: "mind-map",
  name: "3D Mind Map",
  slots: [
    { id: "rootImage", name: "Central Image", type: "file" },
    { id: "rootText", name: "Central Topic", type: "text", required: true },
    { id: "nodes", name: "Nodes Data", type: "data-table" },
  ],
  propsSchema: z.object({
    depth: z.number().default(200),
    spread: z.number().default(1.5),
  }),
  render: ({ assets, frame }: RenderProps) => {
    return (
      <MindMap3D 
        rootTopic={assets.rootText}
        nodesData={assets.nodes}
        frame={frame}
      />
    );
  },
};

/**
 * GraphTemplate: 3D Bar graph.
 */
export const GraphTemplate: AnimationTemplate = {
  id: "graph",
  name: "3D Graph",
  slots: [
    { id: "title", name: "Graph Title", type: "text" },
    { id: "data", name: "Labels & Values", type: "data-table", required: true },
  ],
  propsSchema: z.object({
    type: z.enum(["bar", "line"])
      .default("bar"),
    color: z.string().default("#3b82f6"),
  }),
  render: ({ assets, frame }: RenderProps) => {
    const dataString = assets.data || "";
    const lines = dataString.split("\n").filter((l: string) => l.trim().length > 0);
    
    return (
      <group>
        {assets.title && (
          <Text position={[0, 400, 0]} fontSize={50} color="white" font-weight="bold">
            {assets.title}
          </Text>
        )}
        <group position={[-(lines.length * 120) / 2, 0, 0]}>
          {lines.map((line: string, i: number) => {
            const parts = line.split(",").map(s => s.trim());
            const label = parts[0];
            const value = parseFloat(parts[1]) || 0;
            const progress = Math.min(1, frame / 45); // Slower growth
            const height = progress * value * 3;
            
            return (
              <group key={i} position={[i * 150, 0, 0]}>
                <mesh position={[0, height / 2, 0]} castShadow receiveShadow>
                  <boxGeometry args={[80, height, 80]} />
                  <meshStandardMaterial color="#3b82f6" roughness={0.2} metalness={0.8} />
                </mesh>
                <Text position={[0, -40, 0]} fontSize={20} color="#94a3b8">
                  {label}
                </Text>
                <Text position={[0, height + 40, 0]} fontSize={24} color="white" font-weight="black">
                  {Math.floor(progress * value)}
                </Text>
              </group>
            );
          })}
        </group>
      </group>
    );
  },
};