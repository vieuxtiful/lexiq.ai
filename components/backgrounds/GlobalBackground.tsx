"use client";

import { usePathname } from "next/navigation";

import { BackgroundV1 } from "./BackgroundV1";
import { HyperDigitalCareersBackground } from "./hyperdigital/HyperDigitalCareersBackground";

const CAREERS_ROUTE_PREFIX = "/careers";

export function GlobalBackground() {
  const pathname = usePathname();
  const isCareersRoute = pathname?.startsWith(CAREERS_ROUTE_PREFIX);

  if (isCareersRoute) {
    return <HyperDigitalCareersBackground />;
  }

  return <BackgroundV1 />;
}
