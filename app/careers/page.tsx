"use client";

import { useEffect, useMemo, useState } from "react";

import { CareersPageTemplate } from "@/components/CareersPageTemplate";
import { TabNavigation } from "@/components/PageTabs";
import { useThemeMode } from "@/components/theme/ThemeModeProvider";

export default function CareersPage() {
  const { mode } = useThemeMode();
  const [fadeProgress, setFadeProgress] = useState(0);

  const stars = useMemo(() => {
    let seed = 9001;
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
    const handleScroll = () => {
      const doc = document.documentElement;
      const scrollTop = window.scrollY || doc.scrollTop || 0;
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

  return (
    <div className="relative min-h-[200vh] overflow-x-hidden text-white">
      <div className="fixed inset-x-0 top-10 z-30 px-6 sm:px-10">
        <div className="mx-auto w-full max-w-5xl text-white">
          <TabNavigation current="careers" />
        </div>
      </div>

      {mode === "dark" ? (
        <div
          className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
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
      ) : null}

      <div
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          backgroundImage:
            "linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,1) 100%)",
          opacity: fadeProgress,
          transition: "opacity 120ms linear",
        }}
      />

      <CareersPageTemplate useScaffold showHeader={false} />
      <div className="fixed inset-x-0 bottom-2 …">© LexiQ™ Development Team. All rights reserved.</div>
    </div>
  );
}
