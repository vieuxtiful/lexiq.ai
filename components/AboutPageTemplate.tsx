import { SectionedPage } from "./SectionedPage";

const hero = {
  kicker: "Inside LexiQ™",
  title: "Built by linguists, engineers, and SMEs.",
  description:  (
  <>
  Our team comprises a dynamic blend of expert linguists, cutting-edge AI researchers, and seasoned program leaders, united by their proven track record of delivering advanced localization solutions to some of the most prominent global brands. 
    <br />
    <br />
    Together, we leverage deep expertise in computational linguistics, AI-powered language technologies, and strategic product development to drive innovation and transform the localization industry.
  </>
  ),
    primary: { label: "See our methodology", href: "/about#method" },
  secondary: { label: "Meet the leadership", href: "/meet-the-team" },
};

const stats = [
  {
    label: "Regions supported",
    value: "6",
    hoverText: "North America, Europe, Asia, Middle East & Africa, Latin America, & Oceania",
  },
  { label: "Integrated toolchains", value: "18", hoverText: "Toolchain hover text" },
  { label: "Human QA partners", value: "65", hoverText: "QA partners hover text" },
];

const capabilities = [
  {
    title: "Research-backed QA",
    description: "Benchmarks tuned per industry with live cultural raters and compliance experts.",
  },
  {
    title: "Adaptive playbooks",
    description: "Reusable patterns for regulated, entertainment, and enterprise content.",
  },
  {
    title: "Signal observability",
    description: "Scroll-triggered dashboards that surface drift the moment it appears.",
  },
];

const experience = {
  kicker: "Operating principles",
  title: "Systems thinking meets editorial care",
  description:
    "Every workflow is co-designed with your team, pairing our orchestration framework with your voice and governance needs.",
  highlights: ["Transparent review ladders", "Localized motion libraries", "24-hour sprint retros"],
};

const solutions = [
  {
    title: "Studio Pods",
    description: "Embedded partner pods accelerate launch velocity across business units.",
    bullets: ["Dedicated producers", "Shared knowledge base", "Rolling KPI reviews"],
  },
  {
    title: "Compliance Lab",
    description: "Joint audits ensure legal, cultural, and accessibility targets ship day one.",
    bullets: ["Regional SMEs", "Accessibility sweeps", "Live variance reporting"],
  },
  {
    title: "Innovation Guild",
    description: "Prototype new scroll narratives, interactive glossaries, and programmatic art.",
    bullets: ["Quarterly labs", "Creative codex", "Motion QA matrix"],
  },
];

const cta = {
  kicker: "Work with us",
  title: "Build a localization center of excellence",
  description: "Unify every market touchpoint with thoughtful animations, QA instrumentation, and storytelling.",
  primary: { label: "Book strategy session", href: "/contact" },
  secondary: { label: "Download program brief", href: "/about#brief" },
};

export const ABOUT_PAGE_CONTENT = {
  hero,
  stats,
  capabilities,
  experience,
  solutions,
  cta,
  statLiquidFill: 0.83,
  capabilityLiquidFill: 0.83,
  statLiquidDisableLabels: ["Regions supported", "Integrated toolchains", "Human QA partners"],
};

type AboutPageTemplateProps = {
  useScaffold?: boolean;
  showHeader?: boolean;
  wrapperClassName?: string;
};

export function AboutPageTemplate({
  useScaffold = true,
  showHeader = true,
  wrapperClassName,
}: AboutPageTemplateProps = {}) {
  const {
    hero,
    stats,
    capabilities,
    experience,
    solutions,
    cta,
    statLiquidFill,
    capabilityLiquidFill,
    statLiquidDisableLabels,
  } = ABOUT_PAGE_CONTENT;

  return (
    <SectionedPage
      current="about"
      hero={hero}
      stats={stats}
      capabilities={capabilities}
      experience={experience}
      solutions={solutions}
      cta={cta}
      statLiquidFill={statLiquidFill}
      capabilityLiquidFill={capabilityLiquidFill}
      statLiquidDisableLabels={statLiquidDisableLabels}
      useScaffold={useScaffold}
      showHeader={showHeader}
      wrapperClassName={wrapperClassName}
    />
  );
}
