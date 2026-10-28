import { FtesPromoCard } from "../FtesPromoCard";
import { useI18n } from "../i18n";

/** Hub for the AI assistants; each opens as its own full screen. */
export function TanyaPage({ onOpenFtes, onOpenPerlembagaan }: { onOpenFtes: () => void; onOpenPerlembagaan: () => void }) {
  const { t } = useI18n();
  return (
    <section className="app-page" aria-labelledby="tanya-title">
      <h1 className="app-page-title" id="tanya-title">{t("tanyaTitle")}</h1>
      <p className="app-page-sub">{t("tanyaSub")}</p>
      <div className="app-stack">
        <FtesPromoCard onOpen={onOpenFtes} />
        {/* Same card anatomy as Tanya FTES, so both assistants read as one family */}
        <button type="button" className="ftes-promo" onClick={onOpenPerlembagaan}>
          <span className="ftes-promo-head">
            <span className="ftes-promo-tag">{t("ftesPillTag")}</span>
            <span className="ftes-promo-title">{t("perlembagaanNav")}</span>
          </span>
          <span className="ftes-promo-body">{t("perlembagaanBody")}</span>
          <span className="ftes-promo-ask" aria-hidden>
            <span className="ftes-promo-ask-text">{t("perlembagaanAsk")}</span>
            <span className="ftes-promo-ask-send">
              <svg viewBox="0 0 24 24" width="16" height="16">
                <path fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round" d="M5 12h14m-6-6 6 6-6 6" />
              </svg>
            </span>
          </span>
        </button>
      </div>
    </section>
  );
}
