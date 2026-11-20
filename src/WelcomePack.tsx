import { CONSTITUTION_PDF_URL } from "./constitutionPdf";
import { useI18n } from "./i18n";
import { LEADERSHIP_URL } from "./links";
import { LinkList } from "./app/LinkList";

/**
 * Simple welcome pack shown after an application is submitted: the documents that used to sit under
 * the form. Placeholder for a fuller "next page" (and, later, a digital badge).
 */
export function WelcomePack() {
  const { t } = useI18n();
  return (
    <div className="welcome-pack">
      <h3 className="welcome-pack-title">{t("welcomePackTitle")}</h3>
      <p className="application-sent-pdf-note">{t("welcomePackIntro")}</p>
      <LinkList
        title={t("sertaiDocsTitle")}
        items={[
          { href: CONSTITUTION_PDF_URL, title: t("kenaliConstitution"), hint: t("resourcesConstitutionHint") },
          { href: LEADERSHIP_URL, title: t("sertaiLeaders"), hint: t("sertaiLeadersHint") },
        ]}
      />
    </div>
  );
}
