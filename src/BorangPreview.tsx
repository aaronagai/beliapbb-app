import { useRef, useState } from "react";
import type { BorangOp } from "./borangPdf";

const W = 540;
const H = 780;
const PAGES = [`${import.meta.env.BASE_URL}borang-halaman-1.png`, `${import.meta.env.BASE_URL}borang-halaman-2.png`] as const;

/**
 * The applicant's filled-in official form, drawn on screen: an image of the blank form with every
 * answer on top as its own SVG element (same positions as the PDF).
 *
 * Hooks for animation: each answer has `class="borang-op borang-text|borang-tick"`, `data-group`
 * (the field it belongs to, e.g. "nama", "tarikhLahir") and a `--i` custom property = its order in
 * the form. Ticks carry `pathLength="1"` so a stroke-dashoffset 1 → 0 draws them in.
 */
export function BorangPreview({ ops, swipe = false }: { ops: BorangOp[]; swipe?: boolean }) {
  const scroller = useRef<HTMLElement>(null);
  const [at, setAt] = useState(0);

  /** Which page is nearest the middle of the row. */
  const onScroll = () => {
    const el = scroller.current;
    if (!el) return;
    const box = el.getBoundingClientRect();
    const mid = box.left + box.width / 2;
    let nearest = 0;
    let best = Infinity;
    Array.from(el.children).forEach((child, i) => {
      const r = child.getBoundingClientRect();
      const d = Math.abs(r.left + r.width / 2 - mid);
      if (d < best) {
        best = d;
        nearest = i;
      }
    });
    setAt(nearest);
  };

  const goTo = (i: number) => {
    const page = scroller.current?.children[i] as HTMLElement | undefined;
    const calm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    page?.scrollIntoView({ behavior: calm ? "auto" : "smooth", inline: "center", block: "nearest" });
  };

  return (
    <>
    <figure className={`borang-preview${swipe ? " borang-preview--swipe" : ""}`} aria-label="Borang Permohonan Keahlian PBB" ref={scroller} onScroll={swipe ? onScroll : undefined}>
      {PAGES.map((src, page) => (
        <svg key={src} className="borang-page" viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`Muka ${page + 1}/2`}>
          <image href={src} width={W} height={H} />
          {ops.map((op, i) => {
            if (op.page !== page) return null;
            const style = { ["--i" as string]: i } as React.CSSProperties;
            if (op.kind === "text") {
              return (
                <text
                  key={i}
                  className="borang-op borang-text"
                  data-group={op.group}
                  style={style}
                  x={op.x}
                  y={op.y}
                  fontSize={op.size}
                >
                  {op.text}
                </text>
              );
            }
            if (op.kind === "image") {
              return (
                <image
                  key={i}
                  className="borang-op borang-signature"
                  data-group={op.group}
                  style={style}
                  href={op.dataUrl}
                  x={op.x}
                  y={op.y}
                  width={op.w}
                  height={op.h}
                />
              );
            }
            const [x0, y0, x1, y1] = op.box;
            const w = x1 - x0;
            const h = y1 - y0;
            const d = `M${x0 + 0.2 * w} ${y0 + 0.55 * h} L${x0 + 0.42 * w} ${y0 + 0.85 * h} L${x0 + 0.88 * w} ${y0 + 0.12 * h}`;
            return <path key={i} className="borang-op borang-tick" data-group={op.group} style={style} d={d} pathLength={1} />;
          })}
        </svg>
      ))}
    </figure>
    {swipe ? (
      <div className="borang-dots" role="group" aria-label="Muka borang">
        {PAGES.map((_, i) => (
          <button key={i} type="button" className="borang-dot" aria-label={`Muka ${i + 1}/2`} aria-current={at === i} onClick={() => goTo(i)} />
        ))}
      </div>
    ) : null}
    </>
  );
}
