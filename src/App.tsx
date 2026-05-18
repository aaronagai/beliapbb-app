import { useCallback, useEffect, useLayoutEffect, useState, type ReactNode } from "react";
import logoSvgUrl from "../logo.svg?url";
import { useI18n, type MessageKey } from "./i18n";
import { HomeMembershipCard } from "./HomeMembershipCard";
import { LatestNews } from "./LatestNews";
import { ApplicationPage } from "./ApplicationPage";
import { MembersPage } from "./MembersPage";
import { ProfilePage } from "./ProfilePage";
import { ConstitutionChatSheet } from "./ConstitutionChatSheet";
import { ResourcesPage } from "./ResourcesPage";
import { PartyWingsSection } from "./PartyWingsSection";
import "./App.css";

type AppTab = "home" | "members" | "resources" | "apply" | "profile";

function stripFragmentFromLocation() {
  if (typeof window === "undefined") return;
  const { pathname, search, hash } = window.location;
  if (!hash) return;
  window.history.replaceState(null, "", `${pathname}${search}`);
}

function initialTabFromHash(): AppTab {
  if (typeof window === "undefined") return "home";
  switch (window.location.hash.slice(1).toLowerCase()) {
    case "members":
      return "members";
    case "resources":
      return "resources";
    case "profile":
      return "profile";
    case "apply":
      return "apply";
    case "home":
      return "home";
    default:
      return "home";
  }
}

function IconHome() {
  return (
    <svg className="nav-icon" viewBox="0 0 24 24" aria-hidden>
      <path fill="currentColor" d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8h5z" />
    </svg>
  );
}

function IconMembers() {
  return (
    <svg className="nav-icon" viewBox="0 0 24 24" aria-hidden>
      <path
        fill="currentColor"
        d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.67V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"
      />
    </svg>
  );
}

function IconSparkles() {
  return (
    <svg className="nav-icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M9 4.5a.75.75 0 01.721.544l.813 2.846a3.75 3.75 0 002.576 2.576l2.846.813a.75.75 0 010 1.442l-2.846.813a3.75 3.75 0 00-2.576 2.576l-.813 2.846a.75.75 0 01-1.442 0l-.813-2.846a3.75 3.75 0 00-2.576-2.576l-2.846-.813a.75.75 0 010-1.442l2.846-.813A3.75 3.75 0 007.466 7.89l.813-2.846A.75.75 0 019 4.5zM18 1.5a.75.75 0 01.728.568l.258 1.036c.236.94.97 1.674 1.91 1.91l1.036.258a.75.75 0 010 1.456l-1.036.258c-.94.236-1.674.97-1.91 1.91l-.258 1.036a.75.75 0 01-1.456 0l-.258-1.036a2.625 2.625 0 00-1.91-1.91l-1.036-.258a.75.75 0 010-1.456l1.036-.258a2.625 2.625 0 001.91-1.91l.258-1.036A.75.75 0 0118 1.5zM16.5 15a.75.75 0 01.712.513l.394 1.183c.15.447.5.799.948.948l1.183.395a.75.75 0 010 1.422l-1.183.395c-.447.15-.799.5-.948.948l-.395 1.183a.75.75 0 01-1.422 0l-.395-1.183a1.5 1.5 0 00-.948-.948l-1.183-.395a.75.75 0 010-1.422l1.183-.395c.447-.15.799-.5.948-.948l.395-1.183A.75.75 0 0116.5 15z"
      />
    </svg>
  );
}

function IconResources() {
  return (
    <svg className="nav-icon" viewBox="0 0 24 24" aria-hidden>
      <path
        fill="currentColor"
        d="M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm16-4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-1 9H9V9h10v2zm-4 4H9v-2h6v2zm4-8H9V5h10v2z"
      />
    </svg>
  );
}

function IconProfile() {
  return (
    <svg className="nav-icon" viewBox="0 0 24 24" aria-hidden>
      <path
        fill="currentColor"
        d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"
      />
    </svg>
  );
}

const NAV_ITEMS: { tab: AppTab; labelKey: MessageKey; icon: () => ReactNode }[] = [
  { tab: "home", labelKey: "navHome", icon: IconHome },
  { tab: "members", labelKey: "navMembers", icon: IconMembers },
  { tab: "resources", labelKey: "navResources", icon: IconResources },
  { tab: "profile", labelKey: "navProfile", icon: IconProfile },
];

function pageHeadingKey(tab: AppTab): MessageKey | null {
  switch (tab) {
    case "members":
      return "membersTitle";
    case "resources":
      return "navResources";
    case "apply":
      return "applicationTitle";
    case "profile":
      return "profileTitle";
    default:
      return null;
  }
}

export function App() {
  const { t } = useI18n();
  const [tab, setTab] = useState<AppTab>(initialTabFromHash);
  const defaultGreetingName = "Aaron";
  const [greetingName, setGreetingName] = useState(defaultGreetingName);
  const [constitutionChatOpen, setConstitutionChatOpen] = useState(false);

  useLayoutEffect(() => {
    stripFragmentFromLocation();
  }, []);

  useEffect(() => {
    const brand = "Belia PBB";
    const byTab: Record<AppTab, string> = {
      home: brand,
      members: `${t("membersTitle")} · ${brand}`,
      resources: `${t("navResources")} · ${brand}`,
      apply: `${t("applicationTitle")} · ${brand}`,
      profile: `${t("profileTitle")} · ${brand}`,
    };
    document.title = byTab[tab];
  }, [tab, t]);

  useEffect(() => {
    if (tab !== "home") return;
    try {
      const raw = localStorage.getItem("beliapbb_profile");
      if (!raw) {
        setGreetingName(defaultGreetingName);
        return;
      }
      const p = JSON.parse(raw) as { name?: string };
      const n = typeof p.name === "string" ? p.name.trim() : "";
      setGreetingName(n || defaultGreetingName);
    } catch {
      setGreetingName(defaultGreetingName);
    }
  }, [tab]);

  const selectTab = useCallback((next: AppTab) => {
    setTab(next);
    stripFragmentFromLocation();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const headingKey = pageHeadingKey(tab);

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="app-header-inner">
          <button
            type="button"
            className="site-brand-row site-brand-row--button"
            onClick={() => selectTab("home")}
            translate="no"
          >
            <img
              src={logoSvgUrl}
              alt={t("logoAlt")}
              className="site-brand-logo"
              width={120}
              height={32}
              decoding="async"
            />
            <span className="site-brand">beliapbb.app</span>
          </button>

          <nav className="app-nav" aria-label={t("navMain")}>
            {NAV_ITEMS.map(({ tab: navTab, labelKey, icon: Icon }) => (
              <button
                key={navTab}
                type="button"
                className={`app-nav-item${tab === navTab ? " app-nav-item--active" : ""}`}
                aria-current={tab === navTab ? "page" : undefined}
                onClick={() => selectTab(navTab)}
              >
                <Icon />
                <span>{t(labelKey)}</span>
              </button>
            ))}
          </nav>

          <button
            type="button"
            className="header-ai-btn"
            aria-label={t("fabAria")}
            onClick={() => setConstitutionChatOpen(true)}
          >
            <IconSparkles />
            <span className="header-ai-btn-label">{t("constitutionChatTitle")}</span>
          </button>
        </div>
      </header>

      <main className="app-main">
        <div className="page-inner">
          {headingKey ? (
            <h1 className="page-heading" translate="no">
              {t(headingKey)}
            </h1>
          ) : null}

          {tab === "home" ? (
            <>
              <section className="section section--news">
                <h2 className="greeting">
                  {t("greetingHey").replace(/\{\{name\}\}/g, greetingName)}
                </h2>
                <HomeMembershipCard />
                <h3 className="section-title">
                  <span className="section-title-inline">
                    {t("latestNews")}
                    <span className="section-title-sep">|</span>
                  </span>
                  <a
                    className="news-source-link"
                    href="https://jiwabakti.com.my/"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {t("jiwaBaktiLink")}
                  </a>
                </h3>
                <LatestNews />
                <p className="news-see-more">
                  <a
                    className="news-source-link"
                    href="https://jiwabakti.com.my/"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {t("newsSeeMore")}
                  </a>
                </p>
              </section>
              <PartyWingsSection onSelectApply={() => selectTab("apply")} />
            </>
          ) : tab === "members" ? (
            <MembersPage />
          ) : tab === "resources" ? (
            <ResourcesPage />
          ) : tab === "apply" ? (
            <ApplicationPage />
          ) : (
            <ProfilePage />
          )}
        </div>
      </main>

      <ConstitutionChatSheet
        open={constitutionChatOpen}
        onClose={() => setConstitutionChatOpen(false)}
      />
    </div>
  );
}
