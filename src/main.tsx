import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./fonts/geist.css";
import "./index.css";
import { App } from "./App";
import { Landing } from "./landing/Landing";
import { Leadership } from "./landing/Leadership";
import { I18nProvider } from "./i18n";
import { ThemeProvider } from "./theme";

const base = import.meta.env.BASE_URL;
const route = window.location.pathname.startsWith(base)
  ? window.location.pathname.slice(base.length)
  : "";
const isApp = route === "app" || route.startsWith("app/");
const isLeadership = route === "kepimpinan" || route.startsWith("kepimpinan/");

// Links shared before the landing page existed (e.g. /#ftes) belong to the app.
// Only the app's tab hashes move; the landing's own anchors (#ciri, #soalan) stay.
const APP_TAB_HASHES = new Set([
  "home",
  "members",
  "resources",
  "apply",
  "profile",
  "ftes",
  "education",
  "employment",
  "emerging-tech",
  "emergingtech",
]);
const legacyAppHash = APP_TAB_HASHES.has(window.location.hash.slice(1).toLowerCase());

if (!isApp && !isLeadership && legacyAppHash) {
  window.location.replace(`${base}app/${window.location.hash}`);
} else {
  createRoot(document.getElementById("root")!).render(
    <StrictMode>
      <ThemeProvider>
        <I18nProvider>{isApp ? <App /> : isLeadership ? <Leadership /> : <Landing />}</I18nProvider>
      </ThemeProvider>
    </StrictMode>
  );
}
