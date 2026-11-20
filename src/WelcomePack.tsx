import type { ReactNode } from "react";
import { CONSTITUTION_PDF_URL } from "./constitutionPdf";
import { useI18n } from "./i18n";
import { LEADERSHIP_URL } from "./links";
import { LinkList } from "./app/LinkList";

/**
 * The "next page" after applying: a simple welcome pack. Placeholder for the fuller flow (and, later,
 * a digital badge). Shows where the application stands and the documents that used to sit under the form.
 */
export function WelcomePack({
  reference,
  signed,
  onBack,
  onAnother,
  onDone,
  title,
  intro,
  pendingText,
  children,
}: {
  reference: string;
  signed: boolean;
  onBack?: () => void;
  onAnother: () => void;
  onDone?: () => void;
  title?: string;
  intro?: string;
  pendingText?: string;
  children?: ReactNode;
}) {
  const { t } = useI18n();
  return (
    <div className="application-sent profile-card welcome-pack">
      <h2>{title ?? t("welcomePackTitle")}</h2>
      <p className="application-sent-pdf-note">{intro ?? t("welcomePackIntro")}</p>

      <div className="welcome-pack-status" data-state={signed ? "signed" : "pending"}>
        <span className="welcome-pack-ref">{reference}</span>
        <span>{signed ? t("welcomePackStatusSigned") : (pendingText ?? t("welcomePackStatusPending"))}</span>
      </div>

      {children}

      <LinkList
        title={t("sertaiDocsTitle")}
        items={[
          { href: CONSTITUTION_PDF_URL, title: t("kenaliConstitution"), hint: t("resourcesConstitutionHint") },
          { href: LEADERSHIP_URL, title: t("sertaiLeaders"), hint: t("sertaiLeadersHint") },
        ]}
      />

      {onDone ? (
        <button type="button" className="profile-save-btn application-sent-next" onClick={onDone}>
          {t("welcomePackDone")}
        </button>
      ) : null}
      {onBack ? (
        <button type="button" className="profile-save-btn profile-save-btn--secondary application-sent-next" onClick={onBack}>
          {t("welcomePackBack")}
        </button>
      ) : null}
      <button type="button" className="profile-save-btn profile-save-btn--secondary application-sent-next" onClick={onAnother}>
        {t("applicationSentAnother")}
      </button>
    </div>
  );
}
