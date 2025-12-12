"use client";

import { useEffect, useRef } from "react";
import { Color, Mesh, Program, Renderer, Triangle } from "ogl";

const VERT = `
attribute vec2 position;
varying vec2 vUv;

void main() {
  // OGL's Triangle provides a clip-space position attribute.
  // Convert it to UV space (0..1) for convenience in the fragment.
  vUv = position * 0.5 + 0.5;
  gl_Position = vec4(position, 0.0, 1.0);
}
`;

const FRAG = `
precision highp float;

uniform float uTime;
uniform float uAmplitude;
uniform vec3 uColorStops[3];
uniform vec2 uResolution;
uniform float uBlend;
uniform float uOverlayStrength;
uniform float uOpacity;
uniform float uUseGradientMask;

varying vec2 vUv;

vec3 permute(vec3 x) {
  return mod(((x * 34.0) + 1.0) * x, 289.0);
}

float snoise(vec2 v){
  const vec4 C = vec4(
      0.211324865405187, 0.366025403784439,
      -0.577350269189626, 0.024390243902439
  );
  vec2 i  = floor(v + dot(v, C.yy));
  vec2 x0 = v - i + dot(i, C.xx);
  vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod(i, 289.0);

  vec3 p = permute(
      permute(i.y + vec3(0.0, i1.y, 1.0))
    + i.x + vec3(0.0, i1.x, 1.0)
  );

  vec3 m = max(
      0.5 - vec3(
          dot(x0, x0),
          dot(x12.xy, x12.xy),
          dot(x12.zw, x12.zw)
      ),
      0.0
  );
  m = m * m;
  m = m * m;

  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h);

  vec3 g;
  g.x  = a0.x  * x0.x  + h.x  * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}

float saturate(float x) { return clamp(x, 0.0, 1.0); }

// Match the existing MainPage gradient overlay (linear-gradient(to left, ...))
// so the aurora reads as an "additional overlay" in the darker regions.
float gradientMask(vec2 uv) {
  // CSS: to left means 0% at right edge, 100% at left edge.
  float t = 1.0 - uv.x;

  // Stops: 0.00->0.15 : 0.0 -> 0.25
  float m0 = mix(0.0, 0.25, saturate((t - 0.00) / (0.15 - 0.00)));
  // Stops: 0.15->0.35 : 0.25 -> 0.9
  float m1 = mix(0.25, 0.9, saturate((t - 0.15) / (0.35 - 0.15)));
  // Stops: 0.35->0.55 : 0.9 -> 1.0
  float m2 = mix(0.9, 1.0, saturate((t - 0.35) / (0.55 - 0.35)));

  float a = 0.0;
  a = mix(m0, m1, step(0.15, t));
  a = mix(a, m2, step(0.35, t));
  a = mix(a, 1.0, step(0.55, t));
  return saturate(a);
}

vec3 rampColor3(vec3 c0, vec3 c1, vec3 c2, float x) {
  // Three-stop ramp: c0@0.0, c1@0.5, c2@1.0
  float t0 = saturate(x * 2.0);
  float t1 = saturate((x - 0.5) * 2.0);
  vec3 a = mix(c0, c1, t0);
  vec3 b = mix(c1, c2, t1);
  return mix(a, b, step(0.5, x));
}

void main() {
  vec2 uv = vUv;

  vec3 ramp = rampColor3(uColorStops[0], uColorStops[1], uColorStops[2], uv.x);

  // Height field / intensity
  float height = snoise(vec2(uv.x * 2.0 + uTime * 0.1, uTime * 0.25)) * 0.5 * uAmplitude;
  height = exp(height);
  height = (uv.y * 2.0 - height + 0.2);
  float intensity = 0.6 * height;

  float midPoint = 0.20;
  float auroraAlpha = smoothstep(midPoint - uBlend * 0.5, midPoint + uBlend * 0.5, intensity);

  // Apply the same left/right legibility gradient as a mask so the aurora reads as
  // a subtle overlay in the darker side (Option A).
  float mask = mix(1.0, gradientMask(uv), uUseGradientMask);
  auroraAlpha *= mask * uOverlayStrength * uOpacity;

  vec3 auroraColor = intensity * ramp;

  // Premultiplied alpha output (matches the GL blendFunc we set in JS).
  gl_FragColor = vec4(auroraColor * auroraAlpha, auroraAlpha);
}
`;

export interface AuroraOverlayProps {
  className?: string;
  colorStops?: [string, string, string];
  amplitude?: number;
  blend?: number;
  speed?: number;
  overlayStrength?: number;
  useGradientMask?: boolean;
}

export default function AuroraOverlay({
  className,
  colorStops = ["#00c9bfff", "#7cff67", "#007fd3ff"], 
  amplitude = 0.3,
  blend = 1.0,
  speed = 0.3,
  overlayStrength = 0.15,
  useGradientMask = true,
}: AuroraOverlayProps) {
  // Store latest props in a ref so the RAF loop doesn't need to restart on every prop change.
  const propsRef = useRef({ colorStops, amplitude, blend, speed, overlayStrength, useGradientMask });
  propsRef.current = { colorStops, amplitude, blend, speed, overlayStrength, useGradientMask };

  // Container div that owns the WebGL canvas.
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const ctn = containerRef.current;
    if (!ctn) return;

    // Create a dedicated renderer for the overlay.
    // We keep it isolated from the Mosaic renderer so it can't interfere with that pipeline.
    const renderer = new Renderer({
      alpha: true,
      premultipliedAlpha: true,
      antialias: true,
    });

    const gl = renderer.gl;

    // Transparent clear + premultiplied blending.
    gl.clearColor(0, 0, 0, 0);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

    // Treat as a pure overlay layer.
    gl.canvas.style.position = "absolute";
    gl.canvas.style.inset = "0";
    gl.canvas.style.width = "100%";
    gl.canvas.style.height = "100%";
    gl.canvas.style.pointerEvents = "none";
    gl.canvas.style.backgroundColor = "transparent";

    // Ensure the container is a positioning context for the absolute canvas.
    // IMPORTANT: `className` is expected to provide `fixed inset-0` on Main.
    // We must not clobber that by writing an inline `position: relative`.
    const computedPosition = window.getComputedStyle(ctn).position;
    if (computedPosition === "static") {
      ctn.style.position = "relative";
    }

    // Clear any children and mount the canvas.
    while (ctn.firstChild) ctn.removeChild(ctn.firstChild);
    ctn.appendChild(gl.canvas);

    const geometry = new Triangle(gl);
    // We compute vUv from position, so we don't need OGL's uv attribute.
    if ((geometry as any).attributes?.uv) {
      delete (geometry as any).attributes.uv;
    }

    const normalizeHexForOglColor = (value: string) => {
      // OGL's Color parser does not reliably handle 8-digit hex (#RRGGBBAA).
      // For our purposes the alpha channel is controlled separately by the shader,
      // so we safely drop it and keep RGB.
      const v = (value || "").trim();
      if (v.startsWith("#") && v.length === 9) return v.slice(0, 7);
      return v;
    };

    const toStopVec3 = (hex: string) => {
      const c = new Color(normalizeHexForOglColor(hex));
      return [c.r, c.g, c.b];
    };

    const program = new Program(gl, {
      vertex: VERT,
      fragment: FRAG,
      uniforms: {
        uTime: { value: 0 },
        uAmplitude: { value: amplitude },
        uColorStops: { value: colorStops.map(toStopVec3) },
        uResolution: { value: [1, 1] },
        uBlend: { value: blend },
        uOverlayStrength: { value: overlayStrength },
        uOpacity: { value: 1 },
        uUseGradientMask: { value: useGradientMask ? 1 : 0 },
      },
      transparent: true,
    });

    const mesh = new Mesh(gl, { geometry, program });

    const resize = () => {
      const rect = ctn.getBoundingClientRect();
      const w = rect.width;
      const h = rect.height;
      if (!w || !h) return;
      renderer.setSize(w, h);
      program.uniforms.uResolution.value = [w, h];
    };

    const ro = new ResizeObserver(resize);
    ro.observe(ctn);
    resize();

    let raf = 0;

    type Phase = "fadeIn" | "hold" | "fadeOut";
    const randRange = (min: number, max: number) => min + Math.random() * (max - min);
    const clamp = (x: number, min: number, max: number) => Math.max(min, Math.min(max, x));

    let phase: Phase = "fadeIn";
    let phaseStart = 0;
    let phaseEnd = 0;
    let fadeInDur = 1;
    let holdDur = 2;
    const fadeOutDur = 3;

    const startNewCycle = (nowSec: number) => {
      const visibleTotal = randRange(2, 5);
      fadeInDur = clamp(visibleTotal * 0.35, 0.5, 1.5);
      holdDur = Math.max(0, visibleTotal - fadeInDur);
      phase = "fadeIn";
      phaseStart = nowSec;
      phaseEnd = nowSec + fadeInDur;
    };

    const advancePhase = (nowSec: number) => {
      if (phase === "fadeIn") {
        phase = "hold";
        phaseStart = nowSec;
        phaseEnd = nowSec + holdDur;
        return;
      }

      if (phase === "hold") {
        phase = "fadeOut";
        phaseStart = nowSec;
        phaseEnd = nowSec + fadeOutDur;
        return;
      }

      startNewCycle(nowSec);
    };

    const tick = (t: number) => {
      raf = requestAnimationFrame(tick);

      const p = propsRef.current;

      const nowSec = t * 0.001;
      if (phaseEnd === 0) startNewCycle(nowSec);
      while (nowSec >= phaseEnd) advancePhase(nowSec);

      let opacity = 0;
      if (phase === "fadeIn") {
        const k = (nowSec - phaseStart) / fadeInDur;
        opacity = clamp(k, 0, 1);
      } else if (phase === "hold") {
        opacity = 1;
      } else {
        const k = (nowSec - phaseStart) / fadeOutDur;
        opacity = 1 - clamp(k, 0, 1);
      }

      // Time is scaled down to keep the flow slow/subtle.
      program.uniforms.uTime.value = nowSec * p.speed;
      program.uniforms.uAmplitude.value = p.amplitude;
      program.uniforms.uBlend.value = p.blend;
      program.uniforms.uOverlayStrength.value = p.overlayStrength;
      program.uniforms.uColorStops.value = p.colorStops.map(toStopVec3);
      program.uniforms.uOpacity.value = opacity;
      program.uniforms.uUseGradientMask.value = p.useGradientMask ? 1 : 0;

      renderer.render({ scene: mesh });
    };

    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();

      if (gl.canvas.parentElement === ctn) ctn.removeChild(gl.canvas);
      gl.getExtension("WEBGL_lose_context")?.loseContext();
    };
  }, []);

  // The parent (mainpage.tsx) should position this with fixed/inset/z-index.
  return <div ref={containerRef} className={className} data-aurora-overlay="true" />;
}
