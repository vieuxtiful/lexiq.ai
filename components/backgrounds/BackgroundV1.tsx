"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Points, PointMaterial } from "@react-three/drei";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import { createNoise4D } from "simplex-noise";
import * as THREE from "three";

import { gradientColors, interpolateColor } from "./gradients";

function SwirlParticles() {
  const noise4D = useMemo(() => createNoise4D(), []);
  const ref = useRef<THREE.Points>(null);
  const materialRef = useRef<any>(null);

  const cycleRef = useRef({ lastCycleIndex: -1, hasResetThisCycle: false });
  const invalidLogRef = useRef(false);

  const baseSize = 0.014;
  const featherExtraSize = 0.03; // extra size added at full feather (softer, larger halo at max feather)

  const swirlXYAmplitude = 0.0033;
  const swirlZAmplitude = 0.0017;

  const radialCohesionBase = 0.00085;
  const yCohesionBase = 0.00032;
  const zCohesionBase = 0.0005;

  const pulseBaseStrength = 0.0004;
  const maxStepBase = 0.0085;

  const { positions, colors } = useMemo(() => {
    const count = 8000;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      const index = i * 3;
      // Wider initial distribution to better fill the frustum, per BackgroundReference
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
    const dt = state.clock.getDelta();
    const geometry = ref.current?.geometry;
    if (!geometry) return;

    const positions = geometry.attributes.position.array as Float32Array;

    const resetParticle = (idx: number) => {
      positions[idx] = (Math.random() - 0.5) * 5;
      positions[idx + 1] = (Math.random() - 0.5) * 3;
      positions[idx + 2] = (Math.random() - 0.5) * 2;
    };

    let invalidFound = false;
    for (let i = 0; i < positions.length; i += 3) {
      if (
        !Number.isFinite(positions[i]) ||
        !Number.isFinite(positions[i + 1]) ||
        !Number.isFinite(positions[i + 2])
      ) {
        resetParticle(i);
        invalidFound = true;
      }
    }

    // Timed fade / reset cycle
    const leadIn = 4;
    const visibleDuration = 3;
    const fadeOutDuration = 1.0;   // slightly slower fade-out for softer exit
    const featherDuration = 1.3;   // feather spans ~1.3s total (fade-out + short tail)
    const fadeInDuration = 3;
    const transitionDuration = fadeOutDuration + fadeInDuration;
    const cycleDuration = visibleDuration + transitionDuration;

    let alpha = 1;
    let featherFactor = 0; // 0 = sharp, 1 = maximum feather
    let saturationFactor = 0; // 0 = full saturation, up to 0.30 reduction during fade-out, then eased back in
    let fadeOutPhase = 0; // 0 = not in fade-out, (0,1] = strength of fade-out fragmentation

    if (t >= leadIn) {
      const raw = t - leadIn;
      const cycleIndex = Math.floor(raw / cycleDuration);
      const cycleT = raw % cycleDuration;

      if (cycleT < visibleDuration) {
        // Visible phase
        alpha = 1;
        featherFactor = 0;
        cycleRef.current.hasResetThisCycle = false;
        cycleRef.current.lastCycleIndex = cycleIndex;
      } else {
        // Transition phase
        const transitionT = cycleT - visibleDuration; // [0, transitionDuration)

        if (transitionT < fadeOutDuration) {
          // Fade out existing field over fadeOutDuration seconds
          const local = transitionT / fadeOutDuration; // 0 -> 1
          alpha = 1 - local;

          // Feather grows with fade-out
          featherFactor = local;
          saturationFactor = local * 0.3; // up to 30% saturation reduction across fade-out

          // Record fade-out phase for fragmentation forces
          fadeOutPhase = local;
        } else {
          // Midpoint: once per cycle, re-randomize positions for a fresh field
          if (!cycleRef.current.hasResetThisCycle || cycleRef.current.lastCycleIndex !== cycleIndex) {
            for (let i = 0; i < positions.length; i += 3) {
              positions[i] = (Math.random() - 0.5) * 5;
              positions[i + 1] = (Math.random() - 0.5) * 3;
              positions[i + 2] = (Math.random() - 0.5) * 2;
            }
            cycleRef.current.hasResetThisCycle = true;
            cycleRef.current.lastCycleIndex = cycleIndex;
          }

          // Fade in new field over fadeInDuration seconds
          const local = (transitionT - fadeOutDuration) / fadeInDuration; // 0 -> 1
          alpha = Math.min(Math.max(local, 0), 1);

          // Feather persists a bit beyond fade-out, then decays back to 0 by featherDuration
          if (transitionT < featherDuration) {
            const tailT = transitionT - fadeOutDuration; // [0, featherDuration - fadeOutDuration)
            const tailSpan = Math.max(featherDuration - fadeOutDuration, 1e-3);
            const k = Math.min(Math.max(tailT / tailSpan, 0), 1); // 0 -> 1 over feather tail
            featherFactor = 1 - k; // starts at 1 at end of fade-out, goes to 0 by featherDuration
          } else {
            featherFactor = 0; // rest of fade-in is sharp
          }

          // During fade-in, gradually restore saturation so there is no lingering darkening
          if (transitionT < featherDuration) {
            // Use the same tailT window to bring saturation back to full color
            const tailT = transitionT - fadeOutDuration;
            const tailSpan = Math.max(featherDuration - fadeOutDuration, 1e-3);
            const k = Math.min(Math.max(tailT / tailSpan, 0), 1); // 0 -> 1
            saturationFactor = (1 - k) * 0.3; // start at 0.3 at end of fade-out, ease to 0
          } else {
            saturationFactor = 0;
          }
        }
      }
    }

    if (materialRef.current) {
      materialRef.current.opacity = alpha;
      materialRef.current.size = baseSize + featherExtraSize * featherFactor;

      // Apply global saturation reduction during fade-out by tinting toward grey
      const satReduction = saturationFactor; // up to 0.15
      const greyFactor = 1 - satReduction;
      materialRef.current.color.setScalar(greyFactor);
    }

    // Reference-style traveling wave field (BackgroundReference)

    // Wave parameters (modulated over time for dynamic behavior)
    const waveAngle = Math.sin(t * 0.15) * 0.8;
    const waveFreqX = 0.35 + Math.cos(waveAngle) * 0.15;
    const waveFreqY = 0.25 + Math.sin(waveAngle) * 0.15;
    const waveSpeed = 0.5;

    for (let i = 0; i < positions.length; i += 3) {
      const x = positions[i];
      const y = positions[i + 1];
      const z = positions[i + 2];

      // Primary and secondary waves to create diagonal, splitting bands
      const wavePhase = x * waveFreqX + y * waveFreqY - t * waveSpeed;
      const waveCrest = Math.sin(wavePhase);

      const wave2Phase = x * 0.28 - y * 0.32 + t * 0.4;
      const wave2Crest = Math.sin(wave2Phase);

      // Add multi-octave noise-based shaping so band configurations stay calm and regular
      const shapeNoise1 = noise4D(x * 0.18, y * 0.16, z * 0.18, t * 0.24); // coarse, even lower frequency
      const shapeNoise2 = noise4D(x * 0.45, y * 0.38, z * 0.42, t * 0.42); // finer, but gentler
      const shaping = shapeNoise1 * 0.26 + shapeNoise2 * 0.18;             // further reduced influence

      const combinedWave = ((waveCrest + wave2Crest * 0.5) / 1.5) + shaping;

      // Attraction toward wave crests (intentional bunching, further softened)
      const targetDensity = 1.0;
      const densityError = targetDensity - combinedWave;
      const attractionStrength = Math.max(0, densityError) * 0.00013;

      const gradientX = -Math.cos(wavePhase) * waveFreqX;
      const gradientY = -Math.cos(wavePhase) * waveFreqY;

      let dx = gradientX * attractionStrength;
      let dy = gradientY * attractionStrength;
      let dz = 0;

      // Turbulent flow within bands (acts as our swirl term)
      const turbulence = noise4D(x * 0.4, y * 0.4, z * 0.4, t * 0.25);
      const turbulenceAngle = turbulence * Math.PI * 2;
      const turbulenceStrength = 0.0032 * (0.8 + 0.4 * combinedWave);

      dx += Math.cos(turbulenceAngle) * turbulenceStrength;
      dy += Math.sin(turbulenceAngle) * turbulenceStrength;
      dz += Math.sin(turbulenceAngle * 0.7) * turbulenceStrength * 0.5;

      // Depth modulation linked to wave phase (reduced amplitude and pull again)
      const depthTarget = Math.sin(wavePhase * 0.5) * 0.45;
      const depthError = depthTarget - z;
      dz += depthError * 0.00065;

      // --- Fizzle-out fragmentation during fade-out ---
      // When fading out, apply a repulsive field that pushes particles away from
      // band centers and outward, increasing sparsity as they disappear.
      if (fadeOutPhase > 0) {
        const repelX = x * 0.4 + gradientX * 0.6;
        const repelY = y * 0.4 + gradientY * 0.6;
        const repelZ = z * 0.4;
        const repelLen = Math.sqrt(repelX * repelX + repelY * repelY + repelZ * repelZ) + 1e-6;

        const repelNX = repelX / repelLen;
        const repelNY = repelY / repelLen;
        const repelNZ = repelZ / repelLen;

        const fragStrength = 0.0024 * fadeOutPhase * (1 + Math.abs(combinedWave));

        dx += repelNX * fragStrength;
        dy += repelNY * fragStrength;
        dz += repelNZ * fragStrength;
      }

      // Ambient drift to prevent stagnation (slightly stronger for more motion)
      const driftAngle = noise4D(x * 0.15, y * 0.15, z * 0.15, t * 0.1) * Math.PI * 2;
      dx += Math.cos(driftAngle) * 0.0009;
      dy += Math.sin(driftAngle) * 0.0009;

      // Global push-pull force: dt-aware adjustment based on current velocity
      // f(dx, dy, dz, dt) in 4D noise space slightly expands/contracts motion
      // Bias magnitude higher in dense regions (|combinedWave| high) to help break up bunching.
      const velLen = Math.sqrt(dx * dx + dy * dy + dz * dz) + 1e-6;
      const globalNoise = noise4D(dx * 40, dy * 40, dz * 40, t * 0.7 + dt * 60);
      const pushPull = globalNoise; // [-1,1]
      const densityBias = 0.6 + 0.8 * Math.abs(combinedWave); // 0.6–1.4, stronger bias in dense ribbons
      const globalMag = 0.0042 * pushPull * densityBias; // K slightly raised again to counter long-term clumping

      const nx = dx / velLen;
      const ny = dy / velLen;
      const nz = dz / velLen;

      dx += nx * globalMag;
      dy += ny * globalMag;
      dz += nz * globalMag;

      // Velocity normalization (kept as a safety cap; slightly tighter than before for more control)
      const vNorm = Math.sqrt(dx * dx + dy * dy + dz * dz) + 1e-6;
      const maxStep = 0.028;
      const scale = Math.min(1, maxStep / vNorm);
      dx *= scale;
      dy *= scale;
      dz *= scale;

      // Update positions
      const nextX = positions[i] + dx;
      const nextY = positions[i + 1] + dy;
      const nextZ = positions[i + 2] + dz;

      if (!Number.isFinite(nextX) || !Number.isFinite(nextY) || !Number.isFinite(nextZ)) {
        resetParticle(i);
        invalidFound = true;
        continue;
      }

      positions[i] = nextX;
      positions[i + 1] = nextY;
      positions[i + 2] = nextZ;

      // Expanded boundary wrapping to match wider field
      if (positions[i] > 4.5) positions[i] = -4.5;
      if (positions[i] < -4.5) positions[i] = 4.5;
      if (positions[i + 1] > 2.5) positions[i + 1] = -2.5;
      if (positions[i + 1] < -2.5) positions[i + 1] = 2.5;
      if (positions[i + 2] > 1.2) positions[i + 2] = -1.2;
      if (positions[i + 2] < -1.2) positions[i + 2] = 1.2;
    }

    geometry.attributes.position.needsUpdate = true;

    if (invalidFound) {
      if (!invalidLogRef.current) {
        console.warn("SwirlParticles: detected invalid positions; resetting affected particles.");
        invalidLogRef.current = true;
      }
    } else if (invalidLogRef.current) {
      invalidLogRef.current = false;
    }
  });

  return (
    <Points ref={ref} positions={positions} stride={3}>
      <PointMaterial
        ref={materialRef}
        transparent
        size={baseSize}
        sizeAttenuation
        depthWrite={false}
        vertexColors
        toneMapped={false}
      />
    </Points>
  );
}

export function BackgroundV1() {
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
            <Bloom intensity={1.8} radius={1.0} luminanceThreshold={0.06} luminanceSmoothing={0.5} />
          </EffectComposer>
        </Canvas>
      </Suspense>
    </div>
  );
}
