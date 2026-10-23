import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type FormEvent,
  type KeyboardEvent as ReactKeyboardEvent,
  type ReactNode,
  type RefObject,
} from "react";
import { flushSync } from "react-dom";
import { ftesChatEndpoint } from "./constitutionChatApi";
import { useI18n, type MessageKey } from "./i18n";
import { Logo } from "./Logo";
import focusEducation from "../assets/focus_education.jpg";
import focusEmerging from "../assets/focus_emerging.jpg";
import focusEmployment from "../assets/focus_employment.jpg";
import "./fonts/inter.css";
import "./FtesPage.css";

type FtesSource = { n: number; title: string; url: string | null };
type FtesMsg = { role: "user" | "assistant"; content: string; sources?: FtesSource[] };
type FtesNavTarget = "home" | "education" | "apply";

const EXAMPLES: { questionKey: MessageKey; photo: string; altKey: MessageKey }[] = [
  { questionKey: "ftesExample1", photo: focusEducation, altKey: "ftesPhotoGraduates" },
  { questionKey: "ftesExample2", photo: focusEmerging, altKey: "ftesPhotoTech" },
  { questionKey: "ftesExample3", photo: focusEmployment, altKey: "ftesPhotoWork" },
  { questionKey: "ftesExample4", photo: focusEducation, altKey: "ftesPhotoGraduates" },
  { questionKey: "ftesExample5", photo: focusEmerging, altKey: "ftesPhotoTech" },
  { questionKey: "ftesExample6", photo: focusEmployment, altKey: "ftesPhotoWork" },
];
const EXAMPLE_INTERVAL_MS = 4200;

function prefersReducedMotion() {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

const CHAT_STORE_KEY = "ftes_chat";

function inChatHistoryEntry(): boolean {
  return Boolean((window.history.state as { ftesChat?: boolean } | null)?.ftesChat);
}

/** The chat survives in-app navigation (Back returns to it) but only for this tab. */
function loadStoredChat(): FtesMsg[] {
  if (!inChatHistoryEntry()) return [];
  try {
    const raw = sessionStorage.getItem(CHAT_STORE_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? (parsed as FtesMsg[]) : [];
  } catch {
    return [];
  }
}

function storeChat(messages: FtesMsg[]) {
  try {
    if (messages.length) sessionStorage.setItem(CHAT_STORE_KEY, JSON.stringify(messages));
    else sessionStorage.removeItem(CHAT_STORE_KEY);
  } catch {
    /* storage unavailable: the chat just won't survive navigation */
  }
}

/**
 * Runs a state change inside a view transition (so the ask bar morphs) when supported.
 * Resolves once the change is applied — the transition calls `update` a frame later.
 */
function withViewTransition(update: () => void): Promise<void> {
  if (prefersReducedMotion() || !("startViewTransition" in document)) {
    update();
    return Promise.resolve();
  }
  return document.startViewTransition(() => flushSync(update)).updateCallbackDone;
}

/* ── Icons ─────────────────────────────────────────────────────────── */

function ArrowRightIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden>
      <path
        fill="none"
        stroke="currentColor"
        strokeWidth="2.25"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M5 12h14m-6-6 6 6-6 6"
      />
    </svg>
  );
}

function ChevronIcon({ dir }: { dir: "left" | "right" }) {
  return (
    <svg className="ftes-icon" viewBox="0 0 24 24" aria-hidden>
      <path
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        d={dir === "left" ? "m14.5 6-6 6 6 6" : "m9.5 6 6 6-6 6"}
      />
    </svg>
  );
}

function PlayPauseIcon({ playing }: { playing: boolean }) {
  return (
    <span className="ftes-iconswap" data-state={playing ? "a" : "b"} aria-hidden>
      <svg className="ftes-icon ftes-iconswap-a" viewBox="0 0 24 24">
        <path fill="currentColor" d="M8 5.5h2.6v13H8zm5.4 0H16v13h-2.6z" />
      </svg>
      <svg className="ftes-icon ftes-iconswap-b" viewBox="0 0 24 24">
        <path fill="currentColor" d="M8 5.2v13.6a.6.6 0 0 0 .9.5l10.4-6.8a.6.6 0 0 0 0-1L8.9 4.7a.6.6 0 0 0-.9.5z" />
      </svg>
    </span>
  );
}

function GlobeIcon() {
  return (
    <svg className="ftes-icon ftes-icon--sm" viewBox="0 0 24 24" aria-hidden>
      <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <path
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        d="M3 12h18M12 3c2.5 2.8 2.5 14.2 0 18M12 3c-2.5 2.8-2.5 14.2 0 18"
      />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg className="ftes-icon ftes-icon--sm" viewBox="0 0 24 24" aria-hidden>
      <path fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" d="M12 5v14M5 12h14" />
    </svg>
  );
}

function InfoIcon() {
  return (
    <svg className="ftes-icon ftes-icon--sm" viewBox="0 0 24 24" aria-hidden>
      <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="1.6" />
      <path fill="currentColor" d="M11.1 10.5h1.8V17h-1.8zM12 6.8a1.1 1.1 0 1 1 0 2.2 1.1 1.1 0 0 1 0-2.2z" />
    </svg>
  );
}

function CapIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden>
      <path fill="currentColor" d="M12 3.5 1.5 8.75 12 14l8.5-4.25V16h2V8.75L12 3.5z" />
      <path fill="currentColor" d="M5.5 12.6v3.9c0 1.7 2.9 3.5 6.5 3.5s6.5-1.8 6.5-3.5v-3.9L12 15.85 5.5 12.6z" />
    </svg>
  );
}

function BookIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden>
      <path
        fill="currentColor"
        d="M4 4.5A1.5 1.5 0 0 1 5.5 3H11v16.5H5.5A1.5 1.5 0 0 0 4 21V4.5zm9-1.5h5.5A1.5 1.5 0 0 1 20 4.5V21a1.5 1.5 0 0 0-1.5-1.5H13V3z"
      />
    </svg>
  );
}

function DocIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden>
      <path
        fill="currentColor"
        d="M6 2.5h8l4.5 4.5v13A1.5 1.5 0 0 1 17 21.5H6A1.5 1.5 0 0 1 4.5 20V4A1.5 1.5 0 0 1 6 2.5zm7.5 1.2V8h4.3L13.5 3.7zM7.5 11v1.5h9V11h-9zm0 3.5V16h9v-1.5h-9zm0 3.5v1.5h6V18h-6z"
      />
    </svg>
  );
}

function LockIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden>
      <path
        fill="currentColor"
        d="M7.5 10V7.5a4.5 4.5 0 0 1 9 0V10H18a1.5 1.5 0 0 1 1.5 1.5v8A1.5 1.5 0 0 1 18 21H6a1.5 1.5 0 0 1-1.5-1.5v-8A1.5 1.5 0 0 1 6 10h1.5zm2 0h5V7.5a2.5 2.5 0 0 0-5 0V10zm2.5 3.5a1.5 1.5 0 0 0-.75 2.8V18h1.5v-1.7A1.5 1.5 0 0 0 12 13.5z"
      />
    </svg>
  );
}

function CopyCheckIcon({ copied }: { copied: boolean }) {
  return (
    <span className="ftes-iconswap" data-state={copied ? "b" : "a"} aria-hidden>
      <svg className="ftes-icon ftes-icon--sm ftes-iconswap-a" viewBox="0 0 24 24">
        <rect x="8.5" y="8.5" width="11" height="11" rx="2.5" fill="none" stroke="currentColor" strokeWidth="1.8" />
        <path fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" d="M15.5 5.5V5A1.5 1.5 0 0 0 14 3.5H6A1.5 1.5 0 0 0 4.5 5v8A1.5 1.5 0 0 0 6 14.5h.5" />
      </svg>
      <svg className="ftes-icon ftes-icon--sm ftes-iconswap-b" viewBox="0 0 24 24">
        <path fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="m5 12.5 4.5 4.5L19 7.5" />
      </svg>
    </span>
  );
}

/* ── Ask bar (hero + dock share one draft) ─────────────────────────── */

function AskBar({
  id,
  variant,
  value,
  onChange,
  onSubmit,
  placeholder,
  placeholderKey,
  label,
  sendLabel,
  canSendEmpty,
  disabled,
  inputRef,
  hidden,
}: {
  id: string;
  variant: "hero" | "dock";
  value: string;
  onChange: (next: string) => void;
  onSubmit: () => void;
  placeholder: string;
  /** Changes whenever the placeholder text swaps, to replay its entrance. */
  placeholderKey?: string | number;
  label: string;
  sendLabel: string;
  canSendEmpty?: boolean;
  disabled?: boolean;
  inputRef?: RefObject<HTMLTextAreaElement | null>;
  hidden?: boolean;
}) {
  const localRef = useRef<HTMLTextAreaElement>(null);
  const ref = inputRef ?? localRef;

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 180)}px`;
  }, [value, ref]);

  const canSend = !disabled && (value.trim().length > 0 || Boolean(canSendEmpty));

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (canSend) onSubmit();
  }

  function handleKeyDown(e: ReactKeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      if (canSend) onSubmit();
    }
  }

  return (
    <form
      className={`ftes-ask ftes-ask--${variant}`}
      onSubmit={handleSubmit}
      aria-hidden={hidden || undefined}
      inert={hidden || undefined}
    >
      <label className="visually-hidden" htmlFor={id}>
        {label}
      </label>
      <div className="ftes-ask-field">
        <textarea
          id={id}
          ref={ref}
          rows={1}
          className="ftes-ask-input"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          autoComplete="off"
          enterKeyHint="send"
          maxLength={4000}
        />
        {value ? null : (
          <span key={placeholderKey} className="ftes-ask-placeholder" aria-hidden>
            {placeholder}
          </span>
        )}
      </div>
      <button type="submit" className="ftes-ask-send" disabled={!canSend} aria-label={sendLabel}>
        <ArrowRightIcon className="ftes-icon" />
      </button>
    </form>
  );
}

/* ── Answer rendering (tiny, safe markdown subset) ─────────────────── */

function renderInline(text: string, sources: FtesSource[] | undefined): ReactNode[] {
  return text.split(/(\*\*[^*]+\*\*|\[\d+\])/g).map((part, i) => {
    if (!part) return null;
    const bold = /^\*\*([^*]+)\*\*$/.exec(part);
    if (bold) return <strong key={i}>{bold[1]}</strong>;
    const cite = /^\[(\d+)\]$/.exec(part);
    if (cite) {
      const n = Number(cite[1]);
      const src = sources?.find((s) => s.n === n);
      if (!src) return <sup key={i} className="ftes-cite">{n}</sup>;
      return src.url ? (
        <a key={i} className="ftes-cite" href={src.url} target="_blank" rel="noopener noreferrer" title={src.title}>
          {n}
        </a>
      ) : (
        <sup key={i} className="ftes-cite" title={src.title}>
          {n}
        </sup>
      );
    }
    return part;
  });
}

const BULLET = /^\s*(?:[-*•]|\d+[.)])\s+/;
const HEADING = /^#{1,4}\s+(.*)$/;

type AnswerBlock =
  | { kind: "p"; lines: string[] }
  | { kind: "h"; text: string }
  | { kind: "list"; ordered: boolean; items: string[] };

/** Groups lines into paragraphs, headings and lists (a list may directly follow a paragraph line). */
function parseAnswer(content: string): AnswerBlock[] {
  const blocks: AnswerBlock[] = [];
  let current: AnswerBlock | null = null;
  for (const raw of content.trim().split("\n")) {
    const line = raw.trimEnd();
    if (!line.trim()) {
      current = null;
      continue;
    }
    const heading = HEADING.exec(line);
    if (heading) {
      blocks.push({ kind: "h", text: heading[1] });
      current = null;
    } else if (BULLET.test(line)) {
      const ordered = /^\s*\d/.test(line);
      if (current?.kind !== "list" || current.ordered !== ordered) {
        current = { kind: "list", ordered, items: [] };
        blocks.push(current);
      }
      current.items.push(line.replace(BULLET, ""));
    } else if (current?.kind === "p") {
      current.lines.push(line);
    } else {
      current = { kind: "p", lines: [line] };
      blocks.push(current);
    }
  }
  return blocks;
}

function AnswerBody({ content, sources }: { content: string; sources?: FtesSource[] }) {
  return (
    <>
      {parseAnswer(content).map((block, bi) => {
        if (block.kind === "h") return <h3 key={bi}>{renderInline(block.text, sources)}</h3>;
        if (block.kind === "list") {
          const items = block.items.map((item, li) => <li key={li}>{renderInline(item, sources)}</li>);
          return block.ordered ? <ol key={bi}>{items}</ol> : <ul key={bi}>{items}</ul>;
        }
        return (
          <p key={bi}>
            {block.lines.map((l, li) => (
              <span key={li}>
                {li > 0 ? <br /> : null}
                {renderInline(l, sources)}
              </span>
            ))}
          </p>
        );
      })}
    </>
  );
}

function hostOf(url: string | null) {
  if (!url) return null;
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return null;
  }
}

function AssistantMessage({ msg }: { msg: FtesMsg }) {
  const { t } = useI18n();
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const id = window.setTimeout(() => setCopied(false), 1600);
    return () => window.clearTimeout(id);
  }, [copied]);

  async function copy() {
    try {
      await navigator.clipboard.writeText(msg.content);
      setCopied(true);
    } catch {
      /* clipboard blocked — nothing to do */
    }
  }

  return (
    <article className="ftes-msg ftes-msg--assistant" aria-label={t("ftesAssistant")}>
      <div className="ftes-answer">
        <AnswerBody content={msg.content} sources={msg.sources} />
      </div>

      {msg.sources?.length ? (
        <section className="ftes-sources" aria-label={t("ftesSources")}>
          <h3 className="ftes-sources-title">{t("ftesSources")}</h3>
          <ol className="ftes-sources-list">
            {msg.sources.map((s) => {
              const inner = (
                <>
                  <span className="ftes-source-n">{s.n}</span>
                  <span className="ftes-source-text">
                    <span className="ftes-source-title">{s.title}</span>
                    {hostOf(s.url) ? <span className="ftes-source-host">{hostOf(s.url)}</span> : null}
                  </span>
                </>
              );
              return (
                <li key={s.n}>
                  {s.url ? (
                    <a className="ftes-source" href={s.url} target="_blank" rel="noopener noreferrer">
                      {inner}
                    </a>
                  ) : (
                    <span className="ftes-source">{inner}</span>
                  )}
                </li>
              );
            })}
          </ol>
        </section>
      ) : null}

      <div className="ftes-msg-actions">
        <button type="button" className="ftes-chip-btn" onClick={copy} aria-live="polite">
          <CopyCheckIcon copied={copied} />
          <span>{copied ? t("ftesCopied") : t("ftesCopy")}</span>
        </button>
      </div>
    </article>
  );
}

/* ── Manifesto: words sharpen as the section scrolls into view ─────── */

function Manifesto() {
  const { t } = useI18n();
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (prefersReducedMotion()) {
      el.style.setProperty("--p", "1");
      return;
    }
    let frame = 0;
    const update = () => {
      frame = 0;
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight;
      // 0 when the top enters the bottom of the viewport, 1 once the section's middle passes 40% height.
      const p = (vh - rect.top) / (vh * 0.6 + rect.height * 0.5);
      el.style.setProperty("--p", String(Math.max(0, Math.min(1, p))));
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  const text = t("ftesManifesto");
  const tokens = text.split(/\s+/);
  const plain = text.replace(/\{\{\w+\}\}\s*/g, "");

  return (
    <section ref={ref} className="ftes-manifesto" style={{ "--n": tokens.length } as CSSProperties}>
      <p className="visually-hidden">{plain}</p>
      <p className="ftes-manifesto-text" aria-hidden>
        {tokens.map((tok, i) => {
          const style = { "--i": i } as CSSProperties;
          if (tok === "{{arrow}}") {
            return (
              <span key={i} className="ftes-mword ftes-mbadge ftes-mbadge--arrow" style={style}>
                <ArrowRightIcon className="ftes-mbadge-icon" />
              </span>
            );
          }
          if (tok === "{{cap}}") {
            return (
              <span key={i} className="ftes-mword ftes-mstack" style={style}>
                <span className="ftes-mseal">
                  <BookIcon className="ftes-mseal-icon" />
                </span>
                <span className="ftes-mseal">
                  <DocIcon className="ftes-mseal-icon" />
                </span>
                <span className="ftes-mseal">
                  <CapIcon className="ftes-mseal-icon" />
                </span>
              </span>
            );
          }
          return (
            <span key={i} className="ftes-mword" style={style}>
              {tok}
            </span>
          );
        })}
      </p>
    </section>
  );
}

/* ── Feature visuals (decorative) ──────────────────────────────────── */

function VisualDocs() {
  const docs = [
    { label: "MEITD · FTES", x: "8%", y: "10%", r: "-6deg" },
    { label: "MEITD · FAQ", x: "48%", y: "8%", r: "4deg" },
    { label: "Swinburne", x: "20%", y: "40%", r: "3deg" },
    { label: "Curtin", x: "50%", y: "40%", r: "-4deg" },
    { label: "i-CATS", x: "6%", y: "70%", r: "5deg" },
    { label: "UKAS", x: "44%", y: "74%", r: "-3deg" },
  ];
  return (
    <div className="ftes-visual ftes-visual--docs" aria-hidden>
      {docs.map((d, i) => (
        <div
          key={d.label}
          className="ftes-doc"
          style={{ "--x": d.x, "--y": d.y, "--r": d.r, "--d": `${i * -1.3}s` } as CSSProperties}
        >
          <span className="ftes-doc-label">{d.label}</span>
          <span className="ftes-doc-line" />
          <span className="ftes-doc-line ftes-doc-line--short" />
          <span className="ftes-doc-line" />
        </div>
      ))}
    </div>
  );
}

function VisualPrivacy() {
  return (
    <div className="ftes-visual ftes-visual--privacy" aria-hidden>
      <span className="ftes-lock">
        <LockIcon className="ftes-lock-icon" />
      </span>
    </div>
  );
}

function VisualSources() {
  return (
    <div className="ftes-visual ftes-visual--sources" aria-hidden>
      <div className="ftes-mock">
        <span className="ftes-mock-bubble" />
        <span className="ftes-mock-line" />
        <span className="ftes-mock-line">
          <span className="ftes-mock-cite">1</span>
        </span>
        <span className="ftes-mock-line ftes-mock-line--short">
          <span className="ftes-mock-cite">2</span>
        </span>
        <div className="ftes-mock-sources">
          <span className="ftes-mock-source">
            <span className="ftes-mock-n">1</span>
            <DocIcon className="ftes-mock-doc" />
          </span>
          <span className="ftes-mock-source">
            <span className="ftes-mock-n">2</span>
            <DocIcon className="ftes-mock-doc" />
          </span>
        </div>
      </div>
    </div>
  );
}

function VisualDevices() {
  return (
    <div className="ftes-visual ftes-visual--devices" aria-hidden>
      <div className="ftes-devices">
        <span className="ftes-device ftes-device--phone" />
        <span className="ftes-device ftes-device--tablet" />
        <span className="ftes-device ftes-device--laptop" />
      </div>
    </div>
  );
}

/* ── Page ──────────────────────────────────────────────────────────── */

export function FtesPage({
  onOpenMenu,
  onNavigate,
}: {
  onOpenMenu: () => void;
  onNavigate: (target: FtesNavTarget) => void;
}) {
  const { t, language, setLanguage } = useI18n();
  const endpoint = ftesChatEndpoint();

  const [draft, setDraft] = useState("");
  const [messages, setMessages] = useState<FtesMsg[]>(loadStoredChat);
  const [loading, setLoading] = useState(false);
  // A restored chat whose last question never got an answer offers a retry.
  const [error, setError] = useState<string | null>(() =>
    messages.at(-1)?.role === "user" ? t("ftesErrorGeneric") : null
  );
  const [bannerOpen, setBannerOpen] = useState(false);
  const [exampleIndex, setExampleIndex] = useState(0);
  const [playing, setPlaying] = useState(() => !prefersReducedMotion());
  const [heroAskVisible, setHeroAskVisible] = useState(true);

  const heroAskWrapRef = useRef<HTMLDivElement>(null);
  const heroInputRef = useRef<HTMLTextAreaElement>(null);
  const dockInputRef = useRef<HTMLTextAreaElement>(null);
  const lastUserRef = useRef<HTMLDivElement>(null);
  const requestRef = useRef<AbortController | null>(null);

  const inChat = messages.length > 0;
  const example = EXAMPLES[exampleIndex];
  const exampleQuestion = t(example.questionKey);

  // Cycle example questions while on the landing view.
  useEffect(() => {
    if (!playing || inChat) return;
    const id = window.setInterval(() => {
      setExampleIndex((i) => (i + 1) % EXAMPLES.length);
    }, EXAMPLE_INTERVAL_MS);
    return () => window.clearInterval(id);
  }, [playing, inChat]);

  // The dock appears once the hero ask bar scrolls out of view.
  useEffect(() => {
    const el = heroAskWrapRef.current;
    if (!el || inChat) return;
    const io = new IntersectionObserver(([entry]) => setHeroAskVisible(entry.isIntersecting), {
      threshold: 0,
    });
    io.observe(el);
    return () => io.disconnect();
  }, [inChat]);

  useEffect(() => () => requestRef.current?.abort(), []);

  // Bring the newest question to the top of the viewport, like a fresh page.
  const userCount = messages.filter((m) => m.role === "user").length;
  useEffect(() => {
    if (userCount === 0) return;
    if (userCount === 1) {
      window.scrollTo({ top: 0 });
      return;
    }
    lastUserRef.current?.scrollIntoView({
      behavior: prefersReducedMotion() ? "auto" : "smooth",
      block: "start",
    });
  }, [userCount]);

  const send = useCallback(
    async (history: FtesMsg[]) => {
      setError(null);
      if (!endpoint) {
        setLoading(false);
        setError(t("ftesUnavailable"));
        return;
      }
      setLoading(true);
      requestRef.current?.abort();
      const controller = new AbortController();
      requestRef.current = controller;
      try {
        const res = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: history.map((m) => ({ role: m.role, content: m.content })),
          }),
          signal: controller.signal,
        });
        let data: { reply?: string; sources?: FtesSource[]; error?: string } = {};
        try {
          data = await res.json();
        } catch {
          /* ignore */
        }
        if (!res.ok) throw new Error(data.error || res.statusText);
        const reply = typeof data.reply === "string" ? data.reply.trim() : "";
        if (!reply) throw new Error("empty");
        setMessages([
          ...history,
          { role: "assistant", content: reply, sources: Array.isArray(data.sources) ? data.sources : [] },
        ]);
      } catch (err) {
        if (controller.signal.aborted) return;
        console.error(err);
        setError(t("ftesErrorGeneric"));
      } finally {
        if (requestRef.current === controller) {
          requestRef.current = null;
          setLoading(false);
        }
      }
    },
    [endpoint, t]
  );

  const ask = useCallback(
    (question: string) => {
      const q = question.trim();
      if (!q || loading) return;
      const history: FtesMsg[] = [...messages, { role: "user", content: q }];
      const enter = () => {
        setDraft("");
        setMessages(history);
      };
      if (messages.length === 0) {
        window.history.pushState({ ftesChat: true }, "", window.location.href);
        setLoading(true); // blocks a second submit while the transition runs
        // Send only after the question is on screen, or a fast reply could be overwritten.
        void withViewTransition(enter).then(() => send(history));
      } else {
        enter();
        void send(history);
      }
      window.setTimeout(() => dockInputRef.current?.focus({ preventScroll: true }), 0);
    },
    [loading, messages, send]
  );

  const retry = useCallback(() => {
    if (loading || messages.length === 0) return;
    void send(messages);
  }, [loading, messages, send]);

  const resetToLanding = useCallback(() => {
    requestRef.current?.abort();
    requestRef.current = null;
    void withViewTransition(() => {
      setMessages([]);
      setLoading(false);
      setError(null);
      setDraft("");
      setHeroAskVisible(true);
    });
    window.scrollTo({ top: 0 });
  }, []);

  useEffect(() => {
    storeChat(messages);
  }, [messages]);

  // Back from a chat returns to the landing view. A chat entry whose messages are
  // gone (storage cleared) is just the landing page, so drop its marker.
  useEffect(() => {
    if (inChatHistoryEntry() && loadStoredChat().length === 0) {
      window.history.replaceState(null, "", window.location.href);
    }
    const onPop = (event: PopStateEvent) => {
      if (!(event.state as { ftesChat?: boolean } | null)?.ftesChat) resetToLanding();
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, [resetToLanding]);

  /** "Tanya FTES" / New chat: leave the chat the same way Back does. */
  const newChat = useCallback(() => {
    if (inChatHistoryEntry()) window.history.back();
    else resetToLanding();
  }, [resetToLanding]);

  const goLanding = useCallback(() => {
    if (messages.length > 0) newChat();
    else window.scrollTo({ top: 0, behavior: prefersReducedMotion() ? "auto" : "smooth" });
  }, [messages.length, newChat]);

  const focusAsk = useCallback(() => {
    const target = inChat || !heroAskVisible ? dockInputRef.current : heroInputRef.current;
    target?.focus();
  }, [inChat, heroAskVisible]);

  const stepExample = (delta: number) => {
    setExampleIndex((i) => (i + delta + EXAMPLES.length) % EXAMPLES.length);
  };

  const lastUserIndex = messages.map((m) => m.role).lastIndexOf("user");
  const showDock = inChat || !heroAskVisible;

  return (
    <div className={`ftes${inChat ? " ftes--chat" : ""}`}>
      {/* Official-status banner, like America.gov's top line */}
      <div className="ftes-banner">
        <button
          type="button"
          className="ftes-banner-toggle"
          aria-expanded={bannerOpen}
          aria-controls="ftes-banner-detail"
          onClick={() => setBannerOpen((o) => !o)}
        >
          <span>{t("ftesBanner")}</span>
          <InfoIcon />
          <span className="visually-hidden">{t("ftesBannerToggleAria")}</span>
        </button>
        <div id="ftes-banner-detail" className="ftes-banner-detail" data-open={bannerOpen}>
          <div className="ftes-banner-detail-inner">
            <p>{t("ftesBannerDetail")}</p>
          </div>
        </div>
      </div>

      <div className="ftes-hero">
        <header className="ftes-topbar">
          <nav className="ftes-crumbs" aria-label={t("ftesCrumbsAria")}>
            <button
              type="button"
              className="ftes-brand"
              onClick={() => onNavigate("home")}
              aria-label={t("ftesFooterHome")}
              translate="no"
            >
              <Logo className="ftes-brand-logo" decorative />
              <span className="ftes-brand-text">Belia PBB</span>
            </button>
            <span className="ftes-crumb-sep" aria-hidden>
              /
            </span>
            <button
              type="button"
              className="ftes-crumb"
              onClick={goLanding}
              aria-current={inChat ? undefined : "page"}
            >
              {t("ftesNav")}
            </button>
          </nav>
          <div className="ftes-topbar-actions">
            {inChat ? (
              <button
                type="button"
                className="ftes-btn ftes-btn--ghost ftes-btn--icon-sm"
                onClick={newChat}
                aria-label={t("ftesNewChat")}
              >
                <PlusIcon />
                <span className="ftes-btn-label">{t("ftesNewChat")}</span>
              </button>
            ) : null}
            <button type="button" className="ftes-btn ftes-btn--primary" onClick={onOpenMenu}>
              {t("ftesMenu")}
            </button>
          </div>
        </header>

        {inChat ? null : (
          <>
            <div className="ftes-hero-copy">
              <h1 className="ftes-hero-title">{t("ftesHeroTitle")}</h1>
              <p className="ftes-hero-sub">{t("ftesHeroSub")}</p>
            </div>

            <div className="ftes-stage">
              <div ref={heroAskWrapRef} className="ftes-stage-ask">
                <AskBar
                  id="ftes-hero-input"
                  variant="hero"
                  value={draft}
                  onChange={setDraft}
                  onSubmit={() => ask(draft || exampleQuestion)}
                  placeholder={t("ftesTry").replace("{{q}}", exampleQuestion)}
                  placeholderKey={exampleIndex}
                  label={`${t("ftesInputLabel")}. ${t("ftesExampleCount")
                    .replace("{{n}}", String(exampleIndex + 1))
                    .replace("{{total}}", String(EXAMPLES.length))}: ${exampleQuestion}`}
                  sendLabel={t("ftesSend")}
                  canSendEmpty
                  inputRef={heroInputRef}
                />
              </div>

              <div className="ftes-photo">
                {EXAMPLES.map((ex, i) => (
                  <img
                    key={i}
                    className="ftes-photo-img"
                    src={ex.photo}
                    alt={i === exampleIndex ? t(ex.altKey) : ""}
                    aria-hidden={i === exampleIndex ? undefined : true}
                    data-active={i === exampleIndex}
                    loading={i === 0 ? "eager" : "lazy"}
                    decoding="async"
                  />
                ))}
                <div className="ftes-photo-controls">
                  <button type="button" className="ftes-round-btn" onClick={() => stepExample(-1)} aria-label={t("ftesExamplePrev")}>
                    <ChevronIcon dir="left" />
                  </button>
                  <button
                    type="button"
                    className="ftes-round-btn"
                    onClick={() => setPlaying((p) => !p)}
                    aria-label={playing ? t("ftesExamplePause") : t("ftesExamplePlay")}
                    aria-pressed={playing}
                  >
                    <PlayPauseIcon playing={playing} />
                  </button>
                  <button type="button" className="ftes-round-btn" onClick={() => stepExample(1)} aria-label={t("ftesExampleNext")}>
                    <ChevronIcon dir="right" />
                  </button>
                </div>
              </div>
            </div>

            <button type="button" className="ftes-pill" onClick={() => ask(t("ftesPillQuestion"))}>
              <span className="ftes-pill-tag">{t("ftesPillTag")}</span>
              <span>{t("ftesPill")}</span>
              <ChevronIcon dir="right" />
            </button>
          </>
        )}
      </div>

      {inChat ? (
        <main className="ftes-thread" aria-live="polite" aria-busy={loading}>
          {messages.map((m, i) =>
            m.role === "user" ? (
              <div
                key={i}
                ref={i === lastUserIndex ? lastUserRef : undefined}
                className="ftes-msg ftes-msg--user"
              >
                <span className="visually-hidden">{t("ftesYou")}: </span>
                <p className="ftes-user-bubble">{m.content}</p>
              </div>
            ) : (
              <AssistantMessage key={i} msg={m} />
            )
          )}
          {loading ? (
            <p className="ftes-thinking" role="status">
              <span className="ftes-thinking-dot" aria-hidden />
              <span className="ftes-shimmer">{t("ftesThinking")}</span>
            </p>
          ) : null}
          {error ? (
            <div className="ftes-error" role="alert">
              <p>{error}</p>
              {endpoint ? (
                <button type="button" className="ftes-chip-btn" onClick={retry}>
                  {t("ftesRetry")}
                </button>
              ) : null}
            </div>
          ) : null}
          <div className="ftes-thread-spacer" />
        </main>
      ) : (
        <main>
          <Manifesto />

          <div className="ftes-features">
            <section className="ftes-feature">
              <VisualDocs />
              <div className="ftes-feature-copy">
                <h2 className="ftes-feature-title">{t("ftesFeature1Title")}</h2>
                <p className="ftes-feature-body">{t("ftesFeature1Body")}</p>
                <button type="button" className="ftes-feature-link" onClick={focusAsk}>
                  {t("ftesAskLink")}
                  <ArrowRightIcon className="ftes-icon ftes-icon--sm" />
                </button>
              </div>
            </section>
            <section className="ftes-feature">
              <VisualPrivacy />
              <div className="ftes-feature-copy">
                <h2 className="ftes-feature-title">{t("ftesFeature2Title")}</h2>
                <p className="ftes-feature-body">{t("ftesFeature2Body")}</p>
              </div>
            </section>
            <section className="ftes-feature">
              <VisualSources />
              <div className="ftes-feature-copy">
                <h2 className="ftes-feature-title">{t("ftesFeature3Title")}</h2>
                <p className="ftes-feature-body">{t("ftesFeature3Body")}</p>
              </div>
            </section>
            <section className="ftes-feature">
              <VisualDevices />
              <div className="ftes-feature-copy">
                <h2 className="ftes-feature-title">{t("ftesFeature4Title")}</h2>
                <p className="ftes-feature-body">{t("ftesFeature4Body")}</p>
                <button type="button" className="ftes-feature-link" onClick={focusAsk}>
                  {t("ftesAskLink")}
                  <ArrowRightIcon className="ftes-icon ftes-icon--sm" />
                </button>
              </div>
            </section>
          </div>

          <footer className="ftes-footer">
            <nav className="ftes-footer-nav" aria-label={t("footerNavAria")}>
              <button type="button" onClick={() => onNavigate("home")}>
                {t("ftesFooterHome")}
              </button>
              <button type="button" onClick={() => onNavigate("education")}>
                {t("ftesFooterEducation")}
              </button>
              <button type="button" onClick={() => onNavigate("apply")}>
                {t("ftesFooterJoin")}
              </button>
              <button type="button" onClick={focusAsk}>
                {t("ftesFooterAsk")}
              </button>
            </nav>
            <button
              type="button"
              className="ftes-lang"
              onClick={() => setLanguage(language === "ms" ? "en" : "ms")}
              aria-label={t("languageToggleAria")}
            >
              <GlobeIcon />
              <span>{language === "ms" ? t("footerLanguageNameMs") : t("footerLanguageNameEn")}</span>
            </button>
            <p className="ftes-wordmark" aria-hidden translate="no">
              Belia PBB
            </p>
          </footer>
        </main>
      )}

      <div className="ftes-dock" data-visible={showDock}>
        <AskBar
          id="ftes-dock-input"
          variant="dock"
          value={draft}
          onChange={setDraft}
          onSubmit={() => ask(draft)}
          placeholder={inChat ? t("ftesFollowUpPlaceholder") : t("ftesAskPlaceholder")}
          label={inChat ? t("ftesFollowUpPlaceholder") : t("ftesAskPlaceholder")}
          sendLabel={t("ftesSend")}
          disabled={loading}
          inputRef={dockInputRef}
          hidden={!showDock}
        />
        {inChat ? <p className="ftes-dock-note">{t("ftesDisclaimer")}</p> : null}
      </div>
    </div>
  );
}
