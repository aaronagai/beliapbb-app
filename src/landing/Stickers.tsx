/**
 * Belia PBB sticker set — flat, glossy, Family-style illustrations drawn for this
 * site (Sarawak + youth themes). Every sticker is a 100×100 SVG so they size from CSS.
 */

export type StickerKind =
  | "heart"
  | "star"
  | "sparkle"
  | "hibiscus"
  | "hornbill"
  | "megaphone"
  | "check"
  | "cap"
  | "book"
  | "bulb"
  | "rocket"
  | "chat"
  | "pin"
  | "blob"
  | "tri"
  | "mascot";

const INK = "#1b1b1f";
const SHINE = "rgb(255 255 255 / 0.42)";

function Face({ x, y, gap = 16, happy = false }: { x: number; y: number; gap?: number; happy?: boolean }) {
  const l = x - gap / 2;
  const r = x + gap / 2;
  return (
    <g>
      {happy ? (
        <>
          <path d={`M${l - 4} ${y + 1} Q${l} ${y - 4} ${l + 4} ${y + 1}`} stroke={INK} strokeWidth="3.2" strokeLinecap="round" fill="none" />
          <path d={`M${r - 4} ${y + 1} Q${r} ${y - 4} ${r + 4} ${y + 1}`} stroke={INK} strokeWidth="3.2" strokeLinecap="round" fill="none" />
        </>
      ) : (
        <>
          <ellipse cx={l} cy={y} rx="3.4" ry="4.4" fill={INK} />
          <ellipse cx={r} cy={y} rx="3.4" ry="4.4" fill={INK} />
        </>
      )}
      <path d={`M${x - 6} ${y + 9} Q${x} ${y + 15} ${x + 6} ${y + 9}`} stroke={INK} strokeWidth="3.2" strokeLinecap="round" fill="none" />
      <ellipse cx={l - 5} cy={y + 8} rx="4" ry="2.6" fill="#ff7aa2" opacity="0.55" />
      <ellipse cx={r + 5} cy={y + 8} rx="4" ry="2.6" fill="#ff7aa2" opacity="0.55" />
    </g>
  );
}

function Legs({ a, b, top, bottom = 95 }: { a: number; b: number; top: number; bottom?: number }) {
  return (
    <g stroke={INK} strokeWidth="4" strokeLinecap="round">
      <path d={`M${a} ${top} L${a - 1} ${bottom}`} />
      <path d={`M${b} ${top} L${b + 1} ${bottom}`} />
      <path d={`M${a - 1} ${bottom} L${a - 7} ${bottom}`} />
      <path d={`M${b + 1} ${bottom} L${b + 7} ${bottom}`} />
    </g>
  );
}

function Art({ kind, color }: { kind: StickerKind; color?: string }) {
  switch (kind) {
    case "heart":
      return (
        <>
          <path d="M50 88C20 68 8 52 8 34 8 20 18 10 31 10c9 0 15 5 19 12 4-7 10-12 19-12 13 0 23 10 23 24 0 18-12 34-42 54Z" fill="#ff4d5e" />
          <ellipse cx="29" cy="29" rx="9" ry="6" transform="rotate(-35 29 29)" fill={SHINE} />
        </>
      );
    case "star":
      return (
        <>
          <polygon
            points="50,12 60.6,37.4 88,39.6 67.1,57.6 73.5,84.4 50,70 26.5,84.4 32.9,57.6 12,39.6 39.4,37.4"
            fill="#ffc83d"
            stroke="#ffc83d"
            strokeWidth="9"
            strokeLinejoin="round"
          />
          <ellipse cx="40" cy="40" rx="6" ry="4" transform="rotate(-30 40 40)" fill={SHINE} />
        </>
      );
    case "sparkle":
      return <path d="M50 4C54 34 66 46 96 50 66 54 54 66 50 96 46 66 34 54 4 50 34 46 46 34 50 4Z" fill={color ?? "#ffc83d"} />;
    case "hibiscus":
      return (
        <>
          {[0, 72, 144, 216, 288].map((a) => (
            <g key={a} transform={`rotate(${a} 50 50)`}>
              <ellipse cx="50" cy="27" rx="18" ry="24" fill="#ff3d63" />
              <ellipse cx="46" cy="21" rx="6" ry="9" fill="#ff7891" opacity="0.7" />
            </g>
          ))}
          <circle cx="50" cy="50" r="11" fill="#c8123c" />
          <path d="M50 50 L66 30" stroke="#ffd23f" strokeWidth="4" strokeLinecap="round" />
          <circle cx="67" cy="29" r="4.5" fill="#ffd23f" />
        </>
      );
    case "hornbill":
      return (
        <>
          <path d="M22 62 8 80c-2 3 1 6 4 4l18-12Z" fill="#2a2a31" />
          <ellipse cx="42" cy="60" rx="28" ry="24" fill={INK} />
          <ellipse cx="38" cy="68" rx="15" ry="11" fill="#fff" />
          <ellipse cx="34" cy="56" rx="14" ry="10" fill="#2e2e36" />
          <circle cx="60" cy="38" r="17" fill={INK} />
          <path d="M70 26c8-8 22-4 26 8-8-4-16-4-22 0Z" fill="#ffc83d" />
          <path d="M72 34c10-2 22 6 26 18-10-6-18-6-26-8Z" fill="#ff8a1f" />
          <circle cx="63" cy="35" r="5.5" fill="#fff" />
          <circle cx="64.5" cy="35.5" r="2.8" fill={INK} />
          <path d="M36 84v8M48 84v8" stroke="#ff8a1f" strokeWidth="4" strokeLinecap="round" />
        </>
      );
    case "megaphone":
      return (
        <>
          <rect x="12" y="40" width="14" height="20" rx="5" fill="#e05d00" />
          <path d="M24 40 62 22v56L24 60Z" fill="#ff7a1a" stroke="#ff7a1a" strokeWidth="6" strokeLinejoin="round" />
          <ellipse cx="64" cy="50" rx="8" ry="28" fill="#ffa45c" />
          <rect x="28" y="60" width="10" height="20" rx="5" fill="#e05d00" />
          <path d="M80 36q6 4 6 14M84 26q12 8 12 24" stroke="#ff7a1a" strokeWidth="5" strokeLinecap="round" fill="none" />
          <ellipse cx="38" cy="38" rx="8" ry="4" transform="rotate(-25 38 38)" fill={SHINE} />
        </>
      );
    case "check":
      return (
        <>
          <rect x="10" y="10" width="80" height="80" rx="24" fill="#22c55e" />
          <path d="M31 52 45 65 70 37" stroke="#fff" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          <ellipse cx="30" cy="24" rx="10" ry="5" transform="rotate(-20 30 24)" fill={SHINE} />
        </>
      );
    case "cap":
      return (
        <>
          <path d="M28 50v16c0 10 44 10 44 0V50L50 60Z" fill="#3b418a" />
          <path d="M50 20 94 40 50 60 6 40Z" fill="#2b2f6b" stroke="#2b2f6b" strokeWidth="4" strokeLinejoin="round" />
          <path d="M50 40 80 48v22" stroke="#ffc83d" strokeWidth="4" strokeLinecap="round" fill="none" />
          <rect x="75" y="68" width="10" height="14" rx="3" fill="#ffc83d" />
          <circle cx="50" cy="40" r="4" fill="#ffc83d" />
        </>
      );
    case "book":
      return (
        <>
          <rect x="18" y="12" width="64" height="76" rx="9" fill="#7c4dff" />
          <rect x="18" y="12" width="14" height="76" rx="7" fill="#5b2fe0" />
          <rect x="32" y="78" width="50" height="10" rx="3" fill="#fff" />
          <rect x="42" y="28" width="30" height="5" rx="2.5" fill="#fff" opacity="0.8" />
          <rect x="42" y="38" width="20" height="5" rx="2.5" fill="#fff" opacity="0.55" />
          <path d="M57 50l3.5 7 7.5 1-5.5 5 1.5 7.5-7-4-7 4 1.5-7.5-5.5-5 7.5-1Z" fill="#ffc83d" />
        </>
      );
    case "bulb":
      return (
        <>
          <circle cx="50" cy="42" r="28" fill="#ffd23f" />
          <rect x="38" y="64" width="24" height="10" fill="#ffd23f" />
          <rect x="36" y="72" width="28" height="16" rx="5" fill="#8f98ab" />
          <path d="M37 78h26" stroke="#c8cede" strokeWidth="3" />
          <path d="M50 52v-14l-7 8M50 38l7 8" stroke="#e8a400" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          <ellipse cx="38" cy="30" rx="8" ry="5" transform="rotate(-35 38 30)" fill={SHINE} />
        </>
      );
    case "rocket":
      return (
        <>
          <path d="M42 70 50 94 58 70Z" fill="#ffa31a" />
          <path d="M46 70 50 84 54 70Z" fill="#ffe066" />
          <path d="M34 52 20 72l16-4ZM66 52l14 20-16-4Z" fill="#ff4d5e" />
          <path d="M50 6c16 14 20 36 16 64H34C30 42 34 20 50 6Z" fill="#e9edf5" />
          <path d="M50 6c6 5 10 11 13 18H37c3-7 7-13 13-18Z" fill="#ff4d5e" />
          <circle cx="50" cy="40" r="9" fill="#5aa9ff" stroke="#2b2f6b" strokeWidth="4" />
        </>
      );
    case "chat":
      return (
        <>
          <path d="M28 70 22 90 48 72Z" fill="#4da3ff" />
          <rect x="8" y="14" width="84" height="58" rx="26" fill="#4da3ff" />
          <circle cx="34" cy="43" r="6" fill="#fff" />
          <circle cx="50" cy="43" r="6" fill="#fff" />
          <circle cx="66" cy="43" r="6" fill="#fff" />
        </>
      );
    case "pin":
      return (
        <>
          <path d="M50 94S20 62 20 40C20 23 33 10 50 10s30 13 30 30c0 22-30 54-30 54Z" fill="#ff4d5e" />
          <circle cx="50" cy="40" r="12" fill="#fff" />
          <ellipse cx="35" cy="26" rx="7" ry="4" transform="rotate(-40 35 26)" fill={SHINE} />
        </>
      );
    case "blob":
      return (
        <>
          <Legs a={40} b={60} top={80} />
          <path d="M84 50 96 38" stroke={INK} strokeWidth="4" strokeLinecap="round" />
          <path d="M18 50c0-24 16-36 34-34 22 2 34 18 32 38-2 20-18 30-38 28C26 80 18 70 18 50Z" fill="#3ccf6e" />
          <ellipse cx="34" cy="30" rx="9" ry="5" transform="rotate(-30 34 30)" fill={SHINE} />
          <Face x={51} y={46} />
        </>
      );
    case "tri":
      return (
        <>
          <Legs a={38} b={62} top={84} />
          <path d="M50 10c6 0 10 4 14 11l25 48c4 9-2 17-10 17H21c-8 0-14-8-10-17l25-48c4-7 8-11 14-11Z" fill="#ffb02e" />
          <ellipse cx="42" cy="30" rx="6" ry="4" transform="rotate(-55 42 30)" fill={SHINE} />
          <Face x={50} y={58} gap={18} happy />
        </>
      );
    case "mascot":
      return (
        <>
          <Legs a={40} b={60} top={78} />
          <path d="M26 66 18 86l26-16Z" fill="#2f7bff" />
          <path d="M88 44 98 30" stroke={INK} strokeWidth="4" strokeLinecap="round" />
          <rect x="8" y="10" width="84" height="66" rx="30" fill="#2f7bff" />
          <rect x="18" y="16" width="44" height="14" rx="7" fill="#6aa2ff" opacity="0.7" />
          <Face x={50} y={42} gap={20} />
        </>
      );
  }
}

export function Sticker({ kind, color, className }: { kind: StickerKind; color?: string; className?: string }) {
  return (
    <svg className={className} viewBox="0 0 100 100" aria-hidden="true" focusable="false">
      <Art kind={kind} color={color} />
    </svg>
  );
}
