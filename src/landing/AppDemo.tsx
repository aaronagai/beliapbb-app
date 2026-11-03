import { useEffect, useState, type ReactNode } from "react";
import { useI18n } from "../i18n";
import { Logo } from "../Logo";
import { TAB_ICONS, type TabBarTab } from "../app/TabBar";
// Direct module imports, not the kit's barrel: the barrel pulls in its brand-logo registry
import { Stage } from "./stageshow/kit/stage";
import type { Act } from "./stageshow/kit/act";
import { Window, Bar } from "./stageshow/kit/window";
import { Phone } from "./stageshow/kit/phone";
import { Collapse } from "./stageshow/kit/motion/Collapse";
import { Stream } from "./stageshow/kit/motion/Stream";
import "./AppDemo.css";

/* Hero product shot (stageshow, device-pair layout). The laptop shows the app's Home;
   the phone straddling its right edge plays the story: a question to Tanya FTES is
   typed and sent, it becomes the page title, the answer streams in and its official
   sources arrive under it. "Perbualan baharu" is the visible cause of the loop reset.
   Real strings: the app's chrome labels, the question, the answer, the two sources. */

type S = {
  focused: boolean;
  draft: string;
  sent: boolean;
  phase: "idle" | "thinking" | "answer";
  words: number;
  sources: boolean;
};

const INITIAL: S = { focused: false, draft: "", sent: false, phase: "idle", words: 0, sources: false };

/** Same 24px, 1.8-stroke icons as the app's Home shortcuts. */
const STROKE = { fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round", strokeLinejoin: "round" } as const;
const QUICK_ICONS = [
  "M4 9.5 12 5l8 4.5-8 4.5Zm3 2v4c0 1.4 2.2 2.5 5 2.5s5-1.1 5-2.5v-4",
  "M6 4.5h9.5a2 2 0 0 1 2 2v13H8a2 2 0 0 1-2-2Zm0 13a2 2 0 0 1 2-2h9.5M9.5 8.5h5",
  "M10 11.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Zm-6.5 8c.6-3.4 3.2-5.5 6.5-5.5 1.3 0 2.5.3 3.5.9M18 13.5v6M15 16.5h6",
  "M8.5 10.5a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm7 1a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5ZM3 19c.5-3 2.7-5 5.5-5s5 2 5.5 5m.5-4.6c.5-.2 1-.4 1.5-.4 2.3 0 4 1.6 4.5 4",
] as const;

const TABS: TabBarTab[] = ["home", "tanya", "berita", "sertai", "saya"];
const THUMB = `${import.meta.env.BASE_URL}landing/thumb-`;
const focusEducation = `${THUMB}education.jpg`;
const focusEmerging = `${THUMB}emerging.jpg`;
const focusEmployment = `${THUMB}employment.jpg`;
const NEWS = [
  { img: focusEducation, w: [168, 120] },
  { img: focusEmployment, w: [152, 96] },
  { img: focusEmerging, w: [176, 132] },
  { img: focusEducation, w: [140, 110] },
];

function Svg({ children, size = 20 }: { children: ReactNode; size?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden>
      {children}
    </svg>
  );
}

function useDarkTheme() {
  const read = () => typeof document !== "undefined" && document.documentElement.getAttribute("data-theme") === "dark";
  const [dark, setDark] = useState(read);
  useEffect(() => {
    const obs = new MutationObserver(() => setDark(read()));
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    return () => obs.disconnect();
  }, []);
  return dark;
}

/* ── The laptop: the app's Home, as context ── */

function LaptopHome() {
  const { t } = useI18n();
  const quick = [t("homeQuickFtes"), t("homeQuickConstitution"), t("homeQuickJoin"), t("homeQuickLeaders")];
  const tabLabels = [t("navHome"), t("navTanya"), t("navBerita"), t("navSertai"), t("navSaya")];
  return (
    <Window url="app.beliapbb.com" urlShape="pill" className="ad-window">
      <div className="ad-app">
        <div className="ad-app-head">
          <span className="ad-brand">
            <Logo className="ad-logo" decorative />
            <span>Belia PBB</span>
          </span>
          <span className="ad-tabs">
            {TABS.map((tab, i) => (
              <span className="ad-tab" data-on={i === 0 || undefined} key={tab}>
                <Svg size={14}>{i === 0 ? TAB_ICONS[tab].filled : TAB_ICONS[tab].outline}</Svg>
                {tabLabels[i]}
              </span>
            ))}
          </span>
        </div>

        <div className="ad-home">
          <div className="ad-greeting">{t("appWelcome")}</div>

          <div className="ad-card">
            <div className="ad-card-body">
              <Logo className="ad-card-logo" decorative />
              <span className="ad-card-kicker">{t("membershipCardTitle")}</span>
              <Bar w={148} h={12} r={6} tone={3} />
              <Bar w={104} h={7} r={4} tone={2} />
            </div>
            <div className="ad-card-foot">
              <Bar w={220} h={6} r={3} tone={2} />
              <span className="ad-card-btn">{t("membershipSampleEdit")}</span>
            </div>
          </div>

          <div className="ad-quick">
            {quick.map((label, i) => (
              <span className="ad-quick-item" key={label}>
                <span className="ad-quick-icon">
                  <Svg size={18}><path {...STROKE} d={QUICK_ICONS[i]} /></Svg>
                </span>
                {label}
              </span>
            ))}
          </div>

          <div className="ad-news-head">
            <span>{t("latestNews")}</span>
            <Bar w={52} h={6} r={3} tone={2} />
          </div>
          <div className="ad-news">
            {NEWS.map((n, i) => (
              <div className="ad-news-row" key={i}>
                <img src={n.img} alt="" className="ad-news-img" width={64} height={64} decoding="async" />
                <span className="ad-news-lines">
                  <Bar w={n.w[0]} h={7} r={4} tone={3} />
                  <Bar w={n.w[1]} h={7} r={4} tone={3} />
                  <Bar w={64} h={5} r={3} tone={2} />
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Window>
  );
}

/* ── The phone: Tanya FTES ── */

function PhoneFtes({ s, width, dark }: { s: S; width: number; dark: boolean }) {
  const { t } = useI18n();
  return (
    <Phone width={width} frame="pro" dark={dark} className="ad-phone">
      <div className="ad-ftes">
        <div className="ad-ftes-head">
          <span className="ad-crumbs">
            <Logo className="ad-ftes-logo" decorative />
            <span className="ad-crumbs-brand">Belia PBB</span>
            <span className="ad-crumbs-sep">/</span>
            <span>{t("ftesNav")}</span>
          </span>
          <span className="ad-new" data-on={s.sent || undefined} data-target="new" data-cursor="pointer">
            <Svg size={18}><path {...STROKE} strokeWidth={2.2} d="M12 5v14M5 12h14" /></Svg>
          </span>
        </div>

        <Collapse open={!s.sent}>
          <div className="ad-hero">
            <div className="ad-hero-title">{t("ftesHeroTitle")}</div>
            <div className="ad-hero-sub">{t("ftesHeroSub")}</div>
            <div className="ad-ask" data-focused={s.focused || undefined} data-target="ask" data-cursor="ibeam">
              <span className="ad-ask-text" data-empty={!s.draft || undefined}>
                {s.draft || t("ftesAskPlaceholder")}
                {s.focused && <i className="ad-caret" />}
              </span>
              <span className="ad-send" data-ready={!!s.draft || undefined} data-target="send" data-cursor="pointer">
                <Svg size={18}><path {...STROKE} strokeWidth={2.25} d="M5 12h14m-6-6 6 6-6 6" /></Svg>
              </span>
            </div>
          </div>
        </Collapse>

        <Collapse open={s.sent} reveal="drop" from="below">
          <div className="ad-question">{t("ftesPillQuestion")}</div>
        </Collapse>

        <Collapse open={s.phase === "thinking"}>
          <div className="ad-thinking">
            <span className="ad-thinking-dot" />
            <span className="ad-shimmer">{t("ftesThinking")}</span>
          </div>
        </Collapse>

        <Collapse open={s.phase === "answer"}>
          <div className="ad-answer">
            <Stream className="ad-stream" text={t("landingDemoAnswer")} count={s.words} />
            <div className="ad-sources" data-on={s.sources || undefined}>
              <span className="ad-sources-title">{t("ftesSources")}</span>
              {[
                [t("landingDemoSource1"), "sarawak.gov.my"],
                [t("landingDemoSource2"), "meitd.sarawak.gov.my"],
              ].map(([title, host], i) => (
                <span className="ad-source" key={i}>
                  <span className="ad-source-n">{i + 1}</span>
                  <span className="ad-source-text">
                    <span className="ad-source-title">{title}</span>
                    <span className="ad-source-host">{host}</span>
                  </span>
                </span>
              ))}
            </div>
          </div>
        </Collapse>
      </div>
    </Phone>
  );
}

export function AppDemo() {
  const { t } = useI18n();
  const dark = useDarkTheme();
  const question = t("ftesPillQuestion");
  const answerWords = t("landingDemoAnswer").split(" ").length;
  const poster: S = { focused: false, draft: "", sent: true, phase: "answer", words: answerWords, sources: true };

  async function script(a: Act<S>) {
    await a.wait(900);
    a.mark("tap");
    await a.click("ask");
    a.put({ focused: true });
    await a.wait(250);
    a.mark("type");
    await a.type("draft", question, { interval: 42 });
    await a.wait(350);
    a.mark("send");
    await a.click("send");
    a.put({ sent: true, draft: "", focused: false });
    await a.wait(450);
    a.put({ phase: "thinking" });
    await a.wait(1300);
    a.mark("stream");
    a.put({ phase: "answer" });
    for (let i = 1; i <= answerWords; i++) {
      a.put({ words: i });
      await a.wait(45);
    }
    await a.wait(350);
    a.mark("sources");
    a.put({ sources: true });
    await a.wait(3600);
    a.mark("new");
    await a.click("new");
    a.put({ sent: false, phase: "idle", sources: false });
    await a.wait(700);
    await a.snap({ words: 0 });
    await a.wait(600);
  }

  return (
    <div className="ad" role="img" aria-label={t("landingPreviewAlt")}>
      <Stage<S>
        key={t("ftesPillQuestion")}
        width={1120}
        height={620}
        compact={{ below: 720, width: 358, height: 560 }}
        initial={INITIAL}
        poster={poster}
        script={script}
        play="loop"
        theme={dark ? "dark" : "light"}
        cursor={{ at: { wide: { x: 980, y: 560 }, compact: { x: 300, y: 520 } }, style: "touch" }}
        className="ad-stage"
      >
        {(s, _rect, layout) => (
          <>
            {layout === "wide" && <LaptopHome />}
            <PhoneFtes s={s} width={layout === "wide" ? 340 : 326} dark={dark} />
          </>
        )}
      </Stage>
    </div>
  );
}
