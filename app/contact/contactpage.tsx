"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";

import calendarIcon from "@/guidance/calendar.svg";
import emailIcon from "@/guidance/email.svg";

import { TabNavigation } from "@/components/PageTabs";
import { WaveSurface } from "@/components/WaveSurface";

import Statue from "./components/Statue";

const HERO_SHIFT_THRESHOLD = 80;
const CONTACT_EMAIL = "hello@lexiq.ai";
const CONTACT_SCHED_URL = "https://cal.com/lexiq-team/discovery";

const CONTACT_CARDS = [
  {
    href: `mailto:${CONTACT_EMAIL}`,
    label: "Instant Message",
    kicker: "META Lab / LexiQ™ Dev Team",
    description: "1-3 business days.",
    icon: emailIcon,
  },
  {
    href: CONTACT_SCHED_URL,
    label: "Request a Meeting",
    kicker: "META Lab / LexiQ™ Dev Team",
    description: "5-7 business days.",
    icon: calendarIcon,
  },
];

export default function ContactPage() {
  const [scrollY, setScrollY] = useState(0);
  const [fadeProgress, setFadeProgress] = useState(0);
  const [chromeVisible, setChromeVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const currentScroll = window.scrollY;
      setScrollY(currentScroll);

      const doc = document.documentElement;
      const scrollTop = currentScroll || doc.scrollTop || 0;
      const maxScroll = Math.max(doc.scrollHeight - window.innerHeight, 1);
      const raw = scrollTop / maxScroll;
      const clamped = Math.min(Math.max(raw, 0), 1);
      setFadeProgress(clamped);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => setChromeVisible(true), 50);
    return () => clearTimeout(timeout);
  }, []);

  const heroShifted = scrollY > HERO_SHIFT_THRESHOLD;

  return (
    <div className="contact-page relative min-h-[200vh] overflow-x-hidden bg-[#F7F8FB] text-black">
      <div className="pointer-events-none fixed inset-x-0 top-0 z-0 h-40 bg-gradient-to-b from-black/60 via-black/20 to-transparent" />
      <div className="pointer-events-none fixed top-4 left-4 h-8 w-8 border-l-2 border-t-2 border-gray-200" />
      <div className="pointer-events-none fixed top-4 right-4 h-8 w-8 border-r-2 border-t-2 border-gray-200" />
      <div className="pointer-events-none fixed bottom-4 left-4 h-8 w-8 border-b-2 border-l-2 border-gray-200" />
      <div className="pointer-events-none fixed bottom-4 right-4 h-8 w-8 border-b-2 border-r-2 border-gray-200" />

      <div
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          backgroundImage:
            "linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,1) 100%)",
          opacity: fadeProgress,
          transition: "opacity 120ms linear",
        }}
      />
      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-10 h-48 bg-gradient-to-t from-[#F7F8FB] via-[#F7F8FB]/95 to-transparent" />

      <div className="fixed inset-x-0 top-10 z-30 px-6 sm:px-10">
        <div className="mx-auto w-full max-w-5xl text-white">
          <TabNavigation current="contact" />
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
        <div className="space-y-4 animate-fade-in">
          <p className="max-w-xl text-sm leading-relaxed text-gray-700">
            <span className="font-bold">Connect with the Team</span>
            <br />
            <br />
            If you wish to become involved, whether directly with the project team, via the META Lab, or simply submit an inquiry, please provide the information requested below.
          </p>

          <div className="slot-hint flex flex-col items-start text-left text-xs font-semibold tracking-[0.4em] text-gray-500">
            <span className="slot-hint__text slot-hint__text--visible">Select communication channel</span>
          </div>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {CONTACT_CARDS.map(({ href, label, kicker, description, icon }) => {
              const isExternal = href.startsWith("http");
              return (
                <Link
                  key={label}
                  href={href}
                  target={isExternal ? "_blank" : undefined}
                  rel={isExternal ? "noreferrer" : undefined}
                  className="group relative flex h-full flex-col gap-3 rounded-2xl border border-black/10 bg-white/80 p-5 shadow-sm transition hover:-translate-y-1 hover:border-black/20 hover:bg-white"
                >
                  <div className="flex items-center gap-3">
                    <span className="relative inline-flex h-12 w-12 items-center justify-center rounded-full bg-black/5">
                      <Image src={icon} alt="" className="h-7 w-7 object-contain" />
                      <img
                        src={icon.src}
                        alt=""
                        aria-hidden
                        className="pointer-events-none absolute inset-0 h-full w-full scale-105 object-contain opacity-0 transition duration-300 group-hover:opacity-70 mix-blend-screen"
                      />
                    </span>
                    <div>
                      <p className="text-[0.65rem] uppercase tracking-[0.35em] text-gray-500">{kicker}</p>
                      <p className="text-lg font-semibold text-black">{label}</p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600">{description}</p>
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      <div className="fixed bottom-16 left-1/2 z-10 -translate-x-1/2">
        <Link
          href={`mailto:${CONTACT_EMAIL}`}
          className="liquid-hover relative flex h-12 items-center justify-center overflow-hidden rounded-full border border-white/30 px-8 text-sm font-semibold uppercase tracking-wide text-white/80 transition hover:border-white hover:text-white"
        >
          <div className="pointer-events-none absolute inset-0">
            <WaveSurface className="wave-surface wave-surface--base h-full w-full" palette="carbon" />
            <WaveSurface className="wave-surface wave-surface--blurred h-full w-full" variant="crest-mask" palette="carbon" />
          </div>
          <span className="relative z-10">Send your brief</span>
        </Link>
      </div>
      <div className="fixed inset-x-0 bottom-2 z-10 text-center text-[0.7rem] tracking-wide text-black/60">
        © 2025 LexiQ™ Development Team. All rights reserved.
      </div>
    </div>
  );
}
