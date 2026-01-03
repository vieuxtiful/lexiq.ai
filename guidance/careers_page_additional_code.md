Careers Page
Additional Code, starting from line 21
///////////////////////////////////////////////////////////////////
const stats = [
  { label: "Studios across time zones", value: "5" },
  { label: "Learning stipend", value: "$2.5k" },
  { label: "Annual R&D sprints", value: "4" },
];

const capabilities = [
  {
    title: "Hybrid craft",
    description: "Pair GSAP, Drei, and post-processing artistry with rigorous localization QA playbooks.",
  },
  {
    title: "Impactful launches",
    description: "Ship scroll-native experiences for AI, fintech, and entertainment brands every quarter.",
  },
  {
    title: "Growth mindset",
    description: "Weekly ateliers, critiques, and technical deep dives keep everyone leveling up.",
  },
];

const experience = {
  kicker: "Working model",
  title: "Remote-first, atelier-driven",
  description:
    "We operate on async rituals (Monday intents, Wednesday motion labs, Friday retros) plus optional in-person residencies.",
  highlights: ["Quarterly team residencies", "Annual craft stipend", "Personalized mentorship pods"],
};

const solutions = [
  {
    title: "Creative Engineering",
    description: "Join our GSAP, Drei, and shader experts bringing cinematic systems to the browser.",
    bullets: ["Motion + systems design", "Shader playgrounds", "Custom scroll narratives"],
  },
  {
    title: "Linguistic QA",
    description: "Lead cultural, compliance, and voice QA across enterprise launches.",
    bullets: ["In-market SMEs", "AI-assisted tooling", "High-trust client partnerships"],
  },
  {
    title: "Program & Ops",
    description: "Orchestrate pods, telemetry, and stakeholder rituals from brief to launch.",
    bullets: ["Synchronous + async rituals", "QA instrumentation", "Sprint retros with visibility"],
  },
];

const cta = {
  kicker: "Be part of it",
  title: "Send us your reel, portfolio, or curiosity",
  description:
    "We review every note. Share links, prototypes, or process docs—even if a role isn't listed, we're always meeting builders.",
  primary: { label: "Submit interest", href: "mailto:careers@lexiq.ai" },
  secondary: { label: "Download hiring deck", href: "/careers#deck" },
};

type CareersPageTemplateProps = {
  useScaffold?: boolean;
  showHeader?: boolean;
  wrapperClassName?: string;
};

export function CareersPageTemplate({
  useScaffold = true,
  showHeader = true,
  wrapperClassName,
}: CareersPageTemplateProps = {}) {
  return (
    <SectionedPage
      current="careers"
      hero={hero}
      stats={stats}
      capabilities={capabilities}
      experience={experience}
      solutions={solutions}
      cta={cta}
      statLiquidFill={0.83}
      statLiquidDisableLabels={[
        "Studios across time zones",
        "Learning stipend",
        "Annual R&D sprints",
      ]}
      useScaffold={useScaffold}
      showHeader={showHeader}
      wrapperClassName={wrapperClassName}
    />
  );
}