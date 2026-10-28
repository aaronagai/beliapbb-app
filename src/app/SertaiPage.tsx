import { ApplicationPage } from "../ApplicationPage";
import { CONSTITUTION_PDF_URL } from "../constitutionPdf";
import { useI18n } from "../i18n";
import { LEADERSHIP_URL } from "../links";
import { LinkList } from "./LinkList";

const BORANG_PDF = `${import.meta.env.BASE_URL}borang-permohonan-pbb.pdf`;

export function SertaiPage() {
  const { t } = useI18n();
  return (
    <div className="app-page">
      <h1 className="app-page-title">{t("applicationTitle")}</h1>
      <ApplicationPage />
      <LinkList
        title={t("sertaiDocsTitle")}
        items={[
          { href: CONSTITUTION_PDF_URL, title: t("kenaliConstitution"), hint: t("resourcesConstitutionHint") },
          { href: BORANG_PDF, title: t("sertaiBorang"), hint: t("sertaiBorangHint") },
          { href: LEADERSHIP_URL, title: t("sertaiLeaders"), hint: t("sertaiLeadersHint") },
        ]}
      />
    </div>
  );
}
