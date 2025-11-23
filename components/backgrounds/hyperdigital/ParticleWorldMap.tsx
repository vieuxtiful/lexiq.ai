"use client";

import { useRef, useMemo, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { Points, PointMaterial } from "@react-three/drei";
import * as THREE from "three";

interface ParticleWorldMapProps {
  dotDensity?: number;
  position?: [number, number, number];
  scale?: number;
}

function isLandMass(x: number, y: number): boolean {
  const lon = x * 180;
  const lat = y * 90;

  if (lat > 15 && lat < 72 && lon > -168 && lon < -52) {
    if (lat > 25 && lon > -125 && lon < -65) return true;
    if (lat > 55 && lon > -165 && lon < -130) return Math.random() > 0.25;
    if (lat > 32 && lat < 50 && lon > -125 && lon < -115) return true;
    if (lat > 14 && lat < 33 && lon > -118 && lon < -86) return true;
    if (lat > 7 && lat < 22 && lon > -92 && lon < -77) return Math.random() > 0.3;
    if (lat > 10 && lat < 27 && lon > -85 && lon < -60) return Math.random() > 0.7;
    if (lat > 45 && lon > -80 && lon < -52) return true;
    return false;
  }

  if (lat > -56 && lat < 13 && lon > -82 && lon < -34) {
    if (lat > -40 && lat < 10 && lon > -78 && lon < -35) return true;
    if (lat > -56 && lat < -20 && lon > -75 && lon < -53) return true;
    if (lat > 0 && lat < 12 && lon > -75 && lon < -60) return true;
    return false;
  }

  if (lat > 35 && lat < 72 && lon > -11 && lon < 40) {
    if (lat > 36 && lat < 44 && lon > -10 && lon < 3) return true;
    if (lat > 43 && lat < 55 && lon > -5 && lon < 24) return true;
    if (lat > 55 && lat < 71 && lon > 4 && lon < 31) return Math.random() > 0.2;
    if (lat > 37 && lat < 47 && lon > 6 && lon < 19) return Math.random() > 0.25;
    if (lat > 35 && lat < 46 && lon > 13 && lon < 29) return true;
    if (lat > 50 && lat < 60 && lon > -11 && lon < 2) return Math.random() > 0.3;
    if (lat > 44 && lat < 60 && lon > 20 && lon < 40) return true;
    return false;
  }

  if (lat > -36 && lat < 38 && lon > -18 && lon < 52) {
    if (lat > 10 && lat < 37 && lon > -17 && lon < 32) return true;
    if (lat > -35 && lat < 15 && lon > 8 && lon < 42) return true;
    if (lat > -5 && lat < 16 && lon > -18 && lon < 10) return true;
    if (lat > -12 && lat < 18 && lon > 32 && lon < 52) return true;
    if (lat > -26 && lat < -12 && lon > 43 && lon < 51) return Math.random() > 0.3;
    return false;
  }

  if (lat > -11 && lat < 78 && lon > 25 && lon < 180) {
    if (lat > 12 && lat < 42 && lon > 25 && lon < 63) return true;
    if (lat > 35 && lat < 75 && lon > 40 && lon < 180) {
      if (lat > 60 && lon > 150) return Math.random() > 0.4;
      return true;
    }
    if (lat > 8 && lat < 36 && lon > 68 && lon < 89) return true;
    if (lat > 6 && lat < 10 && lon > 79 && lon < 82) return true;
    if (lat > 5 && lat < 28 && lon > 92 && lon < 110) return true;
    if (lat > 18 && lat < 54 && lon > 73 && lon < 135) return true;
    if (lat > 33 && lat < 43 && lon > 124 && lon < 131) return true;
    if (lat > -8 && lat < 7 && lon > 95 && lon < 141) return Math.random() > 0.5;
    return false;
  }

  if (lat > -44 && lat < -10 && lon > 113 && lon < 154) {
    if (lat > -39 && lat < -11 && lon > 113 && lon < 154) return true;
    if (lat > -44 && lat < -40 && lon > 144 && lon < 149) return Math.random() > 0.3;
    return false;
  }

  if (lat > -47 && lat < -34 && lon > 166 && lon < 179) {
    return Math.random() > 0.25;
  }

  if (lat > 30 && lat < 46 && lon > 129 && lon < 146) {
    return Math.random() > 0.25;
  }

  if (lat > 59 && lat < 84 && lon > -74 && lon < -11) {
    return Math.random() > 0.3;
  }

  if (lat > 63 && lat < 67 && lon > -25 && lon < -13) {
    return Math.random() > 0.4;
  }

  return false;
}

export function ParticleWorldMap({ dotDensity = 3.5, position = [0, 0, 0], scale = 2.5 }: ParticleWorldMapProps) {
  const pointsRef = useRef<THREE.Points>(null);
  const glowPointsRef = useRef<THREE.Points>(null);
  const originalPositions = useRef<Float32Array | null>(null);
  const flickerPhases = useRef<Float32Array | null>(null);

  const { positions, colors, count } = useMemo(() => {
    const tempPositions: number[] = [];
    const tempColors: number[] = [];
    const tempFlickerPhases: number[] = [];

    const width = Math.floor(360 * dotDensity);
    const height = Math.floor(180 * dotDensity);

    for (let i = 0; i < width; i++) {
      for (let j = 0; j < height; j++) {
        const x = (i / width) * 2 - 1;
        const y = (j / height) * 2 - 1;

        if (isLandMass(x, y)) {
          const posX = x * scale;
          const posY = y * scale * 0.5;
          const posZ = (Math.random() - 0.5) * 0.3;

          tempPositions.push(posX, posY, posZ);

          const latFactor = (y + 1) / 2;
          const color = new THREE.Color();
          if (latFactor < 0.5) {
            color.setHSL(0.42, 0.95, 0.45 + latFactor * 0.15);
          } else {
            color.setHSL(0.48, 0.92, 0.5 + (latFactor - 0.5) * 0.2);
          }

          tempColors.push(color.r, color.g, color.b);
          tempFlickerPhases.push(Math.random() * Math.PI * 2);
        }
      }
    }

    const positionArray = new Float32Array(tempPositions);
    const colorArray = new Float32Array(tempColors);
    const totalCount = tempPositions.length / 3;

    originalPositions.current = positionArray.slice();
    flickerPhases.current = new Float32Array(tempFlickerPhases);

    return { positions: positionArray, colors: colorArray, count: totalCount };
  }, [dotDensity, scale]);

  useEffect(() => {
    if (pointsRef.current && colors.length > 0) {
      const colorAttribute = new THREE.Float32BufferAttribute(colors, 3);
      pointsRef.current.geometry?.setAttribute("color", colorAttribute);
    }
    if (glowPointsRef.current && colors.length > 0) {
      const colorAttribute = new THREE.Float32BufferAttribute(colors, 3);
      glowPointsRef.current.geometry?.setAttribute("color", colorAttribute);
    }
  }, [colors]);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();

    if (pointsRef.current && originalPositions.current && flickerPhases.current) {
      const geometry = pointsRef.current.geometry;
      const positionAttribute = geometry.getAttribute("position");
      if (!positionAttribute) {
        return;
      }

      const colorAttribute = geometry.getAttribute("color");
      const positionsAttr = positionAttribute.array as Float32Array;
      const colorAttr = colorAttribute?.array as Float32Array | undefined;

      for (let i = 0; i < count; i++) {
        const idx = i * 3;
        const jitterAmount = 0.002;
        const jitterX = Math.sin(time * 2 + flickerPhases.current[i]) * jitterAmount;
        const jitterY = Math.cos(time * 2.3 + flickerPhases.current[i]) * jitterAmount;
        const jitterZ = Math.sin(time * 1.8 + flickerPhases.current[i]) * jitterAmount * 0.5;

        positionsAttr[idx] = originalPositions.current[idx] + jitterX;
        positionsAttr[idx + 1] = originalPositions.current[idx + 1] + jitterY;
        positionsAttr[idx + 2] = originalPositions.current[idx + 2] + jitterZ;

        if (colorAttr) {
          const flicker = 0.85 + Math.sin(time * 3 + flickerPhases.current[i]) * 0.15;
          colorAttr[idx] = colors[idx] * flicker;
          colorAttr[idx + 1] = colors[idx + 1] * flicker;
          colorAttr[idx + 2] = colors[idx + 2] * flicker;
        }
      }

      geometry.attributes.position.needsUpdate = true;
      if (colorAttribute) {
        geometry.attributes.color.needsUpdate = true;
      }
    }

    if (glowPointsRef.current && pointsRef.current) {
      const mainPositionAttr = pointsRef.current.geometry.getAttribute("position");
      const glowPositionAttr = glowPointsRef.current.geometry.getAttribute("position");
      if (mainPositionAttr && glowPositionAttr) {
        const mainPos = mainPositionAttr.array as Float32Array;
        const glowPos = glowPositionAttr.array as Float32Array;
        glowPos.set(mainPos);
        glowPointsRef.current.geometry.attributes.position.needsUpdate = true;
      }
    }
  });

  return (
    <group position={position}>
      <Points ref={glowPointsRef} positions={positions} stride={3}>
        <PointMaterial
          transparent
          size={0.025}
          sizeAttenuation
          depthWrite={false}
          vertexColors
          toneMapped={false}
          opacity={0.4}
          blending={THREE.AdditiveBlending}
        />
      </Points>

      <Points ref={pointsRef} positions={positions} stride={3}>
        <PointMaterial
          transparent
          size={0.015}
          sizeAttenuation
          depthWrite={false}
          vertexColors
          toneMapped={false}
          opacity={0.95}
        />
      </Points>
    </group>
  );
}
