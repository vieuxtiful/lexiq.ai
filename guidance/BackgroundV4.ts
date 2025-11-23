"use client";

import { Suspense, useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Points, PointMaterial } from "@react-three/drei";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import { createNoise4D } from "simplex-noise";
import * as THREE from "three";

const gradientColors = [
  "#0065ab", "#0067af", "#006ab3", "#006db7", "#0070bb", "#0075c2",
  "#0079c7", "#007fce", "#0085d5", "#008bdb", "#0092e1", "#0098e6",
  "#009ce8", "#00a0e9", "#00a2e5", "#00a5dd", "#00a9d3", "#00accc",
  "#00afc4", "#00b1ba", "#00b3b0", "#00b1a1", "#00af92", "#00ad84",
  "#00ab76", "#00a769", "#00a35e", "#009f54", "#009b4b", "#009745",
  "#009441", "#00914d", "#00905b", "#008f69", "#008f76", "#009082",
  "#00938e", "#00969a", "#009aa4", "#009fae", "#00a4b7", "#00a9bf",
  "#00aec6", "#00b2cc", "#00b6d1", "#00b9d6", "#00bcd9", "#00bfdd",
  "#00c2e0", "#00c4e3",
];

const gradientStops = gradientColors.map((color, index) => ({
  stop: index / (gradientColors.length - 1),
  color,
}));

const hexToRgb = (hex: string) => {
  const normalized = hex.replace("#", "");
  const bigint = parseInt(normalized, 16);
  return [((bigint >> 16) & 255) / 255, ((bigint >> 8) & 255) / 255, (bigint & 255) / 255] as const;
};

function interpolateColor(t: number) {
  const clamped = Math.min(Math.max(t, 0), 1);
  let left = gradientStops[0];
  let right = gradientStops[gradientStops.length - 1];

  for (let i = 0; i < gradientStops.length - 1; i++) {
    const current = gradientStops[i];
    const next = gradientStops[i + 1];
    if (clamped >= current.stop && clamped <= next.stop) {
      left = current;
      right = next;
      break;
    }
  }

  const span = right.stop - left.stop || 1;
  const localT = (clamped - left.stop) / span;
  const leftRgb = hexToRgb(left.color);
  const rightRgb = hexToRgb(right.color);

  return leftRgb.map((channel, index) => channel + (rightRgb[index] - channel) * localT) as [number, number, number];
}

function SwirlParticles() {
  const noise4D = useMemo(() => createNoise4D(), []);
  const ref = useRef<THREE.Points>(null);

  const { positions, colors } = useMemo(() => {
    const count = 8000;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      const index = i * 3;
      positions[index] = (Math.random() - 0.5) * 4;
      positions[index + 1] = (Math.random() - 0.5) * 2;
      positions[index + 2] = (Math.random() - 0.5) * 1.5;

      const [r, g, b] = interpolateColor(i / count);
      colors[index] = r;
      colors[index + 1] = g;
      colors[index + 2] = b;
    }

    return { positions, colors };
  }, []);

  const colorAttribute = useMemo(() => new THREE.Float32BufferAttribute(colors, 3), [colors]);

  useEffect(() => {
    if (ref.current) {
      ref.current.geometry.setAttribute("color", colorAttribute);
    }
  }, [colorAttribute]);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    const geometry = ref.current?.geometry;
    if (!geometry) return;

    const positions = geometry.attributes.position.array as Float32Array;

    // ========================================
    // V4 CRITICAL FIXES:
    // 1. Expanded wrapping boundaries beyond camera frustum
    // 2. Removed rightward drift bias for balanced flow
    // 3. Increased Z-band amplitude to prevent flattening
    // 4. Strengthened Z-axis pull for depth maintenance
    // 5. Increased velocity cap for better redistribution
    // ========================================

    // Noise-based gates for pull strength modulation
    const gateRadius = 0.5 + 0.5 * noise4D(0.1, 0.0, 0.0, t * 0.35);
    const gateY = 0.5 + 0.5 * noise4D(0.2, 0.3, 0.0, t * 0.4);
    const gateZ = 0.5 + 0.5 * noise4D(0.4, 0.1, 0.2, t * 0.45);

    // Global pulse (calculated ONCE per frame for performance)
    const pulse = Math.max(0, noise4D(1.3, 2.1, 0.0, t * 0.8));
    const pulseStrength = pulse * 0.001;

    for (let i = 0; i < positions.length; i += 3) {
      const x = positions[i];
      const y = positions[i + 1];
      const z = positions[i + 2];

      // Base swirl field - REMOVED rightward drift bias
      const angle = noise4D(x * 0.3, y * 0.3, z * 0.3, t * 0.2) * Math.PI * 2;
      let dx = Math.cos(angle) * 0.003; // No +0.004 bias!
      let dy = Math.sin(angle) * 0.003; // Increased from 0.002
      let dz = Math.sin(angle * 0.3) * 0.0015; // Increased from 0.001

      // --- Improved Coalescence Field ---

      // 1. Radial Pull (XY Plane) - with normalized error
      const radius = Math.sqrt(x * x + y * y) + 1e-4;
      const targetRadius = 1.4 + Math.sin(z * 0.6 + t * 0.45) * 0.35;
      const radialDelta = targetRadius - radius;
      const normalizedRadialError = radialDelta / (Math.abs(radialDelta) + 1);
      const radiusCohesion = 0.0015 * (0.5 + gateRadius);
      dx += (x / radius) * normalizedRadialError * radiusCohesion;
      dy += (y / radius) * normalizedRadialError * radiusCohesion;

      // 2. Vertical Pull (Y-axis) - with normalized error
      const bandCenterY = Math.sin(t * 0.5 + z * 0.4) * 0.4;
      const yDelta = bandCenterY - y;
      const normalizedYError = yDelta / (Math.abs(yDelta) + 1);
      const yCohesion = 0.0007 * (0.5 + gateY);
      dy += normalizedYError * yCohesion;

      // 3. Depth Pull (Z-axis) - INCREASED amplitude and strength
      const bandCenterZ = Math.sin(t * 0.55 + radius * 0.45) * 0.6; // 0.35 → 0.6
      const zDelta = bandCenterZ - z;
      const normalizedZError = zDelta / (Math.abs(zDelta) + 1);
      const zCohesion = 0.001 * (0.5 + gateZ); // 0.0005 → 0.001 (doubled)
      dz += normalizedZError * zCohesion;

      // 4. Sporadic Pulses (using pre-calculated global pulse)
      dx += (x / radius) * normalizedRadialError * pulseStrength;
      dy += normalizedYError * pulseStrength * 0.5;

      // 5. Velocity Normalization - INCREASED cap for better redistribution
      const vNorm = Math.sqrt(dx * dx + dy * dy + dz * dz) + 1e-6;
      const maxStep = 0.01; // 0.006 → 0.01 (67% increase)
      const scale = Math.min(1, maxStep / vNorm);
      dx *= scale;
      dy *= scale;
      dz *= scale;

      // Update positions
      positions[i] += dx;
      positions[i + 1] += dy;
      positions[i + 2] += dz;

      // EXPANDED boundary wrapping (beyond camera frustum)
      // Based on frustum calculation: visible area at front is ±3.233 (X) and ±1.819 (Y)
      // Wrapping at ±3.9 (X) and ±2.2 (Y) ensures no visible teleportation

      // X wrapping - EXPANDED from ±2.5 to ±3.9
      if (positions[i] > 3.9) positions[i] = -3.9;
      if (positions[i] < -3.9) positions[i] = 3.9;

      // Y wrapping - EXPANDED from ±1.2 to ±2.2
      if (positions[i + 1] > 2.2) positions[i + 1] = -2.2;
      if (positions[i + 1] < -2.2) positions[i + 1] = 2.2;

      // Z wrapping - EXPANDED from ±0.9 to ±1.1
      if (positions[i + 2] > 1.1) positions[i + 2] = -1.1;
      if (positions[i + 2] < -1.1) positions[i + 2] = 1.1;
    }

    geometry.attributes.position.needsUpdate = true;
  });

  return (
    <Points ref={ref} positions={positions} stride={3}>
      <PointMaterial
        transparent
        size={0.014}
        sizeAttenuation
        depthWrite={false}
        vertexColors
        toneMapped={false}
      />
    </Points>
  );
}

export function BackgroundV4() {
  return (
    <div
      className="pointer-events-none fixed inset-0 -z-10"
      style={{
        background:
          "linear-gradient(135deg, #0065ab 0%, #00a0e9 18%, #009a59 36%, #009944 52%, #009c71 68%, #009fad 84%, #00a0e9 100%)",
      }}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(0,160,233,0.18),_transparent_65%)]" aria-hidden />
      <Suspense fallback={null}>
        <Canvas
          camera={{ position: [0, 0, 2.4], fov: 60 }}
          dpr={[1, 1.5]}
          gl={{ antialias: true }}
          frameloop="always"
          style={{ width: "100%", height: "100%" }}
        >
          <color attach="background" args={["#000814"]} />
          <ambientLight intensity={0.2} />
          <SwirlParticles />
          <EffectComposer multisampling={4}>
            <Bloom intensity={1.5} radius={0.8} luminanceThreshold={0.1} luminanceSmoothing={0.4} />
          </EffectComposer>
        </Canvas>
      </Suspense>
    </div>
  );
}
