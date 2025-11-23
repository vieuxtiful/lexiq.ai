"use client";

import { Fragment } from "react";

import { HeroScrollEffects } from "./HeroScrollEffects";
import { RevealOnScroll } from "./RevealOnScroll";
import { VelocityPulseCta } from "./VelocityPulseCta";
import { FadeInOnScroll } from "./FadeInOnScroll";

export function PageMotionProviders() {
  return (
    <Fragment>
      <HeroScrollEffects />
      <RevealOnScroll />
      <VelocityPulseCta />
      <FadeInOnScroll />
    </Fragment>
  );
}
