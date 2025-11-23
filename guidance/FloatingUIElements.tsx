"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

/**
 * FloatingUIElements Component
 * 
 * Creates floating holographic UI panels with:
 * - Soft bloom glow with halo diffusion
 * - Smooth Z-axis drift
 * - Asynchronous motion (low-gravity effect)
 * - Occasional fades and flickers
 * - Layered depth hierarchy
 */

interface UIElement {
  position: THREE.Vector3;
  scale: THREE.Vector3;
  color: THREE.Color;
  opacity: number;
  driftSpeed: THREE.Vector3;
  flickerPhase: number;
  flickerSpeed: number;
  rotationSpeed: THREE.Vector3;
}

interface FloatingUIElementsProps {
  count?: number;
}

export function FloatingUIElements({ count = 12 }: FloatingUIElementsProps) {
  const groupRef = useRef<THREE.Group>(null);
  const meshRefs = useRef<(THREE.Mesh | null)[]>([]);

  // Generate UI elements with random properties
  const elements = useMemo<UIElement[]>(() => {
    const els: UIElement[] = [];
    
    const colors = [
      new THREE.Color("#00E5FF"), // Cyan
      new THREE.Color("#00FF9D"), // Emerald
      new THREE.Color("#38BDF8"), // Sky blue
      new THREE.Color("#FF6B35"), // Orange/red accent
      new THREE.Color("#00D4AA"), // Teal
    ];

    for (let i = 0; i < count; i++) {
      // Distribute elements in 3D space around the map
      const angle = (i / count) * Math.PI * 2;
      const radius = 3 + Math.random() * 2;
      const height = (Math.random() - 0.5) * 2;
      
      els.push({
        position: new THREE.Vector3(
          Math.cos(angle) * radius,
          height,
          Math.sin(angle) * radius - 2 // Offset back in Z
        ),
        scale: new THREE.Vector3(
          0.3 + Math.random() * 0.4,
          0.2 + Math.random() * 0.3,
          0.05
        ),
        color: colors[Math.floor(Math.random() * colors.length)].clone(),
        opacity: 0.6 + Math.random() * 0.3,
        driftSpeed: new THREE.Vector3(
          (Math.random() - 0.5) * 0.1,
          (Math.random() - 0.5) * 0.08,
          (Math.random() - 0.5) * 0.12
        ),
        flickerPhase: Math.random() * Math.PI * 2,
        flickerSpeed: 0.5 + Math.random() * 1.5,
        rotationSpeed: new THREE.Vector3(
          (Math.random() - 0.5) * 0.2,
          (Math.random() - 0.5) * 0.3,
          (Math.random() - 0.5) * 0.15
        ),
      });
    }

    return els;
  }, [count]);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();

    meshRefs.current.forEach((mesh, i) => {
      if (!mesh) return;

      const element = elements[i];

      // Smooth drift motion (low-gravity effect)
      const driftX = Math.sin(time * element.driftSpeed.x + element.flickerPhase) * 0.3;
      const driftY = Math.cos(time * element.driftSpeed.y + element.flickerPhase * 1.3) * 0.2;
      const driftZ = Math.sin(time * element.driftSpeed.z + element.flickerPhase * 0.7) * 0.4;

      mesh.position.set(
        element.position.x + driftX,
        element.position.y + driftY,
        element.position.z + driftZ
      );

      // Slow rotation
      mesh.rotation.x += element.rotationSpeed.x * 0.01;
      mesh.rotation.y += element.rotationSpeed.y * 0.01;
      mesh.rotation.z += element.rotationSpeed.z * 0.01;

      // Flicker effect on opacity
      const flicker = Math.sin(time * element.flickerSpeed + element.flickerPhase);
      const flickerAmount = 0.15;
      const currentOpacity = element.opacity + flicker * flickerAmount;

      const material = mesh.material as THREE.MeshBasicMaterial;
      material.opacity = Math.max(0.3, Math.min(0.95, currentOpacity));

      // Occasional fade out/in (every ~8 seconds per element)
      const fadePhase = (time + element.flickerPhase) % 8;
      if (fadePhase < 0.5) {
        material.opacity *= fadePhase * 2; // Fade in
      } else if (fadePhase > 7.5) {
        material.opacity *= (8 - fadePhase) * 2; // Fade out
      }
    });
  });

  return (
    <group ref={groupRef}>
      {elements.map((element, i) => (
        <mesh
          key={i}
          ref={(el) => (meshRefs.current[i] = el)}
          position={element.position}
          scale={element.scale}
        >
          <boxGeometry args={[1, 1, 1]} />
          <meshBasicMaterial
            color={element.color}
            transparent
            opacity={element.opacity}
            toneMapped={false}
            side={THREE.DoubleSide}
          />
          
          {/* Glow border effect */}
          <lineSegments>
            <edgesGeometry args={[new THREE.BoxGeometry(1, 1, 1)]} />
            <lineBasicMaterial
              color={element.color}
              transparent
              opacity={0.8}
              toneMapped={false}
            />
          </lineSegments>
        </mesh>
      ))}
    </group>
  );
}
