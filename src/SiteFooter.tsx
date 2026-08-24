import { CONSTITUTION_PDF_URL } from "./constitutionPdf";
import { ExternalLinkArrowIcon } from "./ExternalLinkArrowIcon";
import { FooterSocialIcons } from "./FooterSocialIcons";
import { useI18n, type Language } from "./i18n";

const JIWABAKTI_HREF = "https://jiwabakti.com.my/";
const KENALI_ABOUT_WIKI_MS =
  "https://ms.wikipedia.org/wiki/Parti_Pesaka_Bumiputera_Bersatu_Sarawak";
const FOOTER_END_YEAR = Math.max(2026, new Date().getFullYear());

export type FooterTab =
  | "home"
  | "members"
  | "resources"
  | "apply"
  | "profile"
  | "education"
  | "employment"
  | "emergingTech";

type SiteFooterProps = {
  onSelectTab?: (tab: FooterTab) => void;
};

function GlobeIcon() {
  return (
    <svg className="site-footer-bar-lang-icon" viewBox="0 0 24 24" aria-hidden>
      <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <path
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        d="M3 12h18M12 3c2.5 2.8 2.5 14.2 0 18M12 3c-2.5 2.8-2.5 14.2 0 18"
      />
    </svg>
  );
}

export function SiteFooter({ onSelectTab }: SiteFooterProps) {
  const { language, setLanguage, t } = useI18n();

  const toggleLanguage = () => {
    setLanguage(language === "ms" ? "en" : "ms");
  };

  const languageDisplay: Record<Language, string> = {
    en: t("footerLanguageNameEn"),
    ms: t("footerLanguageNameMs"),
  };

  const copyrightText = t("footerCopyright").replace(
    /\{\{endYear\}\}/g,
    String(FOOTER_END_YEAR),
  );

  const go = (tab: FooterTab) => {
    onSelectTab?.(tab);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="site-footer" aria-label={t("footerAria")}>
      <div className="site-footer-inner">
        <nav className="site-footer-columns" aria-label={t("footerNavAria")}>
          <div className="site-footer-col">
            <h3 className="site-footer-col-title">{t("footerColHome")}</h3>
            <ul className="site-footer-links">
              <li>
                <button type="button" className="site-footer-link" onClick={() => go("home")}>
                  {t("navHome")}
                </button>
              </li>
              <li>
                <a
                  className="site-footer-link site-footer-link--external"
                  href={KENALI_ABOUT_WIKI_MS}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {t("kenaliAbout")}
                  <ExternalLinkArrowIcon className="site-footer-external-arrow" />
                </a>
              </li>
              <li>
                <button type="button" className="site-footer-link" onClick={() => go("members")}>
                  {t("navMembers")}
                </button>
              </li>
              <li>
                <button type="button" className="site-footer-link" onClick={() => go("apply")}>
                  {t("kenaliApply")}
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
            <h3 className="site-footer-col-title">{t("footerColResources")}</h3>
            <ul className="site-footer-links">
              <li>
                <a
                  className="site-footer-link site-footer-link--external"
                  href={CONSTITUTION_PDF_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {t("kenaliConstitution")}
                  <ExternalLinkArrowIcon className="site-footer-external-arrow" />
                </a>
              </li>
              <li>
                <a
                  className="site-footer-link site-footer-link--external"
                  href={JIWABAKTI_HREF}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {t("jiwaBaktiLink")}
                  <ExternalLinkArrowIcon className="site-footer-external-arrow" />
                </a>
              </li>
              <li>
                <button type="button" className="site-footer-link" onClick={() => go("resources")}>
                  {t("navResources")}
                </button>
              </li>
            </ul>
          </div>

          <div className="site-footer-col">
            <h3 className="site-footer-col-title">{t("footerColFocus")}</h3>
            <ul className="site-footer-links">
              <li>
                <button type="button" className="site-footer-link" onClick={() => go("education")}>
                  {t("agendaEducation")}
                </button>
              </li>
              <li>
                <button
                  type="button"
                  className="site-footer-link"
                  onClick={() => go("employment")}
                >
                  {t("agendaEmployment")}
                </button>
              </li>
              <li>
                <button
                  type="button"
                  className="site-footer-link"
                  onClick={() => go("emergingTech")}
                >
                  {t("agendaEmergingTech")}
                </button>
              </li>
            </ul>
          </div>
        </nav>

        <div className="site-footer-bar">
          <FooterSocialIcons t={t} />

          <p className="site-footer-bar-legal">{copyrightText}</p>

          <button
            type="button"
            className="site-footer-bar-lang"
            onClick={toggleLanguage}
            aria-label={t("languageToggleAria")}
          >
            <GlobeIcon />
            <span>{languageDisplay[language]}</span>
          </button>
        </div>
      </div>
    </footer>
  );
}
