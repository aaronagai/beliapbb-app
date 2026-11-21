import { useCallback, useEffect, useRef, useState } from "react";
import { PenLine } from "reicon-react";
import { useI18n } from "./i18n";

export type SignatureResult = { dataUrl: string; aspect: number };

type Pt = { x: number; y: number };

const INK = "#0d1a73";
const HEIGHT = 170;
const LINE = 2.6;
/** Export at a fixed scale so the signature looks the same on every screen. */
const EXPORT_SCALE = 3;
const EXPORT_PAD = 4;

/** Draw smooth strokes: curve through the midpoints of consecutive samples. */
function paint(ctx: CanvasRenderingContext2D, strokes: Pt[][], scale: number, offX = 0, offY = 0) {
  ctx.lineWidth = LINE * scale;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.strokeStyle = INK;
  for (const s of strokes) {
    if (!s.length) continue;
    const X = (p: Pt) => (p.x - offX) * scale;
    const Y = (p: Pt) => (p.y - offY) * scale;
    ctx.beginPath();
    ctx.moveTo(X(s[0]), Y(s[0]));
    if (s.length === 1) ctx.lineTo(X(s[0]) + 0.01, Y(s[0]) + 0.01); // a tap leaves a dot
    for (let i = 1; i < s.length - 1; i++) {
      ctx.quadraticCurveTo(X(s[i]), Y(s[i]), (X(s[i]) + X(s[i + 1])) / 2, (Y(s[i]) + Y(s[i + 1])) / 2);
    }
    if (s.length > 1) ctx.lineTo(X(s[s.length - 1]), Y(s[s.length - 1]));
    ctx.stroke();
  }
}

/**
 * Draw-your-signature box (finger or mouse). Strokes are kept as points (in CSS pixels), so the box
 * redraws cleanly if the phone rotates. Reports a tightly cropped transparent PNG when a stroke ends,
 * or null when cleared. Only the first finger draws; a second touch is ignored.
 */
export function SignaturePad({ onChange, disabled = false }: { onChange: (sig: SignatureResult | null) => void; disabled?: boolean }) {
  const { t } = useI18n();
  const canvas = useRef<HTMLCanvasElement>(null);
  const strokes = useRef<Pt[][]>([]);
  const activePointer = useRef<number | null>(null);
  const [empty, setEmpty] = useState(true);

  const redraw = useCallback(() => {
    const c = canvas.current;
    if (!c) return;
    const dpr = Math.max(1, window.devicePixelRatio || 1);
    const w = c.clientWidth;
    if (!w) return;
    if (c.width !== Math.round(w * dpr) || c.height !== Math.round(HEIGHT * dpr)) {
      c.width = Math.round(w * dpr);
      c.height = Math.round(HEIGHT * dpr);
    }
    const ctx = c.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, c.width, c.height);
    paint(ctx, strokes.current, dpr);
  }, []);

  useEffect(() => {
    redraw();
    const c = canvas.current;
    if (!c || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(redraw);
    ro.observe(c);
    return () => ro.disconnect();
  }, [redraw]);

  const at = (e: React.PointerEvent<HTMLCanvasElement>): Pt => {
    const r = canvas.current!.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  };

  const exportSignature = () => {
    const pts = strokes.current.flat();
    if (!pts.length) return null;
    const x0 = Math.min(...pts.map((p) => p.x)) - EXPORT_PAD;
    const y0 = Math.min(...pts.map((p) => p.y)) - EXPORT_PAD;
    const x1 = Math.max(...pts.map((p) => p.x)) + EXPORT_PAD;
    const y1 = Math.max(...pts.map((p) => p.y)) + EXPORT_PAD;
    const w = x1 - x0;
    const h = y1 - y0;
    if (w < 6 || h < 6) return null;
    const out = document.createElement("canvas");
    out.width = Math.round(w * EXPORT_SCALE);
    out.height = Math.round(h * EXPORT_SCALE);
    const ctx = out.getContext("2d");
    if (!ctx) return null;
    paint(ctx, strokes.current, EXPORT_SCALE, x0, y0);
    return { dataUrl: out.toDataURL("image/png"), aspect: out.width / out.height };
  };

  const down = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (disabled || activePointer.current !== null) return; // ignore a second finger
    e.preventDefault();
    canvas.current?.setPointerCapture(e.pointerId);
    activePointer.current = e.pointerId;
    strokes.current.push([at(e)]);
    redraw();
  };

  const move = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (activePointer.current !== e.pointerId) return;
    const s = strokes.current[strokes.current.length - 1];
    if (!s) return;
    // Pointer events can be coalesced: take every sample for a smoother line.
    const samples = e.nativeEvent.getCoalescedEvents?.() ?? [];
    const r = canvas.current!.getBoundingClientRect();
    if (samples.length) for (const ev of samples) s.push({ x: ev.clientX - r.left, y: ev.clientY - r.top });
    else s.push(at(e));
    redraw();
  };

  const up = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (activePointer.current !== e.pointerId) return;
    activePointer.current = null;
    const sig = exportSignature();
    setEmpty(!sig);
    onChange(sig);
  };

  const clear = () => {
    strokes.current = [];
    redraw();
    setEmpty(true);
    onChange(null);
  };

  return (
    <div className="signpad">
      <div className="signpad-stage">
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
        {/* A grey pen-and-scribble clue that this is where to sign; it fades once they start drawing. */}
        <div className="signpad-clue" data-hidden={!empty} aria-hidden>
          <PenLine size={40} />
        </div>
      </div>
      <div className="signpad-row">
        <span className="signpad-hint">{empty ? t("signPadHint") : ""}</span>
        <button type="button" className="signpad-clear" onClick={clear} disabled={empty || disabled}>
          {t("signPadClear")}
        </button>
      </div>
    </div>
  );
}
