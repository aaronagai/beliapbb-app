/**
 * A short confetti burst from a point (the success badge). No library: one fixed canvas, about 90 pieces
 * thrown upwards in a cone, gravity and drag, gone in ~2.4s. Skipped for people who prefer reduced motion.
 * Colours are the party logo's (red, yellow, black) plus a soft grey so it reads on light and dark pages.
 */
const COLORS = ["#d71920", "#f7b500", "#0d0d0d", "#8f8f99", "#e9e9ee"];

type Piece = { x: number; y: number; vx: number; vy: number; w: number; h: number; r: number; vr: number; color: string; round: boolean; life: number };

export function fireConfetti(origin: { x: number; y: number }) {
  if (typeof window === "undefined" || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const canvas = document.createElement("canvas");
  canvas.setAttribute("aria-hidden", "true");
  canvas.style.cssText = "position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:9999";
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  canvas.width = Math.round(window.innerWidth * dpr);
  canvas.height = Math.round(window.innerHeight * dpr);
  document.body.appendChild(canvas);
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    canvas.remove();
    return;
  }
  ctx.scale(dpr, dpr);

  const pieces: Piece[] = Array.from({ length: 90 }, () => {
    const angle = (-90 + (Math.random() - 0.5) * 110) * (Math.PI / 180); // mostly upwards
    const speed = 7 + Math.random() * 9;
    return {
      x: origin.x,
      y: origin.y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      w: 5 + Math.random() * 5,
      h: 3 + Math.random() * 5,
      r: Math.random() * Math.PI,
      vr: (Math.random() - 0.5) * 0.4,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      round: Math.random() < 0.25,
      life: 1,
    };
  });

  const start = performance.now();
  const frame = (now: number) => {
    const t = now - start;
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    let alive = 0;
    for (const p of pieces) {
      p.vx *= 0.985;
      p.vy = p.vy * 0.985 + 0.32; // gravity
      p.x += p.vx;
      p.y += p.vy;
      p.r += p.vr;
      p.life = Math.max(0, 1 - Math.max(0, t - 1500) / 900); // fade out over the last ~0.9s
      if (p.life <= 0 || p.y > window.innerHeight + 20) continue;
      alive++;
      ctx.save();
      ctx.globalAlpha = p.life;
      ctx.translate(p.x, p.y);
      ctx.rotate(p.r);
      ctx.fillStyle = p.color;
      if (p.round) {
        ctx.beginPath();
        ctx.arc(0, 0, p.w / 2, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      }
      ctx.restore();
    }
    if (alive > 0 && t < 2600) requestAnimationFrame(frame);
    else canvas.remove();
  };
  requestAnimationFrame(frame);
}
