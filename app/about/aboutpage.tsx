"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

import { AboutParticleSphere } from "@/components/animations/AboutParticleSphere";
import { PageMotionProviders } from "@/components/animations/PageMotionProviders";
import { TabNavigation } from "@/components/PageTabs";
import { SmoothScrollProvider } from "@/components/layout/SmoothScrollProvider";
import { WaveSurface } from "@/components/WaveSurface";

const HERO_SHIFT_THRESHOLD = 120;

export default function AboutPage() {
  const [scrollY, setScrollY] = useState(0);
  const [fadeProgress, setFadeProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScroll = window.scrollY;
      setScrollY(currentScroll);

      const doc = document.documentElement;
      const scrollTop = currentScroll || doc.scrollTop || 0;
      const maxScroll = Math.max(doc.scrollHeight - window.innerHeight, 1);
      const raw = scrollTop / maxScroll;
      const clamped = Math.min(Math.max(raw, 0), 1);
      setFadeProgress(clamped);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, []);

  const heroShifted = scrollY > HERO_SHIFT_THRESHOLD;

  return (
    <SmoothScrollProvider>
      <div className="relative min-h-[220vh] overflow-x-hidden text-white">
        <PageMotionProviders />
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
        <div
          className="pointer-events-none fixed inset-0 z-0"
          style={{
            backgroundImage:
              "linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,1) 100%)",
            opacity: fadeProgress,
            transition: "opacity 120ms linear",
          }}
        />

        <div className="fixed inset-x-0 top-10 z-30 px-6 sm:px-10">
          <div className="mx-auto w-full max-w-5xl text-white">
            <TabNavigation current="about" />
          </div>
        </div>

      <div
        className={`fixed left-8 top-36 z-10 max-w-3xl text-left text-white transition-all duration-500 sm:left-16 ${
          heroShifted ? "translate-y-0 opacity-100" : "-translate-y-1 opacity-95"
        }`}
      >
        <Image
         src="/LexiQ_Team_Logo_(white).png"
         alt="LexiQ logo"
         width={120}
         height={40}
         priority
        />
        <br />
        <br />
        <p className="text-xs uppercase tracking-[0.4em] text-white/70">About</p>
        <p className="mt-5 max-w-2xl text-base leading-relaxed text-white/85">
          LexiQ™, an innovative solution hand crafted by linguists, engineers, and SMEs, was built to address the most grand industry needs. It is equipped with a powerful quality assurance system to ensure the highest level of accuracy and reliability.
        </p>
        <div className="liquid-hover relative mt-4 overflow-hidden rounded-[36px] border border-white/12 bg-white/5 p-6 text-white">
          <div className="pointer-events-none absolute inset-0">
            <WaveSurface className="wave-surface wave-surface--base h-full w-full" palette="carbon" />
            <WaveSurface
              className="wave-surface wave-surface--blurred h-full w-full"
              variant="crest-mask"
              palette="carbon"
            />
          </div>
          <div className="relative z-10">
            <p className="text-xs uppercase tracking-[0.4em] text-white/60">Specifications</p>
            <p className="mt-3 text-2xl font-semibold text-white">A Unified Platform</p>
            <p className="mt-3 text-sm text-white/80">
              Our architecture is designed for high performance, flexibility, and developer-friendly implementation.
            </p>
            <ul className="mt-4 space-y-2 text-sm text-white/80">
              <li>・ Ensures AI decisions are transparent and understandable.</li>
              <li>・ Processes and analyzes text in any language.</li>
              <li>・ Identifies issues proactively before they escalate.</li>
            </ul>
          </div>
        </div>
        <br />
        <br />
        <p className="text-xs uppercase tracking-[0.4em] text-white/60">News</p>
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-white/85">
        <span className="font-semibold">October 15, 2025</span> 
        <br />
        LexiQ™ was featured on-stage at the Process Innovation Challenge Sneaks @ LocWorld54 in Monterey, California
        </p>
      </div>
        <div className="pointer-events-auto fixed right-[20vw] top-32 z-10 hidden h-[72vh] w-[46vw] max-w-3xl lg:block">
          <AboutParticleSphere />
        </div>

        <div className="fixed inset-x-0 bottom-4 z-20 text-center text-[0.7rem] tracking-wide text-white/60">
          2025 LexiQ Development Team. All rights reserved.
        </div>
      </div>
    </SmoothScrollProvider>
  );
}
