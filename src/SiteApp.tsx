import { useCallback, useEffect, useState } from "react";
import { useI18n, type MessageKey } from "./i18n";
import { Logo } from "./Logo";
import { FtesPage, type FtesNavTarget } from "./FtesPage";
import { SITE_URL, type SitePage } from "./links";
import { TanyaPage } from "./app/TanyaPage";
import { PerlembagaanPage } from "./app/PerlembagaanPage";
import { SertaiPage } from "./app/SertaiPage";
import "./App.css";
import "./app/AppShell.css";

/**
 * beliapbb.com's other pages (the former app): the join flow and the two assistants. No tabs, no accounts.
 * Same visual shell as before (top bar, wide centred form), reached by plain addresses like /sertai/.
 */
const BASE = import.meta.env.BASE_URL;

const DOC_TITLE: Record<SitePage, MessageKey> = {
  sertai: "applicationTitle",
  tanya: "tanyaTitle",
  ftes: "ftesDocTitle",
  perlembagaan: "perlembagaanNav",
};

function pageFromPath(fallback: SitePage): SitePage {
  const rest = window.location.pathname.startsWith(BASE) ? window.location.pathname.slice(BASE.length) : "";
  const seg = rest.split("/")[0] as SitePage;
  return seg in DOC_TITLE ? seg : fallback;
}

export function SiteApp({ initial }: { initial: SitePage }) {
  const { t, language, setLanguage } = useI18n();
  const [page, setPage] = useState<SitePage>(initial);
  const [scrolled, setScrolled] = useState(false);

  const go = useCallback((next: SitePage) => {
    window.history.pushState(null, "", `${BASE}${next}/`);
    window.scrollTo({ top: 0 });
    setPage(next);
  }, []);

  useEffect(() => {
    const onPop = () => setPage(pageFromPath(initial));
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, [initial]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.title = `${t(DOC_TITLE[page])} · Belia PBB`;
  }, [page, t]);

  const leave = () => window.location.assign(SITE_URL);

  if (page === "ftes") {
    return (
      <FtesPage
        onNavigate={(target: FtesNavTarget) => {
          if (target === "home") leave();
          else go(target === "tanya" ? "tanya" : "sertai");
        }}
      />
    );
  }

  const joining = page === "sertai";
  return (
    <div className={`app-shell app2${page === "perlembagaan" ? " is-full" : ""}${joining ? " is-focus" : ""}`}>
      <header className={`app2-header${scrolled ? " is-scrolled" : ""}`}>
        <div className="app2-header-inner">
          <div className="app2-header-left">
            <a className="app2-brand" href={SITE_URL} translate="no">
              <Logo className="app2-brand-logo" alt={t("logoAlt")} />
              <span>Belia PBB</span>
            </a>
            {joining ? (
              <>
                <span className="app2-focus-divider" aria-hidden />
                <span className="app2-focus-title">{t("applicationTitle")}</span>
              </>
            ) : null}
          </div>
          {joining ? (
            <div className="app2-header-right">
              <button
                type="button"
                className="app2-lang"
                role="switch"
                aria-checked={language === "en"}
                aria-label="Bahasa / Language"
                data-lang={language}
                onClick={() => setLanguage(language === "en" ? "ms" : "en")}
                translate="no"
              >
                <span className="app2-lang-thumb" aria-hidden />
                <span className="app2-lang-opt">BM</span>
                <span className="app2-lang-opt">EN</span>
              </button>
              <button type="button" className="app2-site-link app2-exit" onClick={leave} aria-label={t("focusExit")}>
                <span className="app2-exit-text">{t("focusExit")}</span>
                <span className="app2-exit-x" aria-hidden />
              </button>
            </div>
          ) : (
            <a className="app2-site-link" href={SITE_URL}>
              {t("appSiteLink")}
            </a>
          )}
        </div>
      </header>

      <main className="app2-main">
        {page === "tanya" ? (
          <TanyaPage onOpenFtes={() => go("ftes")} onOpenPerlembagaan={() => go("perlembagaan")} />
        ) : page === "perlembagaan" ? (
          <PerlembagaanPage onBack={() => go("tanya")} />
        ) : (
          <SertaiPage onExit={leave} />
        )}
      </main>
    </div>
  );
}
