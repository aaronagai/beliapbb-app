import { useEffect, useMemo, useState } from "react";
import { formatCawanganLabel } from "../cawanganOptions";
import { useI18n } from "../i18n";
import { SocialIcon } from "../FooterSocialIcons";
import { Footer, SiteNav } from "./Landing";
import type { CouncilMember, CouncilSocials } from "./leadershipData";
import { useLeadershipData, type Branch } from "./sheetSync";
import "./Landing.css";

const BASE = import.meta.env.BASE_URL;

const EXCO = "ahli exco";

/** A sheet photo is a full URL; a bundled one is a file in public/kepimpinan/. */
function photoSrc(photo: string) {
  return /^https?:\/\//.test(photo) ? photo : `${BASE}kepimpinan/${photo}`;
}

/** Grey placeholder until a photo arrives: initials, skipping Bin/Binti/Anak. */
function PersonPlaceholder({ name }: { name: string }) {
  const initials = name
    .split(/\s+/)
    .filter((w) => !/^(bin|binti|anak|ak|@)$/i.test(w))
    .slice(0, 2)
    .map((w) => w.charAt(0).toUpperCase())
    .join("");
  return (
    <span className="lp-council-photo lp-council-photo--empty" aria-hidden="true">
      {initials}
    </span>
  );
}


const PLATFORM_NAMES: Record<keyof CouncilSocials, string> = {
  whatsapp: "WhatsApp",
  instagram: "Instagram",
  facebook: "Facebook",
  tiktok: "TikTok",
  x: "X",
  linkedin: "LinkedIn",
};

function Socials({ name, socials }: { name: string; socials?: CouncilSocials }) {
  const { t } = useI18n();
  const links = Object.entries(socials ?? {}).filter(([, href]) => href) as [keyof CouncilSocials, string][];
  if (links.length === 0) return null;
  return (
    <span className="lp-council-socials">
      {links.map(([platform, href]) => (
        <a
          key={platform}
          href={href}
          aria-label={t("leadershipSocialAria").replace("{{name}}", name).replace("{{platform}}", PLATFORM_NAMES[platform])}
          {...(href !== "#" ? { target: "_blank", rel: "noopener noreferrer" } : {})}
        >
          <SocialIcon platform={platform} />
        </a>
      ))}
    </span>
  );
}

function CouncilGrid({
  members,
  showPosition,
  collapsed = false,
}: {
  members: CouncilMember[];
  showPosition: boolean;
  collapsed?: boolean;
}) {
  return (
    <ul className={`lp-council${collapsed ? " is-collapsed" : ""}`}>
      {members.map((m) => {
        const area = formatCawanganLabel(m.cawangan).replace(/^N\.\d+\s+/, "");
        return (
          <li key={`${m.position}-${m.name}`}>
            {m.photo ? (
              <img className="lp-council-photo" src={photoSrc(m.photo)} alt="" width={72} height={72} loading="lazy" />
            ) : (
              <PersonPlaceholder name={m.name} />
            )}
            <span className="lp-council-text">
              <span className="lp-council-name">{m.name}</span>
              <span className="lp-council-role">{showPosition ? `${m.position} · ${area}` : area}</span>
              <Socials name={m.name} socials={m.socials} />
            </span>
          </li>
        );
      })}
    </ul>
  );
}

/* Majlis Tertinggi — Height-style grid: square photo, name, position. */
function Council({ council }: { council: CouncilMember[] }) {
  const { t } = useI18n();
  const [showAllExco, setShowAllExco] = useState(false);
  const officeBearers = council.filter((m) => m.position.toLowerCase() !== EXCO);
  const excoMembers = council.filter((m) => m.position.toLowerCase() === EXCO);
  return (
    <section className="lp-section lp-section--first" aria-labelledby="lp-council-title">
      <div className="lp-wrap">
        <h2 className="lp-h2" id="lp-council-title">{t("leadershipCouncilTitle")}</h2>
        <p className="lp-branch-sub">{t("leadershipCouncilSub")}</p>
        <CouncilGrid members={officeBearers} showPosition />
        <h3 className="lp-h3">{t("leadershipExcoTitle")}</h3>
        <CouncilGrid members={excoMembers} showPosition={false} collapsed={!showAllExco} />
        {!showAllExco && (
          <button type="button" className="lp-btn lp-btn--soft lp-more" onClick={() => setShowAllExco(true)}>
            {t("leadershipExcoShowAll").replace("{{count}}", String(excoMembers.length))}
          </button>
        )}
      </div>
    </section>
  );
}

/* Ketua Belia Cawangan — a clean, searchable list. */
function Branches({ branches }: { branches: Branch[] }) {
  const { t } = useI18n();
  const [query, setQuery] = useState("");

  /* One row per DUN: "N.1 OPAR" → code "N.1", area "Opar". */
  const all = useMemo(
    () =>
      branches.map((b) => {
        const [code, ...rest] = formatCawanganLabel(b.cawangan).split(" ");
        return { code, area: rest.join(" "), name: b.name };
      }),
    [branches],
  );

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return all;
    return all.filter((b) => `${b.code} ${b.area} ${b.name}`.toLowerCase().includes(q));
  }, [all, query]);

  return (
    <section className="lp-section" aria-labelledby="lp-branch-title">
      <div className="lp-wrap">
        <div className="lp-branch-head">
          <div>
            <h2 className="lp-h2" id="lp-branch-title">{t("leadershipBranchTitle")}</h2>
            <p className="lp-branch-sub">{t("leadershipBranchSub")}</p>
          </div>
          <label className="lp-search">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <circle cx="11" cy="11" r="6.5" fill="none" stroke="currentColor" strokeWidth="2" />
              <path d="m16 16 4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
            <span className="visually-hidden">{t("leadershipSearch")}</span>
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t("leadershipSearch")}
              enterKeyHint="search"
              autoComplete="off"
            />
          </label>
        </div>

        <p className="lp-branch-count" aria-live="polite">
          {t("leadershipCount").replace("{{shown}}", String(rows.length))}
        </p>

        {rows.length === 0 ? (
          <p className="lp-lead-pending">{t("leadershipNoResults")}</p>
        ) : (
          <ul className="lp-branches">
            {rows.map((b) => (
              <li key={b.code}>
                <span className="lp-branch-code">{b.code}</span>
                <span className="lp-branch-area">{b.area}</span>
                <span className={`lp-branch-name${b.name ? "" : " is-pending"}`}>
                  {b.name || t("memberPending")}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}

export function Leadership() {
  const { t } = useI18n();
  const { council, branches } = useLeadershipData();

  useEffect(() => {
    document.title = t("leadershipDocTitle");
  }, [t]);

  return (
    <div className="lp">
      <SiteNav />
      <main>
        <header className="lp-page-head">
          <div className="lp-wrap">
            <p className="lp-kicker">{t("leadershipKicker")}</p>
            <h1 className="lp-h1">{t("leadershipTitle")}</h1>
            <p className="lp-sub">{t("leadershipSub")}</p>
          </div>
        </header>
        <Council council={council} />
        <Branches branches={branches} />
      </main>
      <Footer />
    </div>
  );
}
