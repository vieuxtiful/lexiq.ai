"use client";

import { useEffect } from "react";

import { MainPageTemplate } from "@/components/MainPageTemplate";
import { TabNavigation } from "@/components/PageTabs";

export default function Home() {
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
      <div
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          backgroundImage:
            "linear-gradient(to left, rgba(0,0,0,0) 0%, rgba(0,0,0,0.25) 15%, rgba(0,0,0,0.9) 35%, rgba(0,0,0,1) 55%, rgba(0,0,0,1) 100%)",
        }}
      />

      <div className="fixed inset-x-0 top-10 z-30 px-6 sm:px-10">
        <div className="mx-auto w-full max-w-5xl text-white">
          <TabNavigation current="home" />
        </div>
      </div>

      <MainPageTemplate current="home" />
    </div>
  );
}
