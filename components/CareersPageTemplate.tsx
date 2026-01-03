import { SectionedPage } from "./SectionedPage";

const hero = {
  kicker: "Join LexiQ™",
  title: "Careers",
  description: <p>Coming soon.</p>,
  primary: { label: "Learn about us", href: "/meet-the-team" },
  secondary: { label: "Meet with us", href: "/contact" },
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
      useScaffold={useScaffold}
      showHeader={showHeader}
      wrapperClassName={wrapperClassName}
    />
  );
}