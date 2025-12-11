"use client";

import { useEffect, useState } from "react";

import { TabNavigation } from "@/components/PageTabs";

const HERO_SHIFT_THRESHOLD = 120;

export default function AboutPage() {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const heroShifted = scrollY > HERO_SHIFT_THRESHOLD;

  return (
    <div className="relative min-h-[220vh] overflow-x-hidden text-white">
      {/* Gradient overlay: horizontal transparent-to-black blanket over the
          mosaic so the left-side hero remains legible while the animation
          is more visible on the right. */}
      <div
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          // Slightly expand the deep-black region toward the center so more
          // of the left side is fully dark while the right remains visible.
          backgroundImage:
            "linear-gradient(to left, rgba(0,0,0,0) 0%, rgba(0,0,0,0.25) 20%, rgba(0,0,0,0.9) 40%, rgba(0,0,0,1) 65%, rgba(0,0,0,1) 100%)",
        }}
      />

      <div className="fixed inset-x-0 top-10 z-30 px-6 sm:px-10">
        <div className="mx-auto w-full max-w-5xl text-white">
          <TabNavigation current="about" />
        </div>
      </div>

      <div
        className={`fixed left-6 top-48 z-10 max-w-3xl text-left text-white transition-all duration-500 sm:left-16 ${
          heroShifted ? "translate-y-0 opacity-100" : "-translate-y-2 opacity-95"
        }`}
      >
        <p className="text-xs uppercase tracking-[0.4em] text-white/70">About</p>
        <p className="mt-5 max-w-2xl text-base leading-relaxed text-white/85">
          LexiQ™, an innovative solution hand crafted by linguists, engineers, and SMEs, was built to address the most grand industry needs. It is equipped with a powerful quality assurance system to ensure the highest level of accuracy and reliability.
        </p>
        <p className="mt-5 max-w-2xl text-base leading-relaxed text-white/85">
          ☆ Featured at Process Innovation Challenge Sneaks @ LocWorld54 in Monterey, CA
        </p>
      </div>
    </div>
  );
}
