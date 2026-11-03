import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent as ReactKeyboardEvent,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { useI18n, type MessageKey } from "../i18n";
import { fetchNewsFeed, type NewsCardModel } from "../jiwabakti";
import "./ExploreCards.css";

/* The explore cards' live stages. Each plays a short demo once when it scrolls into
   view, and hands over to the visitor the moment they touch it (no autoplay after that). */

function prefersReducedMotion() {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/** True once the element has been at least half on screen. */
function useSeen<T extends Element>() {
  const ref = useRef<T>(null);
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || seen) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setSeen(true);
          io.disconnect();
        }
      },
      { threshold: 0.5 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [seen]);
  return [ref, seen] as const;
}

/** Whether the element is on screen right now (for loops that should pause offscreen). */
function useInView<T extends Element>() {
  const ref = useRef<T>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { threshold: 0.4 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return [ref, inView] as const;
}

/* ── Tanya FTES: eligibility check ─────────────────────────────────────── */

const CRITERIA: MessageKey[] = ["landingElig1", "landingElig2", "landingElig3", "landingElig4", "landingElig5"];
/** The demo ticks all but the last, so the visitor gets to finish it. */
const AUTO_TICKS = CRITERIA.length - 1;

export function EligibilityStage({ askHref }: { askHref: string }) {
  const { t } = useI18n();
  const [ref, seen] = useSeen<HTMLDivElement>();
  const [checked, setChecked] = useState<boolean[]>(() => CRITERIA.map(() => false));
  const touched = useRef(false);

  useEffect(() => {
    if (!seen || touched.current || prefersReducedMotion()) return;
    const timers = Array.from({ length: AUTO_TICKS }, (_, i) =>
      window.setTimeout(() => {
        if (touched.current) return;
        setChecked((c) => c.map((v, j) => (j === i ? true : v)));
      }, 500 + i * 380),
    );
    return () => timers.forEach(clearTimeout);
  }, [seen]);

  const count = checked.filter(Boolean).length;
  const done = count === CRITERIA.length;
  const next = checked.indexOf(false);
  const hinting = !touched.current && count === AUTO_TICKS && next === CRITERIA.length - 1;

  function toggle(i: number) {
    touched.current = true;
    setChecked((c) => c.map((v, j) => (j === i ? !v : v)));
  }

  return (
    <div className="xc-elig" ref={ref}>
      <div className="xc-elig-head">
        <span>{t("landingEligTitle")}</span>
        <span className="xc-elig-count" aria-hidden="true">
          <span className="xc-roll" key={count}>{count}</span>/{CRITERIA.length}
        </span>
      </div>
      <ul className="xc-elig-list">
        {CRITERIA.map((key, i) => (
          <li key={key}>
            <button
              type="button"
              role="checkbox"
              aria-checked={checked[i]}
              className="xc-check"
              data-on={checked[i] || undefined}
              data-hint={(hinting && i === next) || undefined}
              onClick={() => toggle(i)}
            >
              <span className="xc-box" aria-hidden="true">
                <svg viewBox="0 0 16 16">
                  <path d="M3.5 8.4 6.6 11.4 12.5 4.8" />
                </svg>
              </span>
              <span className="xc-check-label">{t(key)}</span>
            </button>
          </li>
        ))}
      </ul>
      <div className="xc-elig-foot" aria-live="polite">
        <span className="xc-elig-hint" data-on={!done || undefined} aria-hidden={done}>
          {t("landingEligHint")}
        </span>
        <a
          className="xc-elig-done"
          href={askHref}
          data-on={done || undefined}
          aria-hidden={!done}
          aria-label={`${t("landingEligDone")}: ${t("landingEligAsk")}`}
          tabIndex={done ? 0 : -1}
        >
          <span className="xc-elig-done-mark" aria-hidden="true">
            <svg viewBox="0 0 16 16"><path d="M3.5 8.4 6.6 11.4 12.5 4.8" /></svg>
          </span>
          {t("landingEligDone")}
          <span className="xc-elig-done-cta" aria-hidden="true">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14m-6-6 6 6-6 6" /></svg>
          </span>
        </a>
      </div>
    </div>
  );
}

/* ── Perlembagaan: article scrubber ────────────────────────────────────── */

/** The constitution's table of contents (amended to 7 June 2023), from public/perlembagaan.pdf. */
const ARTICLES: [string, string][] = [
  ["1", "Nama"],
  ["2", "Alamat Berdaftar"],
  ["3", "Lambang"],
  ["4", "Lencana"],
  ["5", "Bendera"],
  ["6", "Cogan Kata dan Seruan"],
  ["7", "Tujuan-Tujuan dan Kuasa-Kuasa"],
  ["8", "Kelayakan Keahlian"],
  ["9", "Permohonan Keahlian"],
  ["10", "Penerimaan Keahlian"],
  ["11", "Tanggungjawab dan Hak Ahli"],
  ["12", "Pemberhentian Keahlian"],
  ["13", "Perhimpunan Agung"],
  ["14", "Majlis Tertinggi"],
  ["15", "Caucus Parlimen"],
  ["16", "Tanggungjawab Pemegang-Pemegang Jawatan"],
  ["17", "Penubuhan, Pentadbiran dan Pengurusan Cawangan"],
  ["17A", "Pendaftaran Cawangan dan Ranting"],
  ["18", "Jawatankuasa Cawangan"],
  ["19", "Penubuhan, Pentadbiran dan Pengurusan Ranting-Ranting"],
  ["20", "Jawatankuasa Ranting"],
  ["21", "Pelantikan Perwakilan"],
  ["22", "Pergerakan Pemuda"],
  ["23", "Pergerakan Wanita"],
  ["24", "Syarat Menjadi Calon"],
  ["25", "Disiplin Parti"],
  ["26", "Buku Daftar Keahlian"],
  ["27", "Kad Keahlian"],
  ["28", "Sumber Kewangan"],
  ["29", "Yuran"],
  ["30", "Peruntukan Kewangan"],
  ["31", "Harta Tak Alih"],
  ["32", "Audit"],
  ["33", "Peraturan-Peraturan"],
  ["34", "Pindaan Perlembagaan"],
  ["35", "Pungutan Suara (Referendum)"],
  ["36", "Pembubaran, Percantuman dan Lain-Lain"],
  ["37", "Pentafsiran"],
  ["38", "Peruntukan Umum Mengenai Cawangan, Ranting dan Pergerakan"],
  ["39", "Peruntukan-Peruntukan Khas"],
  ["40", "Tarikh Kuatkuasa Perlembagaan"],
];
const LAST = ARTICLES.length - 1;
/** Where the demo comes to rest: Article 8, membership eligibility. */
const DEMO_TARGET = 7;

/** One rolling line: the outgoing value slides out as the new one slides in, in the direction of travel. */
function RollText({ value, dir, className }: { value: string; dir: 1 | -1; className?: string }) {
  const [current, setCurrent] = useState(value);
  const [prev, setPrev] = useState<string | null>(null);
  const [n, setN] = useState(0);
  if (value !== current) {
    setPrev(current);
    setCurrent(value);
    setN(n + 1);
  }
  return (
    <span className={`xc-rolltext ${className ?? ""}`} style={{ "--dir": dir } as CSSProperties}>
      {prev !== null && (
        <span key={`o${n}`} className="xc-rolltext-out" aria-hidden="true" onAnimationEnd={() => setPrev(null)}>
          {prev}
        </span>
      )}
      <span key={`i${n}`} className={n ? "xc-rolltext-in" : undefined}>
        {current}
      </span>
    </span>
  );
}

export function ScrubberStage() {
  const { t } = useI18n();
  const [ref, seen] = useSeen<HTMLDivElement>();
  const trackRef = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const [dir, setDir] = useState<1 | -1>(1);
  const [dragging, setDragging] = useState(false);
  const touched = useRef(false);

  const go = useCallback((next: number) => {
    const clamped = Math.max(0, Math.min(LAST, next));
    setIndex((i) => {
      if (clamped !== i) setDir(clamped > i ? 1 : -1);
      return clamped;
    });
  }, []);

  // Demo: flick from Article 1 to Article 8, slowing as it arrives
  useEffect(() => {
    if (!seen || touched.current || prefersReducedMotion()) return;
    const timers: number[] = [];
    let at = 600;
    for (let i = 1; i <= DEMO_TARGET; i++) {
      at += 70 + (i / DEMO_TARGET) ** 3 * 220;
      timers.push(window.setTimeout(() => !touched.current && go(i), at));
    }
    return () => timers.forEach(clearTimeout);
  }, [seen, go]);

  function indexAt(clientX: number) {
    const r = trackRef.current!.getBoundingClientRect();
    return Math.round(((clientX - r.left) / r.width) * LAST);
  }

  function onPointerDown(e: ReactPointerEvent<HTMLDivElement>) {
    touched.current = true;
    e.currentTarget.setPointerCapture(e.pointerId);
    e.currentTarget.focus({ preventScroll: true });
    setDragging(true);
    go(indexAt(e.clientX));
  }

  function onPointerMove(e: ReactPointerEvent<HTMLDivElement>) {
    if (dragging) go(indexAt(e.clientX));
  }

  function onKeyDown(e: ReactKeyboardEvent<HTMLDivElement>) {
    const step = { ArrowRight: 1, ArrowUp: 1, ArrowLeft: -1, ArrowDown: -1, PageUp: 5, PageDown: -5 }[e.key];
    if (step !== undefined) go(index + step);
    else if (e.key === "Home") go(0);
    else if (e.key === "End") go(LAST);
    else return;
    touched.current = true;
    e.preventDefault();
  }

  const [num, title] = ARTICLES[index];
  const pos = index / LAST;

  return (
    <div className="xc-scrub" ref={ref}>
      <div className="xc-scrub-read" aria-hidden="true">
        <span className="xc-scrub-label">{t("landingScrubLabel")}</span>
        <RollText value={num} dir={dir} className="xc-scrub-big" />
        <RollText value={title} dir={dir} className="xc-scrub-title" />
      </div>
      <div
        className="xc-scrub-rail"
        ref={trackRef}
        role="slider"
        tabIndex={0}
        aria-label={t("landingScrubAria")}
        aria-valuemin={1}
        aria-valuemax={ARTICLES.length}
        aria-valuenow={index + 1}
        aria-valuetext={`${t("landingScrubLabel")} ${num}: ${title}`}
        data-dragging={dragging || undefined}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={() => setDragging(false)}
        onPointerCancel={() => setDragging(false)}
        onKeyDown={onKeyDown}
        style={{ "--pos": pos } as CSSProperties}
      >
        <span className="xc-scrub-ticks" aria-hidden="true">
          {ARTICLES.map(([n], i) => (
            <i key={n} data-on={i <= index || undefined} data-major={i === 0 || i === LAST || (Number(n) % 10 === 0 && !n.endsWith("A")) || undefined} />
          ))}
        </span>
        <span className="xc-scrub-thumb" aria-hidden="true" />
      </div>
      <div className="xc-scrub-ends" aria-hidden="true">
        <span>1</span>
        <span className="xc-scrub-hint">{t("landingScrubHint")}</span>
        <span>40</span>
      </div>
    </div>
  );
}

/* ── Berita: live headline deck ────────────────────────────────────────── */

const DECK_SIZE = 5;
const VISIBLE = 3;
const AUTO_MS = 4200;
const THROW_PX = 70;

function formatDate(iso: string, locale: string) {
  try {
    return new Intl.DateTimeFormat(locale, { day: "numeric", month: "short" }).format(new Date(iso));
  } catch {
    return "";
  }
}

export function NewsDeckStage() {
  const { t, language } = useI18n();
  const [ref, inView] = useInView<HTMLDivElement>();
  const [items, setItems] = useState<NewsCardModel[] | null>(null);
  const [failed, setFailed] = useState(false);
  const [order, setOrder] = useState<number[]>([]);
  const [drag, setDrag] = useState<{ id: number; x: number } | null>(null);
  const [flying, setFlying] = useState<{ id: number; dir: 1 | -1 } | null>(null);
  const [hovered, setHovered] = useState(false);
  const start = useRef<{ x: number; y: number; t: number; moved: boolean } | null>(null);
  const requested = useRef(false);

  // Fetch the feed the first time the card comes on screen
  useEffect(() => {
    if (!inView || requested.current) return;
    requested.current = true;
    fetchNewsFeed({ count: DECK_SIZE })
      .then((list) => {
        if (!list.length) throw new Error("empty");
        setItems(list);
        setOrder(list.map((_, i) => i));
      })
      .catch(() => setFailed(true));
  }, [inView]);

  const advance = useCallback(
    (dir: 1 | -1) => {
      if (flying || order.length < 2) return;
      const top = order[0];
      setFlying({ id: top, dir });
      window.setTimeout(() => {
        setOrder((o) => [...o.slice(1), o[0]]);
        setFlying(null);
      }, 260);
    },
    [flying, order],
  );

  // Idle: the next story comes up every few seconds while the deck is on screen
  useEffect(() => {
    if (!items || !inView || hovered || drag || prefersReducedMotion()) return;
    const id = window.setTimeout(() => advance(-1), AUTO_MS);
    return () => clearTimeout(id);
  }, [items, inView, hovered, drag, order, advance]);

  function onPointerDown(e: ReactPointerEvent<HTMLAnchorElement>, id: number) {
    if (id !== order[0] || flying) return;
    start.current = { x: e.clientX, y: e.clientY, t: performance.now(), moved: false };
    e.currentTarget.setPointerCapture(e.pointerId);
    setDrag({ id, x: 0 });
  }

  function onPointerMove(e: ReactPointerEvent<HTMLAnchorElement>) {
    if (!start.current || !drag) return;
    const dx = e.clientX - start.current.x;
    if (Math.abs(dx) > 4) start.current.moved = true;
    setDrag({ id: drag.id, x: dx });
  }

  function onPointerUp(e: ReactPointerEvent<HTMLAnchorElement>) {
    if (!start.current || !drag) return;
    const dx = e.clientX - start.current.x;
    const speed = Math.abs(dx) / Math.max(1, performance.now() - start.current.t);
    setDrag(null);
    if (Math.abs(dx) > THROW_PX || (Math.abs(dx) > 24 && speed > 0.5)) advance(dx > 0 ? 1 : -1);
  }

  function onClick(e: React.MouseEvent<HTMLAnchorElement>, id: number) {
    // A drag is not a click; only the top card opens
    if (start.current?.moved || id !== order[0]) e.preventDefault();
    start.current = null;
  }

  const dateLocale = language === "ms" ? "ms-MY" : "en-MY";

  if (!items) {
    return (
      <div className="xc-deck" ref={ref} aria-busy={!failed}>
        {[2, 1, 0].map((depth) => (
          <div className="xc-deck-card xc-deck-card--ghost" key={depth} style={{ "--d": depth } as CSSProperties}>
            <span className="xc-deck-img" />
            <span className="xc-deck-body">
              <i />
              <i />
              <small>{t("newsSource")}</small>
            </span>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div
      className="xc-deck"
      ref={ref}
      onPointerEnter={(e) => e.pointerType === "mouse" && setHovered(true)}
      onPointerLeave={() => setHovered(false)}
    >
      {items.map((item, i) => {
        const depth = order.indexOf(i);
        const isTop = depth === 0;
        const style: CSSProperties & Record<string, string | number> = { "--d": Math.min(depth, VISIBLE), zIndex: items.length - depth };
        if (drag && drag.id === i) {
          style["--dx"] = `${drag.x}px`;
          style["--rot"] = `${drag.x / 24}deg`;
        }
        return (
          <a
            key={item.id}
            className="xc-deck-card"
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            draggable={false}
            tabIndex={isTop ? 0 : -1}
            aria-hidden={!isTop}
            data-top={isTop || undefined}
            data-hidden={depth >= VISIBLE || undefined}
            data-dragging={(drag && drag.id === i) || undefined}
            data-fly={flying && flying.id === i ? (flying.dir > 0 ? "right" : "left") : undefined}
            style={style}
            onPointerDown={(e) => onPointerDown(e, i)}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={() => setDrag(null)}
            onClick={(e) => onClick(e, i)}
          >
            <span className="xc-deck-img">{item.image && <img src={item.image} alt="" loading="lazy" decoding="async" draggable={false} />}</span>
            <span className="xc-deck-body">
              <span className="xc-deck-title">{item.title}</span>
              <small>
                {t("newsSource")} · <time dateTime={item.date}>{formatDate(item.date, dateLocale)}</time>
              </small>
            </span>
          </a>
        );
      })}
      <button type="button" className="xc-deck-next" onClick={() => advance(-1)} aria-label={t("landingNewsNext")} title={t("landingNewsSwipe")}>
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14m-6-6 6 6-6 6" /></svg>
      </button>
    </div>
  );
}
