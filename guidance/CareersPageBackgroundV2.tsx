"use client";

import { Suspense, useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";

import { Points, PointMaterial, Text } from "@react-three/drei";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import { createNoise4D } from "simplex-noise";
import * as THREE from "three";
import { DottedWorldMapEnhanced } from "./DottedWorldMapEnhanced";

const gradientColors = [
  "#0065ab",
  "#0067af",
  "#006ab3",
  "#006db7",
  "#0070bb",
  "#0075c2",
  "#0079c7",
  "#007fce",
  "#0085d5",
  "#008bdb",
  "#0092e1",
  "#0098e6",
  "#009ce8",
  "#00a0e9",
  "#00a2e5",
  "#00a5dd",
  "#00a9d3",
  "#00accc",
  "#00afc4",
  "#00b1ba",
  "#00b3b0",
  "#00b1a1",
  "#00af92",
  "#00ad84",
  "#00ab76",
  "#00a769",
  "#00a35e",
  "#009f54",
  "#009b4b",
  "#009745",
  "#009441",
  "#00914d",
  "#00905b",
  "#008f69",
  "#008f76",
  "#009082",
  "#00938e",
  "#00969a",
  "#009aa4",
  "#009fae",
  "#00a4b7",
  "#00a9bf",
  "#00aec6",
  "#00b2cc",
  "#00b6d1",
  "#00b9d6",
  "#00bcd9",
  "#00bfdd",
  "#00c2e0",
  "#00c4e3",
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

const glyphRegions = [
  { label: "Germany", glyph: "ß" },
  { label: "France", glyph: "è" },
  { label: "Czechia", glyph: "š" },
  { label: "Poland", glyph: "ł" },
  { label: "Japan", glyph: "あ" },
  { label: "India", glyph: "क्ष" },
  { label: "Oceania", glyph: "ā" },
  { label: "Mexico", glyph: "ó" },
  { label: "Brazil", glyph: "ã" },
  { label: "Greece", glyph: "Ω" },
];

function CareersParticles() {
  const noise4D = useMemo(() => createNoise4D(), []);
  const ref = useRef<THREE.Points>(null);

  const { positions, colors } = useMemo(() => {
    const count = 6500;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      const index = i * 3;
      positions[index] = (Math.random() - 0.5) * 4.2;
      positions[index + 1] = (Math.random() - 0.5) * 2.3;
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

    const positionsArr = geometry.attributes.position.array as Float32Array;

    for (let i = 0; i < positionsArr.length; i += 3) {
      const x = positionsArr[i];
      const y = positionsArr[i + 1];
      const z = positionsArr[i + 2];

      const bandPhase = x * 0.32 - y * 0.19 + Math.sin(z * 0.33 + t * 0.35) * 0.2 - t * 0.45;
      const crest = Math.sin(bandPhase);

      const gradientX = -Math.cos(bandPhase) * 0.28;
      const gradientY = Math.cos(bandPhase) * 0.18;

      let dx = gradientX * 0.0007 * (1 + crest * 0.4);
      let dy = gradientY * 0.0007 * (1 + crest * 0.4);
      let dz = 0;

      const swirl = noise4D(x * 0.3, y * 0.3, z * 0.3, t * 0.2);
      const swirlAngle = swirl * Math.PI * 2;
      const swirlStrength = 0.0019 * (1 + crest * 0.3);
      dx += Math.cos(swirlAngle) * swirlStrength;
      dy += Math.sin(swirlAngle) * swirlStrength;
      dz += Math.sin(swirlAngle * 0.6) * swirlStrength * 0.4;

      const depthTarget = Math.cos(bandPhase * 0.5) * 0.6;
      dz += (depthTarget - z) * 0.0007;

      const driftAngle = noise4D(x * 0.14, y * 0.14, z * 0.14, t * 0.1) * Math.PI * 2;
      dx += Math.cos(driftAngle) * 0.00045;
      dy += Math.sin(driftAngle) * 0.00045;

      const maxStep = 0.018;
      const vNorm = Math.sqrt(dx * dx + dy * dy + dz * dz) + 1e-6;
      const scale = Math.min(1, maxStep / vNorm);
      dx *= scale;
      dy *= scale;
      dz *= scale;

      positionsArr[i] += dx;
      positionsArr[i + 1] += dy;
      positionsArr[i + 2] += dz;

      if (positionsArr[i] > 4.1) positionsArr[i] = -4.1;
      if (positionsArr[i] < -4.1) positionsArr[i] = 4.1;
      if (positionsArr[i + 1] > 2.1) positionsArr[i + 1] = -2.1;
      if (positionsArr[i + 1] < -2.1) positionsArr[i + 1] = 2.1;
      if (positionsArr[i + 2] > 1.1) positionsArr[i + 2] = -1.1;
      if (positionsArr[i + 2] < -1.1) positionsArr[i + 2] = 1.1;
    }

    geometry.attributes.position.needsUpdate = true;
  });

  return (
    <Points ref={ref} positions={positions} stride={3}>
      <PointMaterial
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

function CareersGlobeWithGlyphs() {
  const glyphRef = useRef<any>(null);
  const glyphOrbitRef = useRef<THREE.Group>(null);

  const spinAngleRef = useRef(0);
  const lastRevIndexRef = useRef(0);
  const visibleGlyphIndexRef = useRef(0);
  const { camera } = useThree();

  useFrame((_, delta) => {
    const spinSpeed = 0.45;
    const prevAngle = spinAngleRef.current;

    const nextAngle = prevAngle + spinSpeed * delta;
    spinAngleRef.current = nextAngle;

    const prevRev = Math.floor(prevAngle / (Math.PI * 2));
    const nextRev = Math.floor(nextAngle / (Math.PI * 2));

    if (nextRev > prevRev) {
      const nextIndex = (visibleGlyphIndexRef.current + 1) % glyphRegions.length;
      visibleGlyphIndexRef.current = nextIndex;
      lastRevIndexRef.current = nextRev;
    }

    if (glyphRef.current) {
      const region = glyphRegions[visibleGlyphIndexRef.current];
      if (region) {
        glyphRef.current.text = region.glyph;
      }
    }

    const fullRotation = Math.PI * 2;
    const normalizedAngle = ((spinAngleRef.current % fullRotation) + fullRotation) % fullRotation;
    const signedFrontAngle = ((normalizedAngle + Math.PI) % fullRotation) - Math.PI;
    const frontVisible = signedFrontAngle > -Math.PI / 2 && signedFrontAngle < Math.PI / 2;

    if (glyphOrbitRef.current && glyphRef.current) {
      if (frontVisible) {
        const arcRadius = 1.12;
        const arcAngle = signedFrontAngle;
        const x = Math.sin(arcAngle) * arcRadius;
        const z = Math.cos(arcAngle) * arcRadius;
        const lift = Math.sin((arcAngle + Math.PI / 2) / Math.PI * Math.PI) * 0.04;

        glyphOrbitRef.current.position.set(x, lift * 0.5, z);
        glyphOrbitRef.current.visible = true;

        glyphRef.current.quaternion.copy(camera.quaternion);
        glyphRef.current.scale.setScalar(0.45 + Math.sin((arcAngle + Math.PI / 2) / Math.PI * Math.PI) * 0.1);
      } else {
        glyphOrbitRef.current.visible = false;
      }
    }
  });

  return (
    <>
      {/* Glyph sprite that rides the front of the globe */}
      <group ref={glyphOrbitRef} position={[0.73, 0.16, 0]}>
        <Text
          ref={glyphRef}
          position={[0, 0, 0]}
          fontSize={0.4}
          color="#e5f6ff"
          anchorX="center"
          anchorY="middle"
          outlineColor="#0ea5e9"
          outlineWidth={0.012}
        >
          {glyphRegions[0].glyph}
        </Text>
      </group>
    </>
  );
}

export function CareersPageBackgroundV2() {
  return (
    <div
      className="pointer-events-none fixed inset-0 -z-10"
      style={{
        background:
          "linear-gradient(135deg, #020617 0%, #031029 25%, #041a3c 50%, #052440 65%, #093a52 100%)",
      }}
    >
      <div
        className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,_rgba(0,160,233,0.18),_transparent_60%)]"
        aria-hidden
      />
      <Suspense fallback={null}>
        <Canvas
          camera={{ position: [0.4, 0.1, 2.6], fov: 58 }}
          dpr={[1, 1.6]}
          gl={{ antialias: true }}
          frameloop="always"
          style={{ width: "100%", height: "100%" }}
        >
          <color attach="background" args={["#01030a"]} />
          <ambientLight intensity={0.18} />
          <directionalLight
            position={[-2, 2.5, 2]}
            intensity={1.2}
            color="#38bdf8"
          />
          
          {/* Dotted World Map Globe */}
          <DottedWorldMapEnhanced
            radius={0.85}
            dotDensity={2.5}
            dotSize={0.012}
            autoRotate={true}
            rotationSpeed={0.45}
            position={[0.73, 0.16, 0]}
            showGlow={true}
          />
          
          {/* Glyphs */}
          <CareersGlobeWithGlyphs />
          
          {/* Background particles */}
          <CareersParticles />
          
          <EffectComposer multisampling={4}>
            <Bloom
              intensity={1.5}
              radius={0.95}
              luminanceThreshold={0.08}
              luminanceSmoothing={0.45}
            />
          </EffectComposer>
        </Canvas>
      </Suspense>
    </div>
  );
}
