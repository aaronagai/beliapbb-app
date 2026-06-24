import { useCallback, useEffect, useLayoutEffect, useState } from "react";
import { CONSTITUTION_PDF_URL } from "./constitutionPdf";
import { ExternalLinkArrowIcon } from "./ExternalLinkArrowIcon";
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

const JIWABAKTI_HREF = "https://jiwabakti.com.my/";
const KENALI_ABOUT_WIKI_MS =
  "https://ms.wikipedia.org/wiki/Parti_Pesaka_Bumiputera_Bersatu_Sarawak";

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

function NavCloseIcon() {
  return (
    <svg className="nav-menu-icon" viewBox="0 0 24 24" aria-hidden>
      <path
        fill="currentColor"
        d="M19 6.41 17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"
      />
    </svg>
  );
}

const NAV_PRIMARY: { tab: AppTab; labelKey: MessageKey }[] = [
  { tab: "home", labelKey: "navHome" },
  { tab: "resources", labelKey: "navResources" },
  { tab: "education", labelKey: "agendaEducation" },
  { tab: "employment", labelKey: "agendaEmployment" },
  { tab: "emergingTech", labelKey: "agendaEmergingTech" },
  { tab: "members", labelKey: "navMembers" },
  { tab: "apply", labelKey: "kenaliApply" },
];

const NAV_SECONDARY_TABS: { tab: AppTab; labelKey: MessageKey }[] = [
  { tab: "profile", labelKey: "navProfile" },
];

const NAV_SECONDARY_EXTERNAL: { href: string; labelKey: MessageKey }[] = [
  { href: KENALI_ABOUT_WIKI_MS, labelKey: "kenaliAbout" },
  { href: CONSTITUTION_PDF_URL, labelKey: "kenaliConstitution" },
  { href: JIWABAKTI_HREF, labelKey: "jiwaBaktiLink" },
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

  const closeNavMenu = useCallback(() => {
    setNavMenuOpen(false);
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
            <span className="site-brand">Belia PBB</span>
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
          className="app-nav-overlay"
          role="dialog"
          aria-modal="true"
          aria-label={t("navMain")}
        >
          <div className="app-nav-overlay-top">
            <button
              type="button"
              className="app-nav-overlay-brand"
              onClick={() => selectTab("home")}
              translate="no"
            >
              <Logo className="site-brand-logo" alt={t("logoAlt")} />
              <span className="app-nav-overlay-brand-text">{t("welcomeTitle")}</span>
            </button>
            <button
              type="button"
              className="app-nav-overlay-close"
              onClick={closeNavMenu}
              aria-label={t("navMenuClose")}
            >
              <NavCloseIcon />
            </button>
          </div>

          <nav id="main-nav" className="app-nav-overlay-body" aria-label={t("navMain")}>
            <ul className="app-nav-primary">
              {NAV_PRIMARY.map(({ tab: navTab, labelKey }) => (
                <li key={navTab}>
                  <button
                    type="button"
                    className={`app-nav-primary-item${tab === navTab ? " app-nav-primary-item--active" : ""}`}
                    aria-current={tab === navTab ? "page" : undefined}
                    onClick={() => selectTab(navTab)}
                  >
                    {t(labelKey)}
                  </button>
                </li>
              ))}
            </ul>

            <div className="app-nav-separator" role="separator" />

            <ul className="app-nav-secondary">
              {NAV_SECONDARY_TABS.map(({ tab: navTab, labelKey }) => (
                <li key={navTab}>
                  <button
                    type="button"
                    className={`app-nav-secondary-item${tab === navTab ? " app-nav-secondary-item--active" : ""}`}
                    aria-current={tab === navTab ? "page" : undefined}
                    onClick={() => selectTab(navTab)}
                  >
                    {t(labelKey)}
                  </button>
                </li>
              ))}
              {NAV_SECONDARY_EXTERNAL.map(({ href, labelKey }) => (
                <li key={href}>
                  <a
                    className="app-nav-secondary-item app-nav-secondary-item--external"
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={closeNavMenu}
                  >
                    {t(labelKey)}
                    <ExternalLinkArrowIcon className="app-nav-external-arrow" />
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      ) : null}

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
              </section>
              <PartyWingsSection onSelectApply={() => selectTab("apply")} />
              <LatestNews />
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
