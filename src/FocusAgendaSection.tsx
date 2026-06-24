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
    imageSrc:
      "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=1400&q=80&auto=format&fit=crop",
  },
  {
    tab: "employment",
    labelKey: "agendaEmployment",
    imageSrc:
      "https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=1400&q=80&auto=format&fit=crop",
  },
  {
    tab: "emergingTech",
    labelKey: "agendaEmergingTech",
    imageSrc:
      "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=1400&q=80&auto=format&fit=crop",
  },
];

function ChevronIcon() {
  return (
    <svg className="focus-agenda-chevron" viewBox="0 0 24 24" aria-hidden>
      <path
        fill="currentColor"
        d="M9.29 6.71a1 1 0 0 0 0 1.41L13.17 12l-3.88 3.88a1 1 0 1 0 1.41 1.41l4.59-4.59a1 1 0 0 0 0-1.41l-4.59-4.59a1 1 0 0 0-1.41 0z"
      />
    </svg>
  );
}

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
                <span className="focus-agenda-card-text">{t(labelKey)}</span>
                <ChevronIcon />
              </span>
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
