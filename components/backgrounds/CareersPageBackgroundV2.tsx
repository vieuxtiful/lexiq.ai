"use client";

import { Suspense, useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useLoader } from "@react-three/fiber";
import { Points, PointMaterial } from "@react-three/drei";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import * as THREE from "three";

import earthColorImage from "@/guidance/earth-blue-marble.jpg";
import earthBumpImage from "@/guidance/earth-topology.png";
import cloudsImage from "@/guidance/clouds.png";

//Color Palette/Color CSS for the Careers Background//
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
// To adjust particle ("star") feather//
type FeatheredPointMaterialProps = {
  size?: number;
  featherStrength?: number;
};

function FeatheredPointMaterial({ size = 0.012, featherStrength = 0.7 }: FeatheredPointMaterialProps) {
  const featherTexture = useMemo(() => {
    if (typeof document === "undefined") return null;

    const dimension = 128;
    const canvas = document.createElement("canvas");
    canvas.width = dimension;
    canvas.height = dimension;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    const center = dimension / 2;
    const radius = dimension / 0.1;
    const softness = THREE.MathUtils.clamp(featherStrength, 0, 1);
    const innerStop = THREE.MathUtils.lerp(0.05, 0.35, 1 - softness);
    const outerStop = THREE.MathUtils.lerp(0.55, 0.95, softness);

    const gradient = ctx.createRadialGradient(center, center, 0, center, center, radius);
    gradient.addColorStop(0, "rgba(255,255,255,1)");
    gradient.addColorStop(innerStop, "rgba(255,255,255,0.6)");
    gradient.addColorStop(outerStop, "rgba(255,255,255,0.15)");
    gradient.addColorStop(1, "rgba(255,255,255,0)");

    ctx.clearRect(0, 0, dimension, dimension);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, dimension, dimension);

    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    texture.magFilter = THREE.LinearFilter;
    texture.minFilter = THREE.LinearMipMapLinearFilter;
    texture.wrapS = THREE.ClampToEdgeWrapping;
    texture.wrapT = THREE.ClampToEdgeWrapping;
    return texture;
  }, [featherStrength]);

  useEffect(() => {
    return () => {
      featherTexture?.dispose();
    };
  }, [featherTexture]);

  return (
    <PointMaterial
      transparent
      size={size}
      sizeAttenuation
      depthWrite={false}
      vertexColors
      toneMapped={false}
      map={featherTexture ?? undefined}
      alphaMap={featherTexture ?? undefined}
    />
  );
}

function CareersParticles() {
  const ref = useRef<THREE.Points>(null);

  const { positions, baseColors, flickerPhases, dynamicColors } = useMemo(() => {
    const count = 1300;
    const positions = new Float32Array(count * 5);
    const baseColors = new Float32Array(count * 5);
    const flickerPhases = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      const index = i * 3;
      positions[index] = (Math.random() - 0.5) * 5.9; //Adjust "horizontal range" for stars on screen//
      positions[index + 1] = (Math.random() - 0.5) * 2.3;
      positions[index + 2] = (Math.random() - 0.5) * 1.5;

      const [r, g, b] = interpolateColor(i / count);
      baseColors[index] = r;
      baseColors[index + 1] = g;
      baseColors[index + 2] = b;

      flickerPhases[i] = Math.random() * Math.PI * 2;
    }

    const dynamicColors = baseColors.slice();

    return { positions, baseColors, flickerPhases, dynamicColors };
  }, []);

  const baseColorsRef = useRef(baseColors);
  const flickerPhasesRef = useRef(flickerPhases);

  const colorAttribute = useMemo(() => new THREE.Float32BufferAttribute(dynamicColors, 3), [dynamicColors]);

  useEffect(() => {
    if (ref.current) {
      ref.current.geometry.setAttribute("color", colorAttribute);
    }
  }, [colorAttribute]);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    const geometry = ref.current?.geometry;
    if (!geometry) return;

    const colorAttr = geometry.getAttribute("color") as THREE.BufferAttribute | undefined;
    if (!colorAttr) {
      return;
    }

    const colorsArr = colorAttr.array as Float32Array;
    const baseArr = baseColorsRef.current;
    const phases = flickerPhasesRef.current;

    for (let i = 0; i < phases.length; i++) {
      const idx = i * 3; // Instance //
      const flicker = 0.19 + Math.sin(t * 1.82 + phases[i]) * 0.282; //Adjust Flicker arguments//
      colorsArr[idx] = baseArr[idx] * flicker;
      colorsArr[idx + 1] = baseArr[idx + 1] * flicker;
      colorsArr[idx + 2] = baseArr[idx + 2] * flicker;
    }

    colorAttr.needsUpdate = true;
  });

  return (
    <Points ref={ref} positions={positions} stride={3}>
      <FeatheredPointMaterial featherStrength={0.72} size={0.012} />
    </Points>
  );
}

type RotatingGlobeProps = {
  groupPosition?: [number, number, number];
  globeScale?: number;
  atmosphereColor?: THREE.ColorRepresentation;
  cloudRotationSpeed?: number;
  eclipseColor?: THREE.ColorRepresentation;
  eclipseCoverage?: number;
  eclipseSoftness?: number;
  eclipsePosition?: [number, number, number];
  eclipseOpacity?: number;
};

function RotatingGlobe({
  groupPosition = [1.73, 1.16, 0],
  globeScale = 0.62,
  atmosphereColor = "#00025aff",
  cloudRotationSpeed,
  eclipseColor = "#01030a",
  eclipseCoverage = 0.2,
  eclipseSoftness = 0.32,
  eclipsePosition = [-9.4, 1.3, 0.2],
  eclipseOpacity = 9.9,
}: RotatingGlobeProps) {
  const groupRef = useRef<THREE.Group>(null);
  const cloudRef = useRef<THREE.Mesh>(null);

  const textures = useLoader(THREE.TextureLoader, [earthColorImage.src, earthBumpImage.src, cloudsImage.src]);
  const [earthTexture, bumpTexture, cloudTexture] = textures;
  earthTexture.colorSpace = THREE.SRGBColorSpace;
  cloudTexture.colorSpace = THREE.SRGBColorSpace;

  const computedCloudSpeed = typeof cloudRotationSpeed === "number" ? cloudRotationSpeed : THREE.MathUtils.degToRad(-0.0025);

  const sphereArgs = useMemo(() => [1.3, 128, 128] as const, []);
  const cloudArgs = useMemo(() => [1.239 * (1 + 0.05), 96, 96] as const, []);
  const atmosphereArgs = useMemo(() => [1.0169 * 1.28116, 64, 64] as const, []);

  const eclipseMaterial = useMemo(() => {
    const material = new THREE.ShaderMaterial({
      uniforms: {
        uColor: { value: new THREE.Color(eclipseColor) },
        uDirection: { value: new THREE.Vector3(0, -1, 0) },
        uCoverage: { value: 0 },
        uSoftness: { value: 0.3 },
        uOpacity: { value: 1 },
      },
      vertexShader: `varying vec3 vWorldNormal; void main() { vWorldNormal = normalize(mat3(modelMatrix) * normal); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
      fragmentShader: `varying vec3 vWorldNormal; uniform vec3 uColor; uniform vec3 uDirection; uniform float uCoverage; uniform float uSoftness; uniform float uOpacity; void main() { float coverage = clamp(uCoverage, 0.0, 1.0); if (coverage <= 0.0001) { discard; } vec3 dir = normalize(uDirection); float shadeDot = clamp(dot(normalize(vWorldNormal), dir), -1.0, 1.0); float normalizedAngle = acos(shadeDot) / 3.14159265; float softness = clamp(uSoftness, 0.0001, 1.0); float halfSoft = softness * 0.5; float edge = clamp(coverage, 0.0, 1.0); float falloffStart = max(edge - halfSoft, 0.0); float falloffEnd = min(edge + halfSoft, 1.0); float mask = 1.0 - smoothstep(falloffStart, falloffEnd, normalizedAngle); float alpha = mask * coverage * clamp(uOpacity, 0.0, 1.0); if (alpha <= 0.0001) { discard; } gl_FragColor = vec4(uColor, alpha); }`,
      transparent: true,
      depthWrite: false,
      polygonOffset: true,
      polygonOffsetFactor: -1,
      polygonOffsetUnits: -1,
      side: THREE.FrontSide,
      blending: THREE.CustomBlending,
      blendSrc: THREE.SrcAlphaFactor,
      blendDst: THREE.OneMinusSrcAlphaFactor,
      blendEquation: THREE.AddEquation,
    });
    material.premultipliedAlpha = true;
    return material;
  }, []);

  useEffect(() => {
    const direction = new THREE.Vector3().fromArray(eclipsePosition);
    if (direction.lengthSq() < 1e-6) {
      direction.set(0, -1, 0);
    }
    direction.normalize();

    const coverageValue = THREE.MathUtils.clamp(eclipseCoverage, 0, 1);
    const softnessValue = THREE.MathUtils.clamp(eclipseSoftness, 0.0001, 1);

    eclipseMaterial.uniforms.uColor.value.set(eclipseColor as THREE.ColorRepresentation);
    eclipseMaterial.uniforms.uDirection.value.copy(direction);
    eclipseMaterial.uniforms.uCoverage.value = coverageValue;
    eclipseMaterial.uniforms.uSoftness.value = softnessValue;
    eclipseMaterial.uniforms.uOpacity.value = THREE.MathUtils.clamp(eclipseOpacity, 0, 1);
  }, [eclipseMaterial, eclipseColor, eclipseCoverage, eclipsePosition, eclipseSoftness, eclipseOpacity]);

  useEffect(() => () => {
    eclipseMaterial.dispose();
  }, [eclipseMaterial]);

  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.0065; //standard rotation speed: 0.0065//
    }

    if (cloudRef.current) {
      cloudRef.current.rotation.y += computedCloudSpeed;
    }
  });

  return (
    <group ref={groupRef} position={groupPosition} scale={globeScale}>
      <mesh castShadow receiveShadow>
        <sphereGeometry args={sphereArgs} />
        <meshPhongMaterial
          map={earthTexture}
          bumpMap={bumpTexture}
          bumpScale={0.2}
          shininess={97}
          emissive="#f7faffff"
          emissiveIntensity={4}
          specular={new THREE.Color("#ffffffff")}
        />
      </mesh>

      <mesh ref={cloudRef}>
        <sphereGeometry args={cloudArgs} />
        <meshPhongMaterial map={cloudTexture} transparent opacity={0.8} depthWrite={false} />
      </mesh>

      <mesh>
        <sphereGeometry args={atmosphereArgs} />
        <meshBasicMaterial
          color={atmosphereColor}
          transparent
          opacity={0.004} //standard: 0.89// //Globe Outline//
          side={THREE.BackSide}
          blending={THREE.NormalBlending}
        />
      </mesh>
      {eclipseCoverage > 0.001 && (
        <mesh scale={[1.002, 1.002, 1.002]}>
          <sphereGeometry args={sphereArgs} />
          <primitive object={eclipseMaterial} attach="material" />
        </mesh>
      )}
    </group>
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
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,_rgba(0,160,233,0.18),_transparent_60%)]" aria-hidden />
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
          <directionalLight position={[-3.2, 0.1, 6.9]} intensity={0.012} color="#38bdf8" /> //position={[-2.1, 0.2, 7]}//
          <CareersParticles />
          <RotatingGlobe
            groupPosition={[-0.23, -0.29, 1.33]} // z = 1.7//
            globeScale={0.6}
            atmosphereColor="#000e31ff"
            cloudRotationSpeed={THREE.MathUtils.degToRad(0.00012)} //Cloud Rotation Speed//
            eclipseColor="#020617"
            eclipsePosition={[-0.1, -1.0, 0.2]} // set x/y/z to steer the eclipse
            eclipseCoverage={0.15} // 0-1 range for obscured area
            eclipseSoftness={0.35}
            eclipseOpacity={1.0}
          />
          <EffectComposer multisampling={4}>
            <Bloom intensity={1.5} radius={0.95} luminanceThreshold={0.08} luminanceSmoothing={0.45} />
          </EffectComposer>
        </Canvas>
      </Suspense>
    </div>
  );
}
