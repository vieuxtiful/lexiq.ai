"use client";

import { useEffect } from "react";
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

  useEffect(() => {
    ensureValidBufferGeometry();
  }, []);

  if (isAboutRoute) {
    return <AboutPageBackgroundMosaic className="fixed inset-0" />;
  }

  return (
    <>
      <div
        className="pointer-events-none fixed inset-0 transition-opacity duration-300 ease-in-out"
        style={{
          zIndex: 0,
          opacity: mode === "light" ? 1 : 0,
          backgroundImage: "linear-gradient(135deg, #e8eaee 0%, #f5f6f8 50%, #fafafa 100%)",
        }}
      />

      <div
        className="pointer-events-none fixed inset-0 transition-opacity duration-300 ease-in-out"
        style={{
          zIndex: 1,
          opacity: mode === "light" ? 1 : 0,
          backgroundImage:
            "linear-gradient(to left, rgba(0,0,0,0) 0%, rgba(0,0,0,0.25) 22%, rgba(0,0,0,0.6) 52%, rgba(0,0,0,0.85) 80%, rgba(0,0,0,0.95) 100%)",
        }}
      />

      <div className="fixed inset-0" style={{ zIndex: 2 }}>
        <div className="transition-opacity duration-300 ease-in-out" style={{ opacity: mode === "dark" ? 1 : 0 }}>
          <MainPageBackground className="fixed inset-0" />
        </div>
        <div className="transition-opacity duration-300 ease-in-out" style={{ opacity: mode === "light" ? 1 : 0 }}>
          <MainPageBackground
            className="fixed inset-0"
            monochromeInk
            tint="#ffffff"
            inkColor="#111111"
            inkStrength={1.6}
            useTransparentBackground
            brightness={1.05}
            chromaticAberration={6}
          />
        </div>
      </div>

      <div
        className="pointer-events-none fixed inset-0 transition-opacity duration-300 ease-in-out"
        style={{ zIndex: 3, opacity: mode === "light" ? 1 : 0 }}
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
    </>
  );
}
