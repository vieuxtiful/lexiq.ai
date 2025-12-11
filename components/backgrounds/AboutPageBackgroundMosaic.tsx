"use client";

import type { ComponentProps } from "react";
import AboutPageFaultyTerminal from "./AboutPageFaultyTerminal";

type AboutPageBackgroundMosaicProps = ComponentProps<typeof AboutPageFaultyTerminal>;

export default function AboutPageBackgroundMosaic(props: AboutPageBackgroundMosaicProps) {
  return <AboutPageFaultyTerminal {...props} />;
}
