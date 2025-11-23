"use client";

import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { EffectComposer, Bloom, ChromaticAberration } from "@react-three/postprocessing";
import { BlendFunction } from "postprocessing";
import * as THREE from "three";

import { ParticleWorldMap } from "./ParticleWorldMap";
import { FloatingUIElements } from "./FloatingUIElements";
import { ParallaxGrid } from "./ParallaxGrid";
import { VolumetricLights } from "./VolumetricLights";
import { CameraController } from "./CameraController";

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

          <ParticleWorldMap dotDensity={particleDensity} position={[0, 0, 0]} scale={2.5} />
          <FloatingUIElements count={uiElementCount} />

          <EffectComposer multisampling={4}>
            <Bloom intensity={1.8} luminanceThreshold={0.2} luminanceSmoothing={0.9} radius={0.85} mipmapBlur />
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
