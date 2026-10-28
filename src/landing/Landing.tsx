import { useEffect, useState, type CSSProperties } from "react";
import { useI18n, type MessageKey } from "../i18n";
import { Logo } from "../Logo";
import { CONSTITUTION_PDF_URL } from "../constitutionPdf";
import { AppIcon, APP_ICON_KINDS, type AppIconKind } from "./AppIcons";
import "./Landing.css";

const BASE = import.meta.env.BASE_URL;
const APP_HREF = `${BASE}app/`;
const appTab = (hash: string) => `${APP_HREF}#${hash}`;
export const LEADERSHIP_HREF = `${BASE}kepimpinan/`;
const CONTACT_EMAIL = "hello@beliapbb.com";

/* ── Headline icons (Mobbin hero): the lines blur in, a gap opens in each line and an
   app icon resolves into it; then one slot at a time (bottom line first) cross-fades
   to an icon that isn't on screen. ── */

const SWAP_INTERVAL_MS = 1500;

function useIconSwap(initial: AppIconKind[], startDelay: number) {
  const [kinds, setKinds] = useState(initial);

  useEffect(() => {
    let slot = initial.length;
    let interval: number | undefined;
    const start = window.setTimeout(() => {
      interval = window.setInterval(() => {
        if (document.hidden) return;
        slot = (slot - 1 + initial.length) % initial.length;
        const target = slot;
        setKinds((current) => {
          const unused = APP_ICON_KINDS.filter((k) => !current.includes(k));
          const next = [...current];
          next[target] = unused[Math.floor(Math.random() * unused.length)];
          return next;
        });
      }, SWAP_INTERVAL_MS);
    }, startDelay);
    return () => {
      window.clearTimeout(start);
      window.clearInterval(interval);
    };
  }, [initial.length, startDelay]);

  return kinds;
}

/** One icon position: keeps the outgoing icon mounted while it cross-fades out. */
function IconSlot({ kind, firstClass }: { kind: AppIconKind; firstClass?: string }) {
  const [current, setCurrent] = useState(kind);
  const [prev, setPrev] = useState<AppIconKind | null>(null);
  const [swaps, setSwaps] = useState(0);

  if (kind !== current) {
    setPrev(current);
    setCurrent(kind);
    setSwaps(swaps + 1);
  }

  return (
    <>
      {prev && <AppIcon key={`out-${swaps}`} kind={prev} className="is-out" />}
      <AppIcon key={`in-${swaps}`} kind={current} className={swaps > 0 ? "is-in" : firstClass} />
    </>
  );
}

const HERO_ICONS: AppIconKind[] = ["hornbill", "chat", "cap"];
// First swap once the intro has settled (lines ~0.9s, icons ~1.6s).
const HERO_SWAP_DELAY_MS = 2400;

/** "Minat {0} dengan\npembangunan {1} belia\ndi {2} Sarawak?" → lines with icon slots. */
function HeroTitle() {
  const { t } = useI18n();
  const kinds = useIconSwap(HERO_ICONS, HERO_SWAP_DELAY_MS);
  const title = t("landingTitle");
  const plain = title.replace(/\s*\{\d\}/g, "").replace(/\s*\n\s*/g, " ");

  return (
    <h1 className="lp-h1" aria-label={plain}>
      <span aria-hidden="true">
        {title.split("\n").map((line, l) => (
          <span className="lp-line" key={l} style={{ "--l": l } as CSSProperties}>
            {line.split(/\s*\{(\d)\}/).map((part, i) =>
              i % 2 === 0 ? (
                part
              ) : (
                <span className="lp-hicon" key={i}>
                  <IconSlot kind={kinds[Number(part)]} firstClass="is-first" />
                </span>
              ),
            )}
          </span>
        ))}
      </span>
    </h1>
  );
}

function CtaIcons() {
  const kinds = useIconSwap(["news", "people", "rocket"], 600);
  return (
    <div className="lp-cta-icons" aria-hidden="true">
      {kinds.map((k, i) => (
        <span className="lp-cta-icon" key={i}>
          <IconSlot kind={k} />
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
            </div>
            <h3 className="lp-card-title">{t("landingConstTitle")}</h3>
            <p className="lp-card-body">{t("landingConstBody")}</p>
          </a>
          <a className="lp-card" href={APP_HREF}>
            <div className="lp-card-stage">
              <div className="lp-news">
                {[0, 1].map((i) => (
                  <div className="lp-news-row" key={i}>
                    <span className="lp-news-thumb" />
                    <span className="lp-news-lines">
                      <i />
                      <i />
                      <small>{t("newsSource")}</small>
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <h3 className="lp-card-title">{t("latestNews")}</h3>
            <p className="lp-card-body">{t("landingNewsBody")}</p>
          </a>
        </div>
      </div>
    </section>
  );
}

const SIX: { kind: AppIconKind; title: MessageKey; body: MessageKey }[] = [
  { kind: "cap", title: "agendaEducation", body: "landingSixEducationBody" },
  { kind: "briefcase", title: "agendaEmployment", body: "landingSixEmploymentBody" },
  { kind: "rocket", title: "agendaEmergingTech", body: "landingSixTechBody" },
  { kind: "card", title: "landingSixJoinTitle", body: "landingSixJoinBody" },
  { kind: "book", title: "landingSixDocsTitle", body: "landingSixDocsBody" },
  { kind: "lang", title: "landingSixLangTitle", body: "landingSixLangBody" },
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
              <AppIcon kind={f.kind} className="lp-six-icon" />
              <h3>{t(f.title)}</h3>
              <p>{t(f.body)}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/* About (Frontify label + statement, Raw Materials numbered points). The statement's
   words darken as it scrolls into view where scroll-driven animations are supported. */
const ABOUT_POINTS: [MessageKey, MessageKey][] = [
  ["landingAbout1Title", "landingAbout1Body"],
  ["landingAbout2Title", "landingAbout2Body"],
  ["landingAbout3Title", "landingAbout3Body"],
];

function About() {
  const { t } = useI18n();
  return (
    <section className="lp-section" id="tentang" aria-labelledby="lp-about-label">
      <div className="lp-wrap lp-about">
        <p className="lp-about-label" id="lp-about-label">{t("landingAboutLabel")}</p>
        <div>
          <p className="lp-about-statement">
            {t("landingAboutStatement")
              .split(" ")
              .map((word, i) => (
                <span key={i} style={{ "--w": i } as CSSProperties}>
                  {word}{" "}
                </span>
              ))}
          </p>
          <ol className="lp-about-points">
            {ABOUT_POINTS.map(([title, body], i) => (
              <li key={title}>
                <span className="lp-about-num">{String(i + 1).padStart(2, "0")}</span>
                <h3>{t(title)}</h3>
                <p>{t(body)}</p>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}

/* Party structure: alternating text + illustration rows (illustrations to come). */
const STRUCTURE: { kicker: MessageKey; sub: MessageKey; title: MessageKey; body: MessageKey; link?: boolean }[] = [
  { kicker: "landingStructKicker", sub: "landingStructMktSub", title: "sayapMkt", body: "landingStructMktBody" },
  { kicker: "landingStructWingKicker", sub: "landingStructWpSub", title: "landingStructWpTitle", body: "landingStructWpBody" },
  { kicker: "landingStructWingKicker", sub: "landingStructBeliaSub", title: "landingStructBeliaTitle", body: "landingStructBeliaBody", link: true },
];

function Structure() {
  const { t } = useI18n();
  return (
    <section className="lp-section" aria-label={t("landingStructAria")}>
      <div className="lp-wrap lp-struct">
        {STRUCTURE.map((row, i) => (
          <div className={`lp-struct-row${i % 2 ? " is-flipped" : ""}`} key={row.title}>
            <div className="lp-struct-text">
              <p className="lp-struct-kicker">
                <span>{t(row.kicker)}</span>
                <i aria-hidden="true" />
                <span>{t(row.sub)}</span>
              </p>
              <h2 className="lp-struct-title">{t(row.title)}</h2>
              <p className="lp-struct-body">{t(row.body)}</p>
              {row.link && (
                <a className="lp-btn lp-btn--outline" href={LEADERSHIP_HREF}>
                  {t("landingStructBeliaCta")}
                </a>
              )}
            </div>
            <div className="lp-struct-visual" aria-hidden="true" />
          </div>
        ))}
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
          <CtaIcons />
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

export function Footer() {
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
              <li><a href={LEADERSHIP_HREF}>{t("leadershipNav")}</a></li>
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

export function SiteNav() {
  const { t } = useI18n();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className={`lp-nav${scrolled ? " is-scrolled" : ""}`}>
      <div className="lp-wrap lp-nav-inner">
        <a className="lp-brand" href={BASE}>
          <Logo className="lp-brand-logo" decorative />
          <span>Belia PBB</span>
        </a>
        <nav className="lp-nav-links" aria-label={t("landingNavAria")}>
          <a href={`${BASE}#ciri`}>{t("landingNavFeatures")}</a>
          <a href={LEADERSHIP_HREF}>{t("leadershipNav")}</a>
          <a href={`${BASE}#soalan`}>{t("landingNavFaq")}</a>
          <a href={appTab("ftes")}>{t("ftesNav")}</a>
        </nav>
        <a className="lp-btn lp-btn--dark lp-btn--sm" href={APP_HREF}>{t("landingOpenApp")}</a>
      </div>
    </header>
  );
}

export function Landing() {
  const { t } = useI18n();

  useEffect(() => {
    document.title = t("landingDocTitle");
  }, [t]);

  return (
    <div className="lp">
      <SiteNav />

      <main>
        <section className="lp-hero">
          <div className="lp-hero-inner">
            <p className="lp-kicker">{t("landingKicker")}</p>
            <HeroTitle />
            <p className="lp-sub">{t("landingSub")}</p>
            <div className="lp-ctas">
              <a className="lp-btn lp-btn--dark" href={appTab("apply")}>{t("landingJoin")}</a>
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

        <About />
        <Explore />
        <Six />
        <Structure />
        <Faq />
        <Cta />
      </main>
      <Footer />
    </div>
  );
}
