"use client";

import Image from "next/image";
import Link from "next/link";

import { PageScaffold } from "@/components/PageScaffold";
import { type TabId } from "@/components/PageTabs";
import { WaveSurface } from "@/components/WaveSurface";

type MainPageTemplateProps = {
  current: TabId;
};

const capabilities = [
  {
    title: "Linguistic Quality Assurance",
    description:
      "Language-aware sentence splitting for Western + CJK scripts with 1:1 positional matching and extra-segment alerts.",
  },
  {
    title: "Terminology Validator",
    description:
      "Contextual badges, ribbons, and structured popovers surface term compliance plus suggested actions so glossaries stay enforced at scale.",
  },
  {
    title: "Machine Translation",
    description:
      "Domain-specific MT models with on-device fallbacks for offline workflows.",
  },
];

export function MainPageTemplate({ current }: MainPageTemplateProps) {
  return (
    <PageScaffold>
      <div className="flex h-full flex-col">
        <div className="flex flex-1 flex-col justify-between gap-8">
          <section className="hero-section" data-scroll-section>
            <div className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center gap-4 text-sm text-white/80">
                  <Image
                    src="/LexiQ_Team_Logo_(white).png"
                    alt="LexiQ logo"
                    width={120}
                    height={40}
                    priority
                  />
                </div>
                <p className="uppercase tracking-[0.3em] text-xs text-white/60">LQA. Simple.</p>
                <h1 className="max-w-3xl text-4xl font-semibold leading-tight tracking-tight text-white sm:text-5xl">
                  Veracity. Tuned.
                </h1>
                <p className="max-w-2xl text-base text-white/70">
                  We coalesce translation management with terminology validation, machine translation, and quality assurance to
                  streamline localization in one, unified platformーthe first and most powerful of its kind.
                </p>
              </div>
              <div className="flex flex-col gap-4 text-sm font-semibold sm:flex-row">
                <Link
                  href="/about"
                  className="liquid-hover relative flex h-11 items-center justify-center overflow-hidden rounded-full border border-white/30 px-6 uppercase tracking-wide text-white/80 transition hover:border-white hover:text-white"
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
          </section>

          <div className="space-y-6" data-scroll-section>
            <section className="space-y-4" data-sr="section-heading">
              <br />
              <br />
              <p className="text-xs uppercase tracking-[0.4em] text-white/50">Capabilities</p>
              <h2 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">Powering LexiQ™</h2>
              <p className="max-w-2xl text-sm text-white/70">
                LexiQ is not just another QA tool; it's a paradigm shift built on proprietary technology and a forward-thinking
                approach.
              </p>
            </section>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {capabilities.map((capability) => (
                <article
                  key={capability.title}
                  className="liquid-hover relative flex flex-col justify-between gap-3 overflow-hidden rounded-4xl border border-white/30 bg-transparent p-5 text-white/80 transition hover:border-white hover:bg-white/10"
                  data-sr="card"
                >
                  <div className="pointer-events-none absolute inset-0">
                    <WaveSurface className="wave-surface wave-surface--base h-full w-full" palette="carbon" />
                    <WaveSurface
                      className="wave-surface wave-surface--blurred h-full w-full"
                      variant="crest-mask"
                      palette="carbon"
                    />
                  </div>
                  <div className="relative z-10 space-y-2 text-white/80 transition duration-300 group-hover:text-white">
                    <h3 className="text-lg font-semibold">{capability.title}</h3>
                    <p className="text-xs">{capability.description}</p>
                  </div>
                </article>
              ))}
            </div>
            <br />
            <br />
            <br />
            <div className="space-y-6">
              <p className="text-xs font-semibold uppercase tracking-[0.4em] text-white/80">
                Partnerships, Features &amp; Affiliations
              </p>
              <div className="flex flex-wrap items-center gap-12">
                <Image
                  src="/locworld-logo.svg"
                  alt="LocWorld logo"
                  width={320}
                  height={120}
                  className="h-12 w-auto opacity-100"
                  priority
                />
                <Image
                  src="/process-innovation-challenge-logo.svg"
                  alt="Process Innovation Challenge logo"
                  width={320}
                  height={120}
                  className="h-12 w-auto opacity-100"
                  priority
                />
                <Image
                  src="/meta-laboratory-logo-light.svg"
                  alt="META Laboratory logo"
                  width={320}
                  height={120}
                  className="h-12 w-auto opacity-100"
                  priority
                />
                <Image
                  src="/miis-logo-rev.svg"
                  alt="MIIS logo"
                  width={320}
                  height={120}
                  className="h-12 w-auto opacity-100"
                  priority
                />
              </div>
            </div>
          </div>
        </div>
        <div className="fixed inset-x-0 bottom-4 z-20 text-center text-[0.7rem] tracking-wide text-white/60">
          © 2025 LexiQ™ Development Team. All rights reserved.
        </div>
      </div>
    </PageScaffold>
  );
}
