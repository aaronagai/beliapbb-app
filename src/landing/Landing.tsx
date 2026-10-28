import { useEffect, useRef, useState, type CSSProperties } from "react";
import { useI18n, type MessageKey } from "../i18n";
import { Logo } from "../Logo";
import { CONSTITUTION_PDF_URL } from "../constitutionPdf";
import { Sticker, type StickerKind } from "./Stickers";
import "./Landing.css";

const BASE = import.meta.env.BASE_URL;
const APP_HREF = `${BASE}app/`;
const appTab = (hash: string) => `${APP_HREF}#${hash}`;
const CONTACT_EMAIL = "hello@beliapbb.com";

function prefersReducedMotion() {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/* ── Headline tiles (Mobbin-style): an app-icon squircle in the sentence that swaps sticker ── */

type TileItem = { kind: StickerKind; bg: string };

const TILE_SETS: TileItem[][] = [
  [
    { kind: "hornbill", bg: "#fff1d6" },
    { kind: "hibiscus", bg: "#ffe3ea" },
    { kind: "pin", bg: "#e4f0ff" },
    { kind: "heart", bg: "#fff0f1" },
  ],
  [
    { kind: "megaphone", bg: "#fff0e2" },
    { kind: "chat", bg: "#e4f2ff" },
    { kind: "mascot", bg: "#e6eeff" },
    { kind: "check", bg: "#e3f8ea" },
  ],
  [
    { kind: "cap", bg: "#e9eaff" },
    { kind: "rocket", bg: "#ffe8ea" },
    { kind: "bulb", bg: "#fff6d6" },
    { kind: "star", bg: "#fff4dc" },
  ],
];

const TILE_INTERVAL_MS = 2600;

function CycleTile({ set, offset, tilt }: { set: TileItem[]; offset: number; tilt: number }) {
  const [index, setIndex] = useState(0);
  const [prev, setPrev] = useState<number | null>(null);

  useEffect(() => {
    let interval: number | undefined;
    const start = window.setTimeout(() => {
      interval = window.setInterval(() => {
        if (document.hidden) return;
        setIndex((i) => {
          setPrev(i);
          return (i + 1) % set.length;
        });
      }, TILE_INTERVAL_MS);
    }, offset);
    return () => {
      window.clearTimeout(start);
      window.clearInterval(interval);
    };
  }, [set.length, offset]);

  const current = set[index];
  return (
    <span className="lp-tile" style={{ "--tilt": `${tilt}deg`, background: current.bg } as CSSProperties} aria-hidden="true">
      {prev !== null && (
        <span key={`out-${prev}-${index}`} className="lp-tile-art is-out">
          <Sticker kind={set[prev].kind} />
        </span>
      )}
      <span key={`in-${index}`} className={`lp-tile-art${prev !== null ? " is-in" : ""}`}>
        <Sticker kind={current.kind} />
      </span>
    </span>
  );
}

/* ── Sticker burst around the hero (Family-style).
   Laptop: x/y = centre in % of the hero, s = px; middle rows stay at the edges so the
   headline is never covered. Phone (m = [x%, y%, px]): a cluster above the headline
   around the mascot, like Family's welcome screen. No m = laptop only; mOnly = phone
   only; xl = hidden on narrow laptops where the headline is relatively wider. ── */

type Placed = {
  kind: StickerKind;
  x: number;
  y: number;
  s: number;
  r: number;
  d: number;
  m?: [number, number, number];
  mOnly?: boolean;
  xl?: boolean;
  color?: string;
};

const BURST: Placed[] = [
  { kind: "hornbill", x: 8, y: 22, s: 124, r: -8, d: 22, m: [13, 22, 76] },
  { kind: "heart", x: 22, y: 9, s: 64, r: -14, d: -14, m: [35, 9, 42] },
  { kind: "star", x: 13, y: 47, s: 54, r: 12, d: 16, xl: true, m: [9, 52, 38] },
  { kind: "blob", x: 7, y: 70, s: 112, r: -6, d: -20, m: [17, 82, 66] },
  { kind: "book", x: 21, y: 89, s: 76, r: -12, d: 12 },
  { kind: "pin", x: 32, y: 93, s: 46, r: 8, d: -10, xl: true },
  { kind: "sparkle", x: 31, y: 15, s: 28, r: 0, d: 26, color: "#4da3ff", m: [30, 36, 20] },
  { kind: "check", x: 40, y: 5, s: 40, r: -10, d: 10 },
  { kind: "chat", x: 63, y: 6, s: 54, r: 6, d: -12, m: [65, 8, 44] },
  { kind: "sparkle", x: 70, y: 18, s: 24, r: 0, d: -24, color: "#ffc83d", m: [71, 35, 18] },
  { kind: "hibiscus", x: 80, y: 11, s: 98, r: 10, d: 18, m: [87, 20, 68] },
  { kind: "cap", x: 93, y: 32, s: 92, r: 12, d: -18 },
  { kind: "megaphone", x: 88, y: 52, s: 76, r: -16, d: 20, xl: true, m: [91, 54, 48] },
  { kind: "tri", x: 93, y: 72, s: 108, r: 6, d: -16, m: [84, 83, 64] },
  { kind: "bulb", x: 79, y: 89, s: 64, r: 14, d: 14 },
  { kind: "rocket", x: 67, y: 94, s: 54, r: 35, d: -22, xl: true },
  { kind: "mascot", x: 50, y: 50, s: 0, r: -4, d: 0, mOnly: true, m: [50, 54, 120] },
];

function StickerBurst() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    const hero = el?.parentElement;
    if (!el || !hero || prefersReducedMotion()) return;
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    let frame = 0;
    const onMove = (e: PointerEvent) => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const rect = hero.getBoundingClientRect();
        el.style.setProperty("--px", ((e.clientX - rect.left) / rect.width - 0.5).toFixed(3));
        el.style.setProperty("--py", ((e.clientY - rect.top) / rect.height - 0.5).toFixed(3));
      });
    };
    const onLeave = () => {
      el.style.setProperty("--px", "0");
      el.style.setProperty("--py", "0");
    };
    hero.addEventListener("pointermove", onMove);
    hero.addEventListener("pointerleave", onLeave);
    return () => {
      cancelAnimationFrame(frame);
      hero.removeEventListener("pointermove", onMove);
      hero.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  return (
    <div className="lp-burst" ref={ref} aria-hidden="true">
      {BURST.map((p, i) => (
        <span
          key={i}
          className={`lp-sticker${p.m ? "" : " no-m"}${p.mOnly ? " m-only" : ""}${p.xl ? " xl" : ""}`}
          style={
            {
              "--x": p.x,
              "--y": p.y,
              "--s": p.s,
              "--mx": p.m?.[0] ?? p.x,
              "--my": p.m?.[1] ?? p.y,
              "--ms": p.m?.[2] ?? p.s,
              "--r": `${p.r}deg`,
              "--d": p.d,
              "--i": i,
            } as CSSProperties
          }
        >
          <span className="lp-sticker-pop">
            <span className="lp-sticker-par">
              <span className="lp-sticker-float">
                <Sticker kind={p.kind} color={p.color} />
              </span>
            </span>
          </span>
        </span>
      ))}
    </div>
  );
}

/* ── Sections ── */

function Explore() {
  const { t } = useI18n();
  const exampleQuestion = t("constitutionChatEmpty").split(": ").pop();
  return (
    <section className="lp-section" id="ciri" aria-labelledby="lp-explore-title">
      <div className="lp-wrap">
        <h2 className="lp-h2 lp-center" id="lp-explore-title">
          {t("landingExploreTitle")}
        </h2>
        <div className="lp-explore">
          <a className="lp-card" href={appTab("ftes")}>
            <div className="lp-card-stage">
              <div className="lp-chat">
                <p className="lp-bubble lp-bubble--me">{t("ftesPromoAsk")}</p>
                <p className="lp-bubble lp-bubble--them" aria-label={t("landingTyping")}>
                  <span className="lp-dots"><i /><i /><i /></span>
                </p>
              </div>
              <Sticker kind="cap" className="lp-card-sticker" />
            </div>
            <h3 className="lp-card-title">{t("ftesNav")}</h3>
            <p className="lp-card-body">{t("landingFtesBody")}</p>
          </a>
          <a className="lp-card" href={APP_HREF}>
            <div className="lp-card-stage">
              <div className="lp-ask">
                <span className="lp-ask-text">{exampleQuestion}</span>
                <span className="lp-ask-send" aria-hidden="true">
                  <svg viewBox="0 0 24 24"><path d="M12 19V5m0 0-6 6m6-6 6 6" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" /></svg>
                </span>
              </div>
              <Sticker kind="book" className="lp-card-sticker" />
            </div>
            <h3 className="lp-card-title">{t("landingConstTitle")}</h3>
            <p className="lp-card-body">{t("landingConstBody")}</p>
          </a>
          <a className="lp-card" href={APP_HREF}>
            <div className="lp-card-stage">
              <div className="lp-news">
                {["#ffd9a8", "#cfe3ff"].map((c) => (
                  <div className="lp-news-row" key={c}>
                    <span className="lp-news-thumb" style={{ background: c }} />
                    <span className="lp-news-lines">
                      <i />
                      <i />
                      <small>{t("newsSource")}</small>
                    </span>
                  </div>
                ))}
              </div>
              <Sticker kind="megaphone" className="lp-card-sticker" />
            </div>
            <h3 className="lp-card-title">{t("latestNews")}</h3>
            <p className="lp-card-body">{t("landingNewsBody")}</p>
          </a>
        </div>
      </div>
    </section>
  );
}

const SIX: { kind: StickerKind; accent: string; title: MessageKey; body: MessageKey }[] = [
  { kind: "cap", accent: "#3b5bdb", title: "agendaEducation", body: "landingSixEducationBody" },
  { kind: "bulb", accent: "#e8590c", title: "agendaEmployment", body: "landingSixEmploymentBody" },
  { kind: "rocket", accent: "#d6336c", title: "agendaEmergingTech", body: "landingSixTechBody" },
  { kind: "check", accent: "#2b8a3e", title: "landingSixJoinTitle", body: "landingSixJoinBody" },
  { kind: "book", accent: "#7048e8", title: "landingSixDocsTitle", body: "landingSixDocsBody" },
  { kind: "chat", accent: "#1c7ed6", title: "landingSixLangTitle", body: "landingSixLangBody" },
];

function Six() {
  const { t } = useI18n();
  return (
    <section className="lp-section" aria-labelledby="lp-six-title">
      <div className="lp-wrap">
        <h2 className="lp-h2" id="lp-six-title">{t("landingSixTitle")}</h2>
        <ul className="lp-six">
          {SIX.map((f) => (
            <li key={f.title}>
              <Sticker kind={f.kind} className="lp-six-sticker" />
              <h3 style={{ color: f.accent }}>{t(f.title)}</h3>
              <p>{t(f.body)}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

const FAQ: [MessageKey, MessageKey][] = [
  ["landingFaq1Q", "landingFaq1A"],
  ["landingFaq2Q", "landingFaq2A"],
  ["landingFaq3Q", "landingFaq3A"],
  ["landingFaq4Q", "landingFaq4A"],
  ["landingFaq5Q", "landingFaq5A"],
];

function Faq() {
  const { t } = useI18n();
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section className="lp-section" id="soalan" aria-labelledby="lp-faq-title">
      <div className="lp-wrap lp-faq-layout">
        <h2 className="lp-h2" id="lp-faq-title">{t("landingFaqTitle")}</h2>
        <div className="lp-faq">
          {FAQ.map(([q, a], i) => {
            const isOpen = open === i;
            return (
              <div className={`lp-faq-item${isOpen ? " is-open" : ""}`} key={q}>
                <h3>
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    aria-controls={`lp-faq-${i}`}
                    onClick={() => setOpen(isOpen ? null : i)}
                  >
                    {t(q)}
                    <span className="lp-faq-plus" aria-hidden="true" />
                  </button>
                </h3>
                <div className="lp-faq-body" id={`lp-faq-${i}`} role="region" aria-hidden={!isOpen}>
                  <div>
                    <p>{t(a)}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function Cta() {
  const { t } = useI18n();
  return (
    <section className="lp-section lp-section--tight">
      <div className="lp-wrap">
        <div className="lp-cta">
          <Sticker kind="mascot" className="lp-cta-mascot" />
          <Sticker kind="heart" className="lp-cta-s lp-cta-s--1" />
          <Sticker kind="star" className="lp-cta-s lp-cta-s--2" />
          <Sticker kind="hibiscus" className="lp-cta-s lp-cta-s--3" />
          <Sticker kind="sparkle" color="#fff" className="lp-cta-s lp-cta-s--4" />
          <h2 className="lp-cta-title">{t("landingCtaTitle")}</h2>
          <p className="lp-cta-body">{t("landingCtaBody")}</p>
          <div className="lp-ctas">
            <a className="lp-btn lp-btn--light" href={appTab("apply")}>{t("landingJoin")}</a>
            <a className="lp-btn lp-btn--ghost-light" href={APP_HREF}>{t("landingOpenApp")}</a>
          </div>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  const { t, language, setLanguage } = useI18n();
  return (
    <footer className="lp-footer">
      <div className="lp-wrap">
        <div className="lp-footer-grid">
          <div className="lp-footer-brand">
            <a className="lp-brand" href={BASE}>
              <Logo className="lp-brand-logo" decorative />
              <span>Belia PBB</span>
            </a>
            <p>{t("landingFooterTagline")}</p>
          </div>
          <nav aria-label={t("landingFooterApp")}>
            <h2>{t("landingFooterApp")}</h2>
            <ul>
              <li><a href={APP_HREF}>{t("navHome")}</a></li>
              <li><a href={appTab("ftes")}>{t("ftesNav")}</a></li>
              <li><a href={appTab("resources")}>{t("navResources")}</a></li>
              <li><a href={CONSTITUTION_PDF_URL} target="_blank" rel="noopener noreferrer">{t("kenaliConstitution")}</a></li>
              <li><a href={appTab("apply")}>{t("kenaliApply")}</a></li>
            </ul>
          </nav>
          <div>
            <h2>{t("landingFooterContact")}</h2>
            <ul>
              <li><a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a></li>
            </ul>
          </div>
        </div>
        <div className="lp-footer-bar">
          <span>{t("footerCopyright").replace("{{endYear}}", String(new Date().getFullYear()))}</span>
          <button
            type="button"
            className="lp-lang"
            aria-label={t("landingLanguageSwitchAria")}
            onClick={() => setLanguage(language === "ms" ? "en" : "ms")}
          >
            {t("landingLanguageSwitch")}
          </button>
        </div>
      </div>
    </footer>
  );
}

export function Landing() {
  const { t } = useI18n();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    document.title = t("landingDocTitle");
  }, [t]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="lp">
      <header className={`lp-nav${scrolled ? " is-scrolled" : ""}`}>
        <div className="lp-wrap lp-nav-inner">
          <a className="lp-brand" href={BASE}>
            <Logo className="lp-brand-logo" decorative />
            <span>Belia PBB</span>
          </a>
          <nav className="lp-nav-links" aria-label={t("landingNavAria")}>
            <a href="#ciri">{t("landingNavFeatures")}</a>
            <a href="#soalan">{t("landingNavFaq")}</a>
            <a href={appTab("ftes")}>{t("ftesNav")}</a>
          </nav>
          <a className="lp-btn lp-btn--dark lp-btn--sm" href={APP_HREF}>{t("landingOpenApp")}</a>
        </div>
      </header>

      <main>
        <section className="lp-hero">
          <StickerBurst />
          <div className="lp-hero-inner">
            <p className="lp-kicker">{t("landingKicker")}</p>
            <h1 className="lp-h1" aria-label={t("landingTitleFull")}>
              <span aria-hidden="true">
                {t("landingTitleA")} <CycleTile set={TILE_SETS[0]} offset={0} tilt={-6} /> {t("landingTitleB")}{" "}
                <br className="lp-br" />
                {t("landingTitleC")} <CycleTile set={TILE_SETS[1]} offset={860} tilt={5} /> {t("landingTitleD")}{" "}
                <br className="lp-br" />
                {t("landingTitleE")} <CycleTile set={TILE_SETS[2]} offset={1720} tilt={-4} /> {t("landingTitleF")}
              </span>
            </h1>
            <p className="lp-sub">{t("landingSub")}</p>
            <div className="lp-ctas">
              <a className="lp-btn lp-btn--primary" href={appTab("apply")}>{t("landingJoin")}</a>
              <a className="lp-btn lp-btn--soft" href={APP_HREF}>
                {t("landingOpenApp")}
                <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14m0 0-6-6m6 6-6 6" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </a>
            </div>
          </div>
        </section>

        <section className="lp-preview-wrap" aria-label={t("landingPreviewAlt")}>
          <div className="lp-wrap">
            <a className="lp-preview" href={APP_HREF}>
              <img src={`${BASE}landing/app-preview.jpg`} alt={t("landingPreviewAlt")} width={1440} height={900} loading="lazy" />
            </a>
          </div>
        </section>

        <Explore />
        <Six />
        <Faq />
        <Cta />
      </main>
      <Footer />
    </div>
  );
}
