import { ExternalLinkArrowIcon } from "./ExternalLinkArrowIcon";
import { useI18n, type MessageKey } from "./i18n";

export type AgendaTab = "education" | "employment" | "emergingTech";

type FocusAgendaSectionProps = {
  onSelectAgenda: (tab: AgendaTab) => void;
};

const AGENDA_ITEMS: {
  tab: AgendaTab;
  labelKey: MessageKey;
  imageSrc: string;
}[] = [
  {
    tab: "education",
    labelKey: "agendaEducation",
    imageSrc: `${import.meta.env.BASE_URL}focus/education.png`,
  },
  {
    tab: "employment",
    labelKey: "agendaEmployment",
    imageSrc: `${import.meta.env.BASE_URL}focus/employment.png`,
  },
  {
    tab: "emergingTech",
    labelKey: "agendaEmergingTech",
    imageSrc: `${import.meta.env.BASE_URL}focus/emerging.png`,
  },
];

export function FocusAgendaSection({ onSelectAgenda }: FocusAgendaSectionProps) {
  const { t } = useI18n();

  return (
    <section className="focus-agenda" aria-labelledby="focus-agenda-heading">
      <div className="focus-agenda-header">
        <h2 id="focus-agenda-heading" className="focus-agenda-title">
          {t("focusAgendaTitle")}
        </h2>
      </div>
      <ul className="focus-agenda-list">
        {AGENDA_ITEMS.map(({ tab, labelKey, imageSrc }) => (
          <li key={tab} className="focus-agenda-item">
            <button
              type="button"
              className="focus-agenda-card"
              onClick={() => onSelectAgenda(tab)}
              aria-label={t("agendaCardAria").replace(/\{\{label\}\}/g, t(labelKey))}
            >
              <img
                className="focus-agenda-card-image"
                src={imageSrc}
                alt=""
                loading="lazy"
                decoding="async"
              />
              <span className="focus-agenda-card-overlay" aria-hidden />
              <span className="focus-agenda-card-label">
                <span className="focus-agenda-card-title">
                  {t(labelKey)}
                  <ExternalLinkArrowIcon className="focus-agenda-card-title-arrow" />
                </span>
              </span>
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
