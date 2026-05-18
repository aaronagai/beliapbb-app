import { useI18n, type MessageKey } from "./i18n";
import { CONSTITUTION_PDF_URL } from "./constitutionPdf";

const KENALI_PARTI_LABELS = ["About", "Structure", "Constitution", "Apply"] as const;

const KENALI_PARTI_UI_ORDER: Record<(typeof KENALI_PARTI_LABELS)[number], number> = {
  About: 1,
  Structure: 2,
  Constitution: 3,
  Apply: 4,
};

const KENALI_LABEL_TO_KEY: Record<(typeof KENALI_PARTI_LABELS)[number], MessageKey> = {
  About: "kenaliAbout",
  Structure: "kenaliStructure",
  Constitution: "kenaliConstitution",
  Apply: "kenaliApply",
};

const KENALI_ABOUT_WIKI_MS =
  "https://ms.wikipedia.org/wiki/Parti_Pesaka_Bumiputera_Bersatu_Sarawak";

const SAYAP_PARTI_LABELS = ["MKT", "Wanita", "Pemuda", "Belia"] as const;

const SAYAP_PARTI_PHOTO_SRC: Record<(typeof SAYAP_PARTI_LABELS)[number], string> = {
  MKT: `${import.meta.env.BASE_URL}sayap/mkt.jpg`,
  Wanita: `${import.meta.env.BASE_URL}sayap/wanita.jpg.webp`,
  Pemuda: `${import.meta.env.BASE_URL}sayap/pemuda.jpg`,
  Belia: `${import.meta.env.BASE_URL}sayap/belia.jpeg`,
};

function KenaliPartiIcon({ label }: { label: (typeof KENALI_PARTI_LABELS)[number] }) {
  const cls = "wing-circle-icon";
  switch (label) {
    case "About":
      return (
        <svg className={cls} viewBox="0 0 24 24" aria-hidden>
          <path
            fill="currentColor"
            d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"
          />
        </svg>
      );
    case "Structure":
      return (
        <svg className={cls} viewBox="0 0 24 24" aria-hidden fill="none">
          <g
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="7.5" y="2" width="9" height="4" rx="1.2" />
            <path d="M12 6v2.5M6 8.5h12M6 8.5v2M12 8.5v2M18 8.5v2" />
            <rect x="4" y="10.5" width="4" height="3.8" rx="0.9" />
            <rect x="10" y="10.5" width="4" height="3.8" rx="0.9" />
            <rect x="16" y="10.5" width="4" height="3.8" rx="0.9" />
          </g>
        </svg>
      );
    case "Constitution":
      return (
        <svg className={cls} viewBox="0 0 24 24" aria-hidden>
          <path
            fill="currentColor"
            d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"
          />
        </svg>
      );
    case "Apply":
      return (
        <svg className={cls} viewBox="0 0 24 24" aria-hidden>
          <path
            fill="currentColor"
            d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm2 14H8v-2h8v2zm0-3H8v-2h8v2zm-3-5V3.5L18.5 9H13z"
          />
        </svg>
      );
    default:
      return null;
  }
}

type PartyWingsSectionProps = {
  onSelectApply: () => void;
};

export function PartyWingsSection({ onSelectApply }: PartyWingsSectionProps) {
  const { t } = useI18n();

  return (
    <section className="party-wings" aria-label={t("kenaliParti")}>
      {[0, 1].map((row) => (
        <div key={row} className="wings-block">
          <h2 className="wings-heading">
            {row === 0 ? t("kenaliParti") : t("sayapParti")}
          </h2>
          <ul className="wings-row">
            {row === 0
              ? KENALI_PARTI_LABELS.map((label) => (
                  <li
                    key={label}
                    className="wing-item"
                    data-wing={label}
                    style={{ order: KENALI_PARTI_UI_ORDER[label] }}
                  >
                    {label === "About" ? (
                      <a
                        className="wing-button"
                        href={KENALI_ABOUT_WIKI_MS}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <span className="wing-circle">
                          <KenaliPartiIcon label={label} />
                        </span>
                        <span className="wing-label">{t(KENALI_LABEL_TO_KEY[label])}</span>
                      </a>
                    ) : label === "Constitution" ? (
                      <a
                        className="wing-button"
                        href={CONSTITUTION_PDF_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <span className="wing-circle">
                          <KenaliPartiIcon label={label} />
                        </span>
                        <span className="wing-label">{t(KENALI_LABEL_TO_KEY[label])}</span>
                      </a>
                    ) : label === "Apply" ? (
                      <button type="button" className="wing-button" onClick={onSelectApply}>
                        <span className="wing-circle">
                          <KenaliPartiIcon label={label} />
                        </span>
                        <span className="wing-label">{t(KENALI_LABEL_TO_KEY[label])}</span>
                      </button>
                    ) : (
                      <button type="button" className="wing-button">
                        <span className="wing-circle">
                          <KenaliPartiIcon label={label} />
                        </span>
                        <span className="wing-label">{t(KENALI_LABEL_TO_KEY[label])}</span>
                      </button>
                    )}
                  </li>
                ))
              : SAYAP_PARTI_LABELS.map((label) => (
                  <li key={label} className="wing-item">
                    <button type="button" className="wing-button">
                      <span className="wing-circle wing-circle--photo">
                        <img src={SAYAP_PARTI_PHOTO_SRC[label]} alt="" width={52} height={52} />
                      </span>
                      <span className="wing-label">{label}</span>
                    </button>
                  </li>
                ))}
          </ul>
        </div>
      ))}
    </section>
  );
}
