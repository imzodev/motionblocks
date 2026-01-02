"use client";

import React, { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera, Environment, ContactShadows } from "@react-three/drei";
import { useThree } from "@react-three/fiber";
import { cn } from "@/lib/utils";
import { useEffect } from "react";

interface Canvas3DProps {
  children?: React.ReactNode;
  className?: string;
  onCameraSave?: (pos: [number, number, number], target: [number, number, number]) => void;
}

function CameraManager({ 
  onCameraSave 
}: { 
  onCameraSave?: (pos: [number, number, number], target: [number, number, number]) => void 
}) {
  const { camera, controls } = useThree();

  useEffect(() => {
    const handleSave = () => {
      if (onCameraSave && camera && controls) {
        const pos: [number, number, number] = [camera.position.x, camera.position.y, camera.position.z];
        const target: [number, number, number] = [
          (controls as any).target.x,
          (controls as any).target.y,
          (controls as any).target.z
        ];
        onCameraSave(pos, target);
      }
    };
    
    window.addEventListener("motionblocks:save-camera", handleSave);
    return () => window.removeEventListener("motionblocks:save-camera", handleSave);
  }, [camera, controls, onCameraSave]);

  return null;
}

/**
 * Canvas3D component sets up the React Three Fiber environment.
 */
export function Canvas3D({ children, className, onCameraSave }: Canvas3DProps) {
  return (
    <div className={cn("w-full h-full relative bg-background", className)}>
      <Canvas
        shadows
        gl={{ antialias: true, preserveDrawingBuffer: true, alpha: true }}
        onCreated={({ gl }) => {
          gl.setClearColor(0x000000, 0)
        }}
      >
        <PerspectiveCamera makeDefault position={[0, 0, 1000]} fov={50} />
        <OrbitControls makeDefault enableDamping dampingFactor={0.05} />
        <CameraManager onCameraSave={onCameraSave} />
        
        <ambientLight intensity={0.5} />
        <pointLight position={[1000, 1000, 1000]} intensity={1} castShadow />
        <spotLight position={[0, 500, 500]} angle={0.15} penumbra={1} intensity={2} castShadow />
        
        <Suspense fallback={null}>
          <Environment preset="city" />
          <group>
            {children}
          </group>
          <ContactShadows 
            position={[0, -500, 0]} 
            opacity={0.4} 
            scale={2000} 
            blur={2} 
            far={1000} 
          />
        </Suspense>
      </Canvas>
    </div>
  );
}
