"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface VolumetricLightsProps {
  debug?: boolean;
}

export function VolumetricLights({ debug = false }: VolumetricLightsProps) {
  const lightGroup1Ref = useRef<THREE.Group>(null);
  const lightGroup2Ref = useRef<THREE.Group>(null);
  const lightGroup3Ref = useRef<THREE.Group>(null);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();

    if (lightGroup1Ref.current) {
      const driftX = Math.sin(time * 0.3) * 0.5;
      const driftY = Math.cos(time * 0.25) * 0.3;
      lightGroup1Ref.current.position.set(4 + driftX, 1 + driftY, -2);
    }

    if (lightGroup2Ref.current) {
      const driftX = Math.cos(time * 0.35) * 0.4;
      const driftY = Math.sin(time * 0.3) * 0.25;
      lightGroup2Ref.current.position.set(-2 + driftX, -0.5 + driftY, -1);
    }

    if (lightGroup3Ref.current) {
      const driftX = Math.sin(time * 0.28) * 0.3;
      const driftZ = Math.cos(time * 0.32) * 0.4;
      lightGroup3Ref.current.position.set(1 + driftX, 2, -3 + driftZ);
    }
  });

  return (
    <>
      <group ref={lightGroup1Ref} position={[4, 1, -2]}>
        <pointLight color="#00E5FF" intensity={2.5} distance={8} decay={2} />
        <mesh>
          <sphereGeometry args={[0.8, 32, 32]} />
          <meshBasicMaterial color="#00E5FF" transparent opacity={0.15} toneMapped={false} side={THREE.BackSide} />
        </mesh>
        <mesh>
          <sphereGeometry args={[1.5, 32, 32]} />
          <meshBasicMaterial color="#00E5FF" transparent opacity={0.08} toneMapped={false} side={THREE.BackSide} />
        </mesh>
        {debug && <axesHelper args={[0.5]} />}
      </group>

      <group ref={lightGroup2Ref} position={[-2, -0.5, -1]}>
        <pointLight color="#FF5F40" intensity={1.6} distance={6} decay={2.2} />
        <mesh>
          <sphereGeometry args={[0.6, 32, 32]} />
          <meshBasicMaterial color="#FF5F40" transparent opacity={0.18} toneMapped={false} side={THREE.BackSide} />
        </mesh>
        <mesh>
          <sphereGeometry args={[1.2, 32, 32]} />
          <meshBasicMaterial color="#FF5F40" transparent opacity={0.1} toneMapped={false} side={THREE.BackSide} />
        </mesh>
      </group>

      <group ref={lightGroup3Ref} position={[1, 2, -3]}>
        <pointLight color="#00F0FF" intensity={1.2} distance={7} decay={2} />
        <mesh>
          <sphereGeometry args={[0.7, 32, 32]} />
          <meshBasicMaterial color="#00F0FF" transparent opacity={0.12} toneMapped={false} side={THREE.BackSide} />
        </mesh>
        <mesh>
          <sphereGeometry args={[1.4, 32, 32]} />
          <meshBasicMaterial color="#00F0FF" transparent opacity={0.06} toneMapped={false} side={THREE.BackSide} />
        </mesh>
      </group>
    </>
  );
}
