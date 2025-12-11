"use client";

import { useEffect, useState } from "react";

import { MainPageTemplate } from "@/components/MainPageTemplate";

export default function Home() {
  const [fadeProgress, setFadeProgress] = useState(0);

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
    <div className="relative min-h-[220vh] overflow-x-hidden text-white">
      {/* Horizontal gradient overlay for left/right legibility, matching the
          About page but tuned for the main hero composition. */}
      <div
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          backgroundImage:
            "linear-gradient(to left, rgba(0,0,0,0) 0%, rgba(0,0,0,0.25) 20%, rgba(0,0,0,0.9) 45%, rgba(0,0,0,1) 70%, rgba(0,0,0,1) 100%)",
        }}
      />

      {/* Vertical fade-to-black overlay that ramps in smoothly as the user
          approaches the bottom of the page. This retains the mosaic at the
          top while easing into full black near the end of the scroll. */}
      <div
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          backgroundImage:
            "linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,1) 100%)",
          opacity: fadeProgress,
          transition: "opacity 120ms linear",
        }}
      />

      <MainPageTemplate current="home" />
    </div>
  );
}
