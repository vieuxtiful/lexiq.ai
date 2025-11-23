"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

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

  const elements = useMemo<UIElement[]>(() => {
    const list: UIElement[] = [];
    const colors = [
      new THREE.Color("#00E5FF"),
      new THREE.Color("#00FF9D"),
      new THREE.Color("#38BDF8"),
      new THREE.Color("#FF6B35"),
      new THREE.Color("#00D4AA"),
    ];

    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      const radius = 3 + Math.random() * 2;
      const height = (Math.random() - 0.5) * 2;

      list.push({
        position: new THREE.Vector3(Math.cos(angle) * radius, height, Math.sin(angle) * radius - 2),
        scale: new THREE.Vector3(0.3 + Math.random() * 0.4, 0.2 + Math.random() * 0.3, 0.05),
        color: colors[Math.floor(Math.random() * colors.length)].clone(),
        opacity: 0.6 + Math.random() * 0.3,
        driftSpeed: new THREE.Vector3((Math.random() - 0.5) * 0.1, (Math.random() - 0.5) * 0.08, (Math.random() - 0.5) * 0.12),
        flickerPhase: Math.random() * Math.PI * 2,
        flickerSpeed: 0.5 + Math.random() * 1.5,
        rotationSpeed: new THREE.Vector3((Math.random() - 0.5) * 0.2, (Math.random() - 0.5) * 0.3, (Math.random() - 0.5) * 0.15),
      });
    }

    return list;
  }, [count]);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();

    meshRefs.current.forEach((mesh, index) => {
      if (!mesh) return;
      const element = elements[index];

      const driftX = Math.sin(time * element.driftSpeed.x + element.flickerPhase) * 0.3;
      const driftY = Math.cos(time * element.driftSpeed.y + element.flickerPhase * 1.3) * 0.2;
      const driftZ = Math.sin(time * element.driftSpeed.z + element.flickerPhase * 0.7) * 0.4;

      mesh.position.set(element.position.x + driftX, element.position.y + driftY, element.position.z + driftZ);

      mesh.rotation.x += element.rotationSpeed.x * 0.01;
      mesh.rotation.y += element.rotationSpeed.y * 0.01;
      mesh.rotation.z += element.rotationSpeed.z * 0.01;

      const flicker = Math.sin(time * element.flickerSpeed + element.flickerPhase);
      const flickerAmount = 0.15;
      const material = mesh.material as THREE.MeshBasicMaterial;
      const baseOpacity = element.opacity + flicker * flickerAmount;
      material.opacity = Math.max(0.3, Math.min(0.95, baseOpacity));

      const fadePhase = (time + element.flickerPhase) % 8;
      if (fadePhase < 0.5) {
        material.opacity *= fadePhase * 2;
      } else if (fadePhase > 7.5) {
        material.opacity *= (8 - fadePhase) * 2;
      }
    });
  });

  return (
    <group ref={groupRef}>
      {elements.map((element, index) => (
        <mesh key={index} ref={(el) => (meshRefs.current[index] = el)} position={element.position} scale={element.scale}>
          <boxGeometry args={[1, 1, 1]} />
          <meshBasicMaterial color={element.color} transparent opacity={element.opacity} toneMapped={false} side={THREE.DoubleSide} />

          <lineSegments>
            <edgesGeometry args={[new THREE.BoxGeometry(1, 1, 1)]} />
            <lineBasicMaterial color={element.color} transparent opacity={0.8} toneMapped={false} />
          </lineSegments>
        </mesh>
      ))}
    </group>
  );
}
