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
import { ARTICLES } from "./constitutionArticles";
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
const CONFETTI_COLORS = ["#16a34a", "#22c55e", "#86efac", "#facc15", "#f97316", "#ef4444", "#3b82f6"];

/** A one-off confetti burst on a canvas covering the card's stage (clipped by it). */
function burstConfetti(canvas: HTMLCanvasElement, origin: { x: number; y: number }) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return () => {};
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const w = canvas.clientWidth;
  const h = canvas.clientHeight;
  canvas.width = w * dpr;
  canvas.height = h * dpr;
  ctx.scale(dpr, dpr);

  const parts = Array.from({ length: 90 }, () => {
    const angle = -Math.PI / 2 + (Math.random() - 0.5) * Math.PI * 0.9;
    const speed = 5 + Math.random() * 7;
    return {
      x: origin.x + (Math.random() - 0.5) * 40,
      y: origin.y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      size: 5 + Math.random() * 5,
      rot: Math.random() * Math.PI,
      spin: (Math.random() - 0.5) * 0.4,
      tilt: Math.random() * Math.PI,
      color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
      round: Math.random() < 0.3,
    };
  });

  const start = performance.now();
  const life = 2200;
  let raf = 0;
  const frame = (now: number) => {
    const t = now - start;
    ctx.clearRect(0, 0, w, h);
    const fade = Math.min(1, Math.max(0, (life - t) / 500));
    for (const p of parts) {
      p.vy += 0.28; // gravity
      p.vx *= 0.985; // air
      p.vy *= 0.985;
      p.x += p.vx;
      p.y += p.vy;
      p.rot += p.spin;
      p.tilt += 0.12;
      ctx.save();
      ctx.globalAlpha = fade;
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.fillStyle = p.color;
      if (p.round) {
        ctx.beginPath();
        ctx.arc(0, 0, p.size / 2.4, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // Paper flutter: the strip's height breathes as it turns
        ctx.fillRect(-p.size / 2, -p.size / 4, p.size, (p.size / 2) * Math.abs(Math.cos(p.tilt)) + 1);
      }
      ctx.restore();
    }
    if (t < life) raf = requestAnimationFrame(frame);
    else ctx.clearRect(0, 0, w, h);
  };
  raf = requestAnimationFrame(frame);
  return () => cancelAnimationFrame(raf);
}

export function EligibilityStage({ askHref }: { askHref: string }) {
  const { t } = useI18n();
  const [ref, seen] = useSeen<HTMLDivElement>();
  const [checked, setChecked] = useState<boolean[]>(() => CRITERIA.map(() => false));
  const touched = useRef(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pillRef = useRef<HTMLAnchorElement>(null);
  const wasDone = useRef(false);

  // Demo: the criteria tick one by one, all the way to the green result
  useEffect(() => {
    if (!seen || touched.current || prefersReducedMotion()) return;
    const timers = CRITERIA.map((_, i) =>
      window.setTimeout(() => {
        if (touched.current) return;
        setChecked((c) => c.map((v, j) => (j === i ? true : v)));
      }, 500 + i * 420),
    );
    return () => timers.forEach(clearTimeout);
  }, [seen]);

  const count = checked.filter(Boolean).length;
  const done = count === CRITERIA.length;

  // Confetti each time the list becomes complete, from the result pill
  useEffect(() => {
    const became = done && !wasDone.current;
    wasDone.current = done;
    if (!became || prefersReducedMotion()) return;
    const canvas = canvasRef.current;
    const pill = pillRef.current;
    if (!canvas || !pill) return;
    const c = canvas.getBoundingClientRect();
    const p = pill.getBoundingClientRect();
    let stop = () => {};
    // Let the boxes turn green first
    const id = window.setTimeout(() => {
      stop = burstConfetti(canvas, { x: p.left - c.left + p.width / 2, y: p.top - c.top + p.height / 2 });
    }, 260);
    return () => {
      clearTimeout(id);
      stop();
    };
  }, [done]);

  function toggle(i: number) {
    touched.current = true;
    setChecked((c) => c.map((v, j) => (j === i ? !v : v)));
  }

  return (
    <div className="xc-elig" ref={ref} data-done={done || undefined}>
      <canvas className="xc-confetti" ref={canvasRef} aria-hidden="true" />
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
              style={{ "--i": i } as CSSProperties}
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
          ref={pillRef}
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

const LAST = ARTICLES.length - 1;
/** Where the demo comes to rest: Article 23A, Pergerakan Belia PBB. */
const DEMO_TARGET = ARTICLES.findIndex((a) => a.n === "23A");

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

  // The latest index, so held-down arrow keys step from where the last one landed
  const indexRef = useRef(0);
  const go = useCallback((next: number) => {
    const clamped = Math.max(0, Math.min(LAST, next));
    if (clamped !== indexRef.current) setDir(clamped > indexRef.current ? 1 : -1);
    indexRef.current = clamped;
    setIndex(clamped);
  }, []);

  // Demo: flick from Article 1 to Article 8, slowing as it arrives
  useEffect(() => {
    if (!seen || touched.current || prefersReducedMotion()) return;
    const timers: number[] = [];
    let at = 600;
    for (let i = 1; i <= DEMO_TARGET; i++) {
      at += 45 + (i / DEMO_TARGET) ** 4 * 260;
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
    if (step !== undefined) go(indexRef.current + step);
    else if (e.key === "Home") go(0);
    else if (e.key === "End") go(LAST);
    else return;
    touched.current = true;
    e.preventDefault();
  }

  const { n: num, title, text } = ARTICLES[index];
  const pos = index / LAST;

  return (
    <div className="xc-scrub" ref={ref}>
      <div className="xc-scrub-read" aria-hidden="true">
        <div className="xc-scrub-head">
          <span className="xc-scrub-num">
            <span className="xc-scrub-label">{t("landingScrubLabel")}</span>
            <RollText value={num} dir={dir} className="xc-scrub-big" />
          </span>
          <RollText value={title} dir={dir} className="xc-scrub-title" />
        </div>
        <RollText value={text} dir={dir} className="xc-scrub-text" />
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
        aria-valuetext={`${t("landingScrubLabel")} ${num}: ${title}. ${text}`}
        data-dragging={dragging || undefined}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={() => setDragging(false)}
        onPointerCancel={() => setDragging(false)}
        onKeyDown={onKeyDown}
        style={{ "--pos": pos } as CSSProperties}
      >
        <span className="xc-scrub-ticks" aria-hidden="true">
          {ARTICLES.map(({ n }, i) => (
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

/* ── Berita: live stories ─────────────────────────────────────────────── */

const STORY_COUNT = 5;
const STORY_MS = 5000;
/** Holding longer than this pauses (as in Stories) instead of counting as a tap. */
const HOLD_MS = 220;

function formatDate(iso: string, locale: string) {
  try {
    return new Intl.DateTimeFormat(locale, { day: "numeric", month: "short" }).format(new Date(iso));
  } catch {
    return "";
  }
}

export function NewsStoriesStage() {
  const { t, language } = useI18n();
  const [ref, inView] = useInView<HTMLDivElement>();
  const [items, setItems] = useState<NewsCardModel[] | null>(null);
  const [index, setIndex] = useState(0);
  const [hovered, setHovered] = useState(false);
  const [held, setHeld] = useState(false);
  const [reduced] = useState(prefersReducedMotion);
  const requested = useRef(false);
  const holdTimer = useRef<number | undefined>(undefined);
  const wasHold = useRef(false);

  // Fetch the feed the first time the card comes on screen
  useEffect(() => {
    if (!inView || requested.current) return;
    requested.current = true;
    fetchNewsFeed({ count: STORY_COUNT })
      .then((list) => list.length && setItems(list))
      .catch(() => {
        /* the placeholder stays */
      });
  }, [inView]);

  const count = items?.length ?? 0;
  const step = useCallback((by: 1 | -1) => setIndex((i) => (i + by + count) % count), [count]);
  const paused = hovered || held || !inView || reduced;

  function onZoneDown(e: ReactPointerEvent<HTMLButtonElement>) {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    wasHold.current = false;
    holdTimer.current = window.setTimeout(() => {
      wasHold.current = true;
      setHeld(true);
    }, HOLD_MS);
  }

  function onZoneUp() {
    clearTimeout(holdTimer.current);
    setHeld(false);
  }

  function onZoneClick(by: 1 | -1) {
    // A hold only pauses; a tap moves
    if (wasHold.current) {
      wasHold.current = false;
      return;
    }
    step(by);
  }

  if (!items) {
    return (
      <div className="xc-story xc-story--ghost" ref={ref} aria-busy="true">
        <div className="xc-story-bars" aria-hidden="true">
          {Array.from({ length: STORY_COUNT }, (_, i) => (
            <span className="xc-story-bar" key={i} />
          ))}
        </div>
        <div className="xc-story-text">
          <i />
          <i />
          <small>{t("newsSource")}</small>
        </div>
      </div>
    );
  }

  const item = items[index];
  const dateLocale = language === "ms" ? "ms-MY" : "en-MY";

  return (
    <div
      className="xc-story"
      ref={ref}
      data-paused={paused || undefined}
      onPointerEnter={(e) => e.pointerType === "mouse" && setHovered(true)}
      onPointerLeave={() => setHovered(false)}
    >
      {items.map((it, i) => (
        <span className="xc-story-photo" data-on={i === index || undefined} key={it.id} aria-hidden="true">
          {it.image && <img src={it.image} alt="" loading={i < 2 ? "eager" : "lazy"} decoding="async" draggable={false} />}
        </span>
      ))}
      <span className="xc-story-shade" aria-hidden="true" />

      <div className="xc-story-bars" aria-hidden="true">
        {items.map((it, i) => (
          <span className="xc-story-bar" key={it.id} data-done={i < index || undefined}>
            {i === index && (
              <i
                key={`${index}-${count}`}
                className="xc-story-fill"
                style={{ animationDuration: `${STORY_MS}ms` }}
                onAnimationEnd={() => step(1)}
              />
            )}
          </span>
        ))}
      </div>

      <button
        type="button"
        className="xc-story-zone xc-story-zone--prev"
        aria-label={t("landingNewsPrev")}
        onPointerDown={onZoneDown}
        onPointerUp={onZoneUp}
        onPointerCancel={onZoneUp}
        onClick={() => onZoneClick(-1)}
      />
      <button
        type="button"
        className="xc-story-zone xc-story-zone--next"
        aria-label={t("landingNewsNext")}
        onPointerDown={onZoneDown}
        onPointerUp={onZoneUp}
        onPointerCancel={onZoneUp}
        onClick={() => onZoneClick(1)}
      />

      <a className="xc-story-text" href={item.url} target="_blank" rel="noopener noreferrer" aria-live="polite">
        <span className="xc-story-title" key={item.id}>
          {item.title}
        </span>
        <small>
          {t("newsSource")} · <time dateTime={item.date}>{formatDate(item.date, dateLocale)}</time>
          <span className="xc-story-count" aria-hidden="true">
            {index + 1}/{count}
          </span>
        </small>
      </a>
    </div>
  );
}
