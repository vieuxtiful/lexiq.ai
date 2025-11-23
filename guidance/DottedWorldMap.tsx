"use client";

import { useRef, useMemo, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { Points, PointMaterial } from "@react-three/drei";
import * as THREE from "three";

/**
 * DottedWorldMap Component
 * 
 * Creates a globe visualization using LED-like dots that form world map continents.
 * The dots are placed on a spherical surface using latitude/longitude coordinates.
 */

interface DottedWorldMapProps {
  /** Globe radius */
  radius?: number;
  /** Number of dots along latitude (horizontal resolution) */
  latitudeSegments?: number;
  /** Number of dots along longitude (vertical resolution) */
  longitudeSegments?: number;
  /** Dot size */
  dotSize?: number;
  /** Base color for dots */
  baseColor?: string;
  /** Whether to animate rotation */
  autoRotate?: boolean;
  /** Rotation speed in radians per second */
  rotationSpeed?: number;
  /** Position offset [x, y, z] */
  position?: [number, number, number];
}

/**
 * Simplified world map data as latitude/longitude regions
 * This is a procedural approximation of continents
 */
function isLandMass(lat: number, lon: number): boolean {
  // Normalize to -180 to 180 for longitude, -90 to 90 for latitude
  const normLon = ((lon + 180) % 360) - 180;
  const normLat = lat;

  // North America (roughly)
  if (
    normLat > 15 && normLat < 72 &&
    normLon > -168 && normLon < -52
  ) {
    // Exclude some water regions
    if (normLat > 50 && normLon < -130) return Math.random() > 0.3; // Alaska sparse
    if (normLat < 30 && normLon > -100 && normLon < -80) return false; // Gulf
    return true;
  }

  // South America
  if (
    normLat > -56 && normLat < 12 &&
    normLon > -82 && normLon < -34
  ) {
    return true;
  }

  // Europe
  if (
    normLat > 36 && normLat < 71 &&
    normLon > -10 && normLon < 40
  ) {
    if (normLat < 42 && normLon > 10 && normLon < 25) return false; // Mediterranean
    return true;
  }

  // Africa
  if (
    normLat > -35 && normLat < 37 &&
    normLon > -18 && normLon < 52
  ) {
    if (normLat > 30 && normLon > 10 && normLon < 35) return false; // Mediterranean
    return true;
  }

  // Asia (large region)
  if (
    normLat > -10 && normLat < 75 &&
    normLon > 26 && normLon < 180
  ) {
    // Exclude some water
    if (normLat < 25 && normLon > 90 && normLon < 110) return Math.random() > 0.4; // SE Asia islands
    if (normLat > 40 && normLon > 140) return Math.random() > 0.5; // Eastern Russia sparse
    return true;
  }

  // Australia
  if (
    normLat > -44 && normLat < -10 &&
    normLon > 113 && normLon < 154
  ) {
    return true;
  }

  // Greenland
  if (
    normLat > 60 && normLat < 84 &&
    normLon > -73 && normLon < -12
  ) {
    return Math.random() > 0.2; // Sparse ice coverage
  }

  // Antarctica (sparse)
  if (normLat < -60) {
    return Math.random() > 0.6;
  }

  // New Zealand
  if (
    normLat > -47 && normLat < -34 &&
    normLon > 166 && normLon < 179
  ) {
    return true;
  }

  // Japan
  if (
    normLat > 30 && normLat < 46 &&
    normLon > 129 && normLon < 146
  ) {
    return Math.random() > 0.3; // Island chain
  }

  // Philippines/Indonesia
  if (
    normLat > -8 && normLat < 20 &&
    normLon > 117 && normLon < 127
  ) {
    return Math.random() > 0.4;
  }

  return false;
}

/**
 * Convert latitude/longitude to 3D Cartesian coordinates on a sphere
 */
function latLonToCartesian(lat: number, lon: number, radius: number): [number, number, number] {
  const phi = (90 - lat) * (Math.PI / 180); // Convert latitude to polar angle
  const theta = (lon + 180) * (Math.PI / 180); // Convert longitude to azimuthal angle

  const x = -radius * Math.sin(phi) * Math.cos(theta);
  const y = radius * Math.cos(phi);
  const z = radius * Math.sin(phi) * Math.sin(theta);

  return [x, y, z];
}

export function DottedWorldMap({
  radius = 0.85,
  latitudeSegments = 90,
  longitudeSegments = 180,
  dotSize = 0.015,
  baseColor = "#00bfdd",
  autoRotate = true,
  rotationSpeed = 0.45,
  position = [0.73, 0.16, 0],
}: DottedWorldMapProps) {
  const groupRef = useRef<THREE.Group>(null);
  const pointsRef = useRef<THREE.Points>(null);

  // Generate dot positions and colors
  const { positions, colors, count } = useMemo(() => {
    const tempPositions: number[] = [];
    const tempColors: number[] = [];

    // Create a grid of latitude/longitude points
    for (let latIdx = 0; latIdx < latitudeSegments; latIdx++) {
      for (let lonIdx = 0; lonIdx < longitudeSegments; lonIdx++) {
        // Calculate lat/lon for this grid point
        const lat = -90 + (latIdx / (latitudeSegments - 1)) * 180;
        const lon = -180 + (lonIdx / (longitudeSegments - 1)) * 360;

        // Check if this point is on land
        if (isLandMass(lat, lon)) {
          // Convert to 3D position
          const [x, y, z] = latLonToCartesian(lat, lon, radius);
          tempPositions.push(x, y, z);

          // Color gradient based on latitude (like your existing gradient)
          const colorT = (lat + 90) / 180; // 0 to 1 from south to north
          
          // Cyan to teal gradient
          const color = new THREE.Color();
          color.setHSL(
            0.5 + colorT * 0.05, // Hue: cyan to slightly green-cyan
            0.85 - colorT * 0.2, // Saturation: high to medium
            0.45 + colorT * 0.15  // Lightness: medium to brighter
          );

          tempColors.push(color.r, color.g, color.b);
        }
      }
    }

    const positions = new Float32Array(tempPositions);
    const colors = new Float32Array(tempColors);
    const count = tempPositions.length / 3;

    return { positions, colors, count };
  }, [radius, latitudeSegments, longitudeSegments]);

  // Set up color attribute
  useEffect(() => {
    if (pointsRef.current && colors.length > 0) {
      const colorAttribute = new THREE.Float32BufferAttribute(colors, 3);
      pointsRef.current.geometry.setAttribute("color", colorAttribute);
    }
  }, [colors]);

  // Animation loop
  useFrame((_, delta) => {
    if (autoRotate && groupRef.current) {
      groupRef.current.rotation.y += rotationSpeed * delta;
    }

    // Optional: Add subtle pulsing effect to dots
    if (pointsRef.current) {
      const material = pointsRef.current.material as THREE.PointsMaterial;
      if (material) {
        // Subtle size pulsing
        const time = performance.now() * 0.0005;
        material.size = dotSize * (1 + Math.sin(time) * 0.08);
      }
    }
  });

  return (
    <group ref={groupRef} position={position}>
      <Points ref={pointsRef} positions={positions} stride={3}>
        <PointMaterial
          transparent
          size={dotSize}
          sizeAttenuation
          depthWrite={false}
          vertexColors
          toneMapped={false}
          opacity={0.9}
        />
      </Points>
    </group>
  );
}
