"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";

import facebookIcon from "@/guidance/facebook.svg";
import instagramIcon from "@/guidance/instagram.svg";

import { TabNavigation } from "@/components/PageTabs";
import { WaveSurface } from "@/components/WaveSurface";

import Statue from "./components/Statue";

const SCROLL_HINT_TEXT = "META Lab website";
const META_LAB_MEMBERS_URL = "https://sites.middlebury.edu/metalab/";
const HERO_SHIFT_THRESHOLD = 80;
const SOCIAL_LINKS = [
  {
    href: "https://x.com/MIIS_META_LAB",
    label: "META Lab on X",
    icon: facebookIcon,
  },
  {
    href: "https://www.instagram.com/metalab_MIIS/",
    label: "META Lab on Instagram",
    icon: instagramIcon,
  },
];

export default function MetaLabPage() {
  const [scrollY, setScrollY] = useState(0);
  const [chromeVisible, setChromeVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => setChromeVisible(true), 50);
    return () => clearTimeout(timeout);
  }, []);

  const heroShifted = scrollY > HERO_SHIFT_THRESHOLD;

  return (
    <div className="meta-lab-page relative min-h-[200vh] overflow-x-hidden bg-[#FAFAFA] text-black">
      <div className="pointer-events-none fixed inset-x-0 top-0 z-0 h-40 bg-gradient-to-b from-black/70 via-black/30 to-transparent" />
      <div className="pointer-events-none fixed top-4 left-4 h-8 w-8 border-l-2 border-t-2 border-gray-300" />
      <div className="pointer-events-none fixed top-4 right-4 h-8 w-8 border-r-2 border-t-2 border-gray-300" />
      <div className="pointer-events-none fixed bottom-4 left-4 h-8 w-8 border-b-2 border-l-2 border-gray-300" />
      <div className="pointer-events-none fixed bottom-4 right-4 h-8 w-8 border-b-2 border-r-2 border-gray-300" />

      <div className="fixed inset-x-0 top-10 z-30 px-6 sm:px-10">
        <div className="mx-auto w-full max-w-5xl text-white">
          <TabNavigation current="meta" />
        </div>
      </div>

      <div
        className={`fixed inset-x-0 top-[15rem] z-20 flex flex-col items-center gap-2 px-6 transition-opacity duration-700 ${
          chromeVisible ? "opacity-100" : "opacity-0"
        }`}
      >
        <div className="mx-auto flex w-full max-w-5xl items-center justify-center text-white" />
      </div>

      <Statue scrollY={scrollY} />

      <div
        className={`fixed left-16 top-48 z-10 flex w-full max-w-4xl flex-col gap-7 text-left transition-all duration-500 ${
          heroShifted ? "translate-y-0 opacity-100" : "-translate-y-1 opacity-95"
        }`}
      >
        <div className={`animate-fade-in ${heroShifted ? "self-start" : "self-start"}`}>
          <div className="group relative inline-flex -translate-x-2 translate-y-14 sm:-translate-x-3 sm:translate-y-18">
            <Image
              src="/meta-lab-logo.svg"
              alt="META Laboratory"
              width={520}
              height={180}
              priority
              className="h-auto w-[min(420px,70vw)] object-contain"
            />
            <img
              src="/meta-lab-logo.svg"
              alt="META glow overlay"
              aria-hidden
              className="pointer-events-none absolute inset-0 h-full w-full object-contain opacity-0 transition-opacity duration-275 group-hover:opacity-30 mix-blend-screen brightness-195 saturate-5"
            />
            <div
              className="pointer-events-none absolute inset-0 rounded-sm opacity-0 transition-opacity duration-300 group-hover:opacity-100"
              style={{ backgroundColor: "rgba(255,255,255,0.08)" }}
            />
          </div>
        </div>
        <div className="mt-12 space-y-4 animate-fade-in">
          <p className="max-w-xl text-sm leading-relaxed text-gray-700 transition-all duration-500">
            <br/>
            <span className="font-bold">About</span>
            <br />
            <br />
            The MIIS Mixed-Methods Evaluation, Training, and Analysis (META) Laboratory is a hub for multidisciplinary research, new innovation, and professional development. 
            <br />
            <br />
            Led by Philip Murphy, Ph.D., the META Laboratory is composed of a curated selection of SMEs, visionaries, and brainiacs, and oversees rigorous student-led initiatives across engineering, data, and qualitative research disciplines. 
            Its members collaborate on noteworthy projects, most of which involve specialized analytical and programming tools (R, Python, JavaScript) and frameworks.
            Here, data-driven solutions are developed to streamline workflows and stymie wasteful resource utilization, increasing efficiency and enabling enhanced user experiences across domains.
          </p>

          <div className="slot-hint flex flex-col items-start text-left text-xs font-semibold tracking-[0.4em] text-gray-500 opacity-100">
            <span className="slot-hint__text slot-hint__text--visible">
              {SCROLL_HINT_TEXT}
              <span className="slot-hint__arrow" aria-hidden>
                ↓
              </span>
            </span>
            <a
              href={META_LAB_MEMBERS_URL}
              target="_blank"
              rel="noreferrer"
              className="mt-1 inline-flex justify-start text-left text-[0.68rem] font-semibold uppercase tracking-[0.35em] text-[#20548d] transition-colors hover:text-[#163355]"
            >
              {META_LAB_MEMBERS_URL}
            </a>
            <div className="group/video relative mt-4 w-full max-w-lg overflow-hidden rounded-2xl border border-black/10 bg-black/5 shadow-lg transition-all duration-500 ease-out will-change-transform hover:-translate-y-1 hover:border-black/20 hover:bg-black/10 hover:shadow-2xl">
              <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover/video:opacity-70" style={{ background: "radial-gradient(circle at 30% 20%, rgba(255,255,255,0.25), transparent 55%)" }} />
              <iframe
                className="aspect-video h-full w-full"
                src="https://www.youtube.com/embed/Tzf_DHCKYXw"
                title="META Lab overview video"
                loading="lazy"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            </div>
            <div className="mt-4 flex items-center gap-2" aria-label="META Lab social links">
              {SOCIAL_LINKS.map(({ href, label, icon }) => (
                <Link
                  key={href}
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  className="group relative inline-flex h-10 w-10 items-center justify-center rounded-full border border-black/10 bg-white/60 text-black shadow-sm ring-offset-2 transition hover:border-black/30 hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/30"
                  aria-label={label}
                >
                  <Image src={icon} alt={label} className="h-7 w-7 object-contain" />
                  <img
                    src={icon.src}
                    alt=""
                    aria-hidden
                    className="pointer-events-none absolute inset-0 h-full w-full scale-105 object-contain opacity-0 transition-transform transition-opacity duration-275 group-hover:scale-110 group-hover:opacity-80 mix-blend-screen brightness-200 saturate-150"
                  />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className="fixed bottom-8 left-1/2 z-10 -translate-x-1/2">
        <Link
          href="/contact"
          className="liquid-hover relative flex h-12 items-center justify-center overflow-hidden rounded-full border border-white/30 px-8 text-sm font-semibold uppercase tracking-wide text-white/80 transition hover:border-white hover:text-white"
        >
          <div className="pointer-events-none absolute inset-0">
            <WaveSurface className="wave-surface wave-surface--base h-full w-full" palette="carbon" />
            <WaveSurface className="wave-surface wave-surface--blurred h-full w-full" variant="crest-mask" palette="carbon" />
          </div>
          <span className="relative z-10">Contact</span>
        </Link>
      </div>
    </div>
  );
}
