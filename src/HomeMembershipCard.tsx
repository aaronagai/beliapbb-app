import { useEffect, useState } from "react";
import { Logo } from "./Logo";
import { getCawanganDisplayLabel, isValidCawangan } from "./cawanganOptions";
import { useI18n } from "./i18n";
import { readApplication } from "./applicationRecord";

const PROFILE_STORAGE_KEY = "beliapbb_profile";

function readCardFields(): { name: string; cawangan: string } {
  try {
    const raw = localStorage.getItem(PROFILE_STORAGE_KEY);
    if (!raw) return { name: "", cawangan: "" };
    const p = JSON.parse(raw) as Record<string, unknown>;
    return {
      name: typeof p.name === "string" ? p.name.trim() : "",
      cawangan: typeof p.cawangan === "string" ? p.cawangan.trim() : "",
    };
  } catch {
    return { name: "", cawangan: "" };
  }
}

/**
 * A clearly labelled sample of the future digital membership card, filled from the visitor's
 * own saved profile. No QR code or verified tick until cards are issued from a member database.
 */
export function HomeMembershipCard({ onEditProfile, onOpenApplication }: { onEditProfile: () => void; onOpenApplication: () => void }) {
  const { t, language } = useI18n();
  /** Once an application has been sent from this device, show where it stands instead of the sample. */
  const [record] = useState(readApplication);
  const [name, setName] = useState("");
  const [cawangan, setCawangan] = useState("");

  useEffect(() => {
    const fields = readCardFields();
    setName(fields.name);
    setCawangan(
      fields.cawangan && isValidCawangan(fields.cawangan)
        ? getCawanganDisplayLabel(fields.cawangan, t)
        : fields.cawangan,
    );
  }, [t, language]);

  const complete = Boolean(name && cawangan);

  if (record) {
    return (
      <article className="home-membership-card" aria-label={t("homeAppKicker")}>
        <div className="home-membership-card-body">
          <header className="home-membership-card-top">
            <Logo className="home-membership-card-logo" decorative />
            <span className="home-membership-card-badge">{t("homeAppBadge")}</span>
          </header>
          <div className="home-membership-card-main">
            <div className="home-membership-card-text">
              <p className="home-membership-card-kicker">{t("homeAppKicker")}</p>
              <p className="home-membership-card-name">
                <span>{record.ref}</span>
              </p>
              <p className="home-membership-card-dun">{t(record.signed ? "homeAppSigned" : "homeAppPending")}</p>
            </div>
          </div>
        </div>
        <footer className="home-membership-card-foot">
          <p>{t("homeAppHint")}</p>
          <button type="button" className="home-membership-card-edit" onClick={onOpenApplication}>
            {t("homeAppOpen")}
          </button>
        </footer>
      </article>
    );
  }

  return (
    <article className="home-membership-card home-membership-card--sample" aria-label={t("membershipCardAria")}>
      <div className="home-membership-card-body">
        <header className="home-membership-card-top">
          <Logo className="home-membership-card-logo" decorative />
          <span className="home-membership-card-badge">{t("membershipSampleBadge")}</span>
        </header>
        <div className="home-membership-card-main">
          <div className="home-membership-card-text">
            <p className="home-membership-card-kicker">{t("membershipCardTitle")}</p>
            <p className={`home-membership-card-name${name ? "" : " is-empty"}`}>
              <span>{name || t("membershipSampleName")}</span>
            </p>
            <p className={`home-membership-card-dun${cawangan ? "" : " is-empty"}`}>
              {cawangan || t("membershipSampleCawangan")}
            </p>
          </div>
        </div>
      </div>
      <footer className="home-membership-card-foot">
        <p>{t("membershipSampleHint")}</p>
        {complete ? null : (
          <button type="button" className="home-membership-card-edit" onClick={onEditProfile}>
            {t("membershipSampleEdit")}
          </button>
        )}
      </footer>
    </article>
  );
}
