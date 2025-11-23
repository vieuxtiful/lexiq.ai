"use client";

import Image from "next/image";
import Link from "next/link";

import { WorkflowLottie } from "@/components/animations/WorkflowLottie";
import { PageScaffold } from "@/components/PageScaffold";
import { TabNavigation, type TabId } from "@/components/PageTabs";
import { WaveSurface } from "@/components/WaveSurface";
import { CarbonWaveSurface } from "@/components/CarbonWaveSurface";

type MainPageTemplateProps = {
  current: TabId;
};

const stats = [
  { label: "Accuracy Rate", value: "95%" },
  { label: "[Metric #2]", value: "XX%" },
  { label: "[Metric #3]", value: "XX%" },
];

const capabilities = [
  {
    title: "Linguistic Quality Assurance",
    description:
      "Language-aware sentence splitting for Western + CJK scripts with 1:1 positional matching and extra-segment alerts.",
  },
  {
    title: "Term Validator",
    description:
      "Contextual badges, ribbons, and structured popovers surface term compliance plus suggested actions so glossaries stay enforced at scale.",
  },
  {
    title: "Machine Translation",
    description:
      "Domain-specific MT models with on-device fallbacks for offline workflows.",
  },
];

const experienceHighlights = [
  "Lucide iconography + unified bottom bars",
  "Responsive safeguards against awkward wrapping",
  "Exponential backoff + graceful failover when backend slows",
];

const solutionTracks = [
  {
    title: "[Solution Track #1]",
    description: "Deploy live bilingual alignment dashboards plus the Waveform QA Button to monitor localization signal in real time.",
    bullets: [
      "Language-aware splitting & 1:1 matching",
      "Waveform QA button telemetry",
      "Bilingual diff exports for leadership decks",
    ],
  },
  {
    title: "[Solution Track #2]",
    description: "Give linguists and reviewers the Source Editor + Term Validator combo for faster, clearer decisions.",
    bullets: [
      "Inline grammar / spelling guidance",
      "Term badges & ribbons for instant context",
      "Structured tooltips with suggested actions",
    ],
  },
  {
    title: "[Solution Track #3]",
    description: "Tap resilient pipelines with dual-mask CTA animations, retry logic, and downtime-safe reporting.",
    bullets: [
      "Waveform CTA dual-mask animation",
      "Exponential backoff + retry queue",
      "Graceful degradation with alerting",
    ],
  },
];

export function MainPageTemplate({ current }: MainPageTemplateProps) {
  return (
    <PageScaffold>
      <header className="flex flex-col items-start gap-8" data-scroll-section>
        <TabNavigation current={current} />
        <div className="flex items-center gap-4 text-sm text-white/80">
          <Image src="/LexiQ_Team_Logo_(white).png" alt="LexiQ logo" width={120} height={40} priority />
        </div>
      </header>
      <section className="hero-section grid gap-12 lg:grid-cols-[1.25fr_0.75fr]" data-scroll-section>
        <div className="space-y-10">
          <div className="space-y-6">
            <p className="uppercase tracking-[0.3em] text-xs text-white/60">LQA. Simple.</p>
            <h1 className="max-w-3xl text-4xl font-semibold leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">
              Veracity. Tuned.
            </h1>
            <p className="max-w-2xl text-lg text-white/70">
              We coalesce translation management with terminology validation, machine translation, and quality assurance to streamline localization in one, unified platformーthe first and most powerful of its kind.
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-3">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="stat-card stat-card--carbon relative overflow-hidden rounded-3xl border p-4 text-center"
                data-sr="card"
                data-scroll
                data-scroll-speed="0.3"
              >
                <div className="stat-card__liquid" aria-hidden>
                  <CarbonWaveSurface
                    className="stat-card__wave"
                    width={220}
                    height={70}
                    fill={0.83}
                    segments={70}
                  />
                </div>
                <div className="relative z-10">
                  <p className="text-3xl font-semibold text-white">{stat.value}</p>
                  <p className="mt-2 text-xs uppercase tracking-wide text-white/60">{stat.label}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="flex flex-col gap-4 text-base font-medium sm:flex-row">
            <Link
              href="/about"
              className="liquid-hover relative flex h-12 items-center justify-center overflow-hidden rounded-full border border-white/30 px-6 text-sm font-semibold uppercase tracking-wide text-white/80 transition hover:border-white hover:text-white"
            >
              <div className="pointer-events-none absolute inset-0">
                <WaveSurface className="wave-surface wave-surface--base h-full w-full" palette="carbon" />
                <WaveSurface
                  className="wave-surface wave-surface--blurred h-full w-full"
                  variant="crest-mask"
                  palette="carbon"
                />
              </div>
              <span className="relative z-10">Learn More</span>
            </Link>
          </div>
        </div>
        <div className="relative flex items-center justify-center rounded-[32px] border border-white/10 bg-gradient-to-br from-white/10 via-transparent to-white/5 p-8">
          <div className="absolute -inset-4 rounded-[36px] border border-white/10 opacity-40" aria-hidden />
          <WorkflowLottie />
        </div>
      </section>

      <section className="space-y-8" data-scroll-section>
        <div className="space-y-4" data-sr="section-heading">
          <p className="text-sm uppercase tracking-[0.3em] text-white/50">Capabilities</p>
          <h2 className="text-3xl font-semibold tracking-tight text-white">Powering LexiQ™</h2>
          <p className="max-w-3xl text-white/70">
            The LexiQ AI xLQA platform combines live alignment, inline editorial intelligence, and term governance so your
            teams resolve localization issues before they reach production.
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {capabilities.map((capability) => (
            <article
              key={capability.title}
              className="rounded-3xl border border-white/10 bg-gradient-to-b from-white/5 to-white/0 p-6"
              data-sr="card"
            >
              <h3 className="text-xl font-semibold text-white">{capability.title}</h3>
              <p className="mt-3 text-sm text-white/70">{capability.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="relative overflow-hidden rounded-[36px] border border-white/10 bg-white/5 p-8" data-scroll-section>
        <div
          className="absolute inset-0 bg-[radial-gradient(circle,_rgba(255,255,255,0.08),_transparent_65%)]"
          aria-hidden
          data-scroll
          data-scroll-speed="-0.5"
        />
        <div className="relative grid gap-6 lg:grid-cols-2">
          <div className="space-y-4">
            <p className="text-xs uppercase tracking-[0.4em] text-white/60">Specifications</p>
            <h2 className="text-3xl font-semibold text-white">A Unified Platform</h2>
            <p className="text-white/70">
              Standardized bottom bars, Lucide iconography, and responsive safeguards keep every panel coherent, while
              retry logic with exponential backoff and graceful degradation ensure QA never stalls.
            </p>
          </div>
          <div className="grid gap-4 text-sm text-white/70">
            {experienceHighlights.map((highlight) => (
              <div key={highlight} className="rounded-2xl bg-black/20 px-5 py-4 text-white" data-sr="card">
                {highlight}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="space-y-8" data-scroll-section>
        <div className="space-y-4" data-sr="section-heading">
          <p className="text-sm uppercase tracking-[0.3em] text-white/50">Solution tracks</p>
          <h2 className="text-3xl font-semibold text-white">Built for translation professionals, LSPs, and enterprises.</h2>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {solutionTracks.map((track) => (
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
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-3">
            <p className="text-xs uppercase tracking-[0.4em] text-white/70">Experience LexiQ™</p>
            <h2 className="text-3xl font-semibold text-white">Let’s orchestrate your scroll-first launch</h2>
            <p className="max-w-2xl text-white/70">
              Experience the exquisite via demo.
            </p>
          </div>
          <div className="flex flex-col gap-4 text-sm font-semibold uppercase tracking-wide text-white sm:flex-row">
            <Link
              href="/contact"
              className="cta-button flex h-12 items-center justify-center rounded-full bg-white px-8 text-black transition hover:bg-white/90"
            >
              Schedule a demo
            </Link>
            <Link
              href="/meet-the-team"
              className="flex h-12 items-center justify-center rounded-full border border-white/40 px-8 text-white transition hover:border-white"
            >
              Meet with Us
            </Link>
          </div>
        </div>
      </section>
    </PageScaffold>
  );
}
