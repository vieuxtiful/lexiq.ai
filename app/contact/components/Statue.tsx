"use client";

import { useEffect, useState } from "react";

import LightRays from "@/app/meta-lab/components/LightRays";
import metaLabBeakerSvg from "@/guidance/META Lab - Beaker.svg";

interface ContactStatueProps {
  scrollY: number;
}

const STATUE_POSITION = Object.freeze({ x: 0, y: 60, z: 0 });
const LIGHT_RAY_PROPS = Object.freeze({
  raysOrigin: "top-right-down" as const,
  raysColor: "#f8fafc",
  raysSpeed: 2,
  lightSpread: 0.25,
  rayLength: 1.1,
  pulsating: true,
  fadeDistance: 1.35,
  saturation: 0.85,
  followMouse: true,
  mouseInfluence: 0.18,
  noiseAmount: 0.04,
  distortion: 0.04,
  intensity: 1.4,
});

const BEAKER_SRC = encodeURI(metaLabBeakerSvg.src);

export default function ContactStatue({ scrollY: _scrollY }: ContactStatueProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => setVisible(true), 50);
    return () => clearTimeout(timeout);
  }, []);

  return (
    <div
      className={`fixed inset-0 z-0 flex items-center justify-center transition-opacity duration-700 ${
        visible ? "opacity-100" : "opacity-0"
      }`}
      style={{ transform: `translate3d(${STATUE_POSITION.x}px, ${STATUE_POSITION.y}px, ${STATUE_POSITION.z}px)` }}
    >
      <div className="relative flex h-full w-full items-center justify-center">
        <div className="pointer-events-none absolute inset-0 -translate-y-[88px]">
          <LightRays {...LIGHT_RAY_PROPS} className="h-full w-full" />
        </div>

        <div className="group pointer-events-auto relative z-10 flex w-full max-w-5xl items-center justify-center">
          <div className="relative flex h-[68vh] items-center justify-center">
            <img src={BEAKER_SRC} alt="META Lab discovery sculpture" className="h-full w-auto" />
            <div
              className="statue-shine-overlay"
              aria-hidden
              style={{ maskImage: `url("${BEAKER_SRC}")`, WebkitMaskImage: `url("${BEAKER_SRC}")` }}
            />
            <img
              src={BEAKER_SRC}
              alt="META Lab highlight"
              aria-hidden
              className="pointer-events-none absolute h-full w-auto opacity-0 transition-opacity duration-177 group-hover:opacity-100 mix-blend-lighten brightness-110 saturate-110"
            />
            <div
              className="pointer-events-none absolute left-1/2 top-[92%] mt-6 -translate-x-1/2 flex flex-col items-center gap-1 text-center opacity-0 transition-all duration-500 group-hover:opacity-100 hover-text-panel"
              style={{ fontFamily: '"Century Gothic", "URW Gothic", sans-serif' }}
            >
              <div className="hover-text-baseline">
                <p className="hover-text-baseline__text text-[clamp(1rem,2vw,1.8rem)] font-semibold text-black">"Signal"</p>
                <p className="hover-text-baseline__text -mt-1 text-[0.6rem] font-semibold uppercase tracking-[0.4em] text-[#0f172a]">2025</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
