"use client";

import { useRef, useMemo, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { Points, PointMaterial } from "@react-three/drei";
import * as THREE from "three";

/**
 * Enhanced DottedWorldMap Component
 * 
 * Creates a more detailed globe visualization using LED-like dots
 * with improved continent shapes and density variation.
 */

interface DottedWorldMapEnhancedProps {
  radius?: number;
  dotDensity?: number; // dots per degree
  dotSize?: number;
  autoRotate?: boolean;
  rotationSpeed?: number;
  position?: [number, number, number];
  showGlow?: boolean;
}

/**
 * More detailed land mass detection with better continent shapes
 */
function isLandMassDetailed(lat: number, lon: number): boolean {
  const normLon = ((lon + 180) % 360) - 180;
  const normLat = lat;

  // Helper function for distance-based regions (for islands and irregular shapes)
  const distance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    return Math.sqrt(Math.pow(lat1 - lat2, 2) + Math.pow(lon1 - lon2, 2));
  };

  // NORTH AMERICA
  if (normLat > 15 && normLat < 72 && normLon > -168 && normLon < -52) {
    // Canada and USA main body
    if (normLat > 25 && normLon > -125 && normLon < -65) return true;
    
    // Alaska
    if (normLat > 55 && normLon > -165 && normLon < -130) {
      return Math.random() > 0.25;
    }
    
    // West coast
    if (normLat > 32 && normLat < 50 && normLon > -125 && normLon < -115) return true;
    
    // Mexico and Central America
    if (normLat > 14 && normLat < 33 && normLon > -118 && normLon < -86) return true;
    if (normLat > 7 && normLat < 22 && normLon > -92 && normLon < -77) {
      return Math.random() > 0.3; // Central America isthmus
    }
    
    // Caribbean islands
    if (normLat > 10 && normLat < 27 && normLon > -85 && normLon < -60) {
      return Math.random() > 0.7; // Sparse islands
    }
    
    // Eastern Canada
    if (normLat > 45 && normLon > -80 && normLon < -52) return true;
    
    return false;
  }

  // SOUTH AMERICA
  if (normLat > -56 && normLat < 13 && normLon > -82 && normLon < -34) {
    // Main body
    if (normLat > -40 && normLat < 10 && normLon > -78 && normLon < -35) return true;
    
    // Southern cone (Chile, Argentina)
    if (normLat > -56 && normLat < -20 && normLon > -75 && normLon < -53) return true;
    
    // Northern coast
    if (normLat > 0 && normLat < 12 && normLon > -75 && normLon < -60) return true;
    
    return false;
  }

  // EUROPE
  if (normLat > 35 && normLat < 72 && normLon > -11 && normLon < 40) {
    // Iberian Peninsula
    if (normLat > 36 && normLat < 44 && normLon > -10 && normLon < 3) return true;
    
    // France, Germany, Poland
    if (normLat > 43 && normLat < 55 && normLon > -5 && normLon < 24) return true;
    
    // Scandinavia
    if (normLat > 55 && normLat < 71 && normLon > 4 && normLon < 31) {
      return Math.random() > 0.2;
    }
    
    // Italy
    if (normLat > 37 && normLat < 47 && normLon > 6 && normLon < 19) {
      return Math.random() > 0.25; // Peninsula shape
    }
    
    // Balkans and Greece
    if (normLat > 35 && normLat < 46 && normLon > 13 && normLon < 29) return true;
    
    // UK and Ireland
    if (normLat > 50 && normLat < 60 && normLon > -11 && normLon < 2) {
      return Math.random() > 0.3;
    }
    
    // Eastern Europe
    if (normLat > 44 && normLat < 60 && normLon > 20 && normLon < 40) return true;
    
    return false;
  }

  // AFRICA
  if (normLat > -36 && normLat < 38 && normLon > -18 && normLon < 52) {
    // North Africa
    if (normLat > 10 && normLat < 37 && normLon > -17 && normLon < 32) return true;
    
    // Sub-Saharan Africa (main body)
    if (normLat > -35 && normLat < 15 && normLon > 8 && normLon < 42) return true;
    
    // West Africa coast
    if (normLat > -5 && normLat < 16 && normLon > -18 && normLon < 10) return true;
    
    // East Africa and Horn
    if (normLat > -12 && normLat < 18 && normLon > 32 && normLon < 52) return true;
    
    // Madagascar
    if (normLat > -26 && normLat < -12 && normLon > 43 && normLon < 51) {
      return Math.random() > 0.3;
    }
    
    return false;
  }

  // ASIA
  if (normLat > -11 && normLat < 78 && normLon > 25 && normLon < 180) {
    // Middle East
    if (normLat > 12 && normLat < 42 && normLon > 25 && normLon < 63) return true;
    
    // Central Asia and Russia
    if (normLat > 35 && normLat < 75 && normLon > 40 && normLon < 180) {
      if (normLat > 60 && normLon > 150) return Math.random() > 0.4; // Sparse far east
      return true;
    }
    
    // Indian subcontinent
    if (normLat > 8 && normLat < 36 && normLon > 68 && normLon < 89) return true;
    if (normLat > 6 && normLat < 10 && normLon > 79 && normLon < 82) return true; // Sri Lanka tip
    
    // Southeast Asia mainland
    if (normLat > 5 && normLat < 28 && normLon > 92 && normLon < 110) return true;
    
    // China and Mongolia
    if (normLat > 18 && normLat < 54 && normLon > 73 && normLon < 135) return true;
    
    // Korean Peninsula
    if (normLat > 33 && normLat < 43 && normLon > 124 && normLon < 131) return true;
    
    // Southeast Asian islands
    if (normLat > -8 && normLat < 7 && normLon > 95 && normLon < 141) {
      return Math.random() > 0.5; // Indonesia, Philippines
    }
    
    return false;
  }

  // AUSTRALIA
  if (normLat > -44 && normLat < -10 && normLon > 113 && normLon < 154) {
    // Main body
    if (normLat > -39 && normLat < -11 && normLon > 113 && normLon < 154) return true;
    
    // Tasmania
    if (normLat > -44 && normLat < -40 && normLon > 144 && normLon < 149) {
      return Math.random() > 0.3;
    }
    
    return false;
  }

  // NEW ZEALAND
  if (normLat > -47 && normLat < -34 && normLon > 166 && normLon < 179) {
    return Math.random() > 0.25; // Island chain
  }

  // JAPAN
  if (normLat > 30 && normLat < 46 && normLon > 129 && normLon < 146) {
    return Math.random() > 0.25; // Island chain
  }

  // GREENLAND
  if (normLat > 59 && normLat < 84 && normLon > -74 && normLon < -11) {
    return Math.random() > 0.3; // Sparse coverage
  }

  // ICELAND
  if (normLat > 63 && normLat < 67 && normLon > -25 && normLon < -13) {
    return Math.random() > 0.4;
  }

  // ANTARCTICA (very sparse)
  if (normLat < -60) {
    return Math.random() > 0.75;
  }

  return false;
}

function latLonToCartesian(lat: number, lon: number, radius: number): [number, number, number] {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);

  const x = -radius * Math.sin(phi) * Math.cos(theta);
  const y = radius * Math.cos(phi);
  const z = radius * Math.sin(phi) * Math.sin(theta);

  return [x, y, z];
}

export function DottedWorldMapEnhanced({
  radius = 0.85,
  dotDensity = 2.5, // dots per degree
  dotSize = 0.012,
  autoRotate = true,
  rotationSpeed = 0.45,
  position = [0.73, 0.16, 0],
  showGlow = true,
}: DottedWorldMapEnhancedProps) {
  const groupRef = useRef<THREE.Group>(null);
  const pointsRef = useRef<THREE.Points>(null);
  const glowPointsRef = useRef<THREE.Points>(null);

  const { positions, colors, count } = useMemo(() => {
    const tempPositions: number[] = [];
    const tempColors: number[] = [];

    const latStep = 1 / dotDensity;
    const lonStep = 1 / dotDensity;

    for (let lat = -90; lat <= 90; lat += latStep) {
      for (let lon = -180; lon <= 180; lon += lonStep) {
        if (isLandMassDetailed(lat, lon)) {
          const [x, y, z] = latLonToCartesian(lat, lon, radius);
          tempPositions.push(x, y, z);

          // Color gradient: cyan/teal based on latitude
          const colorT = (lat + 90) / 180;
          
          // Create vibrant cyan-to-teal gradient
          const hue = 0.52 - colorT * 0.08; // Cyan (0.5) to teal (0.48)
          const saturation = 0.92 - colorT * 0.15;
          const lightness = 0.48 + Math.sin(colorT * Math.PI) * 0.12;
          
          const color = new THREE.Color();
          color.setHSL(hue, saturation, lightness);

          tempColors.push(color.r, color.g, color.b);
        }
      }
    }

    const positions = new Float32Array(tempPositions);
    const colors = new Float32Array(tempColors);
    const count = tempPositions.length / 3;

    return { positions, colors, count };
  }, [radius, dotDensity]);

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

    // Subtle pulsing effect
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
      {/* Glow layer (behind) */}
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

      {/* Main dots */}
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
