"use client";

import React, { useEffect, useId, useRef, useState } from "react";

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
  variant?: "default" | "crest-mask";
  palette?: "aqua" | "carbon";
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
  variant = "default",
  palette = "aqua",
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
        y = Math.min(Math.max(y, 0), H);

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

  const { surfacePath, glowTransform } = React.useMemo(() => {
    if (!points.length) return { surfacePath: "", glowTransform: "" };

    const topPoints = points.map((p) => `${p.x},${p.y}`).join(" ");
    const last = points[points.length - 1];
    const first = points[0];

    const bottomY = height + 4;
    const path = `${topPoints} ${last.x},${bottomY} ${first.x},${bottomY}`;

    const scaleX = 1.04;
    const scaleY = 1.08;
    const translateX = -(width * (scaleX - 1)) / 2;
    const translateY = -height * 0.02;

    return { surfacePath: path, glowTransform: `translate(${translateX} ${translateY}) scale(${scaleX} ${scaleY})` };
  }, [points, height, width]);

  const zAvg = avgDepth;
  const sigmaMin = 1;
  const sigmaMax = 4;
  const baseSigma = sigmaMin + (sigmaMax - sigmaMin) * zAvg;

  let extraBlurFactor = 0;
  if (points.length) {
    const topY = points.reduce((acc, p) => (p.y < acc ? p.y : acc), points[0].y);
    const topNorm = topY / height;
    if (topNorm <= 0.1) {
      const t = 1 - topNorm / 0.1;
      extraBlurFactor = 0.25 * t;
    }
  }

  const sigma = baseSigma * (1 + extraBlurFactor);
  const glowAlpha = 0.4 + 0.4 * zAvg;

  const uniqueId = useId();
  const fillGradientId = `${uniqueId}-fill`;
  const shimmerGradientId = `${uniqueId}-shimmer`;
  const glowFilterId = `${uniqueId}-glow`;
  const combinedGradientId = `${uniqueId}-combined`;
  const crestGradientId = `${uniqueId}-crest-gradient`;
  const crestMaskId = `${uniqueId}-crest-mask`;
  const shimmerClipId = `${uniqueId}-shimmer-clip`;

  const fillStops =
    palette === "carbon"
      ? [
          { offset: "0%", color: "#01050c", opacity: 1 },
          { offset: "45%", color: "#061526", opacity: 1 },
          { offset: "100%", color: "#0b2530", opacity: 1 },
        ]
      : [
          { offset: "0%", color: "#06b6d4", opacity: 1 },
          { offset: "50%", color: "#0e7490", opacity: 1 },
          { offset: "100%", color: "#18d2c1", opacity: 1 },
        ];

  const combinedStops =
    palette === "carbon"
      ? [
          { offset: "0%", color: "#03101c", opacity: 0.95 },
          { offset: "45%", color: "#062436", opacity: 0.92 },
          { offset: "80%", color: "#0a3842", opacity: 0.9 },
          { offset: "100%", color: "#0f4b52", opacity: 0.85 },
        ]
      : [
          { offset: "0%", color: "#06b6d4", opacity: 0.95 },
          { offset: "50%", color: "#0e7490", opacity: 0.95 },
          { offset: "85%", color: "#18d2c1", opacity: 0.95 },
          { offset: "100%", color: "#18d2c1", opacity: 0.85 },
        ];

  const shimmerOpacity = palette === "carbon" ? 0.15 : 0.3;
  const highlightColor = palette === "carbon" ? "rgba(255,255,255,0.4)" : "rgba(255,255,255,0.6)";
  const crestMaskUrl = variant === "crest-mask" ? `url(#${crestMaskId})` : undefined;

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
        <linearGradient id={fillGradientId} x1="0" y1="0" x2="0" y2="1">
          {fillStops.map((stop) => (
            <stop key={`fill-${stop.offset}`} offset={stop.offset} stopColor={stop.color} stopOpacity={stop.opacity} />
          ))}
        </linearGradient>

        <linearGradient id={shimmerGradientId} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="rgba(255,255,255,0)" />
          <stop offset="40%" stopColor="rgba(255,255,255,0.25)" />
          <stop offset="60%" stopColor="rgba(255,255,255,0)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0.25)" />
        </linearGradient>

        <filter id={glowFilterId} x="-20%" y="-40%" width="140%" height="180%">
          <feGaussianBlur in="SourceGraphic" stdDeviation={sigma} result="blur" />
        </filter>

        <linearGradient id={combinedGradientId} x1="0" y1="0" x2="0" y2="1">
          {combinedStops.map((stop) => (
            <stop
              key={`combined-${stop.offset}`}
              offset={stop.offset}
              stopColor={stop.color}
              stopOpacity={stop.opacity}
            />
          ))}
        </linearGradient>

        <linearGradient id={crestGradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="white" stopOpacity="1" />
          <stop offset="55%" stopColor="white" stopOpacity="1" />
          <stop offset="80%" stopColor="white" stopOpacity="0.3" />
          <stop offset="100%" stopColor="white" stopOpacity="0" />
        </linearGradient>
        <mask id={crestMaskId} maskUnits="objectBoundingBox">
          <rect x="0" y="0" width="1" height="1" fill={`url(#${crestGradientId})`} />
        </mask>

        <clipPath id={shimmerClipId}>
          <rect x="0" y="0" width={width} height={height * 0.5} />
        </clipPath>
      </defs>

      {surfacePath && (
        <polygon
          points={surfacePath}
          fill={`url(#${fillGradientId})`}
          opacity={glowAlpha}
          filter={`url(#${glowFilterId})`}
          transform={glowTransform}
        />
      )}

      {surfacePath && (
        <polygon points={surfacePath} fill={`url(#${combinedGradientId})`} opacity={1} mask={crestMaskUrl} />
      )}

      {surfacePath && (
        <polygon
          points={surfacePath}
          fill={`url(#${shimmerGradientId})`}
          opacity={shimmerOpacity}
          clipPath={`url(#${shimmerClipId})`}
          mask={crestMaskUrl}
        />
      )}

      {points.length > 1 && (
        <polyline
          points={points.map((p) => `${p.x},${p.y}`).join(" ")}
          fill="none"
          stroke={highlightColor}
          strokeWidth={1.2}
          mask={crestMaskUrl}
        />
      )}
    </svg>
  );
}
