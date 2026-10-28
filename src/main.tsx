import { StrictMode, type ReactNode } from "react";
import { createRoot } from "react-dom/client";
import "./fonts/geist.css";
import "./index.css";
import { I18nProvider } from "./i18n";
import { ThemeProvider } from "./theme";
import { APP_URL } from "./links";

/**
 * One entry, three builds:
 *   site     → beliapbb.com (landing + /kepimpinan)
 *   app      → app.beliapbb.com (the app at the root)
 *   combined → both from one origin, app under /app/ (GitHub Pages, until the move)
 * The target is a build-time constant, so each split build leaves the other half out.
 */
type BuildTarget = "site" | "app" | "combined";
const TARGET = (import.meta.env.VITE_BUILD_TARGET ?? "combined") as BuildTarget;

const base = import.meta.env.BASE_URL;
const route = window.location.pathname.startsWith(base)
  ? window.location.pathname.slice(base.length)
  : "";
const underApp = route === "app" || route.startsWith("app/");
const isLeadership = route === "kepimpinan" || route.startsWith("kepimpinan/");

// Links shared before the landing page existed (e.g. /#ftes) belong to the app.
// Only the app's tab hashes move; the landing's own anchors (#ciri, #soalan) stay.
const APP_TAB_HASHES = new Set([
  "home",
  "tanya",
  "ftes",
  "perlembagaan",
  "berita",
  "sertai",
  "saya",
  // Pre-2026 app tabs, still in shared links; the app maps them to their new homes.
  "members",
  "resources",
  "apply",
  "profile",
  "education",
  "employment",
  "emerging-tech",
  "emergingtech",
]);
const legacyAppHash = APP_TAB_HASHES.has(window.location.hash.slice(1).toLowerCase());

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
  if (isLeadership) void import("./landing/Leadership").then(({ Leadership }) => mount(<Leadership />));
  else void import("./landing/Landing").then(({ Landing }) => mount(<Landing />));
}

if (TARGET === "app") {
  void import("./App").then(({ App }) => mount(<App />));
} else if (TARGET === "site") {
  // Normally _redirects sends /app/* to the app domain before this runs; this is the fallback.
  if (underApp) window.location.replace(`${APP_URL}${route.slice(4)}${window.location.hash}`);
  else if (!isLeadership && legacyAppHash) window.location.replace(`${APP_URL}${window.location.hash}`);
  else mountSite();
} else if (!underApp && !isLeadership && legacyAppHash) {
  window.location.replace(`${APP_URL}${window.location.hash}`);
} else if (underApp) {
  void import("./App").then(({ App }) => mount(<App />));
} else {
  mountSite();
}
