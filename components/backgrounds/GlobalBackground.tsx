"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

import AboutPageBackgroundMosaic from "./AboutPageBackgroundMosaic";
import MainPageBackground from "./MainPageBackground";
import { ensureValidBufferGeometry } from "./ensureValidBufferGeometry";
import { useThemeMode } from "@/components/theme/ThemeModeProvider";
import LightRays from "@/app/meta-lab/components/LightRays";

const ABOUT_ROUTE = "/about";

export function GlobalBackground() {
  const pathname = usePathname();
  const isAboutRoute = pathname === ABOUT_ROUTE;
  const { mode } = useThemeMode();
  const lightGradientRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    ensureValidBufferGeometry();
  }, []);

  useEffect(() => {
    const el = lightGradientRef.current;
    if (!el) return;
    if (mode !== "light") {
      el.style.transform = "translate3d(0px, 0px, 0px)";
      return;
    }

    let raf = 0;
    let lastX = 0.5;
    let lastY = 0.5;

    const update = () => {
      raf = 0;
      const dx = (lastX - 0.5) * 24;
      const dy = (lastY - 0.5) * 24;
      el.style.transform = `translate3d(${dx}px, ${dy}px, 0px)`;
    };

    const onMove = (e: MouseEvent) => {
      lastX = e.clientX / Math.max(1, window.innerWidth);
      lastY = e.clientY / Math.max(1, window.innerHeight);
      if (!raf) raf = window.requestAnimationFrame(update);
    };

    window.addEventListener("mousemove", onMove);
    return () => {
      window.removeEventListener("mousemove", onMove);
      if (raf) window.cancelAnimationFrame(raf);
    };
  }, [mode]);

  if (isAboutRoute) {
    return <AboutPageBackgroundMosaic className="fixed inset-0" />;
  }

  return (
    <>
      {mode === "light" ? (
        <div
          ref={lightGradientRef}
          className="pointer-events-none fixed inset-0"
          style={{
            zIndex: 0,
            backgroundImage: "linear-gradient(135deg, #d8dce3 0%, #ebeced 100%)",
          }}
        />
      ) : null}

      <MainPageBackground
        className="fixed inset-0"
        monochromeInk={mode === "light"}
        tint={mode === "light" ? "#ffffff" : undefined}
        inkColor={mode === "light" ? "#111111" : undefined}
        inkStrength={mode === "light" ? 1.6 : undefined}
        useTransparentBackground={mode === "light"}
        brightness={mode === "light" ? 1.05 : undefined}
      />

      {mode === "light" ? (
        <div
          className="pointer-events-none fixed inset-0"
          style={{ zIndex: 2 }}
          data-light-rays="true"
        >
          <LightRays
            className="h-full w-full"
            raysOrigin="top-right-down"
            raysColor="#fff4d1"
            raysSpeed={1.85}
            lightSpread={0.28}
            rayLength={1.18}
            pulsating
            fadeDistance={1.22}
            saturation={0.95}
            followMouse
            mouseInfluence={0.18}
            noiseAmount={0.035}
            distortion={0.035}
            intensity={1.5}
          />
        </div>
      ) : null}
    </>
  );
}
