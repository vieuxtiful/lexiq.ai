"use client";

import Link from "next/link";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";

import { TabNavigation } from "@/components/PageTabs";

import Statue from "./components/Statue";

const teamBios = [
  {
    name: "Vieux Valcin",
    program: "Translation & Localization Management",
    affiliation: "Technical Lead, Full-Stack",
    bio: "Shaping the LexiQ™ experimentation stack by translating partner requirements into deployable localization systems that scale across markets.",
  },
  {
    name: "Boce Jia",
    program: "Translation & Localization Management",
    affiliation: "Engineer, Machine Learning",
    bio: "Machine learning specialist architecting evaluation loops, prompt governance, and telemetry safeguards for linguistic tooling in regulated environments.",
  },
  {
    name: "Qiqi Chen",
    program: "International Policy and Development",
    affiliation: "Computational Linguist",
    bio: "Driving corpus curation, multilingual QA, and cultural nuance calibration for every LexiQ™ launch.",
  },
  {
    name: "Fengshi Xu",
    program: "Translation and Localization Management",
    affiliation: "Domain-Linguistic Specialist",
    bio: "Promoting linguistic data development, deep insights, and complex knowledge integration across specified domains.",
  },
];

type TeamMember = (typeof teamBios)[number];

const heroBioName = "Vieux Valcin";
const hoverAccentColor = "#20548d";

const TypewriterHero = ({
  member,
  active,
  align = "left",
  className = "",
  delayMs = 0,
}: {
  member?: TeamMember;
  active: boolean;
  align?: "left" | "right";
  className?: string;
  delayMs?: number;
}) => {
  const [displayedText, setDisplayedText] = useState({ name: "", program: "", affiliation: "", bio: "" });
  const [showBio, setShowBio] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const typingRefs = useRef<Record<string, ReturnType<typeof setInterval> | null>>({});
  const timeoutRefs = useRef<ReturnType<typeof setTimeout>[]>([]);
  const startTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimers = useCallback(() => {
    Object.values(typingRefs.current).forEach((intervalId) => intervalId && clearInterval(intervalId));
    typingRefs.current = {};
    timeoutRefs.current.forEach((timeoutId) => clearTimeout(timeoutId));
    timeoutRefs.current = [];
    if (startTimeoutRef.current) {
      clearTimeout(startTimeoutRef.current);
      startTimeoutRef.current = null;
    }
  }, []);

  const typeWriter = useCallback((text: string, field: keyof typeof displayedText, speed: number) => {
    let index = 0;
    if (typingRefs.current[field]) {
      clearInterval(typingRefs.current[field] as ReturnType<typeof setInterval>);
    }
    typingRefs.current[field] = setInterval(() => {
      setDisplayedText((prev) => ({
        ...prev,
        [field]: text.slice(0, index + 1),
      }));
      index += 1;
      if (index >= text.length) {
        const intervalId = typingRefs.current[field];
        if (intervalId) {
          clearInterval(intervalId);
          typingRefs.current[field] = null;
        }
      }
    }, speed);
  }, []);

  const startTyping = useCallback(() => {
    if (!member) {
      return;
    }
    clearTimers();
    setDisplayedText({ name: "", program: "", affiliation: "", bio: "" });
    setShowBio(false);
    const schedule = [
      { field: "name", text: member.name, speed: 100, delay: 0 },
      { field: "program", text: member.program, speed: 50, delay: 200 },
      { field: "affiliation", text: member.affiliation, speed: 100, delay: 400 },
    ] as const;

    schedule.forEach(({ field, text, speed, delay }) => {
      const timeoutId = setTimeout(() => typeWriter(text, field, speed), delay);
      timeoutRefs.current.push(timeoutId);
    });

    const bioTimeout = setTimeout(() => {
      setDisplayedText((prev) => ({ ...prev, bio: member.bio }));
      setShowBio(true);
    }, 800);
    timeoutRefs.current.push(bioTimeout);
  }, [clearTimers, member, typeWriter]);

  useEffect(() => {
    if (active) {
      startTimeoutRef.current = setTimeout(() => {
        startTyping();
      }, delayMs);
    } else {
      clearTimers();
      setDisplayedText({ name: "", program: "", affiliation: "", bio: "" });
      setShowBio(false);
    }
    return () => {
      clearTimers();
    };
  }, [active, clearTimers, delayMs, startTyping]);

  if (!member) {
    return null;
  }

  const handleNameHover = (hovering: boolean) => {
    setIsHovered(hovering);
  };

  return (
    <div
      className={`space-y-2 transition-all duration-700 ${
        active ? "opacity-100 translate-y-0" : "pointer-events-none opacity-0 translate-y-4"
      } ${align === "right" ? "text-right" : "text-left"} ${className}`}
    >
      <div className="typewriter-text text-[clamp(1.4rem,4vw,3rem)] font-semibold text-black">
        <span
          className="inline-block transition-colors duration-300"
          style={{ color: isHovered ? hoverAccentColor : undefined }}
          onMouseEnter={() => handleNameHover(true)}
          onMouseLeave={() => handleNameHover(false)}
        >
          {displayedText.name}
        </span>
        <span className="blinking-caret" aria-hidden="true" />
      </div>
      <div className="typewriter-text text-xs font-semibold uppercase tracking-[0.4em] text-black/80">
        {displayedText.program}
        <span className="blinking-caret" aria-hidden="true" />
      </div>
      <div className="typewriter-text text-xs text-black/70">
        {displayedText.affiliation}
        <span className="blinking-caret" aria-hidden="true" />
      </div>
      <div className={`text-xs text-black/70 ${showBio ? "bio-fade-in" : "bio-fade-out"}`}>{displayedText.bio}</div>
    </div>
  );
};

export default function MeetTheTeamPage() {
  const [scrollY, setScrollY] = useState(0);
  const [segmentHeight, setSegmentHeight] = useState(400);
  const [chromeVisible, setChromeVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const updateSegment = () => setSegmentHeight(Math.max(window.innerHeight * 0.22, 180));
    updateSegment();
    window.addEventListener("resize", updateSegment);
    return () => window.removeEventListener("resize", updateSegment);
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => setChromeVisible(true), 50);
    return () => clearTimeout(timeout);
  }, []);

  const heroMembers = [
    { member: teamBios[0], align: "left" as const, className: "absolute left-0 -top-2 max-w-sm", delay: 1000 },
    { member: teamBios[1], align: "right" as const, className: "absolute right-0 -top-2 max-w-sm", delay: 0 },
    { member: teamBios[2], align: "left" as const, className: "absolute left-0 top-[12.25rem] max-w-sm", delay: 0 },
    { member: teamBios[3], align: "right" as const, className: "absolute right-0 top-[12.25rem] max-w-sm", delay: 150 },
  ];

  const stages = heroMembers.length;
  const currentStage = Math.min(Math.floor(scrollY / segmentHeight), stages);
  const heroShifted = currentStage > 0;

  const showScrollHint = scrollY < 80;

  return (
    <div className="relative min-h-[200vh] overflow-x-hidden bg-[#FAFAFA] text-black">
      <div className="pointer-events-none fixed inset-x-0 top-0 z-0 h-40 bg-gradient-to-b from-black/70 via-black/30 to-transparent" />
      <div className="pointer-events-none fixed top-4 left-4 h-8 w-8 border-l-2 border-t-2 border-gray-300" />
      <div className="pointer-events-none fixed top-4 right-4 h-8 w-8 border-r-2 border-t-2 border-gray-300" />
      <div className="pointer-events-none fixed bottom-4 left-4 h-8 w-8 border-b-2 border-l-2 border-gray-300" />
      <div className="pointer-events-none fixed bottom-4 right-4 h-8 w-8 border-b-2 border-r-2 border-gray-300" />

      <div className="fixed inset-x-0 top-0 z-20 flex flex-col items-center gap-4 px-6 pt-6">
        <div className="w-full max-w-4xl text-white">
          <TabNavigation current="team" />
        </div>
        <div
          className={`mt-28 flex flex-col items-center gap-2 transition-opacity duration-700 ${
            chromeVisible ? "opacity-100" : "opacity-0"
          }`}
        >
          <div className="flex w-full max-w-3xl items-center justify-between text-white">
            <Image
              src="/miis-logo.svg"
              alt="Middlebury Institute of International Studies"
              width={192}
              height={64}
              priority
              className="h-16 w-auto -translate-x-6 object-contain sm:-translate-x-10"
            />
            <Image
              src="/meta-lab-logo.svg"
              alt="META Laboratory"
              width={160}
              height={48}
              priority
              className="h-12 w-auto translate-x-6 object-contain sm:translate-x-10"
            />
          </div>
        </div>
      </div>

      <Statue scrollY={scrollY} />

      <div
        className={`fixed left-16 top-48 z-10 flex w-full max-w-4xl flex-col gap-7 text-left transition-all duration-500 ${
          heroShifted ? "translate-y-0 opacity-100" : "-translate-y-1 opacity-95"
        }`}
      >
        <div className={`animate-fade-in ${heroShifted ? "self-start" : "self-start"}`}>
          <div className="group relative inline-flex">
            <Image
              src="/we-are-removebg.png"
              alt="We are"
              width={520}
              height={180}
              priority
              className="h-auto w-[min(420px,70vw)] object-contain translate-y-8 sm:translate-y-12"
            />
            <div
              className="pointer-events-none absolute inset-0 rounded-sm opacity-0 transition-opacity duration-300 group-hover:opacity-100"
              style={{ backgroundColor: "rgba(255,255,255,0.08)" }}
            />
          </div>
        </div>
        <div className="mt-12 space-y-4 animate-fade-in">
          <p className="max-w-xl text-sm leading-relaxed text-gray-700 transition-all duration-500">
            ...a passionate graduate student cohort piqued by the potential of artificial intelligence and technology to automate and improve.
            <br />
            <br />
            Through the
            <span className="text-[#20548d]"> Mixed-Methods Evaluation, Training, and Analysis (META) Laboratory </span>
            at the Institute, capabilities to streamline workflows are developed to stymie wasteful resource utilization, enabling enhanced user experiences across domains.
          </p>

          <div
            className={`slot-hint text-xs font-semibold tracking-[0.4em] text-gray-500 transition-opacity duration-500 ${
              showScrollHint ? "opacity-100" : "opacity-40"
            }`}
          >
            <span
              className={`slot-hint__text ${
                showScrollHint ? "slot-hint__text--visible" : "slot-hint__text--hidden"
              }`}
            >
              Scroll for more
              <span className="slot-hint__arrow" aria-hidden>
                ↓
              </span>
            </span>
          </div>
        </div>

        {heroShifted && (
          <div className="relative w-full max-w-5xl min-h-[520px]">
            {heroMembers.map((config, index) => (
              <TypewriterHero
                key={config.member?.name ?? index}
                member={config.member}
                active={currentStage > index}
                align={config.align}
                className={`${config.className}`}
                delayMs={config.delay ?? 0}
              />
            ))}
          </div>
        )}
      </div>
      <div className="fixed bottom-8 left-1/2 z-10 -translate-x-1/2">
        <div className="flex items-center gap-8 rounded-full bg-black/80 px-8 py-4 text-white backdrop-blur-sm">
          <Link href="/meta-lab" className="text-sm font-light transition-colors hover:text-gray-300">
            About The META Lab →
          </Link>
        </div>
      </div>
    </div>
  );
}
