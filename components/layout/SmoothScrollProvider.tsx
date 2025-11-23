"use client";

import { useEffect, type PropsWithChildren } from "react";

export function SmoothScrollProvider({ children }: PropsWithChildren) {
  useEffect(() => {
    if (typeof window === "undefined") return;
    const root = document.documentElement;
    const previousBehavior = root.style.scrollBehavior;
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (!prefersReducedMotion) {
      root.style.scrollBehavior = "smooth";
    }

    return () => {
      root.style.scrollBehavior = previousBehavior;
    };
  }, []);

  return <div>{children}</div>;
}
