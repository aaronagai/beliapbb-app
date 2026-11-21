import { ApplicationPage } from "../ApplicationPage";
import { useI18n } from "../i18n";

export function SertaiPage({ onFocusChange, onExit }: { onFocusChange?: (focus: boolean) => void; onExit?: () => void }) {
  const { t } = useI18n();
  return (
    <div className="app-page">
      <h1 className="app-page-title app-page-title--quiet">{t("applicationTitle")}</h1>
      <ApplicationPage onFocusChange={onFocusChange} onExit={onExit} />
    </div>
  );
}
