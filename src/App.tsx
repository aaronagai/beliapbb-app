import { useCallback, useEffect, useLayoutEffect, useState, type ReactNode } from "react";
import { useI18n, type MessageKey } from "./i18n";
import { HomeMembershipCard } from "./HomeMembershipCard";
import { LatestNews } from "./LatestNews";
import { ApplicationPage } from "./ApplicationPage";
import { MembersPage } from "./MembersPage";
import { ProfilePage } from "./ProfilePage";
import { ResourcesPage } from "./ResourcesPage";
import { PartyWingsSection } from "./PartyWingsSection";
import { FocusAgendaSection } from "./FocusAgendaSection";
import { AgendaPlaceholderPage } from "./AgendaPlaceholderPage";
import { SiteFooter } from "./SiteFooter";
import { Logo } from "./Logo";
import { WelcomeModal, welcomeDismissedThisSession } from "./WelcomeModal";
import { JoinFab } from "./JoinFab";
import "./App.css";

type AppTab =
  | "home"
  | "members"
  | "resources"
  | "apply"
  | "profile"
  | "education"
  | "employment"
  | "emergingTech";

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
    case "education":
      return "education";
    case "employment":
      return "employment";
    case "emergingtech":
    case "emerging-tech":
      return "emergingTech";
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

function NavMenuIcon() {
  return (
    <svg className="nav-menu-icon" viewBox="0 0 24 24" aria-hidden>
      <path
        fill="currentColor"
        d="M4 7h16a1 1 0 0 0 0-2H4a1 1 0 0 0 0 2zm0 6h16a1 1 0 0 0 0-2H4a1 1 0 0 0 0 2zm0 6h16a1 1 0 0 0 0-2H4a1 1 0 0 0 0 2z"
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

function isAgendaTab(tab: AppTab): tab is "education" | "employment" | "emergingTech" {
  return tab === "education" || tab === "employment" || tab === "emergingTech";
}

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
    case "education":
      return "agendaEducationTitle";
    case "employment":
      return "agendaEmploymentTitle";
    case "emergingTech":
      return "agendaEmergingTechTitle";
    default:
      return null;
  }
}

/** Navy page-topper is for members/resources/apply/profile only — agenda uses in-page heading on grey bg. */
function pageTopperHeadingKey(tab: AppTab): MessageKey | null {
  if (isAgendaTab(tab)) return null;
  return pageHeadingKey(tab);
}

function agendaTitleKey(tab: "education" | "employment" | "emergingTech"): MessageKey {
  switch (tab) {
    case "education":
      return "agendaEducationTitle";
    case "employment":
      return "agendaEmploymentTitle";
    case "emergingTech":
      return "agendaEmergingTechTitle";
  }
}

export function App() {
  const { t } = useI18n();
  const [tab, setTab] = useState<AppTab>(initialTabFromHash);
  const defaultGreetingName = "Aaron";
  const [greetingName, setGreetingName] = useState(defaultGreetingName);
  const [navMenuOpen, setNavMenuOpen] = useState(false);
  const [headerScrolled, setHeaderScrolled] = useState(false);
  const [welcomeOpen, setWelcomeOpen] = useState(
    () => !welcomeDismissedThisSession()
  );

  useLayoutEffect(() => {
    stripFragmentFromLocation();
  }, []);

  useEffect(() => {
    const onScroll = () => {
      setHeaderScrolled(window.scrollY > 4);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!navMenuOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setNavMenuOpen(false);
    };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [navMenuOpen]);

  useEffect(() => {
    const brand = "Belia PBB";
    const byTab: Record<AppTab, string> = {
      home: brand,
      members: `${t("membersTitle")} · ${brand}`,
      resources: `${t("navResources")} · ${brand}`,
      apply: `${t("applicationTitle")} · ${brand}`,
      profile: `${t("profileTitle")} · ${brand}`,
      education: `${t("agendaEducationTitle")} · ${brand}`,
      employment: `${t("agendaEmploymentTitle")} · ${brand}`,
      emergingTech: `${t("agendaEmergingTechTitle")} · ${brand}`,
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
    setNavMenuOpen(false);
    stripFragmentFromLocation();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const topperKey = pageTopperHeadingKey(tab);
  const immersiveHeader = Boolean(topperKey && !headerScrolled && !navMenuOpen);
  const headerSolid = tab === "home" || isAgendaTab(tab) || headerScrolled || navMenuOpen;
  const showJoinFab = tab !== "apply" && !welcomeOpen && !navMenuOpen;

  const headerClass = [
    "app-header",
    immersiveHeader ? " app-header--immersive" : "",
    headerSolid && headerScrolled ? " app-header--frosted" : "",
    headerSolid && !headerScrolled ? " app-header--solid" : "",
    navMenuOpen ? " app-header--menu-open" : "",
  ].join("");

  return (
    <div className="app-shell">
      <WelcomeModal open={welcomeOpen} onClose={() => setWelcomeOpen(false)} />

      <header className={headerClass}>
        <div className="app-header-inner">
          <button
            type="button"
            className="site-brand-row site-brand-row--button"
            onClick={() => selectTab("home")}
            translate="no"
          >
            <Logo className="site-brand-logo" alt={t("logoAlt")} />
            <span className="site-brand">beliapbb.app</span>
          </button>

          <div className="header-actions">
            <button
              type="button"
              className="app-nav-toggle"
              aria-expanded={navMenuOpen}
              aria-controls="main-nav"
              onClick={() => setNavMenuOpen((open) => !open)}
            >
              <NavMenuIcon />
              <span className="visually-hidden">
                {navMenuOpen ? t("navMenuClose") : t("navMenuOpen")}
              </span>
            </button>
          </div>
        </div>
      </header>

      {navMenuOpen ? (
        <div
          className="app-nav-scrim"
          role="presentation"
          onMouseDown={() => setNavMenuOpen(false)}
        />
      ) : null}

      <nav
        id="main-nav"
        className={`app-nav${navMenuOpen ? " app-nav--open" : ""}`}
        aria-label={t("navMain")}
        hidden={!navMenuOpen}
      >
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

      <main className={`app-main${topperKey ? " app-main--with-topper" : ""}`}>
        {topperKey ? (
          <div className="page-topper">
            <div className="page-topper-inner">
              <h1 className="page-heading page-heading--topper" translate="no">
                {t(topperKey)}
              </h1>
            </div>
          </div>
        ) : null}

        <div className="page-inner">
          {tab === "home" ? (
            <>
              <section className="section section--news">
                <h2 className="greeting">
                  {t("greetingHey").replace(/\{\{name\}\}/g, greetingName)}
                </h2>
                <HomeMembershipCard />
                <LatestNews />
              </section>
              <PartyWingsSection onSelectApply={() => selectTab("apply")} />
              <FocusAgendaSection onSelectAgenda={selectTab} />
            </>
          ) : tab === "members" ? (
            <MembersPage />
          ) : tab === "resources" ? (
            <ResourcesPage />
          ) : tab === "apply" ? (
            <ApplicationPage />
          ) : isAgendaTab(tab) ? (
            <AgendaPlaceholderPage titleKey={agendaTitleKey(tab)} />
          ) : (
            <ProfilePage />
          )}
        </div>
      </main>

      <SiteFooter onSelectTab={selectTab} />
      <JoinFab visible={showJoinFab} onJoin={() => selectTab("apply")} />
    </div>
  );
}
