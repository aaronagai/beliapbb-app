import { useCallback, useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { useI18n, type MessageKey } from "./i18n";
import { HomeMembershipCard } from "./HomeMembershipCard";
import { LatestNews } from "./LatestNews";
import { FtesPage, type FtesNavTarget } from "./FtesPage";
import { Logo } from "./Logo";
import { LEADERSHIP_URL, SITE_URL } from "./links";
import { TabBar, type TabBarTab } from "./app/TabBar";
import { TanyaPage } from "./app/TanyaPage";
import { PerlembagaanPage } from "./app/PerlembagaanPage";
import { SertaiPage } from "./app/SertaiPage";
import { SayaPage } from "./app/SayaPage";
import "./App.css";
import "./app/AppShell.css";

/** Tabs in the bar, plus the two assistants that open full screen from Tanya. */
type AppTab = TabBarTab | "ftes" | "perlembagaan";

const TAB_HASH: Record<AppTab, string> = {
  home: "",
  tanya: "tanya",
  ftes: "ftes",
  perlembagaan: "perlembagaan",
  berita: "berita",
  sertai: "sertai",
  saya: "saya",
};

/** Hashes from the pre-2026 app, still in shared links. */
const LEGACY_HASH: Record<string, AppTab> = {
  apply: "sertai",
  resources: "sertai",
  profile: "saya",
  education: "home",
  employment: "home",
  emergingtech: "home",
  "emerging-tech": "home",
};

/** The member list moved to the public site. */
const MOVED_TO_SITE: Record<string, string> = {
  members: LEADERSHIP_URL,
};

const FULL_SCREEN: ReadonlySet<AppTab> = new Set(["ftes", "perlembagaan"]);

function tabUrl(tab: AppTab): string {
  const { pathname, search } = window.location;
  const hash = TAB_HASH[tab];
  return `${pathname}${search}${hash ? `#${hash}` : ""}`;
}

function tabFromHash(): AppTab {
  const hash = window.location.hash.slice(1).toLowerCase();
  const direct = (Object.keys(TAB_HASH) as AppTab[]).find((tab) => TAB_HASH[tab] === hash);
  return direct ?? LEGACY_HASH[hash] ?? "home";
}

/** Which bar item lights up: the assistants belong to Tanya. */
function barTab(tab: AppTab): TabBarTab {
  return FULL_SCREEN.has(tab) ? "tanya" : (tab as TabBarTab);
}

const DOC_TITLE: Record<AppTab, MessageKey | null> = {
  home: null,
  tanya: "tanyaTitle",
  ftes: "ftesDocTitle",
  perlembagaan: "perlembagaanNav",
  berita: "latestNews",
  sertai: "applicationTitle",
  saya: "profileTitle",
};

function readGreetingName(): string {
  try {
    const raw = localStorage.getItem("beliapbb_profile");
    const name = raw ? (JSON.parse(raw) as { name?: unknown }).name : "";
    return typeof name === "string" ? name.trim().split(/\s+/)[0] ?? "" : "";
  } catch {
    return "";
  }
}

function QuickAction({ label, onClick, href, icon }: { label: string; onClick?: () => void; href?: string; icon: ReactNode }) {
  const body = (
    <>
      <span className="app-quick-icon" aria-hidden="true">
        <svg viewBox="0 0 24 24">{icon}</svg>
      </span>
      <span className="app-quick-label">{label}</span>
    </>
  );
  return href ? (
    <a className="app-quick" href={href}>
      {body}
    </a>
  ) : (
    <button type="button" className="app-quick" onClick={onClick}>
      {body}
    </button>
  );
}

const STROKE = { fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round", strokeLinejoin: "round" } as const;

function HomePage({ go }: { go: (tab: AppTab) => void }) {
  const { t } = useI18n();
  const [name, setName] = useState(readGreetingName);
  useEffect(() => setName(readGreetingName()), []);

  return (
    <div className="app-page app-home">
      <h1 className="app-greeting">{name ? t("greetingHey").replace(/\{\{name\}\}/g, name) : t("appWelcome")}</h1>
      <HomeMembershipCard onEditProfile={() => go("saya")} />
      <nav className="app-quick-grid" aria-label={t("homeQuickAria")}>
        <QuickAction
          label={t("homeQuickFtes")}
          onClick={() => go("ftes")}
          icon={<path {...STROKE} d="M4 9.5 12 5l8 4.5-8 4.5Zm3 2v4c0 1.4 2.2 2.5 5 2.5s5-1.1 5-2.5v-4" />}
        />
        <QuickAction
          label={t("homeQuickConstitution")}
          onClick={() => go("perlembagaan")}
          icon={<path {...STROKE} d="M6 4.5h9.5a2 2 0 0 1 2 2v13H8a2 2 0 0 1-2-2Zm0 13a2 2 0 0 1 2-2h9.5M9.5 8.5h5" />}
        />
        <QuickAction
          label={t("homeQuickJoin")}
          onClick={() => go("sertai")}
          icon={<path {...STROKE} d="M10 11.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Zm-6.5 8c.6-3.4 3.2-5.5 6.5-5.5 1.3 0 2.5.3 3.5.9M18 13.5v6M15 16.5h6" />}
        />
        <QuickAction
          label={t("homeQuickLeaders")}
          href={LEADERSHIP_URL}
          icon={<path {...STROKE} d="M8.5 10.5a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm7 1a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5ZM3 19c.5-3 2.7-5 5.5-5s5 2 5.5 5m.5-4.6c.5-.2 1-.4 1.5-.4 2.3 0 4 1.6 4.5 4" />}
        />
      </nav>
      <LatestNews count={3} onSeeAll={() => go("berita")} />
    </div>
  );
}

export function App() {
  const { t } = useI18n();
  const [tab, setTab] = useState<AppTab>(tabFromHash);
  const tabRef = useRef(tab);
  useEffect(() => {
    tabRef.current = tab;
  }, [tab]);
  const [scrolled, setScrolled] = useState(false);

  // Old links: #members leaves for the site; legacy and unknown hashes are rewritten in place.
  useLayoutEffect(() => {
    const moved = MOVED_TO_SITE[window.location.hash.slice(1).toLowerCase()];
    if (moved) {
      window.location.replace(moved);
      return;
    }
    window.history.replaceState(window.history.state, "", tabUrl(tabFromHash()));
  }, []);

  useEffect(() => {
    const onPop = () => {
      const next = tabFromHash();
      if (next !== tabRef.current) window.scrollTo({ top: 0 });
      setTab(next);
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const key = DOC_TITLE[tab];
    document.title = key ? `${t(key)} · Belia PBB` : "Belia PBB";
  }, [tab, t]);

  const go = useCallback((next: AppTab) => {
    if (next !== tabFromHash()) window.history.pushState(null, "", tabUrl(next));
    setTab(next);
    window.scrollTo({ top: 0 });
  }, []);

  const onFtesNavigate = useCallback((target: FtesNavTarget) => go(target), [go]);

  if (tab === "ftes") return <FtesPage onNavigate={onFtesNavigate} />;

  return (
    <div className={`app-shell app2${FULL_SCREEN.has(tab) ? " is-full" : ""}`}>
      <header className={`app2-header${scrolled ? " is-scrolled" : ""}`}>
        <div className="app2-header-inner">
          <button type="button" className="app2-brand" onClick={() => go("home")} translate="no">
            <Logo className="app2-brand-logo" alt={t("logoAlt")} />
            <span>Belia PBB</span>
          </button>
          <a className="app2-site-link" href={SITE_URL}>
            {t("appSiteLink")}
          </a>
        </div>
      </header>

      <main className="app2-main">
        {tab === "home" ? (
          <HomePage go={go} />
        ) : tab === "tanya" ? (
          <TanyaPage onOpenFtes={() => go("ftes")} onOpenPerlembagaan={() => go("perlembagaan")} />
        ) : tab === "perlembagaan" ? (
          <PerlembagaanPage onBack={() => go("tanya")} />
        ) : tab === "berita" ? (
          <div className="app-page">
            <h1 className="app-page-title">{t("latestNews")}</h1>
            <LatestNews count={20} showHeading={false} />
          </div>
        ) : tab === "sertai" ? (
          <SertaiPage />
        ) : (
          <SayaPage />
        )}
      </main>

      {FULL_SCREEN.has(tab) ? null : <TabBar active={barTab(tab)} onSelect={go} />}
    </div>
  );
}
