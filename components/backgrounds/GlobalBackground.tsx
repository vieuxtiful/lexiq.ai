"use client";

import { usePathname } from "next/navigation";

import { BackgroundV1 } from "./BackgroundV1";
import { CareersPageBackgroundV2 } from "./CareersPageBackgroundV2";

const CAREERS_ROUTE_PREFIX = "/careers";

export function GlobalBackground() {
  const pathname = usePathname();
  const isCareersRoute = pathname?.startsWith(CAREERS_ROUTE_PREFIX);

  if (isCareersRoute) {
    return <CareersPageBackgroundV2 />;
  }

  return <BackgroundV1 />;
}
