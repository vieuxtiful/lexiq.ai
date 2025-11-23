"use client";

import { useEffect } from "react";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export function HeroScrollEffects() {
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.to(".hero-parallax", {
        opacity: 1,
        scale: 1.05,
        ease: "none",
        scrollTrigger: {
          trigger: ".hero-section",
          start: "top top",
          end: "bottom top",
          scrub: true,
        },
      });

      gsap.utils.toArray<HTMLElement>("[data-scroll-speed]").forEach((el) => {
        const speed = Number(el.dataset.scrollSpeed) || 0;
        gsap.to(el, {
          yPercent: speed * 20,
          ease: "none",
          scrollTrigger: {
            trigger: el,
            start: "top bottom",
            end: "bottom top",
            scrub: true,
          },
        });
      });
    });

    return () => ctx.revert();
  }, []);

  return null;
}
