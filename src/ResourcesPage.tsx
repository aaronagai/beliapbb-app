import { CONSTITUTION_PDF_URL } from "./constitutionPdf";
import { useI18n } from "./i18n";

function ConstitutionDocIcon() {
  return (
    <svg className="members-item-profile-svg" viewBox="0 0 24 24" aria-hidden>
      <path
        fill="currentColor"
        d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"
      />
    </svg>
  );
}

export function ResourcesPage() {
  const { t } = useI18n();

  return (
    <section className="section section--resources" aria-label={t("resourcesSectionAria")}>
      <div className="members-list-panel">
        <ul className="members-list">
          <li>
            <a
              className="members-item members-item--link"
              href={CONSTITUTION_PDF_URL}
              target="_blank"
              rel="noopener noreferrer"
            >
              <span className="members-item-icon" aria-hidden>
                <ConstitutionDocIcon />
              </span>
              <div className="members-item-text">
                <div className="members-item-name">{t("kenaliConstitution")}</div>
                <div className="members-item-cawangan">{t("resourcesConstitutionHint")}</div>
              </div>
            </a>
          </li>
        </ul>
      </div>
    </section>
  );
}
