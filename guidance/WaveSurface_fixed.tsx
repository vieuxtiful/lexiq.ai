"use client";

import React, { useEffect, useRef, useState } from "react";

/**
 * WaveSurface
 *
 * A small SVG-based liquid surface, inspired by the WaveformQAButton docs.
 *
 * - Fixed fill level ("fill") expressed as a fraction [0,1] of the container height.
 *   For this CTA context, the default is 0.55 (55% full).
 * - Multi-layered sine waves define the surface shape:
 *   y(x, t) = baseY + wave1(x, t, z_i) + wave2(x, t, z_i) + wave3(x, t, z_i)
 * - z_i is a per-point pseudo-depth used to modulate amplitude, phase, and glow strength.
 * - A vertical gradient fill, shimmer overlay, highlight stroke, and glow filter create 3D depth.
 */

export interface WaveSurfaceProps {
  width?: number; // SVG width in px
  height?: number; // SVG height in px
  /**
   * Normalized fill level in [0,1]. For this CTA scenario, not a progress bar,
   * but a fixed fill; default is 0.55 (55%).
   */
  fill?: number;
  /**
   * Number of segments along the surface. Higher values create smoother curves
   * at the cost of more SVG points.
   */
  segments?: number;
  /**
   * Base depth bias for z_i; can be used to differentiate multiple surfaces.
   */
  zBias?: number;
  /**
   * Optional className passed to the root <svg>.
   */
  className?: string;
}

interface WavePoint {
  x: number;
  y: number;
  z: number;
}

export function WaveSurface({
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

      const dt = (now - lastTime) / 1000; // seconds
      lastTime = now;

      // Use accumulated time for wave phases; we don't need dt explicitly
      const t = now / 1000;

      const pts: WavePoint[] = [];

      const W = width;
      const H = height;

      const baseY = H * (1 - fill); // bottom-to-top fill

      let zSum = 0;
      let minY = Number.POSITIVE_INFINITY;

      for (let i = 0; i <= segments; i++) {
        const u = i / segments; // normalized horizontal [0,1]
        const x = u * W;

        // Calming factor for depth excursions around 0.5 (0 = flat depth, 1 = full swing)
        const depthCalm = 0.38;

        // Raw pseudo-depth variation
        const zDeviation =
          0.25 * Math.sin(2 * Math.PI * u + 0.5 * t + zBias * 0.7) +
          0.15 * Math.sin(3 * Math.PI * u - 0.8 * t + zBias * 1.1);

        // Apply calming around mid-depth 0.5
        const z_i = 0.5 + depthCalm * zDeviation;
        const zNorm = Math.max(0, Math.min(1, z_i));

        // Wave frequencies
        const w1 = Math.PI * 4;
        const w2 = Math.PI * 6;
        const w3 = Math.PI * 8;

        // Depth-modulated phases
        const phase1 = 2 * t + 1.5 * zNorm;
        const phase2 = -1.5 * t + 2.0 * zNorm;
        const phase3 = 3 * t + 2.5 * zNorm;

        // Depth-modulated amplitudes (scaled relative to height)
        // Solution 4: reduced amplitudes to keep waves from going too high at higher fill
        const baseAmp1 = H * 0.1; // reduced from 0.14
        const baseAmp2 = H * 0.05; // reduced from 0.07
        const baseAmp3 = H * 0.025; // reduced from 0.035

        // Global tide scale to keep motion calm (0 = flat, 1 = full height)
        // Solution 4: slightly reduced to match higher fill
        const tideScale = 0.35; // reduced from 0.42

        const A1 = baseAmp1 * (1 + 0.5 * zNorm) * tideScale;
        const A2 = baseAmp2 * (1 + 0.4 * zNorm) * tideScale;
        const A3 = baseAmp3 * (1 + 0.3 * zNorm) * tideScale;

        const wave1 = Math.sin(u * w1 + phase1) * A1;
        const wave2 = Math.sin(u * w2 + phase2) * A2;
        const wave3 = Math.sin(u * w3 + phase3) * A3;

        const surfaceOffset = wave1 + wave2 + wave3;
        let y = baseY + surfaceOffset;

        // Clamp y into the SVG bounds
        if (y < 0) y = 0;
        if (y > H) y = H;

        pts.push({ x, y, z: zNorm });
        zSum += zNorm;
        if (y < minY) minY = y;
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

  // Build the polygon path string from the current points
  const surfacePath = React.useMemo(() => {
    if (!points.length) return "";

    const topPoints = points.map((p) => `${p.x},${p.y}`).join(" ");
    const last = points[points.length - 1];
    const first = points[0];

    // Close slightly past the bottom edge so any rounding mismatch is clipped by the button container
    const bottomY = height + 4;
    const bottomRight = `${last.x},${bottomY}`;
    const bottomLeft = `${first.x},${bottomY}`;

    return `${topPoints} ${bottomRight} ${bottomLeft}`;
  }, [points, height]);

  // Derive a single glow strength and blur radius from avgDepth
  const zAvg = avgDepth; // already in [0,1]
  const sigmaMin = 1.0;
  const sigmaMax = 4.0;
  const baseSigma = sigmaMin + (sigmaMax - sigmaMin) * zAvg;

  // Extra blur near the very top of the container: as y -> 0, increase blur up to +25%
  // We approximate using the smallest y across the current surface points.
  let extraBlurFactor = 0;
  if (points.length) {
    const topY = points.reduce((acc, p) => (p.y < acc ? p.y : acc), points[0].y);
    const topNorm = topY / height; // 0 at top, 1 at bottom
    const threshold = 0.1; // top 10% region
    if (topNorm <= threshold) {
      const t = 1 - topNorm / threshold; // 0 at threshold, 1 at y=0
      extraBlurFactor = 0.25 * t; // 0 -> 0.25
    }
  }

  const sigma = baseSigma * (1 + extraBlurFactor);

  const glowAlpha = 0.4 + 0.4 * zAvg; // 0.4–0.8

  return (
    <svg
      className={className}
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      aria-hidden
    >
      <defs>
        {/* Vertical 3-stop fill gradient - enhanced for blur compatibility */}
        <linearGradient id="wave-liquid-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#06b6d4" stopOpacity="1" />
          <stop offset="50%" stopColor="#0e7490" stopOpacity="1" />
          {/* Lighten the bottom stop slightly to avoid a heavy dark slab at y = H */}
          <stop offset="100%" stopColor="#18d2c1" stopOpacity="1" />
        </linearGradient>

        {/* Shimmer overlay gradient - now part of the gradient definition */}
        <linearGradient id="wave-liquid-shimmer" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="rgba(255,255,255,0)" />
          <stop offset="40%" stopColor="rgba(255,255,255,0.25)" />
          <stop offset="60%" stopColor="rgba(255,255,255,0)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0.25)" />
        </linearGradient>

        {/* Glow filter, blur radius driven by avgDepth */}
        <filter id="wave-liquid-glow" x="-20%" y="-40%" width="140%" height="180%">
          <feGaussianBlur in="SourceGraphic" stdDeviation={sigma} result="blur" />
        </filter>

        {/* Combined gradient for single-polygon rendering */}
        <linearGradient id="wave-liquid-combined" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.95" />
          <stop offset="50%" stopColor="#0e7490" stopOpacity="0.95" />
          <stop offset="85%" stopColor="#18d2c1" stopOpacity="0.95" />
          {/* Fade to transparent at the very bottom to eliminate hard edges */}
          <stop offset="100%" stopColor="#18d2c1" stopOpacity="0.85" />
        </linearGradient>
      </defs>

      {/* Glow underlay - kept separate for depth effect */}
      {surfacePath && (
        <polygon
          points={surfacePath}
          fill="url(#wave-liquid-fill)"
          opacity={glowAlpha}
          filter="url(#wave-liquid-glow)"
        />
      )}

      {/* SINGLE main polygon with combined gradient - eliminates multiple overlapping layers */}
      {surfacePath && (
        <polygon 
          points={surfacePath} 
          fill="url(#wave-liquid-combined)" 
          opacity="1"
        />
      )}

      {/* Shimmer overlay - simplified, no blend mode to avoid blur artifacts */}
      {surfacePath && (
        <polygon
          points={surfacePath}
          fill="url(#wave-liquid-shimmer)"
          opacity={0.3}
        />
      )}

      {/* Highlight along the surface - slightly reduced opacity to prevent sharp line when blurred */}
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
