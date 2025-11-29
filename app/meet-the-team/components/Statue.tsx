"use client";

import { useEffect, useState } from "react";

interface StatueProps {
  scrollY: number;
}
//Change position of the LexiQ™ Statue Image (SVG)//
const STATUE_POSITION = Object.freeze({ x: 0, y: 45, z: 0 });

export default function Statue({ scrollY: _scrollY }: StatueProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => setVisible(true), 50);
    return () => clearTimeout(timeout);
  }, []);
// The LexiQ™ Statue Image (SVG)//
  return (
    <div
      className={`fixed inset-0 z-0 flex items-center justify-center transition-opacity duration-700 ${
        visible ? "opacity-100" : "opacity-0"
      }`}
      style={{ transform: `translate3d(${STATUE_POSITION.x}px, ${STATUE_POSITION.y}px, ${STATUE_POSITION.z}px)` }}
    >
      <div className="group relative flex items-center">
        <div className="relative">
          <img
            src="/lexiq-statue.svg"
            alt="LexiQ statue"
            className="h-[75vh] w-auto"
          />
          <div
            className="pointer-events-none absolute inset-0 rounded-3xl bg-white/30 opacity-0 transition-opacity duration-700 group-hover:opacity-100"
          />
        </div>

        <div
          className="pointer-events-none absolute left-full top-1/2 ml-6 hidden -translate-y-1/2 flex-col gap-3 text-left opacity-0 group-hover:flex hover-text-panel"
          style={{ fontFamily: '"Century Gothic", "URW Gothic", sans-serif' }}
        >
          <div className="relative h-0.5 w-32 bg-white/25">
            <span className="absolute top-1/2 left-0 h-2 w-2 -translate-y-1/2 rounded-full bg-white/70" />
            <span className="absolute top-1/2 right-0 h-2 w-2 -translate-y-1/2 rounded-full bg-white/90" />
            <span className="absolute top-1/2 left-0 h-1 w-2/3 -translate-y-1/2 bg-gradient-to-r from-white/0 via-white/80 to-white/0 animate-light-streak" />
          </div>
          <div className="space-y-1 text-black">
            <p className="text-[clamp(1rem,2.2vw,2rem)] font-semibold">"Behold"</p>
            <p className="text-[0.65rem] font-semibold uppercase tracking-[0.4em] text-[#20548d]">rendered by vieux</p>
          </div>
        </div>
      </div>
    </div>
  );
}
