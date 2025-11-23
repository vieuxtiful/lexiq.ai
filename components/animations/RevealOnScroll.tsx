"use client";

import { useEffect } from "react";

export function RevealOnScroll() {
  useEffect(() => {
    let cleanup: (() => void) | undefined;

    (async () => {
      const ScrollReveal = (await import("scrollreveal")).default;
      const sr = ScrollReveal({
        distance: "60px",
        duration: 900,
        easing: "cubic-bezier(0.22, 1, 0.36, 1)",
        cleanup: true,
      });

      sr.reveal('[data-sr="section-heading"]', { origin: "top", interval: 120 });
      sr.reveal('[data-sr="card"]', { origin: "bottom", interval: 140 });
      sr.reveal('[data-sr="list-item"]', { origin: "left", interval: 110 });

      cleanup = () => sr.destroy();
    })();

    return () => {
      cleanup?.();
    };
  }, []);

  return null;
}
