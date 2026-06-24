import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from "react";
import { ExternalLinkArrowIcon } from "./ExternalLinkArrowIcon";
import { useI18n, type MessageKey } from "./i18n";
import { CONSTITUTION_PDF_URL } from "./constitutionPdf";

const KENALI_PARTI_LABELS = ["About", "Structure", "Constitution", "Apply", "History"] as const;

const KENALI_PARTI_UI_ORDER: Record<(typeof KENALI_PARTI_LABELS)[number], number> = {
  About: 1,
  Structure: 2,
  History: 3,
  Constitution: 4,
  Apply: 5,
};

const KENALI_LABEL_TO_KEY: Record<(typeof KENALI_PARTI_LABELS)[number], MessageKey> = {
  About: "kenaliAbout",
  Structure: "kenaliStructure",
  Constitution: "kenaliConstitution",
  Apply: "kenaliApply",
  History: "kenaliHistory",
};

const KENALI_ABOUT_WIKI_MS =
  "https://ms.wikipedia.org/wiki/Parti_Pesaka_Bumiputera_Bersatu_Sarawak";

const KENALI_HISTORY_WIKI_MS = `${KENALI_ABOUT_WIKI_MS}#Sejarah`;

const KENALI_PARTI_PHOTO_SRC: Record<(typeof KENALI_PARTI_LABELS)[number], string> = {
  About: `${import.meta.env.BASE_URL}kenali/about.jpg`,
  Structure: `${import.meta.env.BASE_URL}kenali/structure.jpg`,
  Constitution: `${import.meta.env.BASE_URL}kenali/constitution.jpg`,
  Apply: `${import.meta.env.BASE_URL}kenali/apply.jpg`,
  History: `${import.meta.env.BASE_URL}kenali/history.jpg`,
};

const SAYAP_PARTI_LABELS = ["MKT", "Wanita", "Pemuda", "Belia"] as const;

type SayapPartiLabel = (typeof SAYAP_PARTI_LABELS)[number];

const SAYAP_LABEL_TO_KEY: Partial<Record<SayapPartiLabel, MessageKey>> = {
  MKT: "sayapMkt",
};

const SAYAP_FEATURED: SayapPartiLabel = "MKT";

const SAYAP_CAROUSEL_LABELS = ["Wanita", "Pemuda", "Belia"] as const satisfies readonly SayapPartiLabel[];

const SAYAP_PARTI_PHOTO_SRC: Record<SayapPartiLabel, string> = {
  MKT: `${import.meta.env.BASE_URL}sayap/mkt.png`,
  Wanita: `${import.meta.env.BASE_URL}sayap/wanita.png`,
  Pemuda: `${import.meta.env.BASE_URL}sayap/pemuda.png`,
  Belia: `${import.meta.env.BASE_URL}sayap/belia.png`,
};

function KenaliStoryCard({
  label,
  onSelectApply,
}: {
  label: (typeof KENALI_PARTI_LABELS)[number];
  onSelectApply: () => void;
}) {
  const { t } = useI18n();
  const content = (
    <>
      <span className="kenali-stories-visual">
        <img
          src={KENALI_PARTI_PHOTO_SRC[label]}
          alt=""
          className="kenali-stories-media"
          loading="lazy"
          decoding="async"
        />
      </span>
      <span className="kenali-stories-label">{t(KENALI_LABEL_TO_KEY[label])}</span>
    </>
  );

  if (label === "About") {
    return (
      <a
        className="kenali-stories-card"
        href={KENALI_ABOUT_WIKI_MS}
        target="_blank"
        rel="noopener noreferrer"
      >
        {content}
      </a>
    );
  }

  if (label === "History") {
    return (
      <a
        className="kenali-stories-card"
        href={KENALI_HISTORY_WIKI_MS}
        target="_blank"
        rel="noopener noreferrer"
      >
        {content}
      </a>
    );
  }

  if (label === "Constitution") {
    return (
      <a
        className="kenali-stories-card"
        href={CONSTITUTION_PDF_URL}
        target="_blank"
        rel="noopener noreferrer"
      >
        {content}
      </a>
    );
  }

  if (label === "Apply") {
    return (
      <button type="button" className="kenali-stories-card" onClick={onSelectApply}>
        {content}
      </button>
    );
  }

  return (
    <button type="button" className="kenali-stories-card">
      {content}
    </button>
  );
}

function KenaliStoriesSection({ onSelectApply }: { onSelectApply: () => void }) {
  const { t } = useI18n();

  const kenaliLabels = [...KENALI_PARTI_LABELS].sort(
    (a, b) => KENALI_PARTI_UI_ORDER[a] - KENALI_PARTI_UI_ORDER[b],
  );

  return (
    <section className="kenali-stories" aria-labelledby="kenali-stories-heading">
      <div className="kenali-stories-inner">
        <div className="kenali-stories-header">
          <h2 id="kenali-stories-heading" className="kenali-stories-heading">
            {t("kenaliParti")}
          </h2>
          <a
            className="kenali-stories-link"
            href={KENALI_ABOUT_WIKI_MS}
            target="_blank"
            rel="noopener noreferrer"
          >
            {t("kenaliLearnMore")}
          </a>
        </div>
        <ul className="kenali-stories-track" aria-label={t("kenaliParti")}>
          {kenaliLabels.map((label) => (
            <li key={label} className="kenali-stories-item">
              <KenaliStoryCard label={label} onSelectApply={onSelectApply} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function SayapWingCard({
  label,
  variant,
}: {
  label: SayapPartiLabel;
  variant: "featured" | "compact" | "feed";
}) {
  const { t } = useI18n();
  const key = SAYAP_LABEL_TO_KEY[label];
  const displayLabel = key ? t(key) : label;

  return (
    <button
      type="button"
      className={`sayap-wing-card sayap-wing-card--${variant}`}
    >
      <span className="sayap-wing-media-wrap">
        <img
          src={SAYAP_PARTI_PHOTO_SRC[label]}
          alt=""
          className="sayap-wing-media"
          loading="lazy"
          decoding="async"
        />
      </span>
      <span className="sayap-wing-title">
        {displayLabel}
        <ExternalLinkArrowIcon className="sayap-wing-title-arrow" />
      </span>
    </button>
  );
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function SayapPartiSection() {
  const { t } = useI18n();
  const pinRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const firstItemRef = useRef<HTMLLIElement>(null);
  const metricsRef = useRef({ maxOffset: 0, stickyViewport: 0 });
  const [scrollOffset, setScrollOffset] = useState(0);
  const [pinHeightPx, setPinHeightPx] = useState<number | null>(null);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);

  const isDriven = isDesktop && !reducedMotion;

  useLayoutEffect(() => {
    const mq = window.matchMedia("(min-width: 48rem)");
    const sync = () => setIsDesktop(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  useLayoutEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReducedMotion(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  useLayoutEffect(() => {
    if (!isDriven) return;

    const measure = () => {
      const track = firstItemRef.current?.parentElement;
      const viewport = viewportRef.current;
      if (!track || !viewport) return;
      const headerOffset =
        Number.parseFloat(
          getComputedStyle(document.documentElement).getPropertyValue("--header-offset"),
        ) || 0;
      const stickyViewport = window.innerHeight - headerOffset;
      const maxOffset = Math.max(0, track.scrollHeight - viewport.clientHeight);
      metricsRef.current = { maxOffset, stickyViewport };
      setPinHeightPx(stickyViewport + maxOffset);
    };

    measure();
    const ro = typeof ResizeObserver !== "undefined" ? new ResizeObserver(measure) : null;
    if (firstItemRef.current && ro) ro.observe(firstItemRef.current);
    if (viewportRef.current && ro) ro.observe(viewportRef.current);
    if (firstItemRef.current?.parentElement && ro) {
      ro.observe(firstItemRef.current.parentElement);
    }
    window.addEventListener("resize", measure);
    return () => {
      ro?.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [isDriven]);

  useEffect(() => {
    if (!isDriven) return;

    const pin = pinRef.current;
    if (!pin) return;

    let raf = 0;

    const update = () => {
      raf = 0;
      const rect = pin.getBoundingClientRect();
      const headerOffset =
        Number.parseFloat(
          getComputedStyle(document.documentElement).getPropertyValue("--header-offset"),
        ) || 0;
      const { maxOffset, stickyViewport } = metricsRef.current;
      const scrollable = pin.offsetHeight - stickyViewport;

      if (scrollable <= 0) {
        setScrollOffset(0);
        return;
      }

      const scrolled = clamp(-rect.top + headerOffset, 0, scrollable);
      const progress = scrolled / scrollable;

      setScrollOffset(progress * maxOffset);
    };

    const onScroll = () => {
      if (!raf) raf = window.requestAnimationFrame(update);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    update();

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) window.cancelAnimationFrame(raf);
    };
  }, [isDriven]);

  const pinStyle = {
    ...(pinHeightPx != null && isDriven
      ? { "--sayap-pin-height": `${pinHeightPx}px` }
      : {}),
  } as CSSProperties;

  const trackStyle = isDriven
    ? ({ transform: `translate3d(0, ${-scrollOffset}px, 0)` } as CSSProperties)
    : undefined;

  const sayapHeading = (
    <h2 className="sayap-parti-heading" id="sayap-parti-heading">
      {t("sayapParti")}
    </h2>
  );

  return (
    <section className="sayap-parti" aria-labelledby="sayap-parti-heading">
      <div
        ref={isDriven ? pinRef : undefined}
        className={`sayap-parti-pin${isDriven ? "" : " sayap-parti-pin--static"}`}
        style={pinStyle}
      >
        <div className="sayap-parti-sticky">
          <div className="sayap-parti-inner">
            {sayapHeading}
            {isDriven ? (
              <div className="sayap-parti-layout">
                <div className="sayap-featured">
                  <SayapWingCard label={SAYAP_FEATURED} variant="featured" />
                </div>
                <div ref={viewportRef} className="sayap-vertical-viewport" aria-live="polite">
                  <ul
                    className="sayap-vertical-track sayap-vertical-track--driven"
                    aria-label={t("sayapParti")}
                    style={trackStyle}
                  >
                    {SAYAP_CAROUSEL_LABELS.map((label, index) => (
                      <li
                        key={label}
                        ref={index === 0 ? firstItemRef : undefined}
                        className="sayap-vertical-track-item"
                      >
                        <SayapWingCard label={label} variant="compact" />
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : (
              <ul className="sayap-feed-stack" aria-label={t("sayapParti")}>
                {SAYAP_PARTI_LABELS.map((label) => (
                  <li key={label} className="sayap-feed-stack-item">
                    <SayapWingCard
                      label={label}
                      variant={label === SAYAP_FEATURED ? "featured" : "feed"}
                    />
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

type PartyWingsSectionProps = {
  onSelectApply: () => void;
};

export function PartyWingsSection({ onSelectApply }: PartyWingsSectionProps) {
  return (
    <div className="party-wings-group">
      <KenaliStoriesSection onSelectApply={onSelectApply} />
      <SayapPartiSection />
    </div>
  );
}
