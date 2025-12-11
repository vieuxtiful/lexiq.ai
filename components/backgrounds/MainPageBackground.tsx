"use client";

import type { ComponentProps } from "react";
import MainPageBackgroundMosaic from "./MainPageBackgroundMosaic";

type MainPageBackgroundProps = ComponentProps<typeof MainPageBackgroundMosaic>;

export default function MainPageBackground(props: MainPageBackgroundProps) {
  return <MainPageBackgroundMosaic {...props} />;
}
