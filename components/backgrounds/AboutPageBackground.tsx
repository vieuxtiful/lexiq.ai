"use client";

import type { ComponentProps } from "react";

import FaultyTerminal from "@/guidance/about_page_background";

type FaultyTerminalProps = ComponentProps<typeof FaultyTerminal>;

const baseClassName = "pointer-events-none h-full w-full";

export default function AboutPageBackground({ className, ...props }: FaultyTerminalProps) {
  return (
    <FaultyTerminal
      className={[baseClassName, className].filter(Boolean).join(" ")}
      scale={1.8}
      gridMul={[2.4, 1.2]}
      digitSize={1.05}
      scanlineIntensity={0.65}
      glitchAmount={1.15}
      noiseAmp={0.35}
      mouseStrength={0.35}
      brightness={1.25}
      logoOffset={[0.18, 0.18]}
      logoScale={[0.55, 0.55]}
      chromaticAberration={0.75}
      tint="#b3e5ff"
      {...props}
    />
  );
}
