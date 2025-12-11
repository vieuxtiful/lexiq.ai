"use client";

import { useEffect, useState } from "react";

import { CareersPageTemplate } from "@/components/CareersPageTemplate";
import { TabNavigation } from "@/components/PageTabs";

export default function CareersPage() {
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
    <div className="relative min-h-[200vh] overflow-x-hidden text-white">
      <div className="fixed inset-x-0 top-10 z-30 px-6 sm:px-10">
        <div className="mx-auto w-full max-w-5xl text-white">
          <TabNavigation current="careers" />
        </div>
      </div>

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
