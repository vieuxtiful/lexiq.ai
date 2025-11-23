"use client";

import React, { useEffect, useRef, useState } from "react";

import type { WaveSurfaceProps } from "./WaveSurface";

interface WavePoint {
  x: number;
  y: number;
  z: number;
}

export function CarbonWaveSurface({
  width = 180,
  height = 48,
  fill = 0.935,
  segments = 80,
  zBias = 0.5,
  className,
}: WaveSurfaceProps) {
  const [points, setPoints] = useState<WavePoint[]>([]);
  const [avgDepth, setAvgDepth] = useState(0.5);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    let isMounted = true;
    let lastTime = performance.now();

    const loop = (now: number) => {
      if (!isMounted) return;

      lastTime = now;
      const t = now / 1000;
      const pts: WavePoint[] = [];

      const W = width;
      const H = height;
      const baseY = H * (1 - fill);

      let zSum = 0;

      for (let i = 0; i <= segments; i++) {
        const u = i / segments;
        const x = u * W;

        const depthCalm = 0.38;
        const zDeviation =
          0.25 * Math.sin(2 * Math.PI * u + 0.5 * t + zBias * 0.7) +
          0.15 * Math.sin(3 * Math.PI * u - 0.8 * t + zBias * 1.1);
        const z_i = 0.5 + depthCalm * zDeviation;
        const zNorm = Math.max(0, Math.min(1, z_i));

        const w1 = Math.PI * 4;
        const w2 = Math.PI * 6;
        const w3 = Math.PI * 8;

        const phase1 = 2 * t + 1.5 * zNorm;
        const phase2 = -1.5 * t + 2.0 * zNorm;
        const phase3 = 3 * t + 2.5 * zNorm;

        const baseAmp1 = H * 0.1;
        const baseAmp2 = H * 0.05;
        const baseAmp3 = H * 0.025;
        const tideScale = 0.35;

        const A1 = baseAmp1 * (1 + 0.5 * zNorm) * tideScale;
        const A2 = baseAmp2 * (1 + 0.4 * zNorm) * tideScale;
        const A3 = baseAmp3 * (1 + 0.3 * zNorm) * tideScale;

        const wave1 = Math.sin(u * w1 + phase1) * A1;
        const wave2 = Math.sin(u * w2 + phase2) * A2;
        const wave3 = Math.sin(u * w3 + phase3) * A3;

        let y = baseY + wave1 + wave2 + wave3;
        if (y < 0) y = 0;
        if (y > H) y = H;

        pts.push({ x, y, z: zNorm });
        zSum += zNorm;
      }

      if (isMounted) {
        setPoints(pts);
        setAvgDepth(zSum / (segments + 1));
      }

      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);

    return () => {
      isMounted = false;
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    };
  }, [width, height, fill, segments, zBias]);

  const surfacePath = React.useMemo(() => {
    if (!points.length) return "";

    const topPoints = points.map((p) => `${p.x},${p.y}`).join(" ");
    const last = points[points.length - 1];
    const first = points[0];

    const bottomY = height + 4;
    const bottomRight = `${last.x},${bottomY}`;
    const bottomLeft = `${first.x},${bottomY}`;

    return `${topPoints} ${bottomRight} ${bottomLeft}`;
  }, [points, height]);

  const zAvg = avgDepth;
  const sigmaMin = 1.0;
  const sigmaMax = 4.0;
  const baseSigma = sigmaMin + (sigmaMax - sigmaMin) * zAvg;

  let extraBlurFactor = 0;
  if (points.length) {
    const topY = points.reduce((acc, p) => (p.y < acc ? p.y : acc), points[0].y);
    const topNorm = topY / height;
    const threshold = 0.1;
    if (topNorm <= threshold) {
      const t = 1 - topNorm / threshold;
      extraBlurFactor = 0.25 * t;
    }
  }

  const sigma = baseSigma * (1 + extraBlurFactor);
  const glowAlpha = 0.4 + 0.4 * zAvg;

  return (
    <svg
      className={className}
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
      aria-hidden
    >
      <defs>
        <linearGradient id="carbon-wave-liquid-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#06b6d4" stopOpacity="1" />
          <stop offset="50%" stopColor="#0e7490" stopOpacity="1" />
          <stop offset="100%" stopColor="#18d2c1" stopOpacity="1" />
        </linearGradient>

        <linearGradient id="carbon-wave-liquid-shimmer" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="rgba(255,255,255,0)" />
          <stop offset="40%" stopColor="rgba(255,255,255,0.25)" />
          <stop offset="60%" stopColor="rgba(255,255,255,0)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0.25)" />
        </linearGradient>

        <filter id="carbon-wave-liquid-glow" x="-20%" y="-40%" width="140%" height="180%">
          <feGaussianBlur in="SourceGraphic" stdDeviation={sigma} result="blur" />
        </filter>

        <linearGradient id="carbon-wave-liquid-combined" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#07c0de" stopOpacity="0.95" />
          <stop offset="40%" stopColor="#0aaed2" stopOpacity="0.95" />
          <stop offset="75%" stopColor="#16cbbf" stopOpacity="0.92" />
          <stop offset="100%" stopColor="#18d2c1" stopOpacity="0.9" />
        </linearGradient>
      </defs>

      {surfacePath && (
        <polygon
          points={surfacePath}
          fill="url(#carbon-wave-liquid-fill)"
          opacity={glowAlpha}
          filter="url(#carbon-wave-liquid-glow)"
        />
      )}

      {surfacePath && (
        <polygon points={surfacePath} fill="url(#carbon-wave-liquid-combined)" opacity="1" />
      )}

      {surfacePath && (
        <polygon points={surfacePath} fill="url(#carbon-wave-liquid-shimmer)" opacity={0.3} />
      )}

      {points.length > 1 && (
        <polyline
          points={points.map((p) => `${p.x},${p.y}`).join(" ")}
          fill="none"
          stroke="rgba(255,255,255,0.6)"
          strokeWidth={1.2}
        />
      )}
    </svg>
  );
}
