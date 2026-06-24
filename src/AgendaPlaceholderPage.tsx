import { useI18n, type MessageKey } from "./i18n";

type AgendaPlaceholderPageProps = {
  titleKey: MessageKey;
};

export function AgendaPlaceholderPage({ titleKey }: AgendaPlaceholderPageProps) {
  const { t } = useI18n();

  return (
    <section className="section section--agenda" aria-labelledby="agenda-page-title">
      <h1 id="agenda-page-title" className="page-heading" translate="no">
        {t(titleKey)}
      </h1>
      <div className="agenda-empty-state">
        <p className="agenda-empty-label">{t("agendaComingSoon")}</p>
        <p className="agenda-empty-body">{t("agendaPlaceholderBody")}</p>
      </div>
    </section>
  );
}
