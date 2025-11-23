import { SectionedPage } from "./SectionedPage";

const hero = {
  kicker: "The Development Team",
  title: "A collective of linguists, engineers, and SMEs",
  description:
    "We bring together in-demand linguists, researchers, and engineers to break the black box for localization workflow evolution.",
  primary: { label: "Connect with partnerships", href: "/contact" },
  secondary: { label: "See open roles", href: "/careers" },
};

const stats = [
  { label: "Core team members", value: "3" },
  { label: "Academic affiliation", value: "1" },
  { label: "Languages spoken", value: "73+" },
];

const capabilities = [
  {
    title: "Vieux Valcin",
    description: (
      <>
        Technical Lead
        <br />
        Middlebury Institute of International Studies at Monterey
      </>
    ),
  },
  {
    title: "Boce 'Anson' Jia",
    description: (
      <>
        Machine Learning
        <br />
        Middlebury Institute of International Studies at Monterey
      </>
    ),
  },
  {
    title: "Qiqi Chen",
    description: (
      <>
        Computational Linguistics
        <br />
        Middlebury Institute of International Studies at Monterey
      </>
    ),
  },
];

const experience = {
  kicker: "Team rituals",
  title: "Radical transparency, craft mentorship",
  description:
    "From weekly motion ateliers to language councils, we invest in pairing seasoned leads with emerging builders.",
  highlights: ["Creative crits across time zones", "Live QA shadowing", "Partner feedback loops"],
};

const solutions = [
  {
    title: "Motion atelier",
    description: "Artists, editors, and animators translate complex narratives into intuitive scroll stories.",
    bullets: ["Storyboard to production", "Reusable asset libraries", "Live GSAP reviews"],
  },
  {
    title: "Language guild",
    description: "Lead linguists guide tone, compliance, and nuance across every region.",
    bullets: ["Termbase stewardship", "Cultural councils", "Rapid QA squads"],
  },
  {
    title: "Systems pod",
    description: "Engineers ensure smooth locales with telemetry, pipelines, and automation.",
    bullets: ["ScrollTrigger ops", "Locomotive tuning", "Velocity micro-tests"],
  },
];

const cta = {
  kicker: "Partner with the team",
  title: "Embed LexiQ™ experts alongside yours",
  description: "Let’s assemble the right mix of linguists, designers, and engineers for your launch.",
  primary: { label: "Plan immersion session", href: "/contact" },
  secondary: { label: "View team handbook", href: "/meet-the-team#handbook" },
};

export function MeettheTeamPageTemplate() {
  return (
    <SectionedPage
      current="team"
      hero={hero}
      stats={stats}
      capabilities={capabilities}
      experience={experience}
      solutions={solutions}
      cta={cta}
      statLiquidFill={0.83}
      statLiquidDisableLabels={["Core team members", "Academic affiliation", "Languages spoken"]}
    />
  );
}
