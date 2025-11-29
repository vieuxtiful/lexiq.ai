"use client";

import { Suspense, useRef } from "react";
import { Canvas } from "@react-three/fiber";
import { EffectComposer, Bloom, ChromaticAberration, DepthOfField, Glitch, GodRays } from "@react-three/postprocessing";
import { BlendFunction, GlitchMode } from "postprocessing";
import * as THREE from "three";

import { FloatingUIElements } from "./FloatingUIElements";
import { ParallaxGrid } from "./ParallaxGrid";
import { VolumetricLights } from "./VolumetricLights";
import { CameraController } from "./CameraController";

const originalComputeBoundingSphere = THREE.BufferGeometry.prototype.computeBoundingSphere;
THREE.BufferGeometry.prototype.computeBoundingSphere = function computeBoundingSphereShim() {
  originalComputeBoundingSphere.call(this);
  if (!this.boundingSphere || Number.isNaN(this.boundingSphere.radius)) {
    console.warn("NaN bounding sphere on geometry:", this);
  }
};

interface HyperDigitalCareersBackgroundProps {
  enableCameraAnimation?: boolean;
  debug?: boolean;
  particleDensity?: number;
  uiElementCount?: number;
}

export function HyperDigitalCareersBackground({
  enableCameraAnimation = true,
  debug = false,
  particleDensity = 3.5,
  uiElementCount = 12,
}: HyperDigitalCareersBackgroundProps) {
  const sunRef = useRef<THREE.Mesh>(null!);

  return (
    <div
      className="pointer-events-none fixed inset-0 -z-10"
      style={{
        background: "linear-gradient(135deg, #000510 0%, #001a33 50%, #002244 100%)",
      }}
    >
      <div
        className="absolute inset-0 bg-[radial-gradient(circle_at_80%_50%,_rgba(0,229,255,0.08),_transparent_60%)]"
        aria-hidden
      />

      <Suspense fallback={null}>
        <Canvas
          camera={{
            position: [0, 0, 5],
            fov: 60,
            near: 0.1,
            far: 100,
          }}
          dpr={[1, 2]}
          gl={{
            antialias: true,
            alpha: false,
            powerPreference: "high-performance",
          }}
          frameloop="always"
          style={{ width: "100%", height: "100%" }}
        >
          <color attach="background" args={["#000510"]} />
          <fog attach="fog" args={["#000510", 5, 20]} />

          <CameraController enabled={enableCameraAnimation} speed={1} />
          <VolumetricLights debug={debug} />

          <ParallaxGrid size={20} divisions={40} position={[0, -2, -5]} color="#00E5FF" />

          <FloatingUIElements count={uiElementCount} />

          <mesh ref={sunRef} position={[-4, 3.5, -12]}>
            <sphereGeometry args={[1.8, 32, 32]} />
            <meshBasicMaterial color="#00E5FF" transparent opacity={0.6} toneMapped={false} />
          </mesh>

          <EffectComposer multisampling={4}>
            <Bloom intensity={2.35} luminanceThreshold={0.18} luminanceSmoothing={0.75} radius={1.15} mipmapBlur />
            <GodRays
              sun={sunRef}
              samples={60}
              density={0.92}
              decay={0.96}
              exposure={0.7}
              clampMax={1}
              weight={0.5}
            />
            <DepthOfField focusDistance={0.015} focalLength={0.02} bokehScale={2.5} height={720} />
            <Glitch
              delay={new THREE.Vector2(1.5, 3.5)}
              duration={new THREE.Vector2(0.15, 0.35)}
              strength={new THREE.Vector2(0.02, 0.08)}
              mode={GlitchMode.CONSTANT_MILD}
              ratio={0.9}
            />
            <ChromaticAberration
              blendFunction={BlendFunction.NORMAL}
              offset={new THREE.Vector2(0.001, 0.001)}
            />
          </EffectComposer>

          {debug && (
            <>
              <axesHelper args={[5]} />
              <gridHelper args={[10, 10]} />
            </>
          )}
        </Canvas>
      </Suspense>
    </div>
  );
}
