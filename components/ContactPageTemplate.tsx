import { SectionedPage } from "./SectionedPage";

const hero = {
  kicker: "Contact LexiQ™",
  title: "Let's architect your next localization launch",
  description: "Drop us a note with your launch timeline, KPIs, and existing tooling—we'll follow up within one business day.",
  primary: { label: "Schedule discovery call", href: "/contact#form" },
  secondary: { label: "Download service deck", href: "/contact#resources" },
};

const stats = [
  { label: "Average response time", value: "<24h" },
  { label: "Delivery hubs", value: "5" },
  { label: "Time zones covered", value: "9" },
];

const capabilities = [
  {
    title: "Engagement planning",
    description: "Define scope, success metrics, and motion requirements in a single workshop.",
  },
  {
    title: "Platform onboarding",
    description: "We integrate with your CMS, DAM, and QA tooling without disrupting ops.",
  },
  {
    title: "Launch acceleration",
    description: "Dedicated pods keep workstreams moving with async reviews and real-time dashboards.",
  },
];

const experience = {
  kicker: "How we partner",
  title: "Transparent, scroll-native delivery",
  description:
    "You'll meet the leads shaping your project—from motion directors to linguistic QA managers—before kickoff.",
  highlights: ["Weekly signal reports", "Embedded Slack/Teams channel", "Motion + QA postmortems"],
};

const solutions = [
  {
    title: "Discovery sprint",
    description: "Audit current experiences, map gaps, and prioritize velocity versus fidelity.",
    bullets: ["Touchpoint inventory", "Scroll narrative mapping", "AI readiness assessment"],
  },
  {
    title: "Engagement retainer",
    description: "Keep LexiQ™ on call for continuous releases across markets and channels.",
    bullets: ["Quarterly roadmap", "Dedicated pod", "Rapid experiment queue"],
  },
  {
    title: "Advisory hours",
    description: "Tap our specialists for tooling, QA calibration, or internal team training.",
    bullets: ["Motion critiques", "Workflow audits", "Localization playbook refresh"],
  },
];

const cta = {
  kicker: "Next step",
  title: "Share your brief and timelines",
  description: "Send existing assets or just a concept—we'll respond with a tailored plan and sample motion stacks.",
  primary: { label: "Submit project details", href: "/contact#form" },
  secondary: { label: "Email vvalcin@middlebury.edu", href: "mailto:vvalcin@middlebury.edu" },
};

export function ContactPageTemplate() {
  return (
    <SectionedPage
      current="contact"
      hero={hero}
      stats={stats}
      capabilities={capabilities}
      experience={experience}
      solutions={solutions}
      cta={cta}
      statLiquidDisableLabels={["Average response time", "Delivery hubs", "Time zones covered"]}
    />
  );
}
