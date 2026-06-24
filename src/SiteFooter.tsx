import { Logo } from "./Logo";
import { CONSTITUTION_PDF_URL } from "./constitutionPdf";
import { useI18n, type Language } from "./i18n";

const JIWABAKTI_HREF = "https://jiwabakti.com.my/";
const KENALI_ABOUT_WIKI_MS =
  "https://ms.wikipedia.org/wiki/Parti_Pesaka_Bumiputera_Bersatu_Sarawak";

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

export function SiteFooter({ onSelectTab }: SiteFooterProps) {
  const { language, setLanguage, t } = useI18n();
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
                  className="site-footer-link"
                  href={KENALI_ABOUT_WIKI_MS}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {t("kenaliAbout")}
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

        <div className="site-footer-bottom">
          <div className="site-footer-brand-mark">
            <p className="site-footer-wing-label">{t("footerWingLabel")}</p>
            <div className="site-footer-logo-row">
              <Logo className="site-footer-logo" decorative width={28} height={28} />
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
              className="site-footer-lang-btn"
              onClick={toggleLanguage}
              aria-label={t("languageToggleAria")}
            >
              {languageCode[language]}
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
