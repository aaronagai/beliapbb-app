import { useI18n } from "./i18n";
import "./FtesPromoCard.css";

/** Entry point into Ask FTES from the rest of the app (home, Education, …). */
export function FtesPromoCard({ onOpen }: { onOpen: () => void }) {
  const { t } = useI18n();

  return (
    <button type="button" className="ftes-promo" onClick={onOpen}>
      <span className="ftes-promo-head">
        <span className="ftes-promo-tag">{t("ftesPillTag")}</span>
        <span className="ftes-promo-title">{t("ftesNav")}</span>
      </span>
      <span className="ftes-promo-body">{t("ftesPromoBody")}</span>
      <span className="ftes-promo-ask" aria-hidden>
        <span className="ftes-promo-ask-text">{t("ftesPromoAsk")}</span>
        <span className="ftes-promo-ask-send">
          <svg viewBox="0 0 24 24" width="16" height="16">
            <path
              fill="none"
              stroke="currentColor"
              strokeWidth="2.25"
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M5 12h14m-6-6 6 6-6 6"
            />
          </svg>
        </span>
      </span>
    </button>
  );
}
