"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

import { BackgroundV1 } from "./BackgroundV1";
import { CareersPageBackgroundV2 } from "./CareersPageBackgroundV2";
import { ensureValidBufferGeometry } from "./ensureValidBufferGeometry";

const CAREERS_ROUTE_PREFIX = "/careers";

export function GlobalBackground() {
  const pathname = usePathname();
  const isCareersRoute = pathname?.startsWith(CAREERS_ROUTE_PREFIX);

  useEffect(() => {
    ensureValidBufferGeometry();
  }, []);

  if (isCareersRoute) {
    return <CareersPageBackgroundV2 />;
  }

  return <BackgroundV1 />;
}
