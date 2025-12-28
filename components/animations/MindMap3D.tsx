"use client";

import React, { useMemo } from "react";
import { Text, Float, Line } from "@react-three/drei";
import * as THREE from "three";

interface Node {
  id: string;
  text: string;
  position: THREE.Vector3;
}

interface MindMap3DProps {
  rootTopic: string;
  nodesData?: string;
  frame: number;
}

export function MindMap3D({ rootTopic, nodesData, frame }: MindMap3DProps) {
  const nodes = useMemo(() => {
    const hashToUnit = (input: string) => {
      let h = 2166136261;
      for (let i = 0; i < input.length; i++) {
        h ^= input.charCodeAt(i);
        h = Math.imul(h, 16777619);
      }
      return (h >>> 0) / 4294967295;
    };

    const list: Node[] = [];
    if (!nodesData) return list;

    const lines = nodesData.split("\n").filter(l => l.trim().length > 0);
    lines.forEach((line, i) => {
      const parts = line.split(",").map(s => s.trim());
      const text = parts[0];
      const seed = `${i}:${text}`;
      const rx = hashToUnit(`${seed}:x`) - 0.5;
      const ry = hashToUnit(`${seed}:y`) - 0.5;
      const rz = hashToUnit(`${seed}:z`) - 0.5;
      const x = parseFloat(parts[1]) || rx * 600;
      const y = parseFloat(parts[2]) || ry * 600;
      const z = parseFloat(parts[3]) || rz * 200;
      
      list.push({
        id: `node-${i}`,
        text: text || `Node ${i}`,
        position: new THREE.Vector3(x, y, z),
      });
    });
    return list;
  }, [nodesData]);

  const visibleCount = Math.min(nodes.length, Math.floor(frame / 3));

  return (
    <group>
      {/* Root Node */}
      <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
        <mesh position={[0, 0, 0]} castShadow>
          <sphereGeometry args={[50, 32, 32]} />
          <meshStandardMaterial color="#3b82f6" roughness={0.3} metalness={0.8} emissive="#3b82f6" emissiveIntensity={0.2} />
        </mesh>
        <Text
          position={[0, 80, 0]}
          fontSize={40}
          color="white"
          anchorX="center"
          anchorY="middle"
          maxWidth={200}
          textAlign="center"
        >
          {rootTopic || "Central Topic"}
        </Text>
      </Float>

      {/* Child Nodes */}
      {nodes.slice(0, visibleCount).map((node) => (
        <group key={node.id}>
          <Line
            points={[new THREE.Vector3(0, 0, 0), node.position]}
            color="#3b82f6"
            lineWidth={2}
            transparent
            opacity={0.4}
          />
          <Float position={node.position} speed={1.5} rotationIntensity={0.2}>
            <mesh castShadow>
              <sphereGeometry args={[25, 16, 16]} />
              <meshStandardMaterial color="#60a5fa" roughness={0.5} metalness={0.5} />
            </mesh>
            <Text
              position={[0, 40, 0]}
              fontSize={24}
              color="white"
              anchorX="center"
              anchorY="middle"
              maxWidth={150}
              textAlign="center"
            >
              {node.text}
            </Text>
          </Float>
        </group>
      ))}
    </group>
  );
}