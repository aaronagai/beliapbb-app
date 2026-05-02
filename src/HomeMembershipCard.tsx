import { useEffect, useState } from "react";
import QRCode from "react-qr-code";
import logoSvgUrl from "../logo.svg?url";
import { formatCawanganLabel, isValidCawangan } from "./cawanganOptions";
import { useI18n } from "./i18n";

/** Static payload — visual only; not wired to validation or deep links. */
const MEMBERSHIP_QR_PLACEHOLDER = "https://beliapbb.app/kad-ahli/preview";

const PROFILE_STORAGE_KEY = "beliapbb_profile";

const PLACEHOLDER_NAME = "Aaron Nagai";
const PLACEHOLDER_CAWANGAN = "N23 Bukit Semuja";

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

export function HomeMembershipCard() {
  const { t } = useI18n();
  const [displayName, setDisplayName] = useState(PLACEHOLDER_NAME);
  const [displayCawangan, setDisplayCawangan] = useState(PLACEHOLDER_CAWANGAN);

  useEffect(() => {
    const { name, cawangan } = readCardFields();
    setDisplayName(name || PLACEHOLDER_NAME);
    if (cawangan && isValidCawangan(cawangan)) {
      setDisplayCawangan(formatCawanganLabel(cawangan));
    } else if (cawangan) {
      setDisplayCawangan(cawangan);
    } else {
      setDisplayCawangan(PLACEHOLDER_CAWANGAN);
    }
  }, []);

  return (
    <article className="home-membership-card" aria-label={t("membershipCardAria")}>
      <div className="home-membership-card-accent" aria-hidden />
      <div className="home-membership-card-body">
        <header className="home-membership-card-top">
          <img
            src={logoSvgUrl}
            alt=""
            width={96}
            height={26}
            className="home-membership-card-logo"
            decoding="async"
          />
          <span className="home-membership-card-badge">{t("membershipCardBadge")}</span>
        </header>
        <div className="home-membership-card-main">
          <div className="home-membership-card-text">
            <p className="home-membership-card-kicker">{t("membershipCardTitle")}</p>
            <p className="home-membership-card-name">{displayName}</p>
            <p className="home-membership-card-dun">{displayCawangan}</p>
          </div>
          <div className="home-membership-card-qr" aria-hidden>
            <QRCode
              value={MEMBERSHIP_QR_PLACEHOLDER}
              size={80}
              level="M"
              fgColor="#141414"
              bgColor="#ffffff"
            />
          </div>
        </div>
      </div>
    </article>
  );
}
