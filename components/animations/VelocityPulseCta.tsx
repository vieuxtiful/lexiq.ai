"use client";

import { useEffect } from "react";
import type { VelocityFn } from "velocity-animate";

export function VelocityPulseCta() {
  useEffect(() => {
    let Velocity: VelocityFn | null = null;
    let cleanup: (() => void) | undefined;

    (async () => {
      if (typeof document === "undefined") return;
      Velocity = (await import("velocity-animate")).default;
      const buttons = Array.from(document.querySelectorAll<HTMLElement>(".cta-button"));
      if (!buttons.length || !Velocity) return;

      buttons.forEach((button, index) => {
        Velocity?.(button, "stop", true);
        Velocity?.(
          button,
          { scale: 1.04 },
          {
            duration: 900,
            loop: true,
            easing: "easeInOutSine",
            delay: index * 120,
            complete: () => Velocity?.(button, { scale: 1 }, { duration: 0 }),
          },
        );
      });

      cleanup = () => {
        buttons.forEach((button) => {
          Velocity?.(button, "stop", true);
          Velocity?.(button, { scale: 1 }, { duration: 0 });
        });
      };
    })();

    return () => {
      cleanup?.();
    };
  }, []);

  return null;
}
