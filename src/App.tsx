import { useCallback, useLayoutEffect, useRef, useState } from "react";
import logoSvgUrl from "../logo.svg?url";
import { LatestNews } from "./LatestNews";
import { MembersPage } from "./MembersPage";
import "./App.css";

type AppTab = "home" | "members";

function IconHome() {
  return (
    <svg className="nav-icon" viewBox="0 0 24 24" aria-hidden>
      <path
        fill="currentColor"
        d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8h5z"
      />
    </svg>
  );
}

function IconMembers() {
  return (
    <svg className="nav-icon" viewBox="0 0 24 24" aria-hidden>
      <path
        fill="currentColor"
        d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.67V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"
      />
    </svg>
  );
}

function IconSparkles() {
  return (
    <svg className="nav-icon nav-icon--fab" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M9 4.5a.75.75 0 01.721.544l.813 2.846a3.75 3.75 0 002.576 2.576l2.846.813a.75.75 0 010 1.442l-2.846.813a3.75 3.75 0 00-2.576 2.576l-.813 2.846a.75.75 0 01-1.442 0l-.813-2.846a3.75 3.75 0 00-2.576-2.576l-2.846-.813a.75.75 0 010-1.442l2.846-.813A3.75 3.75 0 007.466 7.89l.813-2.846A.75.75 0 019 4.5zM18 1.5a.75.75 0 01.728.568l.258 1.036c.236.94.97 1.674 1.91 1.91l1.036.258a.75.75 0 010 1.456l-1.036.258c-.94.236-1.674.97-1.91 1.91l-.258 1.036a.75.75 0 01-1.456 0l-.258-1.036a2.625 2.625 0 00-1.91-1.91l-1.036-.258a.75.75 0 010-1.456l1.036-.258a2.625 2.625 0 001.91-1.91l.258-1.036A.75.75 0 0118 1.5zM16.5 15a.75.75 0 01.712.513l.394 1.183c.15.447.5.799.948.948l1.183.395a.75.75 0 010 1.422l-1.183.395c-.447.15-.799.5-.948.948l-.395 1.183a.75.75 0 01-1.422 0l-.395-1.183a1.5 1.5 0 00-.948-.948l-1.183-.395a.75.75 0 010-1.422l1.183-.395c.447-.15.799-.5.948-.948l.395-1.183A.75.75 0 0116.5 15z"
      />
    </svg>
  );
}

function IconResources() {
  return (
    <svg className="nav-icon" viewBox="0 0 24 24" aria-hidden>
      <path
        fill="currentColor"
        d="M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm16-4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-1 9H9V9h10v2zm-4 4H9v-2h6v2zm4-8H9V5h10v2z"
      />
    </svg>
  );
}

function IconProfile() {
  return (
    <svg className="nav-icon" viewBox="0 0 24 24" aria-hidden>
      <path
        fill="currentColor"
        d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"
      />
    </svg>
  );
}

const KENALI_PARTI_LABELS = ["About", "Amanat", "Constitution", "Structure"] as const;
const SAYAP_PARTI_LABELS = ["MKT", "Wanita", "Pemuda", "Belia"] as const;

/** Public-folder photos (`public/sayap/`). */
const SAYAP_PARTI_PHOTO_SRC: Record<(typeof SAYAP_PARTI_LABELS)[number], string> = {
  MKT: `${import.meta.env.BASE_URL}sayap/mkt.jpg`,
  Wanita: `${import.meta.env.BASE_URL}sayap/wanita.jpg.webp`,
  Pemuda: `${import.meta.env.BASE_URL}sayap/pemuda.jpg`,
  Belia: `${import.meta.env.BASE_URL}sayap/belia.jpeg`,
};

function KenaliPartiIcon({ label }: { label: (typeof KENALI_PARTI_LABELS)[number] }) {
  const cls = "wing-circle-icon";
  switch (label) {
    case "About":
      return (
        <svg className={cls} viewBox="0 0 24 24" aria-hidden>
          <path
            fill="currentColor"
            d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"
          />
        </svg>
      );
    case "Amanat":
      return (
        <svg className={cls} viewBox="0 0 24 24" aria-hidden>
          <path
            fill="currentColor"
            d="M6 17h3l2-4V7H5v6h3zm8 0h3l2-4V7h-6v6h3z"
          />
        </svg>
      );
    case "Constitution":
      return (
        <svg className={cls} viewBox="0 0 24 24" aria-hidden>
          <path
            fill="currentColor"
            d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"
          />
        </svg>
      );
    case "Structure":
      return (
        <svg className={cls} viewBox="0 0 24 24" aria-hidden>
          <path
            fill="currentColor"
            d="M4 15h17v2H4v-2zm0-5h17v2H4v-2zm0-5h17v2H4V5z"
          />
        </svg>
      );
    default:
      return null;
  }
}

export function App() {
  const phoneFrameRef = useRef<HTMLDivElement>(null);
  const appHeaderRef = useRef<HTMLElement>(null);
  const bottomNavRef = useRef<HTMLElement>(null);
  const sheetRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{ startY: number; startOffset: number; moved: boolean } | null>(
    null
  );
  const [sheetHeight, setSheetHeight] = useState(0);
  const [offset, setOffset] = useState(0);
  const [sheetDragging, setSheetDragging] = useState(false);
  const defaultOffsetAppliedRef = useRef(false);
  const [tab, setTab] = useState<AppTab>("home");

  const goHome = useCallback(() => {
    defaultOffsetAppliedRef.current = false;
    setTab("home");
  }, []);

  /** Minimum visible height when fully collapsed (handle + title + wing row must clear nav). */
  const peekPx = 168;

  useLayoutEffect(() => {
    const el = sheetRef.current;
    if (!el) return;
    const measure = () => {
      const h = el.offsetHeight;
      setSheetHeight(h);
      if (!defaultOffsetAppliedRef.current && h > 0) {
        const phone = el.closest(".phone-frame") as HTMLElement | null;
        const pageH = phone?.clientHeight ?? window.innerHeight;
        /** Default strip: at least peek, ~26% of frame, and 200px so icons are not clipped. */
        const targetVisible = Math.min(h, Math.max(peekPx, pageH * 0.26, 200));
        const max = Math.max(0, h - peekPx);
        const visible = targetVisible;
        const next = Math.min(max, Math.max(0, h - visible));
        setOffset(next);
        defaultOffsetAppliedRef.current = true;
      }
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [tab]);

  /** Tab bar + header height → CSS vars so pull-up fills space between them (up to header). */
  useLayoutEffect(() => {
    const phone = phoneFrameRef.current;
    const nav = bottomNavRef.current;
    const header = appHeaderRef.current;
    if (!phone || !nav || !header) return;
    const sync = () => {
      phone.style.setProperty("--phone-nav-height", `${nav.offsetHeight}px`);
      phone.style.setProperty("--app-header-height", `${header.offsetHeight}px`);
    };
    sync();
    const roNav = new ResizeObserver(sync);
    const roHead = new ResizeObserver(sync);
    roNav.observe(nav);
    roHead.observe(header);
    return () => {
      roNav.disconnect();
      roHead.disconnect();
    };
  }, [tab]);

  const maxOffset = Math.max(0, sheetHeight - peekPx);

  /** Never clamp while maxOffset is 0 — that would force offset to 0 and wipe the default strip. */
  useLayoutEffect(() => {
    if (maxOffset <= 0) return;
    setOffset((o) => Math.min(o, maxOffset));
  }, [maxOffset]);

  const snapStops = useCallback((): number[] => {
    if (maxOffset <= 0) return [0];
    const half = maxOffset / 2;
    const stops = [0, half, maxOffset];
    return [...new Set(stops)].sort((a, b) => a - b);
  }, [maxOffset]);

  const snapFrom = useCallback(
    (value: number) => {
      const stops = snapStops();
      let best = stops[0]!;
      let bestDist = Math.abs(value - best);
      for (const s of stops) {
        const d = Math.abs(value - s);
        if (d < bestDist) {
          best = s;
          bestDist = d;
        }
      }
      return best;
    },
    [snapStops]
  );

  const onHandlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      e.currentTarget.setPointerCapture(e.pointerId);
      setSheetDragging(true);
      dragRef.current = { startY: e.clientY, startOffset: offset, moved: false };
    },
    [offset]
  );

  const onHandlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      const d = dragRef.current;
      if (!d) return;
      const dy = e.clientY - d.startY;
      if (Math.abs(dy) > 6) d.moved = true;
      const next = Math.min(maxOffset, Math.max(0, d.startOffset + dy));
      setOffset(next);
    },
    [maxOffset]
  );

  const onHandlePointerUp = useCallback(
    (e: React.PointerEvent) => {
      try {
        e.currentTarget.releasePointerCapture(e.pointerId);
      } catch {
        /* ignore */
      }
      setSheetDragging(false);
      const d = dragRef.current;
      dragRef.current = null;
      if (!d) return;
      if (!d.moved) {
        const stops = snapStops();
        if (stops.length < 2) return;
        setOffset((o) => {
          let closest = 0;
          let closestDist = Infinity;
          stops.forEach((s, idx) => {
            const dist = Math.abs(s - o);
            if (dist < closestDist) {
              closestDist = dist;
              closest = idx;
            }
          });
          const nextIdx = (closest + 1) % stops.length;
          return stops[nextIdx]!;
        });
        return;
      }
      setOffset((o) => snapFrom(o));
    },
    [maxOffset, snapFrom, snapStops]
  );

  const visibleLift = tab === "home" ? Math.max(0, sheetHeight - offset) : 0;

  return (
    <div className="app-shell">
      <div
        ref={phoneFrameRef}
        className="phone-frame"
        style={
          {
            "--wings-sheet-lift": `${visibleLift}px`,
          } as React.CSSProperties
        }
      >
        <header ref={appHeaderRef} className="app-header">
          {tab === "members" ? (
            <div className="app-header-sub">
              <button
                type="button"
                className="app-header-back"
                onClick={goHome}
                aria-label="Kembali"
              >
                <svg className="app-header-back-icon" viewBox="0 0 24 24" aria-hidden>
                  <path
                    fill="currentColor"
                    d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"
                  />
                </svg>
              </button>
              <h1 className="app-header-title">Members</h1>
              <span aria-hidden="true" />
            </div>
          ) : (
            <div className="site-brand-row" translate="no">
              <img
                src={logoSvgUrl}
                alt="Logo PBB"
                className="site-brand-logo"
                width={120}
                height={32}
                decoding="async"
              />
              <span className="site-brand">beliapbb.app</span>
            </div>
          )}
        </header>

        <main className="app-main">
          {tab === "home" ? (
            <section className="section section--news">
              <h1 className="greeting">Hey User!</h1>
              <div className="home-empty-card" aria-hidden />
              <h2 className="section-title">
                Latest News
                <a
                  className="news-source-link"
                  href="https://jiwabakti.com.my/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Jiwa Bakti
                </a>
              </h2>
              <LatestNews />
            </section>
          ) : (
            <MembersPage />
          )}
        </main>

        {tab === "home" ? (
        <div className="wings-pullup-host">
          <div
            ref={sheetRef}
            className={`wings-pullup${sheetDragging ? " wings-pullup--dragging" : ""}`}
            style={{
              transform: `translateY(${offset}px)`,
            }}
          >
            <button
              type="button"
              className="wings-pullup-handle"
              aria-expanded={maxOffset <= 0 ? true : offset < maxOffset - 4}
              aria-label="Seret untuk naik atau turun: Sayap Parti"
              onPointerDown={onHandlePointerDown}
              onPointerMove={onHandlePointerMove}
              onPointerUp={onHandlePointerUp}
              onPointerCancel={onHandlePointerUp}
            >
              <span className="wings-pullup-pill" />
            </button>
            <div className="wings-pullup-body">
              {[0, 1].map((row) => (
                <div key={row} className="wings-block">
                  <h2 className="wings-heading">
                    {row === 0 ? "Kenali Parti" : "Sayap Parti"}
                  </h2>
                  <ul className="wings-row">
                    {row === 0
                      ? KENALI_PARTI_LABELS.map((label) => (
                          <li key={label} className="wing-item">
                            <button type="button" className="wing-button">
                              <span className="wing-circle">
                                <KenaliPartiIcon label={label} />
                              </span>
                              <span className="wing-label">{label}</span>
                            </button>
                          </li>
                        ))
                      : SAYAP_PARTI_LABELS.map((label) => (
                          <li key={label} className="wing-item">
                            <button type="button" className="wing-button">
                              <span className="wing-circle wing-circle--photo">
                                <img src={SAYAP_PARTI_PHOTO_SRC[label]} alt="" width={52} height={52} />
                              </span>
                              <span className="wing-label">{label}</span>
                            </button>
                          </li>
                        ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>
        ) : null}

        <nav ref={bottomNavRef} className="bottom-nav" aria-label="Navigasi utama">
          <a
            className={`nav-item${tab === "home" ? " nav-item--active" : ""}`}
            href="#home"
            onClick={(e) => {
              e.preventDefault();
              goHome();
            }}
          >
            <IconHome />
            <span>Home</span>
          </a>
          <a
            className={`nav-item${tab === "members" ? " nav-item--active" : ""}`}
            href="#members"
            onClick={(e) => {
              e.preventDefault();
              setTab("members");
            }}
          >
            <IconMembers />
            <span>Members</span>
          </a>
          <a className="nav-item nav-item--fab" href="#chat" aria-label="Sorotan">
            <span className="fab-circle">
              <IconSparkles />
            </span>
          </a>
          <a className="nav-item" href="#resources">
            <IconResources />
            <span>Resources</span>
          </a>
          <a className="nav-item" href="#profile">
            <IconProfile />
            <span>Profile</span>
          </a>
        </nav>
      </div>
    </div>
  );
}
