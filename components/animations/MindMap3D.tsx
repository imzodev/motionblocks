"use client";

  import React, { useMemo, useRef } from "react";
import { Text, Float } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
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
  globalFontUrl?: string;
  spread?: number;
  depth?: number;
  rootRadius?: number;
  nodeRadius?: number;
  introHoldFrames?: number;
  perNodeFrames?: number;
  nodeEnterFrames?: number;
  edgeGrowFrames?: number;
  focusHoldFrames?: number;
  focusZoomFrames?: number;
  focusZoomStrength?: number;
  cameraEnabled?: boolean;
  cameraRadius?: number;
  cameraHeight?: number;
  cameraZ?: number;
  cameraSmooth?: number;
  cameraLeadFrames?: number;
  highlightColor?: string;
  lineColor?: string;
  rootColor?: string;
  nodeColor?: string;
}

function clamp01(v: number) {
  return Math.min(1, Math.max(0, v));
}

function easeOutBack(t: number, overshoot = 1.35) {
  const x = clamp01(t);
  const c1 = overshoot;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2);
}

function easeInOutCubic(t: number) {
  const x = clamp01(t);
  return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
}

export function MindMap3D({
  rootTopic,
  nodesData,
  frame,
  globalFontUrl,
  spread = 1.5,
  depth = 200,
  rootRadius,
  nodeRadius,
  introHoldFrames = 24,
  perNodeFrames = 40,
  nodeEnterFrames = 12,
  edgeGrowFrames = 18,
  focusHoldFrames = 12,
  focusZoomFrames = 12,
  focusZoomStrength = 0.14,
  cameraEnabled = true,
  cameraRadius,
  cameraHeight,
  cameraZ,
  cameraSmooth = 1,
  cameraLeadFrames,
  highlightColor = "#93c5fd",
  lineColor = "#3b82f6",
  rootColor = "#3b82f6",
  nodeColor = "#60a5fa",
}: MindMap3DProps) {
  const safeSpread = Math.max(0.6, Math.min(4, spread));
  const safeDepth = Math.max(0, Math.min(2000, depth));
  const layoutRadius = 420 * safeSpread;
  const rootR = typeof rootRadius === "number" ? rootRadius : Math.max(56, layoutRadius * 0.16);
  const nodeR = typeof nodeRadius === "number" ? nodeRadius : Math.max(34, layoutRadius * 0.095);

  const nodes = useMemo(() => {
    const list: Node[] = [];
    if (!nodesData) return list;

    const lines = nodesData.split("\n").filter((l) => l.trim().length > 0);
    const parsed = lines.map((line, i) => {
      const parts = line.split(",").map((s) => s.trim());
      const text = parts[0];
      const xRaw = Number(parts[1]);
      const yRaw = Number(parts[2]);
      const zRaw = Number(parts[3]);
      // Only treat as explicit coordinates if all 3 coords are present.
      // Many data-table inputs are "Label, Value" which should NOT be interpreted as x/y/z.
      const hasExplicit = Number.isFinite(xRaw) && Number.isFinite(yRaw) && Number.isFinite(zRaw);
      return {
        id: `node-${i}`,
        text: text || `Node ${i}`,
        explicit: hasExplicit ? new THREE.Vector3(xRaw || 0, yRaw || 0, zRaw || 0) : null,
      };
    });

    const count = Math.max(1, parsed.length);
    const baseRadius = layoutRadius;

    const radialPositions = parsed.map((p, i) => {
      const ang = (i / count) * Math.PI * 2;
      const r = baseRadius;
      const x = Math.cos(ang) * r;
      const y = Math.sin(ang) * (r * 0.65);
      const z = ((i % 3) - 1) * (safeDepth * 0.25);
      return new THREE.Vector3(x, y, z);
    });

    // Use explicit coords if provided; otherwise fall back to radial layout.
    const rawPositions = parsed.map((p, i) => p.explicit ?? radialPositions[i]);

    // Fit-to-bounds normalization: keep everything within a predictable radius.
    const maxLen = rawPositions.reduce((m, v) => Math.max(m, v.length()), 0);
    const targetMax = baseRadius;
    const scale = maxLen > 0 ? Math.min(1, targetMax / maxLen) : 1;
    const positions = rawPositions.map((v) => v.clone().multiplyScalar(scale));

    positions.forEach((position, i) => {
      list.push({
        id: parsed[i].id,
        text: parsed[i].text,
        position,
      });
    });
    return list;
  }, [nodesData, layoutRadius, safeDepth]);

  const { camera } = useThree();
  const camState = useRef<{ x: number; y: number; z: number; lx: number; ly: number; lz: number } | null>(null);

  // Camera focus: root first, then each node sequentially.
  useFrame((_s, dt) => {
    if (!cameraEnabled) return;

    const camRadius = typeof cameraRadius === "number" ? cameraRadius : layoutRadius * 0.22;
    const camHeight = typeof cameraHeight === "number" ? cameraHeight : layoutRadius * 0.18;
    const camZ = typeof cameraZ === "number" ? cameraZ : layoutRadius * 1.65;

    const safePer = Math.max(8, Math.floor(perNodeFrames));
    const zoomFrames = Math.max(0, Math.floor(focusZoomFrames));
    const block = safePer + zoomFrames;
    const lead = typeof cameraLeadFrames === "number" ? cameraLeadFrames : 0;

    const intro = Math.max(0, Math.floor(introHoldFrames));
    const t = frame - intro;

    // During the intro window, stay on the root.
    // As soon as the first branch starts growing (t >= 0), immediately target node 1.
    const total = 1 + nodes.length;
    const idx =
      t < 0
        ? 0
        : Math.min(total - 1, 1 + Math.floor((t + lead) / Math.max(1, block)));

    const idxLocal =
      idx <= 0
        ? 0
        : (t + lead) - (idx - 1) * Math.max(1, block);

    const targetPos = idx === 0 ? new THREE.Vector3(0, 0, 0) : nodes[idx - 1]?.position ?? new THREE.Vector3(0, 0, 0);

    // Keep the focused node centered; only a small alternating X offset for parallax.
    const side = idx % 2 === 0 ? 1 : -1;
    const offset = new THREE.Vector3(
      side * camRadius,
      camHeight,
      camZ
    );
    // After the branch grows (edgeGrowFrames), add a short zoom-in beat by reducing offset magnitude.
    const zoomStart = Math.max(0, Math.floor(edgeGrowFrames));
    const zEase =
      zoomFrames > 0
        ? easeInOutCubic(clamp01((idxLocal - zoomStart) / Math.max(1, zoomFrames)))
        : 0;
    const zStrength = clamp01(focusZoomStrength);
    const zoomScale = 1 - zStrength * zEase;
    const zoomZScale = 1 - Math.min(0.92, zStrength * 1.4) * zEase;
    const zoomedOffset = new THREE.Vector3(
      offset.x * zoomScale,
      offset.y * zoomScale,
      offset.z * zoomZScale
    );

    const desired = targetPos.clone().add(zoomedOffset);

    const prev = camState.current ?? {
      x: camera.position.x,
      y: camera.position.y,
      z: camera.position.z,
      lx: 0,
      ly: 0,
      lz: 0,
    };

    // Sync movement duration with branch growth:
    // Reach ~90% of the way to target in about `edgeGrowFrames` (scaled by cameraSmooth).
    const framesDt = Math.max(1e-3, dt * 60);
    const settleFrames = Math.max(1, Math.floor(edgeGrowFrames));
    const speed = Math.max(0.1, cameraSmooth);
    const tauFrames = settleFrames / (2.30258509299 * speed); // ln(10)
    const k = 1 - Math.exp(-framesDt / Math.max(1e-3, tauFrames));
    const next = {
      x: prev.x + (desired.x - prev.x) * k,
      y: prev.y + (desired.y - prev.y) * k,
      z: prev.z + (desired.z - prev.z) * k,
      lx: prev.lx + (targetPos.x - prev.lx) * k,
      ly: prev.ly + (targetPos.y - prev.ly) * k,
      lz: prev.lz + (targetPos.z - prev.lz) * k,
    };
    camState.current = next;

    camera.position.set(next.x, next.y, next.z);
    camera.lookAt(next.lx, next.ly, next.lz);
  });

  const safePer = Math.max(8, Math.floor(perNodeFrames));
  const lead = typeof cameraLeadFrames === "number" ? cameraLeadFrames : 0;
  const intro = Math.max(0, Math.floor(introHoldFrames));
  const t = frame - intro;
  const zoomFrames = Math.max(0, Math.floor(focusZoomFrames));
  const block = safePer + zoomFrames;
  const focusIdx =
    t < 0
      ? -1
      : Math.min(nodes.length - 1, Math.floor((t + lead) / Math.max(1, block)));

  return (
    <group>
      {/* Root Node */}
      <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
        <mesh position={[0, 0, 0]} castShadow>
          <sphereGeometry args={[rootR, 32, 32]} />
          <meshStandardMaterial
            color={rootColor}
            roughness={0.3}
            metalness={0.8}
            emissive={rootColor}
            emissiveIntensity={0.2}
          />
        </mesh>
        <Text
          position={[0, rootR * 1.6, 0]}
          font={globalFontUrl}
          fontSize={Math.max(44, rootR * 0.78)}
          color="white"
          anchorX="center"
          anchorY="middle"
          maxWidth={Math.max(240, rootR * 4.2)}
          textAlign="center"
        >
          {rootTopic || "Central Topic"}
        </Text>
      </Float>

      {/* Child Nodes */}
      {nodes.map((node, i) => {
        const start = Math.max(0, Math.floor(introHoldFrames)) + i * (safePer + Math.max(0, Math.floor(focusZoomFrames)));
        const local = frame - start;
        const enterT = clamp01(local / Math.max(1, nodeEnterFrames));
        const alpha = local <= 0 ? 0 : easeInOutCubic(enterT);
        const scale = local <= 0 ? 0 : easeOutBack(enterT, 1.7);
        const edgeT = clamp01(local / Math.max(1, edgeGrowFrames));
        const dir = node.position.clone();
        const fullLen = Math.max(0.001, dir.length());
        const growLen = fullLen * edgeT;
        const dirN = dir.clone().normalize();
        const end = dirN.clone().multiplyScalar(growLen);
        const mid = end.clone().multiplyScalar(0.5);
        const q = new THREE.Quaternion().setFromUnitVectors(
          new THREE.Vector3(0, 1, 0),
          dirN.lengthSq() > 0 ? dirN : new THREE.Vector3(0, 1, 0)
        );

        const isFocused = i === focusIdx;
        const pulse = 0.5 + 0.5 * Math.sin(frame * 0.14);

        return (
          <group key={node.id}>
            {/* Branch growth: a thin cylinder that scales from root -> node */}
            {edgeT > 0 ? (
              <mesh position={[mid.x, mid.y, mid.z]} quaternion={q} renderOrder={-1}>
                <cylinderGeometry args={[2.2, 2.2, Math.max(0.001, growLen), 10]} />
                <meshBasicMaterial
                  color={lineColor}
                  transparent
                  opacity={0.55 * alpha}
                  depthWrite={false}
                  toneMapped={false}
                />
              </mesh>
            ) : null}

            <group position={node.position}>
              {isFocused ? (
                <mesh scale={[1.18, 1.18, 1.18]} renderOrder={5}>
                  <sphereGeometry args={[nodeR, 16, 16]} />
                  <meshBasicMaterial
                    color={highlightColor}
                    transparent
                    opacity={0.18 + 0.18 * pulse}
                    depthWrite={false}
                    toneMapped={false}
                  />
                </mesh>
              ) : null}

              <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.6}>
                <group scale={[scale, scale, scale]}>
                  <mesh castShadow>
                    <sphereGeometry args={[nodeR, 16, 16]} />
                    <meshStandardMaterial
                      color={nodeColor}
                      roughness={0.5}
                      metalness={0.5}
                      transparent
                      opacity={alpha}
                      emissive={isFocused ? highlightColor : "#000000"}
                      emissiveIntensity={isFocused ? 0.22 + 0.12 * pulse : 0}
                    />
                  </mesh>
                  <Text
                    font={globalFontUrl}
                    position={[0, nodeR * 1.55, 0]}
                    fontSize={Math.max(26, nodeR * 0.7)}
                    color="white"
                    anchorX="center"
                    anchorY="middle"
                    maxWidth={Math.max(200, nodeR * 5)}
                    textAlign="center"
                    fillOpacity={alpha}
                  >
                    {node.text}
                  </Text>
                </group>
              </Float>
            </group>
          </group>
        );
      })}
    </group>
  );
}