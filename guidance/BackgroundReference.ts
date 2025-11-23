"use client";

import { Suspense, useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
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
  const ref = useRef<THREE.Points>(null!);

  const { positions, colors } = useMemo(() => {
    const count = 8000;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      const index = i * 3;
      // Wider initial distribution to fill screen
      positions[index] = (Math.random() - 0.5) * 5;
      positions[index + 1] = (Math.random() - 0.5) * 3;
      positions[index + 2] = (Math.random() - 0.5) * 2;

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
    // REFERENCE VIDEO STYLE:
    // - Traveling wave creates diagonal bands
    // - Particles attracted to wave crests
    // - Turbulent flow within bands
    // - Dramatic density variation (intentional bunching)
    // ========================================

    // Wave parameters (modulated over time for dynamic behavior)
    const waveAngle = Math.sin(t * 0.15) * 0.8; // Slowly rotating wave
    const waveFreqX = 0.35 + Math.cos(waveAngle) * 0.15;
    const waveFreqY = 0.25 + Math.sin(waveAngle) * 0.15;
    const waveSpeed = 0.5;

    for (let i = 0; i < positions.length; i += 3) {
      const x = positions[i];
      const y = positions[i + 1];
      const z = positions[i + 2];

      // --- Primary Wave Field ---
      // Creates the main diagonal band structure
      const wavePhase = x * waveFreqX + y * waveFreqY - t * waveSpeed;
      const waveCrest = Math.sin(wavePhase);
      
      // Secondary wave for more complex patterns
      const wave2Phase = x * 0.28 - y * 0.32 + t * 0.4;
      const wave2Crest = Math.sin(wave2Phase);

      // Combined wave (creates splitting/merging bands)
      const combinedWave = (waveCrest + wave2Crest * 0.5) / 1.5;

      // --- Attraction to Wave Crests ---
      // Particles pulled toward regions where combinedWave ≈ 1
      const targetDensity = 1.0;
      const densityError = targetDensity - combinedWave;
      const attractionStrength = Math.max(0, densityError) * 0.006;

      // Wave gradient (direction perpendicular to wave front)
      const gradientX = -Math.cos(wavePhase) * waveFreqX;
      const gradientY = -Math.cos(wavePhase) * waveFreqY;

      let dx = gradientX * attractionStrength;
      let dy = gradientY * attractionStrength;
      let dz = 0;

      // --- Turbulent Flow Within Bands ---
      // Creates swirling motion inside the dense regions
      const turbulence = noise4D(x * 0.4, y * 0.4, z * 0.4, t * 0.25);
      const turbulenceAngle = turbulence * Math.PI * 2;
      const turbulenceStrength = 0.003 * (1 + combinedWave) * 0.5; // Stronger in dense regions

      dx += Math.cos(turbulenceAngle) * turbulenceStrength;
      dy += Math.sin(turbulenceAngle) * turbulenceStrength;
      dz += Math.sin(turbulenceAngle * 0.7) * turbulenceStrength * 0.5;

      // --- Depth Modulation ---
      // Link Z-position to wave phase for 3D effect
      const depthTarget = Math.sin(wavePhase * 0.5) * 0.8;
      const depthError = depthTarget - z;
      dz += depthError * 0.002;

      // --- Ambient Drift ---
      // Slow background motion to prevent stagnation
      const driftAngle = noise4D(x * 0.15, y * 0.15, z * 0.15, t * 0.1) * Math.PI * 2;
      dx += Math.cos(driftAngle) * 0.001;
      dy += Math.sin(driftAngle) * 0.001;

      // --- Velocity Normalization ---
      const vNorm = Math.sqrt(dx * dx + dy * dy + dz * dz) + 1e-6;
      const maxStep = 0.012; // Slightly higher for more dynamic motion
      const scale = Math.min(1, maxStep / vNorm);
      dx *= scale;
      dy *= scale;
      dz *= scale;

      // Update positions
      positions[i] += dx;
      positions[i + 1] += dy;
      positions[i + 2] += dz;

      // Boundary wrapping (expanded for wider field)
      if (positions[i] > 4.5) positions[i] = -4.5;
      if (positions[i] < -4.5) positions[i] = 4.5;
      if (positions[i + 1] > 2.5) positions[i + 1] = -2.5;
      if (positions[i + 1] < -2.5) positions[i + 1] = 2.5;
      if (positions[i + 2] > 1.2) positions[i + 2] = -1.2;
      if (positions[i + 2] < -1.2) positions[i + 2] = 1.2;
    }

    geometry.attributes.position.needsUpdate = true;
  });

  return (
    <Points ref={ref} positions={positions} stride={3}>
      <pointMaterial
        transparent
        size={0.012}
        sizeAttenuation
        depthWrite={false}
        vertexColors
        toneMapped={false}
      />
    </Points>
  );
}

export function BackgroundReference() {
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
          <ambientLight intensity={0.5} />
          <SwirlParticles />
          <EffectComposer>
            <Bloom intensity={1.8} radius={0.9} luminanceThreshold={0.08} luminanceSmoothing={0.5} />
          </EffectComposer>
        </Canvas>
      </Suspense>
    </div>
  );
}
