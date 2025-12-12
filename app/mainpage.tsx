"use client";

import Image from "next/image";
import { useEffect, useMemo } from "react";

import { MainPageTemplate } from "@/components/MainPageTemplate";
import { TabNavigation } from "@/components/PageTabs";
import AuroraOverlay from "@/components/animations/AuroraOverlay";
import { WaveSurface } from "@/components/WaveSurface";
import { useThemeMode } from "@/components/theme/ThemeModeProvider";

import moonIcon from "@/guidance/moon-icon.svg";
import sunIcon from "@/guidance/sun-icon.svg";

export default function Home() {
  const { mode, toggleMode } = useThemeMode();

  const stars = useMemo(() => {
    let seed = 1337;
    const rand = () => {
      seed = (seed * 1664525 + 1013904223) >>> 0;
      return seed / 4294967296;
    };

    const sizes = [1, 1, 1, 2, 2, 3];
    const randomPosition = (min: number, max: number) => Math.floor(rand() * (max - min + 1)) + min;

    return Array.from({ length: 300 }, (_, i) => {
      const top = randomPosition(1, 100);
      const left = randomPosition(1, 100);
      const size = (sizes[Math.floor(rand() * sizes.length)] ?? 1) * 0.85;

      let starClass = "star1";
      if (i <= 50) starClass = "star1";
      else if (i <= 100) starClass = "star2";
      else if (i <= 150) starClass = "star3";
      else if (i <= 200) starClass = "star4";
      else if (i <= 250) starClass = "star5";
      else starClass = "star6";

      return { top, left, size, starClass, key: i };
    });
  }, []);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  return (
    <div className="relative h-screen overflow-hidden text-white">
      {/* Horizontal gradient overlay for left/right legibility, matching the
          About page but tuned for the main hero composition. */}
      {mode === "dark" ? (
        <>
          <div
            className="pointer-events-none fixed inset-0 z-10 overflow-hidden"
            style={{
              opacity: 0.85,
              WebkitMaskImage:
                "radial-gradient(circle at 88% 12%, rgba(255,255,255,1) 0%, rgba(255,255,255,0) 62%)",
              maskImage:
                "radial-gradient(circle at 88% 12%, rgba(255,255,255,1) 0%, rgba(255,255,255,0) 62%)",
            }}
          >
            {stars.map((s) => (
              <div
                key={s.key}
                className={s.starClass}
                style={{
                  position: "absolute",
                  top: `${s.top}%`,
                  left: `${s.left}%`,
                  height: `${s.size}px`,
                  width: `${s.size}px`,
                  backgroundColor: "#FFFFFF",
                  borderRadius: "50%",
                }}
              />
            ))}
          </div>

          <div
            className="pointer-events-none fixed inset-0 z-0"
            style={{
              backgroundImage:
                "linear-gradient(135deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0) 65%, rgba(0,0,0,1) 100%)",
            }}
          />

        <div
          className="pointer-events-none fixed inset-0 z-0"
          style={{
            backgroundImage:
              "linear-gradient(to left, rgba(0,0,0,0) 0%, rgba(0,0,0,0.25) 15%, rgba(0,0,0,0.9) 35%, rgba(0,0,0,1) 55%, rgba(0,0,0,1) 100%)",
          }}
        />
        </>
      ) : null}

      {mode === "dark" ? (
        <AuroraOverlay
          className="pointer-events-none fixed inset-0 z-0"
          overlayStrength={0.15}
          amplitude={0.5}
          blend={1}
          speed={0.9}
          colorStops={["#00c9bfff", "#7cff67", "#007fd3ff"]}
          useGradientMask
        />
      ) : null}

      <div className="fixed inset-x-0 top-10 z-30 px-6 sm:px-10">
        <div className="mx-auto w-full max-w-5xl text-white">
          <TabNavigation current="home" />
        </div>
      </div>

      <MainPageTemplate current="home" />

      <button
        type="button"
        onClick={toggleMode}
        aria-label={mode === "dark" ? "Switch to light mode" : "Switch to dark mode"}
        className="liquid-hover fixed bottom-6 right-6 z-40 flex h-12 w-12 items-center justify-center overflow-hidden rounded-full border border-white/30 text-white/80 transition hover:border-white hover:text-white"
      >
        <div className="pointer-events-none absolute inset-0">
          <WaveSurface className="wave-surface wave-surface--base h-full w-full" palette="carbon" />
          <WaveSurface className="wave-surface wave-surface--blurred h-full w-full" variant="crest-mask" palette="carbon" />
        </div>
        <Image
          src={mode === "dark" ? moonIcon : sunIcon}
          alt=""
          aria-hidden
          className="relative z-10 h-5 w-5"
        />
      </button>
    </div>
  );
}
