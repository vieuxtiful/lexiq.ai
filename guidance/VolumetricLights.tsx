"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

/**
 * VolumetricLights Component
 * 
 * Creates volumetric light flares with:
 * - Radial diffusion
 * - Contrast falloff
 * - Sub-surface glow
 * - Atmospheric fog effect
 * - Orange/red and cyan light sources
 */

interface VolumetricLightsProps {
  /** Show debug helpers */
  debug?: boolean;
}

export function VolumetricLights({ debug = false }: VolumetricLightsProps) {
  const lightGroup1Ref = useRef<THREE.Group>(null);
  const lightGroup2Ref = useRef<THREE.Group>(null);
  const lightGroup3Ref = useRef<THREE.Group>(null);

  // Animate lights with slow drift
  useFrame((state) => {
    const time = state.clock.getElapsedTime();

    // Main cyan light (right side)
    if (lightGroup1Ref.current) {
      const driftX = Math.sin(time * 0.3) * 0.5;
      const driftY = Math.cos(time * 0.25) * 0.3;
      lightGroup1Ref.current.position.set(4 + driftX, 1 + driftY, -2);
    }

    // Orange/red accent light (left-center)
    if (lightGroup2Ref.current) {
      const driftX = Math.cos(time * 0.35) * 0.4;
      const driftY = Math.sin(time * 0.3) * 0.25;
      lightGroup2Ref.current.position.set(-2 + driftX, -0.5 + driftY, -1);
    }

    // Secondary cyan light (top)
    if (lightGroup3Ref.current) {
      const driftX = Math.sin(time * 0.28) * 0.3;
      const driftZ = Math.cos(time * 0.32) * 0.4;
      lightGroup3Ref.current.position.set(1 + driftX, 2, -3 + driftZ);
    }
  });

  return (
    <>
      {/* Main cyan volumetric light (right side) */}
      <group ref={lightGroup1Ref} position={[4, 1, -2]}>
        <pointLight
          color="#00E5FF"
          intensity={2.5}
          distance={8}
          decay={2}
        />
        
        {/* Volumetric sphere for glow effect */}
        <mesh>
          <sphereGeometry args={[0.8, 32, 32]} />
          <meshBasicMaterial
            color="#00E5FF"
            transparent
            opacity={0.15}
            toneMapped={false}
            side={THREE.BackSide}
          />
        </mesh>

        {/* Larger outer glow */}
        <mesh>
          <sphereGeometry args={[1.5, 32, 32]} />
          <meshBasicMaterial
            color="#00E5FF"
            transparent
            opacity={0.05}
            toneMapped={false}
            side={THREE.BackSide}
          />
        </mesh>

        {debug && <pointLightHelper args={[new THREE.PointLight(), 0.5]} />}
      </group>

      {/* Orange/red accent light (left-center) */}
      <group ref={lightGroup2Ref} position={[-2, -0.5, -1]}>
        <pointLight
          color="#FF6B35"
          intensity={1.8}
          distance={6}
          decay={2}
        />
        
        <mesh>
          <sphereGeometry args={[0.6, 32, 32]} />
          <meshBasicMaterial
            color="#FF6B35"
            transparent
            opacity={0.12}
            toneMapped={false}
            side={THREE.BackSide}
          />
        </mesh>

        <mesh>
          <sphereGeometry args={[1.2, 32, 32]} />
          <meshBasicMaterial
            color="#FF6B35"
            transparent
            opacity={0.04}
            toneMapped={false}
            side={THREE.BackSide}
          />
        </mesh>

        {debug && <pointLightHelper args={[new THREE.PointLight(), 0.5]} />}
      </group>

      {/* Secondary cyan light (top) */}
      <group ref={lightGroup3Ref} position={[1, 2, -3]}>
        <pointLight
          color="#38BDF8"
          intensity={1.5}
          distance={7}
          decay={2}
        />
        
        <mesh>
          <sphereGeometry args={[0.5, 32, 32]} />
          <meshBasicMaterial
            color="#38BDF8"
            transparent
            opacity={0.1}
            toneMapped={false}
            side={THREE.BackSide}
          />
        </mesh>

        <mesh>
          <sphereGeometry args={[1.0, 32, 32]} />
          <meshBasicMaterial
            color="#38BDF8"
            transparent
            opacity={0.03}
            toneMapped={false}
            side={THREE.BackSide}
          />
        </mesh>

        {debug && <pointLightHelper args={[new THREE.PointLight(), 0.5]} />}
      </group>

      {/* Ambient light for overall scene illumination */}
      <ambientLight color="#001a33" intensity={0.3} />

      {/* Directional light for subtle shadows */}
      <directionalLight
        position={[5, 5, 5]}
        intensity={0.5}
        color="#00E5FF"
      />
    </>
  );
}
