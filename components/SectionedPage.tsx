"use client";

import { useState, type ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";

import { PageScaffold } from "@/components/PageScaffold";
import { TabNavigation, type TabId } from "@/components/PageTabs";
import { CarbonWaveSurface } from "@/components/CarbonWaveSurface";

export type Stat = {
  label: string;
  value: string;
  hoverText?: string;
};

export type Capability = {
  title: string;
  description: ReactNode;
};

export type SolutionTrack = {
  title: string;
  description: string;
  bullets: string[];
};

export type SectionedPageProps = {
  current: TabId;
  hero: {
    kicker: string;
    title: string;
    description: ReactNode;
    primary: { label: string; href: string };
    secondary: { label: string; href: string };
  };
  stats: Stat[];
  capabilities: Capability[];
  experience: {
    kicker: string;
    title: string;
    description: string;
    highlights: string[];
  };
  solutions: SolutionTrack[];
  cta: {
    kicker: string;
    title: string;
    description: string;
    primary: { label: string; href: string };
    secondary: { label: string; href: string };
  };
  statLiquidFill?: number;
  capabilityLiquidFill?: number;
  disableStatLiquid?: boolean;
  statLiquidDisableLabels?: string[];
};

export function SectionedPage({
  current,
  hero,
  stats,
  capabilities,
  experience,
  solutions,
  cta,
  statLiquidFill = 0.83,
  capabilityLiquidFill = 0.83,
  disableStatLiquid = false,
  statLiquidDisableLabels = [],
}: SectionedPageProps) {
  const [hoveredStatLabel, setHoveredStatLabel] = useState<string | null>(null);
  const statLiquidDisableSet = new Set(statLiquidDisableLabels);

  return (
    <PageScaffold>
      <header className="flex flex-col items-start gap-8" data-scroll-section data-fade>
        <TabNavigation current={current} />
        <div className="flex items-center gap-4 text-sm text-white/80">
          <Image src="/LexiQ_Team_Logo_(white).png" alt="LexiQ logo" width={120} height={40} priority />
        </div>
      </header>

      <section className="hero-section" data-scroll-section>
        <div className="space-y-10" data-fade>
          <div className="space-y-6">
            <p className="uppercase tracking-[0.3em] text-xs text-white/60">{hero.kicker}</p>
            <h1 className="max-w-3xl text-4xl font-semibold leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">
              {hero.title}
            </h1>
            <p className="max-w-2xl text-lg text-white/70">{hero.description}</p>
          </div>
          <div className="grid gap-6 sm:grid-cols-3" data-fade>
            {stats.map((stat) => {
              const hasHoverText = Boolean(stat.hoverText);
              const isHovered = hasHoverText && hoveredStatLabel === stat.label;

              const liquidDisabledForStat = disableStatLiquid || statLiquidDisableSet.has(stat.label);

              return (
                <div
                  key={stat.label}
                  className={`stat-card stat-card--carbon relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-4 text-center ${
                    hasHoverText ? "cursor-pointer" : ""
                  }`}
                  data-sr="card"
                  data-scroll
                  data-scroll-speed="0.3"
                  onMouseEnter={() => hasHoverText && setHoveredStatLabel(stat.label)}
                  onMouseLeave={() =>
                    hasHoverText &&
                    setHoveredStatLabel((current) => (current === stat.label ? null : current))
                  }
                >
                  {!liquidDisabledForStat && (
                    <div className="stat-card__liquid" aria-hidden>
                      <CarbonWaveSurface
                        className="stat-card__wave"
                        width={260}
                        height={90}
                        fill={statLiquidFill}
                        segments={84}
                      />
                    </div>
                  )}
                  <div className="relative h-16 overflow-hidden">
                    <span
                      className={`block w-full text-3xl font-semibold text-white transition-transform duration-300 ease-out ${
                        isHovered ? "-translate-x-full" : "translate-x-0"
                      }`}
                    >
                      {stat.value}
                    </span>
                    {hasHoverText && (
                      <span
                        className={`absolute inset-0 flex items-center justify-center text-center text-xs uppercase tracking-wide text-white/80 transition-transform duration-300 ease-out ${
                          isHovered ? "translate-x-0" : "translate-x-full"
                        }`}
                      >
                        {stat.hoverText}
                      </span>
                    )}
                  </div>
                  <div className="relative mt-2 h-6 overflow-hidden">
                    <span
                      className={`block w-full text-xs uppercase tracking-wide text-white/60 transition-transform duration-300 ease-out ${
                        isHovered ? "-translate-x-full opacity-0" : "translate-x-0 opacity-100"
                      }`}
                    >
                      {stat.label}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="flex flex-col gap-4 text-base font-medium sm:flex-row" data-fade>
            <Link
              href={hero.primary.href}
              className="cta-button flex h-12 items-center justify-center rounded-full bg-white px-6 text-sm font-semibold uppercase tracking-wide text-black transition hover:bg-white/90"
            >
              {hero.primary.label}
            </Link>
            <Link
              href={hero.secondary.href}
              className="flex h-12 items-center justify-center rounded-full border border-white/30 px-6 text-sm font-semibold uppercase tracking-wide text-white/80 transition hover:border-white hover:text-white"
            >
              {hero.secondary.label}
            </Link>
          </div>
        </div>
      </section>

      <section className="space-y-8" data-scroll-section>
        <div className="space-y-4" data-sr="section-heading" data-fade>
          <p className="text-sm uppercase tracking-[0.3em] text-white/50">Team Members</p>
          <h2 className="text-3xl font-semibold tracking-tight text-white">Technical Team</h2>
          <p className="max-w-3xl text-white/70">
            The foundational system development cohort.
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-3" data-fade>
          {capabilities.map((capability) => (
            <article
              key={capability.title}
              className="capability-card capability-card--carbon relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-white/5 to-white/0 p-6"
              data-sr="card"
            >
              <div className="capability-card__liquid" aria-hidden>
                <CarbonWaveSurface
                  className="capability-card__wave"
                  width={300}
                  height={110}
                  fill={capabilityLiquidFill}
                  segments={90}
                />
              </div>
              <div className="relative z-10">
                <h3 className="text-xl font-semibold text-white">{capability.title}</h3>
                <p className="mt-3 text-sm text-white/70">{capability.description}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="relative overflow-hidden rounded-[36px] border border-white/10 bg-white/5 p-8" data-scroll-section data-fade>
        <div
          className="absolute inset-0 bg-[radial-gradient(circle,_rgba(255,255,255,0.08),_transparent_65%)]"
          aria-hidden
          data-scroll
          data-scroll-speed="-0.5"
        />
        <div className="relative grid gap-6 lg:grid-cols-2">
          <div className="space-y-4">
            <p className="text-xs uppercase tracking-[0.4em] text-white/60">{experience.kicker}</p>
            <h2 className="text-3xl font-semibold text-white">{experience.title}</h2>
            <p className="text-white/70">{experience.description}</p>
          </div>
          <div className="grid gap-4 text-sm text-white/70">
            {experience.highlights.map((highlight) => (
              <div key={highlight} className="rounded-2xl bg-black/20 px-5 py-4 text-white" data-sr="card">
                {highlight}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="space-y-8" data-scroll-section>
        <div className="space-y-4" data-sr="section-heading" data-fade>
          <p className="text-sm uppercase tracking-[0.3em] text-white/50">Solution tracks</p>
          <h2 className="text-3xl font-semibold text-white">Built for global product, creative, and ops teams</h2>
        </div>
        <div className="grid gap-6 md:grid-cols-3" data-fade>
          {solutions.map((track) => (
            <article key={track.title} className="rounded-3xl border border-white/10 bg-white/5 p-6" data-sr="card">
              <h3 className="text-xl font-semibold text-white">{track.title}</h3>
              <p className="mt-3 text-sm text-white/70">{track.description}</p>
              <ul className="mt-4 space-y-2 text-sm text-white/70">
                {track.bullets.map((bullet) => (
                  <li key={bullet} className="flex items-center gap-2" data-sr="list-item">
                    <span className="h-1 w-1 rounded-full bg-white" aria-hidden />
                    {bullet}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>

      <section className="rounded-[36px] border border-white/15 bg-gradient-to-br from-white/10 via-fuchsia-500/10 to-transparent p-8" data-scroll-section>
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between" data-fade>
          <div className="space-y-3">
            <p className="text-xs uppercase tracking-[0.4em] text-white/70">{cta.kicker}</p>
            <h2 className="text-3xl font-semibold text-white">{cta.title}</h2>
            <p className="max-w-2xl text-white/70">{cta.description}</p>
          </div>
          <div className="flex flex-col gap-4 text-sm font-semibold uppercase tracking-wide text-white sm:flex-row">
            <Link
              href={cta.primary.href}
              className="cta-button flex h-12 items-center justify-center rounded-full bg-white px-8 text-black transition hover:bg-white/90"
            >
              {cta.primary.label}
            </Link>
            <Link
              href={cta.secondary.href}
              className="flex h-12 items-center justify-center rounded-full border border-white/40 px-8 text-white transition hover:border-white"
            >
              {cta.secondary.label}
            </Link>
          </div>
        </div>
      </section>
    </PageScaffold>
  );
}
