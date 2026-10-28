import type { CSSProperties, ReactNode } from "react";
import { useI18n, type MessageKey } from "../i18n";

export type TabBarTab = "home" | "tanya" | "berita" | "sertai" | "saya";

type IconPair = { outline: ReactNode; filled: ReactNode };

/* Outline when idle, filled when active (icon swap). 24px grid, 1.8 stroke. */
const ICONS: Record<TabBarTab, IconPair> = {
  home: {
    outline: <path d="M4 10.5 12 4l8 6.5V19a1 1 0 0 1-1 1h-4.5v-5.5h-5V20H5a1 1 0 0 1-1-1Z" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />,
    filled: <path d="M4 10.5 12 4l8 6.5V19a1 1 0 0 1-1 1h-4.5v-5.5h-5V20H5a1 1 0 0 1-1-1Z" fill="currentColor" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />,
  },
  tanya: {
    outline: <path d="M7 5h10a3 3 0 0 1 3 3v6a3 3 0 0 1-3 3h-5l-4.2 3.2c-.5.4-1.3 0-1.3-.6V17H7a3 3 0 0 1-3-3V8a3 3 0 0 1 3-3Z" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />,
    filled: <path d="M7 5h10a3 3 0 0 1 3 3v6a3 3 0 0 1-3 3h-5l-4.2 3.2c-.5.4-1.3 0-1.3-.6V17H7a3 3 0 0 1-3-3V8a3 3 0 0 1 3-3Z" fill="currentColor" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />,
  },
  berita: {
    outline: (
      <>
        <rect x="4" y="5" width="16" height="14" rx="2.5" fill="none" stroke="currentColor" strokeWidth="1.8" />
        <path d="M8 9.5h8M8 13h8M8 16.5h5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </>
    ),
    filled: (
      <>
        <rect x="4" y="5" width="16" height="14" rx="2.5" fill="currentColor" stroke="currentColor" strokeWidth="1.8" />
        <path d="M8 9.5h8M8 13h8M8 16.5h5" stroke="var(--app-bg)" strokeWidth="1.8" strokeLinecap="round" />
      </>
    ),
  },
  sertai: {
    outline: (
      <>
        <circle cx="10" cy="8.5" r="3.5" fill="none" stroke="currentColor" strokeWidth="1.8" />
        <path d="M3.5 19.5c.6-3.4 3.2-5.5 6.5-5.5 1.3 0 2.5.3 3.5.9M18 13.5v6M15 16.5h6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </>
    ),
    filled: (
      <>
        <circle cx="10" cy="8.5" r="3.5" fill="currentColor" stroke="currentColor" strokeWidth="1.8" />
        <path d="M3.5 19.5c.6-3.4 3.2-5.5 6.5-5.5 1.3 0 2.5.3 3.5.9V19.5Z" fill="currentColor" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
        <path d="M18 13.5v6M15 16.5h6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
      </>
    ),
  },
  saya: {
    outline: (
      <>
        <circle cx="12" cy="8.5" r="3.8" fill="none" stroke="currentColor" strokeWidth="1.8" />
        <path d="M4.5 20c.7-3.8 3.7-6 7.5-6s6.8 2.2 7.5 6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </>
    ),
    filled: (
      <>
        <circle cx="12" cy="8.5" r="3.8" fill="currentColor" stroke="currentColor" strokeWidth="1.8" />
        <path d="M4.5 20c.7-3.8 3.7-6 7.5-6s6.8 2.2 7.5 6Z" fill="currentColor" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      </>
    ),
  },
};

const TABS: { tab: TabBarTab; labelKey: MessageKey }[] = [
  { tab: "home", labelKey: "navHome" },
  { tab: "tanya", labelKey: "navTanya" },
  { tab: "berita", labelKey: "navBerita" },
  { tab: "sertai", labelKey: "navSertai" },
  { tab: "saya", labelKey: "navSaya" },
];

/** Phone: fixed to the bottom (thumb zone). Laptop: a centred pill under the header. */
export function TabBar({ active, onSelect }: { active: TabBarTab; onSelect: (tab: TabBarTab) => void }) {
  const { t } = useI18n();
  const index = TABS.findIndex((x) => x.tab === active);

  return (
    <nav className="app-tabbar" aria-label={t("appNavAria")}>
      <div className="app-tabbar-track" style={{ "--active": index, "--count": TABS.length } as CSSProperties}>
        <span className="app-tabbar-indicator" aria-hidden="true" />
        {TABS.map(({ tab, labelKey }) => {
          const isActive = tab === active;
          return (
            <button
              key={tab}
              type="button"
              className={`app-tabbar-item${isActive ? " is-active" : ""}`}
              aria-current={isActive ? "page" : undefined}
              onClick={() => onSelect(tab)}
            >
              <span className="app-tabbar-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" className="app-tabbar-svg app-tabbar-svg--outline">
                  {ICONS[tab].outline}
                </svg>
                <svg viewBox="0 0 24 24" className="app-tabbar-svg app-tabbar-svg--filled">
                  {ICONS[tab].filled}
                </svg>
              </span>
              <span className="app-tabbar-label">{t(labelKey)}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
