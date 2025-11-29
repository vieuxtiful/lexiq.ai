import Link from "next/link";

export const tabs = [
  { id: "home", label: "Main", href: "/" },
  { id: "about", label: "About", href: "/about" },
  { id: "team", label: "Meet the Team", href: "/meet-the-team" },
  { id: "meta", label: "META Lab", href: "/meta-lab" },
  { id: "careers", label: "Careers", href: "/careers" },
  { id: "contact", label: "Contact", href: "/contact" },
] as const;

export type TabId = (typeof tabs)[number]["id"];

export function TabNavigation({ current }: { current: TabId }) {
  return (
    <nav className="w-full">
      <div className="flex flex-wrap items-center gap-2 rounded-full border border-white/15 bg-white/5 p-1 text-sm font-medium text-white/80 shadow-lg shadow-black/20 backdrop-blur">
        {tabs.map((tab) => {
          const isActive = tab.id === current;
          return (
            <Link
              key={tab.id}
              href={{ pathname: tab.href }}
              className={`rounded-full px-4 py-2 transition-colors ${
                isActive
                  ? "bg-white text-black"
                  : "text-white/75 hover:bg-white/10"
              }`}
              aria-current={isActive ? "page" : undefined}
            >
              {tab.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
