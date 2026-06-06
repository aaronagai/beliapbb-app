import logoSvgUrl from "../logo.svg?url";
import { CONSTITUTION_PDF_URL } from "./constitutionPdf";
import { useI18n, type Language } from "./i18n";
import { useTheme } from "./theme";

const JIWABAKTI_HREF = "https://jiwabakti.com.my/";

export type FooterTab = "members" | "resources" | "apply" | "profile";

type SiteFooterProps = {
  onSelectTab?: (tab: FooterTab) => void;
};

function IconSun() {
  return (
    <svg
      className="site-footer-theme-icon"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2" />
      <path d="M12 20v2" />
      <path d="m4.93 4.93 1.41 1.41" />
      <path d="m17.66 17.66 1.41 1.41" />
      <path d="M2 12h2" />
      <path d="M20 12h2" />
      <path d="m6.34 17.66-1.41 1.41" />
      <path d="m19.07 4.93-1.41 1.41" />
    </svg>
  );
}

function IconMoon() {
  return (
    <svg
      className="site-footer-theme-icon"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
    </svg>
  );
}

export function SiteFooter({ onSelectTab }: SiteFooterProps) {
  const { language, setLanguage, t } = useI18n();
  const { theme, toggleTheme } = useTheme();
  const year = new Date().getFullYear();

  const toggleLanguage = () => {
    setLanguage(language === "ms" ? "en" : "ms");
  };

  const languageCode: Record<Language, string> = { ms: "BM", en: "EN" };

  const go = (tab: FooterTab) => {
    onSelectTab?.(tab);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="site-footer" aria-label={t("footerAria")}>
      <div className="site-footer-inner">
        <div className="site-footer-brand">
          <div className="site-footer-brand-mark">
            <p className="site-footer-wing-label">{t("footerWingLabel")}</p>
            <div className="site-footer-logo-row">
              <img className="site-footer-logo" src={logoSvgUrl} alt="" width={28} height={28} />
              <span className="site-footer-name" translate="no">
                Belia PBB
              </span>
            </div>
          </div>
          <p className="site-footer-copy">
            {t("footerCopyright").replace(/\{\{year\}\}/g, String(year))}
          </p>
          <div className="site-footer-brand-foot">
            <button
              type="button"
              className="site-footer-theme-btn"
              onClick={toggleTheme}
              aria-label={t("themeToggleAria")}
            >
              {theme === "dark" ? <IconSun /> : <IconMoon />}
            </button>
            <button
              type="button"
              className="site-footer-lang-btn"
              onClick={toggleLanguage}
              aria-label={t("languageToggleAria")}
            >
              {languageCode[language]}
            </button>
          </div>
        </div>

        <div className="site-footer-divider" aria-hidden />

        <nav className="site-footer-nav" aria-label={t("footerNavAria")}>
          <div className="site-footer-col">
            <h3 className="site-footer-col-title">{t("footerSiteHeading")}</h3>
            <ul className="site-footer-links">
              <li>
                <button type="button" className="site-footer-link" onClick={() => go("apply")}>
                  {t("kenaliApply")}
                </button>
              </li>
              <li>
                <button type="button" className="site-footer-link" onClick={() => go("members")}>
                  {t("navMembers")}
                </button>
              </li>
              <li>
                <button type="button" className="site-footer-link" onClick={() => go("profile")}>
                  {t("navProfile")}
                </button>
              </li>
            </ul>
          </div>
          <div className="site-footer-col">
            <h3 className="site-footer-col-title">{t("footerResourcesHeading")}</h3>
            <ul className="site-footer-links">
              <li>
                <a
                  className="site-footer-link"
                  href={CONSTITUTION_PDF_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {t("kenaliConstitution")}
                </a>
              </li>
              <li>
                <a
                  className="site-footer-link"
                  href={JIWABAKTI_HREF}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {t("jiwaBaktiLink")}
                </a>
              </li>
              <li>
                <button type="button" className="site-footer-link" onClick={() => go("resources")}>
                  {t("navResources")}
                </button>
              </li>
            </ul>
          </div>
        </nav>
      </div>
    </footer>
  );
}
