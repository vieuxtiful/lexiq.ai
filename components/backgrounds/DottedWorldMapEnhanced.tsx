"use client";

import { useRef, useMemo, useEffect } from "react";
import { useFrame, useLoader } from "@react-three/fiber";
import { Points, PointMaterial } from "@react-three/drei";
import * as THREE from "three";

interface DottedWorldMapEnhancedProps {
  radius?: number;
  dotDensity?: number;
  dotSize?: number;
  autoRotate?: boolean;
  rotationSpeed?: number;
  position?: [number, number, number];
  showGlow?: boolean;
}

function latLonToCartesian(lat: number, lon: number, radius: number): [number, number, number] {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);

  const x = -radius * Math.sin(phi) * Math.cos(theta);
  const y = radius * Math.cos(phi);
  const z = radius * Math.sin(phi) * Math.sin(theta);

  return [x, y, z];
}

type ImageBuffer = {
  data: Uint8ClampedArray;
  width: number;
  height: number;
};

function extractImageData(image: HTMLImageElement | null): ImageBuffer | null {
  if (!image) return null;

  const canvas = document.createElement("canvas");
  canvas.width = image.width;
  canvas.height = image.height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  ctx.drawImage(image, 0, 0);
  const imageData = ctx.getImageData(0, 0, image.width, image.height);
  return { data: imageData.data, width: image.width, height: image.height };
}

function uvFromLatLon(lat: number, lon: number) {
  const u = (lon + 180) / 360;
  const v = 1 - (lat + 90) / 180; // flip vertically because image origin is top-left
  return { u, v };
}

function sampleMask(mask: ImageBuffer, lat: number, lon: number): number {
  const { u, v } = uvFromLatLon(lat, lon);
  const x = Math.min(mask.width - 1, Math.max(0, Math.round(u * (mask.width - 1))));
  const y = Math.min(mask.height - 1, Math.max(0, Math.round(v * (mask.height - 1))));
  const offset = (y * mask.width + x) * 4;
  return mask.data[offset] / 255; // grayscale mask
}

function sampleColor(color: ImageBuffer, lat: number, lon: number): [number, number, number] {
  const { u, v } = uvFromLatLon(lat, lon);
  const x = Math.min(color.width - 1, Math.max(0, Math.round(u * (color.width - 1))));
  const y = Math.min(color.height - 1, Math.max(0, Math.round(v * (color.height - 1))));
  const offset = (y * color.width + x) * 4;
  return [color.data[offset] / 255, color.data[offset + 1] / 255, color.data[offset + 2] / 255];
}

function fallbackColor(lat: number): [number, number, number] {
  const colorT = (lat + 90) / 180;
  const hue = 0.52 - colorT * 0.08;
  const saturation = 0.92 - colorT * 0.15;
  const lightness = 0.48 + Math.sin(colorT * Math.PI) * 0.12;

  const color = new THREE.Color();
  color.setHSL(hue, saturation, lightness);

  return [color.r, color.g, color.b];
}

export function DottedWorldMapEnhanced({
  radius = 0.85,
  dotDensity = 2.5,
  dotSize = 0.012,
  autoRotate = true,
  rotationSpeed = 0.45,
  position = [0.73, 0.16, 0],
  showGlow = true,
}: DottedWorldMapEnhancedProps) {
  const groupRef = useRef<THREE.Group>(null);
  const pointsRef = useRef<THREE.Points>(null);
  const glowPointsRef = useRef<THREE.Points>(null);

  const maskTexture = useLoader(THREE.TextureLoader, "/dotted-world-map-mask.jpg");

  const maskData = useMemo(() => extractImageData(maskTexture?.image ?? null), [maskTexture]);

  const { positions, colors, count } = useMemo(() => {
    if (!maskData) {
      return { positions: new Float32Array(), colors: new Float32Array(), count: 0 };
    }

    const tempPositions: number[] = [];
    const tempColors: number[] = [];

    const latStep = 1 / dotDensity;
    const lonStep = 1 / dotDensity;

    const colorHelper = new THREE.Color("#ffffff");

    for (let lat = -90; lat <= 90; lat += latStep) {
      for (let lon = -180; lon <= 180; lon += lonStep) {
        const maskSample = sampleMask(maskData, lat, lon);
        if (maskSample < 0.5) continue;

        const [x, y, z] = latLonToCartesian(lat, lon, radius);
        tempPositions.push(x, y, z);

        tempColors.push(colorHelper.r, colorHelper.g, colorHelper.b);
      }
    }

    return {
      positions: new Float32Array(tempPositions),
      colors: new Float32Array(tempColors),
      count: tempPositions.length / 3,
    };
  }, [radius, dotDensity, maskData]);

  useEffect(() => {
    if (pointsRef.current && colors.length > 0) {
      const colorAttribute = new THREE.Float32BufferAttribute(colors, 3);
      pointsRef.current.geometry.setAttribute("color", colorAttribute);
    }
    if (glowPointsRef.current && colors.length > 0) {
      const colorAttribute = new THREE.Float32BufferAttribute(colors, 3);
      glowPointsRef.current.geometry.setAttribute("color", colorAttribute);
    }
  }, [colors]);

  useFrame((_, delta) => {
    if (autoRotate && groupRef.current) {
      groupRef.current.rotation.y += rotationSpeed * delta;
    }

    const time = performance.now() * 0.0003;
    const pulse = 1 + Math.sin(time) * 0.06;

    if (pointsRef.current) {
      const material = pointsRef.current.material as THREE.PointsMaterial;
      if (material) {
        material.size = dotSize * pulse;
      }
    }

    if (showGlow && glowPointsRef.current) {
      const material = glowPointsRef.current.material as THREE.PointsMaterial;
      if (material) {
        material.size = dotSize * 2.2 * pulse;
        material.opacity = 0.25 + Math.sin(time * 1.2) * 0.08;
      }
    }
  });

  return (
    <group ref={groupRef} position={position}>
      {showGlow && (
        <Points ref={glowPointsRef} positions={positions} stride={3}>
          <PointMaterial
            transparent
            size={dotSize * 2.2}
            sizeAttenuation
            depthWrite={false}
            vertexColors
            toneMapped={false}
            opacity={0.25}
            blending={THREE.AdditiveBlending}
          />
        </Points>
      )}

      <Points ref={pointsRef} positions={positions} stride={3}>
        <PointMaterial
          transparent
          size={dotSize}
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
