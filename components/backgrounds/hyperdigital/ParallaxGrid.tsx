"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface ParallaxGridProps {
  size?: number;
  divisions?: number;
  position?: [number, number, number];
  color?: string;
}

export function ParallaxGrid({
  size = 20,
  divisions = 40,
  position = [0, -2, -5],
  color = "#00E5FF",
}: ParallaxGridProps) {
  const gridRef = useRef<THREE.Group>(null);

  const safeSize = Number.isFinite(size) && size > 0 ? size : 20;
  const safeDivisions = Math.max(1, Math.floor(divisions));

  const gridLines = useMemo(() => {
    const geometry = new THREE.BufferGeometry();
    const vertices: number[] = [];
    const step = safeSize / safeDivisions;

    for (let i = 0; i <= safeDivisions; i++) {
      const y = -safeSize / 2 + i * step;
      vertices.push(-safeSize / 2, y, 0);
      vertices.push(safeSize / 2, y, 0);
    }

    for (let i = 0; i <= safeDivisions; i++) {
      const x = -safeSize / 2 + i * step;
      vertices.push(x, -safeSize / 2, 0);
      vertices.push(x, safeSize / 2, 0);
    }

    geometry.setAttribute("position", new THREE.Float32BufferAttribute(vertices, 3));
    return geometry;
  }, [safeSize, safeDivisions]);

  const dottedLines = useMemo(() => {
    const geometry = new THREE.BufferGeometry();
    const vertices: number[] = [];
    const step = safeSize / safeDivisions;
    const dotSpacing = 0.2;

    for (let i = 0; i <= safeDivisions; i++) {
      const x = -safeSize / 2 + i * step;
      for (let z = 0; z < safeSize; z += dotSpacing) {
        vertices.push(x, -safeSize / 2, -z);
        vertices.push(x, -safeSize / 2, -z - dotSpacing * 0.3);
      }
    }

    for (let i = 0; i <= safeDivisions; i++) {
      const y = -safeSize / 2 + i * step;
      for (let z = 0; z < safeSize; z += dotSpacing) {
        vertices.push(-safeSize / 2, y, -z);
        vertices.push(-safeSize / 2, y, -z - dotSpacing * 0.3);
      }
    }

    geometry.setAttribute("position", new THREE.Float32BufferAttribute(vertices, 3));
    return geometry;
  }, [safeSize, safeDivisions]);

  useFrame((state) => {
    if (!gridRef.current) return;
    const time = state.clock.getElapsedTime();
    const parallaxX = Math.sin(time * 0.1) * 0.5;
    const parallaxZ = time * 0.15;
    const zOffset = parallaxZ % (safeSize / 2);
    gridRef.current.position.x = position[0] + parallaxX;
    gridRef.current.position.z = position[2] - zOffset;
  });

  return (
    <group ref={gridRef} position={position}>
      <lineSegments geometry={gridLines}>
        <lineBasicMaterial color={color} transparent opacity={0.15} toneMapped={false} />
      </lineSegments>

      <lineSegments geometry={gridLines} position={[0, 0, -safeSize / 4]}>
        <lineBasicMaterial color={color} transparent opacity={0.08} toneMapped={false} />
      </lineSegments>

      <lineSegments geometry={dottedLines}>
        <lineBasicMaterial color={color} transparent opacity={0.12} toneMapped={false} />
      </lineSegments>

      <lineSegments geometry={gridLines} position={[0, 0, -safeSize / 2]} rotation={[Math.PI / 2, 0, 0]}>
        <lineBasicMaterial color={color} transparent opacity={0.06} toneMapped={false} />
      </lineSegments>

      <lineSegments geometry={gridLines} position={[0, 0, -safeSize]} rotation={[Math.PI / 2, 0, 0]}>
        <lineBasicMaterial color={color} transparent opacity={0.04} toneMapped={false} />
      </lineSegments>
    </group>
  );
}
