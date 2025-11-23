"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

/**
 * ParallaxGrid Component
 * 
 * Creates a deep receding Cartesian grid with:
 * - Thin neon-like strokes
 * - Dotted guide lines
 * - Slow constant parallax motion (X and Z axes)
 * - Infinite analytics substrate appearance
 */

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
  const dottedLinesRef = useRef<THREE.LineSegments>(null);
  
  // Create main grid lines
  const gridLines = useMemo(() => {
    const geometry = new THREE.BufferGeometry();
    const vertices: number[] = [];
    const step = size / divisions;

    // Horizontal lines
    for (let i = 0; i <= divisions; i++) {
      const y = -size / 2 + i * step;
      vertices.push(-size / 2, y, 0);
      vertices.push(size / 2, y, 0);
    }

    // Vertical lines
    for (let i = 0; i <= divisions; i++) {
      const x = -size / 2 + i * step;
      vertices.push(x, -size / 2, 0);
      vertices.push(x, size / 2, 0);
    }

    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    return geometry;
  }, [size, divisions]);

  // Create dotted guide lines (for depth effect)
  const dottedLines = useMemo(() => {
    const geometry = new THREE.BufferGeometry();
    const vertices: number[] = [];
    const step = size / divisions;
    const dotSpacing = 0.2;

    // Create dotted lines receding into Z-axis
    for (let i = 0; i <= divisions; i++) {
      const x = -size / 2 + i * step;
      
      // Create dots along Z-axis
      for (let z = 0; z < size; z += dotSpacing) {
        vertices.push(x, -size / 2, -z);
        vertices.push(x, -size / 2, -z - dotSpacing * 0.3);
      }
    }

    for (let i = 0; i <= divisions; i++) {
      const y = -size / 2 + i * step;
      
      for (let z = 0; z < size; z += dotSpacing) {
        vertices.push(-size / 2, y, -z);
        vertices.push(-size / 2, y, -z - dotSpacing * 0.3);
      }
    }

    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    return geometry;
  }, [size, divisions]);

  // Parallax animation
  useFrame((state) => {
    if (gridRef.current) {
      const time = state.clock.getElapsedTime();
      
      // Slow constant parallax on X and Z axes
      const parallaxX = Math.sin(time * 0.1) * 0.5;
      const parallaxZ = time * 0.15; // Constant forward motion
      
      // Loop the Z position for infinite effect
      const zOffset = (parallaxZ % (size / 2));
      
      gridRef.current.position.x = position[0] + parallaxX;
      gridRef.current.position.z = position[2] - zOffset;
    }
  });

  return (
    <group ref={gridRef} position={position}>
      {/* Main grid (XY plane) */}
      <lineSegments geometry={gridLines}>
        <lineBasicMaterial
          color={color}
          transparent
          opacity={0.15}
          toneMapped={false}
        />
      </lineSegments>

      {/* Secondary grid (offset for depth) */}
      <lineSegments geometry={gridLines} position={[0, 0, -size / 4]}>
        <lineBasicMaterial
          color={color}
          transparent
          opacity={0.08}
          toneMapped={false}
        />
      </lineSegments>

      {/* Dotted guide lines */}
      <lineSegments ref={dottedLinesRef} geometry={dottedLines}>
        <lineBasicMaterial
          color={color}
          transparent
          opacity={0.12}
          toneMapped={false}
        />
      </lineSegments>

      {/* Additional horizontal grid planes for depth */}
      <lineSegments geometry={gridLines} position={[0, 0, -size / 2]} rotation={[Math.PI / 2, 0, 0]}>
        <lineBasicMaterial
          color={color}
          transparent
          opacity={0.06}
          toneMapped={false}
        />
      </lineSegments>

      <lineSegments geometry={gridLines} position={[0, 0, -size]} rotation={[Math.PI / 2, 0, 0]}>
        <lineBasicMaterial
          color={color}
          transparent
          opacity={0.04}
          toneMapped={false}
        />
      </lineSegments>
    </group>
  );
}
