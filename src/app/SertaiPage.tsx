import { ApplicationPage } from "../ApplicationPage";
import { useI18n } from "../i18n";

export function SertaiPage() {
  const { t } = useI18n();
  return (
    <div className="app-page">
      <h1 className="app-page-title">{t("applicationTitle")}</h1>
      <ApplicationPage />
    </div>
  );
}
