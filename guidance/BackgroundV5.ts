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
    // V5 ANTI-BUNCHING MECHANISMS:
    // 1. Stochastic Jitter: A small, high-frequency random force to break up clusters.
    // 2. Increased Swirl Strength: Stronger base motion to counteract settling.
    // 3. Incommensurate Frequencies: Non-integer frequency ratios to prevent resonance.
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

      // Base swirl field - INCREASED strength to counteract bunching
      const angle = noise4D(x * 0.3, y * 0.3, z * 0.3, t * 0.2) * Math.PI * 2;
      let dx = Math.cos(angle) * 0.004; // Increased from 0.003
      let dy = Math.sin(angle) * 0.004; // Increased from 0.003
      let dz = Math.sin(angle * 0.3) * 0.002; // Increased from 0.0015

      // --- Anti-Bunching Mechanism: Stochastic Jitter ---
      const jitterStrength = 0.0006;
      dx += (noise4D(x * 10, y * 10, z * 10, t * 2.0) - 0.5) * jitterStrength;
      dy += (noise4D(x * 12, y * 12, z * 12, t * 2.1) - 0.5) * jitterStrength;
      dz += (noise4D(x * 14, y * 14, z * 14, t * 2.2) - 0.5) * jitterStrength;

      // --- Coalescence Field ---

      // 1. Radial Pull - using INCOMMENSURATE frequency
      const radius = Math.sqrt(x * x + y * y) + 1e-4;
      const targetRadius = 1.4 + Math.sin(z * 0.6 + t * 0.45) * 0.35;
      const radialDelta = targetRadius - radius;
      const normalizedRadialError = radialDelta / (Math.abs(radialDelta) + 1);
      const radiusCohesion = 0.0015 * (0.5 + gateRadius);
      dx += (x / radius) * normalizedRadialError * radiusCohesion;
      dy += (y / radius) * normalizedRadialError * radiusCohesion;

      // 2. Vertical Pull - using INCOMMENSURATE frequency
      const bandCenterY = Math.sin(t * (0.5 * 1.313) + z * 0.4) * 0.4;
      const yDelta = bandCenterY - y;
      const normalizedYError = yDelta / (Math.abs(yDelta) + 1);
      const yCohesion = 0.0007 * (0.5 + gateY);
      dy += normalizedYError * yCohesion;

      // 3. Depth Pull - using INCOMMENSURATE frequency
      const bandCenterZ = Math.sin(t * (0.55 * 1.618) + radius * 0.45) * 0.6;
      const zDelta = bandCenterZ - z;
      const normalizedZError = zDelta / (Math.abs(zDelta) + 1);
      const zCohesion = 0.001 * (0.5 + gateZ);
      dz += normalizedZError * zCohesion;

      // 4. Sporadic Pulses
      dx += (x / radius) * normalizedRadialError * pulseStrength;
      dy += normalizedYError * pulseStrength * 0.5;

      // 5. Velocity Normalization
      const vNorm = Math.sqrt(dx * dx + dy * dy + dz * dz) + 1e-6;
      const maxStep = 0.01;
      const scale = Math.min(1, maxStep / vNorm);
      dx *= scale;
      dy *= scale;
      dz *= scale;

      // Update positions
      positions[i] += dx;
      positions[i + 1] += dy;
      positions[i + 2] += dz;

      // EXPANDED boundary wrapping
      if (positions[i] > 3.9) positions[i] = -3.9;
      if (positions[i] < -3.9) positions[i] = 3.9;
      if (positions[i + 1] > 2.2) positions[i + 1] = -2.2;
      if (positions[i + 1] < -2.2) positions[i + 1] = 2.2;
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

export function BackgroundV5() {
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
