import { SectionedPage } from "./SectionedPage";

const hero = {
  kicker: "LexiQ™ META Lab",
  title: "Where multilingual experimentation ships to production",
  description: (
    <>
      META Lab is our internal R&D atelier for adaptive localization, motion systems, and QA instrumentation.
      <br />
      <br />
      We co-develop prototypes with partners, then harden the winning patterns into shipping workflows across campaigns.
    </>
  ),
  primary: { label: "Book a lab session", href: "/contact" },
  secondary: { label: "Explore playbooks", href: "/about#method" },
};

const stats = [
  { label: "Active prototypes", value: "12+", hoverText: "Motion systems, QA harnesses, localization ops" },
  { label: "Global SMEs", value: "40", hoverText: "In-market linguists and cultural strategists" },
  { label: "Launch cadence", value: "6 wks", hoverText: "Average time from prototype to production" },
];

const capabilities = [
  {
    title: "Multilingual prototyping",
    description: "Pair LLM workflows with handcrafted QA matrices to validate tone, compliance, and delight.",
  },
  {
    title: "Motion intelligence",
    description: "Design scroll-native canvases with GSAP, Drei, and shader-driven narratives.",
  },
  {
    title: "Observability + QA",
    description: "Telemetry hooks surface drift, latency, and coverage gaps across locales in real time.",
  },
];

const experience = {
  kicker: "Ways of working",
  title: "Atelier rituals tuned for rapid validation",
  description:
    "Every sprint blends async research, live co-builds, and retrospective instrumentation so breakthroughs keep compounding.",
  highlights: ["Dual-track discovery", "Live linguistic QA", "Launch-readiness audits"],
};

const solutions = [
  {
    title: "Adaptive QA Harness",
    description: "Instrumented suites that mix human raters with AI-assisted scoring across locales.",
    bullets: ["Compliance + cultural checks", "LLM regression sweeps", "Accessibility overlays"],
  },
  {
    title: "Scroll-native Story Systems",
    description: "Narrative components with cinematic motion, gradients, and shader accents.",
    bullets: ["WebGL playgrounds", "GSAP timelines", "Localized storytelling"],
  },
  {
    title: "Ops + Telemetry Pods",
    description: "Pods that wire insights, workflow automation, and stakeholder rituals into one command center.",
    bullets: ["Signal dashboards", "Automation scaffolds", "Program governance"],
  },
];

const cta = {
  kicker: "Partner with META Lab",
  title: "Bring us your toughest multilingual challenge",
  description:
    "Whether it's scroll-native product education or regulated QA, we co-design the blueprint and ship alongside your team.",
  primary: { label: "Start a discovery sprint", href: "/contact" },
  secondary: { label: "Download lab brief", href: "/meta-lab#brief" },
};

export function METALabPageTemplate() {
  return (
    <SectionedPage
      current="meta"
      hero={hero}
      stats={stats}
      capabilities={capabilities}
      experience={experience}
      solutions={solutions}
      cta={cta}
      statLiquidFill={0.78}
      capabilityLiquidFill={0.85}
      statLiquidDisableLabels={["Active prototypes", "Global SMEs", "Launch cadence"]}
    />
  );
}

