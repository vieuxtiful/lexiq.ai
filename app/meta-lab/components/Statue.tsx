"use client";

import { useEffect, useState } from "react";

import metaLabBulbPng from "@/assets/META Lab - Bulb.png";

import LightRays from "./LightRays";

interface BeakerStatueProps {
  scrollY: number;
}
//Change position of the LexiQ™ Statue Image (SVG)//
const STATUE_POSITION = Object.freeze({ x: 0, y: 28, z: 0 });
const LIGHT_RAY_PROPS = Object.freeze({
  raysOrigin: "top-right-down" as const,
  raysColor: "#fff4d1",
  raysSpeed: 1.85,
  lightSpread: 0.28,
  rayLength: 1.18,
  pulsating: true,
  fadeDistance: 1.22,
  saturation: 0.95,
  followMouse: true,
  mouseInfluence: 0.18,
  noiseAmount: 0.035,
  distortion: 0.035,
  intensity: 1.5,
});

const BULB_SRC = encodeURI(metaLabBulbPng.src);

export default function Statue({ scrollY: _scrollY }: BeakerStatueProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => setVisible(true), 50);
    return () => clearTimeout(timeout);
  }, []);
// The LexiQ™ META Lab Beaker Image (SVG)//
  return (
    <div
      className={`fixed inset-0 z-0 flex items-center justify-center transition-opacity duration-700 ${
        visible ? "opacity-100" : "opacity-0"
      }`}
      style={{ transform: `translate3d(${STATUE_POSITION.x}px, ${STATUE_POSITION.y}px, ${STATUE_POSITION.z}px)` }}
    >
      <div className="relative flex h-full w-full items-center justify-center">
        <div
          className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
          style={{ width: "150vw", height: "150vh" }}
        >
          <LightRays {...LIGHT_RAY_PROPS} className="h-full w-full" />
        </div>

        <div className="group pointer-events-auto relative z-10 flex w-full max-w-5xl items-center justify-center">
          <div className="relative flex h-[74vh] items-center justify-center">
            <img src={BULB_SRC} alt="META Lab signal bulb" className="h-full w-auto" />
            <div
              className="statue-shine-overlay"
              aria-hidden
              style={{
                maskImage: `url("${BULB_SRC}")`,
                WebkitMaskImage: `url("${BULB_SRC}")`,
              }}
            />
            <img
              src={BULB_SRC}
              alt="META Lab bulb highlight"
              aria-hidden
              className="pointer-events-none absolute h-full w-auto opacity-0 transition-opacity duration-177 group-hover:opacity-100 mix-blend-lighten brightness-110 saturate-120"
            />
            {/* Slot baseline exit applies only to hover text content */}
            <div
              className="pointer-events-none absolute left-1/2 top-[92%] mt-6 -translate-x-1/2 flex flex-col items-center gap-1 text-center opacity-0 transition-all duration-500 group-hover:opacity-100 hover-text-panel"
              style={{ fontFamily: '"Century Gothic", "URW Gothic", sans-serif' }}
            >
              <div className="hover-text-baseline">
                <p className="hover-text-baseline__text text-[clamp(1rem,2.2vw,2rem)] font-semibold text-black">"Scholastic"</p>
                <p className="hover-text-baseline__text -mt-1 text-[0.59rem] font-semibold uppercase tracking-[0.4em] text-[#20548d]">2025</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
