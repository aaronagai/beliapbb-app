import { useMemo, useState } from "react";
import { getAhliRows } from "./ahliData";
import { useI18n } from "./i18n";

const ALL_AHLI = getAhliRows();

function MemberProfileIcon() {
  return (
    <svg className="members-item-profile-svg" viewBox="0 0 24 24" aria-hidden>
      <path
        fill="currentColor"
        d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"
      />
    </svg>
  );
}

export function MembersPage() {
  const { t } = useI18n();
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const s = query.trim().toLowerCase();
    if (!s) return ALL_AHLI;
    return ALL_AHLI.filter(
      (r) => r.cawangan.toLowerCase().includes(s) || r.name.toLowerCase().includes(s)
    );
  }, [query]);

  return (
    <section className="section section--members" aria-label={t("membersListAria")}>
      <label className="members-search-label">
        <span className="visually-hidden">{t("membersSearchPlaceholder")}</span>
        <input
          type="search"
          className="members-search-input"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t("membersSearchPlaceholder")}
          enterKeyHint="search"
          autoComplete="off"
        />
      </label>

      <div className="members-list-panel">
        {filtered.length === 0 ? (
          <p className="members-no-results">{t("membersNoResults")}</p>
        ) : (
          <ul className="members-list">
            {filtered.map((row) => (
              <li key={row.id} className="members-item">
                <span className="members-item-icon" aria-hidden>
                  <MemberProfileIcon />
                </span>
                <div className="members-item-text">
                  <div className="members-item-name">
                    {row.name ? (
                      row.name
                    ) : (
                      <span className="members-pending">{t("memberPending")}</span>
                    )}
                  </div>
                  <div className="members-item-cawangan">{row.cawangan}</div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
