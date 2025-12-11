"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

import AboutPageBackgroundMosaic from "./AboutPageBackgroundMosaic";
import MainPageBackground from "./MainPageBackground";
import { ensureValidBufferGeometry } from "./ensureValidBufferGeometry";

const ABOUT_ROUTE = "/about";

export function GlobalBackground() {
  const pathname = usePathname();
  const isAboutRoute = pathname === ABOUT_ROUTE;

  useEffect(() => {
    ensureValidBufferGeometry();
  }, []);

  if (isAboutRoute) {
    return <AboutPageBackgroundMosaic className="fixed inset-0" />;
  }

  return <MainPageBackground className="fixed inset-0" />;
}
