"use client";

import { useEffect, useRef } from "react";

import workflowAnim from "@/public/animations/workflow.json";

export function WorkflowLottie() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cleanup: (() => void) | undefined;

    (async () => {
      if (!containerRef.current) return;
      const { default: lottie } = await import("lottie-web");
      const animation = lottie.loadAnimation({
        container: containerRef.current,
        renderer: "svg",
        loop: true,
        autoplay: true,
        animationData: workflowAnim,
      });
      cleanup = () => animation?.destroy();
    })();

    return () => cleanup?.();
  }, []);

  return <div ref={containerRef} className="h-72 w-72" aria-hidden />;
}
