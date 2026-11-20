import { useCallback, useEffect, useRef, useState } from "react";
import { useI18n } from "./i18n";

export type SignatureResult = { dataUrl: string; aspect: number };

const INK = "#0d1a73";
const HEIGHT = 170;

/**
 * Draw-your-signature box (finger or mouse). Reports a tightly cropped transparent PNG each time a
 * stroke ends, or null when cleared. Ink is the same blue as the rest of the filled-in form.
 */
export function SignaturePad({ onChange, disabled = false }: { onChange: (sig: SignatureResult | null) => void; disabled?: boolean }) {
  const { t } = useI18n();
  const canvas = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const last = useRef<{ x: number; y: number } | null>(null);
  const box = useRef<{ x0: number; y0: number; x1: number; y1: number } | null>(null);
  const [empty, setEmpty] = useState(true);

  const setup = useCallback(() => {
    const c = canvas.current;
    if (!c) return;
    const dpr = Math.max(1, window.devicePixelRatio || 1);
    const w = c.clientWidth;
    c.width = Math.round(w * dpr);
    c.height = Math.round(HEIGHT * dpr);
    const ctx = c.getContext("2d");
    if (!ctx) return;
    ctx.lineWidth = 2.6 * dpr;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = INK;
  }, []);

  useEffect(() => {
    setup();
  }, [setup]);

  const point = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const c = canvas.current!;
    const r = c.getBoundingClientRect();
    const dpr = c.width / r.width;
    return { x: (e.clientX - r.left) * dpr, y: (e.clientY - r.top) * dpr };
  };

  const grow = (p: { x: number; y: number }) => {
    const pad = 4;
    const b = box.current;
    box.current = b
      ? { x0: Math.min(b.x0, p.x - pad), y0: Math.min(b.y0, p.y - pad), x1: Math.max(b.x1, p.x + pad), y1: Math.max(b.y1, p.y + pad) }
      : { x0: p.x - pad, y0: p.y - pad, x1: p.x + pad, y1: p.y + pad };
  };

  const down = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (disabled) return;
    e.preventDefault();
    canvas.current?.setPointerCapture(e.pointerId);
    drawing.current = true;
    const p = point(e);
    last.current = p;
    grow(p);
    // A tap leaves a dot.
    const ctx = canvas.current?.getContext("2d");
    if (ctx) {
      ctx.beginPath();
      ctx.moveTo(p.x, p.y);
      ctx.lineTo(p.x + 0.01, p.y + 0.01);
      ctx.stroke();
    }
  };

  const move = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawing.current) return;
    const ctx = canvas.current?.getContext("2d");
    const p = point(e);
    if (ctx && last.current) {
      ctx.beginPath();
      ctx.moveTo(last.current.x, last.current.y);
      // Smooth: curve through the midpoint of the last two samples.
      const mx = (last.current.x + p.x) / 2;
      const my = (last.current.y + p.y) / 2;
      ctx.quadraticCurveTo(last.current.x, last.current.y, mx, my);
      ctx.stroke();
    }
    last.current = p;
    grow(p);
  };

  const up = () => {
    if (!drawing.current) return;
    drawing.current = false;
    last.current = null;
    const c = canvas.current;
    const b = box.current;
    if (!c || !b) return;
    const x = Math.max(0, Math.floor(b.x0));
    const y = Math.max(0, Math.floor(b.y0));
    const w = Math.min(c.width, Math.ceil(b.x1)) - x;
    const h = Math.min(c.height, Math.ceil(b.y1)) - y;
    if (w < 8 || h < 8) return;
    const out = document.createElement("canvas");
    out.width = w;
    out.height = h;
    out.getContext("2d")?.drawImage(c, x, y, w, h, 0, 0, w, h);
    setEmpty(false);
    onChange({ dataUrl: out.toDataURL("image/png"), aspect: w / h });
  };

  const clear = () => {
    const c = canvas.current;
    c?.getContext("2d")?.clearRect(0, 0, c.width, c.height);
    box.current = null;
    setEmpty(true);
    onChange(null);
  };

  return (
    <div className="signpad">
      <canvas
        ref={canvas}
        className="signpad-canvas"
        style={{ height: HEIGHT }}
        role="img"
        aria-label={t("signPadAria")}
        onPointerDown={down}
        onPointerMove={move}
        onPointerUp={up}
        onPointerCancel={up}
      />
      <div className="signpad-row">
        <span className="signpad-hint">{empty ? t("signPadHint") : ""}</span>
        <button type="button" className="signpad-clear" onClick={clear} disabled={empty || disabled}>
          {t("signPadClear")}
        </button>
      </div>
    </div>
  );
}
