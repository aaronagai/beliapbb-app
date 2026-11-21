import type { ReactNode } from "react";
import { CONSTITUTION_PDF_URL } from "./constitutionPdf";
import { useI18n } from "./i18n";
import { LEADERSHIP_URL } from "./links";

/** Grey-gradient picture placeholders for the cards (real photos can replace these later). */
function WelcomeArt({ kind }: { kind: "welcome" | "constitution" | "leadership" }) {
  const g = `wp-grad-${kind}`;
  return (
    <svg className="wp-art" viewBox="0 0 320 180" preserveAspectRatio="xMidYMid slice" aria-hidden>
      <defs>
        <linearGradient id={g} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" style={{ stopColor: "var(--wp-a)" }} />
          <stop offset="1" style={{ stopColor: "var(--wp-b)" }} />
        </linearGradient>
      </defs>
      <rect width="320" height="180" fill={`url(#${g})`} />
      {kind === "welcome" ? (
        <>
          <circle cx="262" cy="34" r="96" fill="rgb(255 255 255 / 0.32)" />
          <circle cx="52" cy="176" r="118" fill="rgb(0 0 0 / 0.07)" />
          <circle cx="170" cy="96" r="44" fill="rgb(255 255 255 / 0.28)" />
        </>
      ) : null}
      {kind === "constitution" ? (
        <>
          <rect x="92" y="26" width="112" height="138" rx="4" fill="rgb(255 255 255 / 0.45)" transform="rotate(-7 148 95)" />
          <rect x="116" y="20" width="112" height="144" rx="4" fill="rgb(255 255 255 / 0.9)" />
          <rect x="130" y="38" width="62" height="8" rx="3" fill="rgb(0 0 0 / 0.2)" />
          {[62, 76, 90, 104, 118, 132].map((y, i) => (
            <rect key={y} x="130" y={y} width={i % 3 === 2 ? 56 : 84} height="5" rx="2.5" fill="rgb(0 0 0 / 0.11)" />
          ))}
        </>
      ) : null}
      {kind === "leadership" ? (
        <>
          {[52, 106, 160, 214, 268].map((x, i) => (
            <g key={x}>
              <circle cx={x} cy={i === 2 ? 70 : 82} r={i === 2 ? 30 : 22} fill="rgb(255 255 255 / 0.88)" />
              <rect x={x - (i === 2 ? 22 : 16)} y={i === 2 ? 112 : 114} width={i === 2 ? 44 : 32} height="6" rx="3" fill="rgb(0 0 0 / 0.16)" />
              <rect x={x - (i === 2 ? 14 : 10)} y={i === 2 ? 124 : 126} width={i === 2 ? 28 : 20} height="5" rx="2.5" fill="rgb(0 0 0 / 0.09)" />
            </g>
          ))}
        </>
      ) : null}
    </svg>
  );
}

/**
 * What a new member sees after applying (and whenever they open Join afterwards): a welcome, then a few
 * picture cards to get to know the party. No application status; only a note if the signed copy is missing
 * (applications made before signing became part of the form).
 */
export function WelcomePack({
  first,
  signed,
  pendingText,
  onDone,
  onAnother,
  children,
}: {
  first?: string;
  signed: boolean;
  pendingText?: string;
  onDone?: () => void;
  onAnother?: () => void;
  children?: ReactNode;
}) {
  const { t } = useI18n();
  return (
    <div className="welcome-pack">
      {signed ? null : (
        <section className="wp-pending">
          <p>{pendingText ?? t("welcomePackStatusPending")}</p>
          {children}
        </section>
      )}

      <article className="wp-card">
        <WelcomeArt kind="welcome" />
        <div className="wp-card-body">
          <h2>{first ? t("welcomeHello").replace("{{name}}", first) : t("welcomeHelloNoName")}</h2>
          <p>{t("welcomeBody")}</p>
        </div>
      </article>

      <div className="wp-grid">
        <a className="wp-card wp-card--link" href={CONSTITUTION_PDF_URL} target="_blank" rel="noopener noreferrer">
          <WelcomeArt kind="constitution" />
          <div className="wp-card-body">
            <h3>{t("kenaliConstitution")}</h3>
            <p>{t("resourcesConstitutionHint")}</p>
          </div>
        </a>
        <a className="wp-card wp-card--link" href={LEADERSHIP_URL} target="_blank" rel="noopener noreferrer">
          <WelcomeArt kind="leadership" />
          <div className="wp-card-body">
            <h3>{t("sertaiLeaders")}</h3>
            <p>{t("sertaiLeadersHint")}</p>
          </div>
        </a>
      </div>

      {onDone ? (
        <button type="button" className="profile-save-btn welcome-pack-done" onClick={onDone}>
          {t("welcomePackDone")}
        </button>
      ) : null}
      {onAnother ? (
        <button type="button" className="welcome-pack-another" onClick={onAnother}>
          {t("applicationSentAnother")}
        </button>
      ) : null}
    </div>
  );
}
