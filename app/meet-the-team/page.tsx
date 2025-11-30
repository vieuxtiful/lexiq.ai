"use client";

import Link from "next/link";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";

import { TabNavigation } from "@/components/PageTabs";
import { WaveSurface } from "@/components/WaveSurface";

import Statue from "./components/Statue";

const teamBios = [
  {
    name: "Vieux Valcin",
    program: "Translation and Localization Management",
    affiliation: "Technical Lead, Full-Stack",
    bio: "Joined META Lab in September 2025",
  },
  {
    name: "Boce Jia",
    program: "Translation and Localization Management",
    affiliation: "Engineer, Machine Learning",
    bio: "Class of 2026",
  },
  {
    name: "Qiqi Chen",
    program: "International Policy and Development",
    affiliation: "Computational Linguist",
    bio: "Joined META Lab in September 2024",
  },
  {
    name: "Fengshi Xu",
    program: "Translation and Localization Management",
    affiliation: "Domain-Linguistic Specialist",
    bio: "Joined META Lab in September 2025",
  },
];

type TeamMember = (typeof teamBios)[number];
type TypingField = "name" | "program" | "affiliation";

const heroBioName = "Vieux Valcin";
const hoverAccentColor = "#20548d";
const loopExemptAffiliations = new Set<string>([
  "Technical Lead, Full-Stack",
  "Engineer, Machine Learning",
  "Computational Linguist",
  "Domain-Linguistic Specialist",
]);
const acceleratedProgramFade = new Set<string>([
  "Translation & Localization Management",
  "Translation and Localization Management",
  "International Policy and Development",
]);

const getHeroMember = (name: TeamMember["name"]) => teamBios.find((member) => member.name === name);

const TypewriterHero = ({
  member,
  active,
  align = "left",
  className = "",
  delayMs = 0,
  holdTyping = false,
}: {
  member?: TeamMember;
  active: boolean;
  align?: "left" | "right";
  className?: string;
  delayMs?: number;
  holdTyping?: boolean;
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

  const typeWriter = useCallback(
    (text: string, field: keyof typeof displayedText, speed: number, onComplete?: () => void) => {
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
          if (onComplete) {
            onComplete();
          }
        }
      }, speed);
    },
    []
  );

  const startTyping = useCallback(() => {
    if (!member) {
      return;
    }
    clearTimers();
    setDisplayedText({ name: "", program: "", affiliation: "", bio: "" });
    setShowBio(false);
    const schedule = [
      { field: "name" as const, text: member.name, speed: 100, delay: 0 },
      { field: "program" as const, text: member.program, speed: 50, delay: 200 },
      { field: "affiliation" as const, text: member.affiliation, speed: 100, delay: 400 },
    ];

    schedule.forEach(({ field, text, speed, delay }) => {
      const timeoutId = setTimeout(() => {
        typeWriter(text, field, speed, () => {
          if (field === "affiliation") {
            setDisplayedText((prev) => ({ ...prev, bio: member.bio }));
            setShowBio(true);
          }
        });
      }, delay);
      timeoutRefs.current.push(timeoutId);
    });
  }, [clearTimers, member, typeWriter]);

  useEffect(() => {
    if (!active) {
      clearTimers();
      setDisplayedText({ name: "", program: "", affiliation: "", bio: "" });
      setShowBio(false);
      return () => {
        clearTimers();
      };
    }

    if (holdTyping) {
      clearTimers();
      return () => {
        clearTimers();
      };
    }

    startTimeoutRef.current = setTimeout(() => {
      startTyping();
    }, delayMs);

    return () => {
      clearTimers();
    };
  }, [active, clearTimers, delayMs, holdTyping, startTyping]);

  useEffect(() => {
    if (holdTyping) {
      setDisplayedText({ name: "", program: "", affiliation: "", bio: "" });
      setShowBio(false);
    }
  }, [holdTyping]);

  if (!member) {
    return null;
  }

  const getCaretClass = (field: TypingField) => {
    const classes = ["blinking-caret"];

    if (field === "name") {
      classes.push("name-caret");
    }

    const hasCompletedField = displayedText[field] === member[field];

    if (!hasCompletedField) {
      return classes.join(" ");
    }

    const skipLoop = field === "affiliation" && loopExemptAffiliations.has(member.affiliation);

    if (skipLoop) {
      classes.push("blinking-caret--sequence-no-loop");
      return classes.join(" ");
    }

    if (field === "name") {
      classes.push("blinking-caret--sequence-name");
    } else if (field === "program" && acceleratedProgramFade.has(member.program)) {
      classes.push("blinking-caret--sequence-program-fast");
    } else {
      classes.push("blinking-caret--sequence");
    }

    return classes.join(" ");
  };

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
        <span className={getCaretClass("name")} aria-hidden="true" />
      </div>
      <div className="typewriter-text text-xs font-semibold uppercase tracking-[0.4em] text-black/80">
        {displayedText.program}
        <span className={getCaretClass("program")} aria-hidden="true" />
      </div>
      <div className="typewriter-text text-xs text-black/70">
        {displayedText.affiliation}
        <span className={getCaretClass("affiliation")} aria-hidden="true" />
      </div>
      <div className={`text-xs text-black/70 ${showBio ? "bio-fade-in" : "bio-fade-out"}`}>{displayedText.bio}</div>
    </div>
  );
};

export default function MeetTheTeamPage() {
  const [scrollY, setScrollY] = useState(0);
  const [segmentHeight, setSegmentHeight] = useState(400);
  const [chromeVisible, setChromeVisible] = useState(false);
  const [hasScrolled, setHasScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (scrollY <= 4) {
      setHasScrolled(false);
      return;
    }
    setHasScrolled(true);
  }, [scrollY]);

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
    {
      member: getHeroMember("Vieux Valcin"),
      align: "left" as const,
      className: "absolute left-0 -top-2 max-w-sm",
      delay: 700,
      scrollTrigger: 0.35,
    },
    {
      member: getHeroMember("Boce Jia"),
      align: "right" as const,
      className: "absolute right-0 -top-2 max-w-sm",
      delay: 100,
      scrollTrigger: 1.15,
    },
    {
      member: getHeroMember("Qiqi Chen"),
      align: "left" as const,
      className: "absolute left-0 top-[12.25rem] max-w-sm",
      delay: 200,
      scrollTrigger: 1.95,
    },
    {
      member: getHeroMember("Fengshi Xu"),
      align: "right" as const,
      className: "absolute right-0 top-[12.25rem] max-w-sm",
      delay: 350,
      scrollTrigger: 2.75,
    },
  ];

  const scrollUnits = scrollY / Math.max(segmentHeight, 1);
  const heroShifted = scrollUnits >= (heroMembers[0]?.scrollTrigger ?? 0);

  const showScrollHint = scrollY < 80;

  return (
    <div className="relative min-h-[200vh] overflow-x-hidden bg-[#FAFAFA] text-black">
      <div className="pointer-events-none fixed inset-x-0 top-0 z-0 h-40 bg-gradient-to-b from-black/70 via-black/30 to-transparent" />
      <div className="pointer-events-none fixed top-4 left-4 h-8 w-8 border-l-2 border-t-2 border-gray-300" />
      <div className="pointer-events-none fixed top-4 right-4 h-8 w-8 border-r-2 border-t-2 border-gray-300" />
      <div className="pointer-events-none fixed bottom-4 left-4 h-8 w-8 border-b-2 border-l-2 border-gray-300" />
      <div className="pointer-events-none fixed bottom-4 right-4 h-8 w-8 border-b-2 border-r-2 border-gray-300" />

      <div className="fixed inset-x-0 top-10 z-30 px-6 sm:px-10">
        <div className="mx-auto w-full max-w-5xl text-white">
          <TabNavigation current="team" />
        </div>
      </div>

      <div
        className={`fixed inset-x-0 top-[15rem] z-20 flex flex-col items-center gap-2 px-6 transition-opacity duration-700 ${
          chromeVisible ? "opacity-100" : "opacity-0"
        }`}
      >
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between text-white">
          <div className="group relative inline-flex -translate-x-2 items-center sm:-translate-x-4">
            <Image
              src="/miis-logo.svg"
              alt="Middlebury Institute of International Studies"
              width={192}
              height={64}
              priority
              className="h-16 w-auto object-contain"
            />
            <img
              src="/miis-logo.svg"
              alt="Middlebury glow overlay"
              aria-hidden
              className="pointer-events-none absolute inset-0 h-full w-full object-contain opacity-0 transition-opacity duration-275 group-hover:opacity-30 mix-blend-screen brightness-145 saturate-5"
            />
          </div>
          <div className="group relative inline-flex -translate-x-16 items-center sm:-translate-x-20">
            <Image
              src="/meta-lab-logo.svg"
              alt="META Laboratory"
              width={160}
              height={48}
              priority
              className="h-12 w-auto object-contain"
            />
            <img
              src="/meta-lab-logo.svg"
              alt="META glow overlay"
              aria-hidden
              className="pointer-events-none absolute inset-0 h-full w-full object-contain opacity-0 transition-opacity duration-275 group-hover:opacity-30 mix-blend-screen brightness-195 saturate-5"
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
              src="/we-are.svg"
              alt="We are"
              width={520}
              height={180}
              priority
              className="h-auto w-[min(420px,70vw)] object-contain -translate-x-2 translate-y-14 sm:-translate-x-3 sm:translate-y-18"
            />
            <div
              className="pointer-events-none absolute inset-0 rounded-sm opacity-0 transition-opacity duration-300 group-hover:opacity-100"
              style={{ backgroundColor: "rgba(255,255,255,0.08)" }}
            />
          </div>
        </div>
        <div className="mt-12 space-y-4 animate-fade-in">
          <p className="max-w-xl text-sm leading-relaxed text-gray-700 transition-all duration-500">
            ...a passionate graduate student cohort piqued by the potential of AI, information, and technology to expedite quotidian localization processes.
            <br />
            <br />
            Through the
            <span className="text-[#20548d]"> Mixed-Methods Evaluation, Training, and Analysis (META) Laboratory </span>
            at the Middlebury Institute, data-driven solutions are developed to streamline workflows and stymie wasteful resource utilization, increasing efficiency and enabling enhanced user experiences across domains.
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

        <div className="relative w-full max-w-5xl min-h-[520px]">
          {heroShifted
            ? heroMembers.map((config, index) => (
                <TypewriterHero
                  key={config.member?.name ?? index}
                  member={config.member}
                  active={scrollUnits >= config.scrollTrigger}
                  align={config.align}
                  className={`${config.className}`}
                  delayMs={config.delay ?? 0}
                />
              ))
            : heroMembers[0]?.member && (
                <TypewriterHero
                  member={heroMembers[0].member}
                  active={!hasScrolled}
                  align={heroMembers[0].align}
                  className={`${heroMembers[0].className}`}
                  delayMs={heroMembers[0].delay ?? 0}
                  holdTyping={!hasScrolled}
                />
              )}
        </div>
      </div>
      <div className="fixed bottom-8 left-1/2 z-10 -translate-x-1/2">
        <Link
          href="/meta-lab"
          className="liquid-hover relative flex h-12 items-center justify-center overflow-hidden rounded-full border border-white/30 px-8 text-sm font-semibold uppercase tracking-wide text-white/80 transition hover:border-white hover:text-white"
        >
          <div className="pointer-events-none absolute inset-0">
            <WaveSurface className="wave-surface wave-surface--base h-full w-full" palette="carbon" />
            <WaveSurface className="wave-surface wave-surface--blurred h-full w-full" variant="crest-mask" palette="carbon" />
          </div>
          <span className="relative z-10">About the META Lab</span>
        </Link>
      </div>
    </div>
  );
}
