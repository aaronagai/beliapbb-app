import { StrictMode, type ReactNode } from "react";
import { createRoot } from "react-dom/client";
import "./fonts/geist.css";
import "./fonts/tiktok-sans.css";
import "./index.css";
import { I18nProvider } from "./i18n";
import { ThemeProvider } from "./theme";
import { LEGACY_HASH_TO_PATH, SITE_PAGES, SITE_URL, type SitePage } from "./links";
import { initAnalytics, trackAppLinks } from "./analytics";

/**
 * One entry, three builds:
 *   site     → beliapbb.com: the landing page, /kepimpinan/ and the join flow + assistants (/sertai/, /tanya/, /ftes/, /perlembagaan/)
 *   app      → app.beliapbb.com: retired, only redirects to beliapbb.com
 *   combined → everything from one origin (GitHub Pages / local dev)
 * The target is a build-time constant.
 */
type BuildTarget = "site" | "app" | "combined";
const TARGET = (import.meta.env.VITE_BUILD_TARGET ?? "combined") as BuildTarget;

const base = import.meta.env.BASE_URL;
const route = window.location.pathname.startsWith(base) ? window.location.pathname.slice(base.length) : "";
const firstSegment = route.split("/")[0];
const isLeadership = firstSegment === "kepimpinan";
const sitePage = (SITE_PAGES as readonly string[]).includes(firstSegment) ? (firstSegment as SitePage) : null;

/** Links from the old app (…/#sertai) and from before the landing page existed (/#ftes) land on the page that replaced them. */
const legacyTarget = LEGACY_HASH_TO_PATH[window.location.hash.slice(1).toLowerCase()];

function mount(node: ReactNode) {
  createRoot(document.getElementById("root")!).render(
    <StrictMode>
      <ThemeProvider>
        <I18nProvider>{node}</I18nProvider>
      </ThemeProvider>
    </StrictMode>,
  );
}

function mountSite() {
  initAnalytics({ kind: "site", watchHash: false });
  trackAppLinks();
  if (isLeadership) void import("./landing/Leadership").then(({ Leadership }) => mount(<Leadership />));
  else if (sitePage) void import("./SiteApp").then(({ SiteApp }) => mount(<SiteApp initial={sitePage} />));
  else void import("./landing/Landing").then(({ Landing }) => mount(<Landing />));
}

if (TARGET === "app") {
  // The app site is retired. The server redirects first (_redirects); this is the fallback.
  window.location.replace(`${SITE_URL}${legacyTarget ? `${legacyTarget}/` : ""}`);
} else if (route === "" && legacyTarget !== undefined && legacyTarget !== "") {
  // beliapbb.com/#sertai (a link made for the old app) → beliapbb.com/sertai/
  window.location.replace(`${base}${legacyTarget}/`);
} else {
  mountSite();
}
