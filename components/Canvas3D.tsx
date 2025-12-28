"use client";

import React, { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera, Environment, ContactShadows } from "@react-three/drei";
import { cn } from "@/lib/utils";

interface Canvas3DProps {
  children?: React.ReactNode;
  className?: string;
}

/**
 * Canvas3D component sets up the React Three Fiber environment.
 */
export function Canvas3D({ children, className }: Canvas3DProps) {
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
