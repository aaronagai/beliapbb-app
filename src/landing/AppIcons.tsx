/**
 * Belia PBB app-icon set — full-bleed squircles with one glyph each, drawn for this
 * site (no third-party marks). Glyphs live in a 100×100 viewBox so they size from CSS.
 */
import type { ReactNode } from "react";
import { Logo } from "../Logo";

export type AppIconKind =
  | "chat"
  | "news"
  | "cap"
  | "book"
  | "hornbill"
  | "hibiscus"
  | "pin"
  | "megaphone"
  | "calendar"
  | "card"
  | "briefcase"
  | "rocket"
  | "people"
  | "lang"
  | "logo";

const INK = "#141414";

const ICONS: Record<Exclude<AppIconKind, "logo">, { bg: string; glyph: ReactNode }> = {
  chat: {
    bg: "#0a84ff",
    glyph: (
      <>
        <path d="M30 26h40c8.3 0 15 6.7 15 15v14c0 8.3-6.7 15-15 15H50L36.4 80.6c-1.3 1-3.4.1-3.4-1.6V70h-3c-8.3 0-15-6.7-15-15V41c0-8.3 6.7-15 15-15Z" fill="#fff" />
        <circle cx="36" cy="48" r="5" fill="#0a84ff" />
        <circle cx="50" cy="48" r="5" fill="#0a84ff" />
        <circle cx="64" cy="48" r="5" fill="#0a84ff" />
      </>
    ),
  },
  news: {
    bg: "#ff453a",
    glyph: (
      <>
        <rect x="22" y="24" width="56" height="52" rx="8" fill="#fff" />
        <rect x="30" y="32" width="18" height="17" rx="3" fill="#ff453a" />
        <rect x="53" y="33" width="17" height="5" rx="2.5" fill="#ff453a" opacity="0.5" />
        <rect x="53" y="43" width="12" height="5" rx="2.5" fill="#ff453a" opacity="0.5" />
        <rect x="30" y="56" width="40" height="5" rx="2.5" fill="#ff453a" opacity="0.5" />
        <rect x="30" y="65" width="28" height="5" rx="2.5" fill="#ff453a" opacity="0.5" />
      </>
    ),
  },
  cap: {
    bg: "#5e5ce6",
    glyph: (
      <>
        <path d="M30 50v13c0 6 9 11 20 11s20-5 20-11V50L50 59Z" fill="#fff" opacity="0.8" />
        <path d="M50 25 87 41 50 57 13 41Z" fill="#fff" />
        <path d="M78 45v17" stroke="#fff" strokeWidth="4" strokeLinecap="round" />
        <circle cx="78" cy="65" r="4.5" fill="#fff" />
      </>
    ),
  },
  book: {
    bg: "#ff9f0a",
    glyph: (
      <>
        <rect x="27" y="20" width="46" height="60" rx="8" fill="#fff" />
        <path d="M27 66h46v6a8 8 0 0 1-8 8H35a8 8 0 0 1-8-8Z" fill="#ffe0ad" />
        <path d="M56 20v20l6-5 6 5V20Z" fill="#ff9f0a" />
      </>
    ),
  },
  hornbill: {
    bg: "#fff1d6",
    glyph: (
      <g transform="translate(9 8) scale(0.82)">
        <path d="M22 62 8 80c-2 3 1 6 4 4l18-12Z" fill="#2a2a31" />
        <ellipse cx="42" cy="60" rx="28" ry="24" fill={INK} />
        <ellipse cx="38" cy="68" rx="15" ry="11" fill="#fff" />
        <circle cx="60" cy="38" r="17" fill={INK} />
        <path d="M70 26c8-8 22-4 26 8-8-4-16-4-22 0Z" fill="#ffc83d" />
        <path d="M72 34c10-2 22 6 26 18-10-6-18-6-26-8Z" fill="#ff8a1f" />
        <circle cx="63" cy="35" r="5.5" fill="#fff" />
        <circle cx="64.5" cy="35.5" r="2.8" fill={INK} />
      </g>
    ),
  },
  hibiscus: {
    bg: "#ffffff",
    glyph: (
      <g transform="translate(15 15) scale(0.7)">
        {[0, 72, 144, 216, 288].map((a) => (
          <g key={a} transform={`rotate(${a} 50 50)`}>
            <ellipse cx="50" cy="27" rx="18" ry="24" fill="#ff3d63" />
          </g>
        ))}
        <circle cx="50" cy="50" r="11" fill="#c8123c" />
        <path d="M50 50 66 30" stroke="#ffd23f" strokeWidth="4" strokeLinecap="round" />
        <circle cx="67" cy="29" r="4.5" fill="#ffd23f" />
      </g>
    ),
  },
  pin: {
    bg: "#34c759",
    glyph: (
      <>
        <path d="M50 84S26 59 26 41a24 24 0 0 1 48 0c0 18-24 43-24 43Z" fill="#fff" />
        <circle cx="50" cy="41" r="9" fill="#34c759" />
      </>
    ),
  },
  megaphone: {
    bg: "#ffd60a",
    glyph: (
      <g fill={INK}>
        <path d="M24 41h9l29-15v48L33 59h-9a5 5 0 0 1-5-5V46a5 5 0 0 1 5-5Z" />
        <rect x="31" y="58" width="10" height="18" rx="4" />
        <path d="M71 41q5 9 0 18M79 33q11 17 0 34" stroke={INK} strokeWidth="5" strokeLinecap="round" fill="none" />
      </g>
    ),
  },
  calendar: {
    bg: "#ffffff",
    glyph: (
      <>
        <text x="50" y="35" textAnchor="middle" fontSize="15" fontWeight="500" fill="#ff3b30" letterSpacing="1">SEP</text>
        <text x="50" y="76" textAnchor="middle" fontSize="44" fontWeight="400" fill={INK} letterSpacing="-2">16</text>
      </>
    ),
  },
  card: {
    bg: "#1c1c1e",
    glyph: (
      <>
        <rect x="18" y="29" width="64" height="44" rx="9" fill="#fff" />
        <circle cx="35" cy="48" r="7.5" fill="#1c1c1e" />
        <rect x="47" y="43" width="26" height="5" rx="2.5" fill="#1c1c1e" />
        <rect x="47" y="53" width="17" height="5" rx="2.5" fill="#1c1c1e" opacity="0.45" />
        <rect x="18" y="62" width="64" height="5" fill="#ffd60a" />
      </>
    ),
  },
  briefcase: {
    bg: "#a2845e",
    glyph: (
      <>
        <path d="M40 36v-5a6 6 0 0 1 6-6h8a6 6 0 0 1 6 6v5" stroke="#fff" strokeWidth="6" fill="none" />
        <rect x="19" y="36" width="62" height="40" rx="9" fill="#fff" />
        <rect x="19" y="52" width="62" height="4" fill="#a2845e" />
        <rect x="45" y="49" width="10" height="10" rx="3" fill="#fff" stroke="#a2845e" strokeWidth="3" />
      </>
    ),
  },
  rocket: {
    bg: "#ff375f",
    glyph: (
      <>
        <path d="M44 68h12l-6 15Z" fill="#ffd60a" />
        <path d="M38 52 28 67l11-2ZM62 52l10 15-11-2Z" fill="#fff" opacity="0.8" />
        <path d="M50 17c12 10 16 27 12 51H38c-4-24 0-41 12-51Z" fill="#fff" />
        <circle cx="50" cy="41" r="6.5" fill="#ff375f" />
      </>
    ),
  },
  people: {
    bg: "#af52de",
    glyph: (
      <>
        <circle cx="63" cy="39" r="8.5" fill="#fff" opacity="0.7" />
        <path d="M54 57c2.5-1.6 5.6-2.5 9-2.5 9 0 15 6 15 15.5H60Z" fill="#fff" opacity="0.7" />
        <circle cx="41" cy="37" r="11" fill="#fff" />
        <path d="M21 73c0-12 9-19 20-19s20 7 20 19Z" fill="#fff" />
      </>
    ),
  },
  lang: {
    bg: "#f2f2f7",
    glyph: (
      <text x="50" y="64" textAnchor="middle" fontSize="40" fontWeight="500" fill={INK} letterSpacing="-1">Aa</text>
    ),
  },
};

export const APP_ICON_KINDS: AppIconKind[] = [...(Object.keys(ICONS) as AppIconKind[]), "logo"];

export function AppIcon({ kind, className }: { kind: AppIconKind; className?: string }) {
  const classes = ["lp-app", className].filter(Boolean).join(" ");
  if (kind === "logo") {
    return (
      <span className={`${classes} lp-app--logo`} style={{ background: "#fff" }} aria-hidden="true">
        <Logo decorative />
      </span>
    );
  }
  const { bg, glyph } = ICONS[kind];
  return (
    <span className={classes} style={{ background: bg }} aria-hidden="true">
      <svg viewBox="0 0 100 100" focusable="false">{glyph}</svg>
    </span>
  );
}
