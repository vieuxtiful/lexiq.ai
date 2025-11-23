"use client";

import { type PropsWithChildren } from "react";

import { PageMotionProviders } from "@/components/animations/PageMotionProviders";
import { SmoothScrollProvider } from "@/components/layout/SmoothScrollProvider";

export function PageScaffold({ children }: PropsWithChildren) {
  return (
    <SmoothScrollProvider>
      <div className="page-shell relative min-h-screen overflow-hidden text-white">
        <PageMotionProviders />

        <main className="relative z-10 flex min-h-screen flex-col gap-24 px-6 py-16 sm:px-10 md:px-12 lg:px-24">
          {children}
        </main>
      </div>
    </SmoothScrollProvider>
  );
}
