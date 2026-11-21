/**
 * Visits and a few named actions, nothing more. Same approach as sarawakseats.org: PostHog loaded
 * from its CDN, only on beliapbb.com and app.beliapbb.com, no cookies or storage (persistence
 * "memory", so no consent banner), no autocapture, no session recording, no surveys or feature
 * flags, all text masked, query strings stripped.
 *
 * NEVER send anything typed into the application: no names, IC numbers, addresses, phone numbers,
 * e-mail, cawangan or answers. Events carry only which step/page/button, and yes/no flags.
 *
 * On by default with the project key above (VITE_POSTHOG_KEY overrides it, e.g. to point at another project);
 * it still only runs on the two production hostnames.
 * Each domain is its own anonymous visit: landing → app is linked through the referrer, not a user id.
 */
import { SITE_PAGES, SITE_URL } from "./links";

/** Project token of the "Belia PBB" PostHog project (US cloud). Write-only and public by design, like on sarawakseats.org. */
const PROJECT_KEY = "phc_qhFLEqCutCAfZonXqTUeiHahdPMpfpGEFFuvPu6nEseV";
const KEY = import.meta.env.VITE_POSTHOG_KEY?.trim() || PROJECT_KEY;
const HOST_OK = /(^|\.)beliapbb\.com$/.test(window.location.hostname);
export const analyticsEnabled = Boolean(KEY) && HOST_OK;

type Props = Record<string, string | number | boolean | null>;
type PostHog = { init: (key: string, options: Record<string, unknown>) => void; capture: (event: string, props?: Props, options?: Record<string, unknown>) => void };

const queue: [string, Props, Record<string, unknown>?][] = [];
let ph: PostHog | null = null;
let kind: "app" | "site" = "site";

/** The address without its query string, as sent with every event. */
const cleanUrl = () => window.location.origin + window.location.pathname + window.location.hash;

function baseProps(): Props {
  return { site: kind, phone: window.matchMedia("(max-width: 768px)").matches, $current_url: cleanUrl() };
}

/** `beacon` sends immediately in a way that survives the page being left (e.g. a click that navigates away). */
export function track(event: string, props: Props = {}, beacon = false): void {
  if (!analyticsEnabled) return;
  const p = { ...baseProps(), ...props };
  const options = beacon ? { send_instantly: true, transport: "sendBeacon" } : undefined;
  if (ph) ph.capture(event, p, options);
  else if (queue.length < 50) queue.push([event, p, options]);
}

/** Load PostHog and send page views. `watchHash` is for the app, where each tab is a hash. */
export function initAnalytics(options: { kind: "app" | "site"; watchHash: boolean }): void {
  if (!analyticsEnabled) return;
  kind = options.kind;

  const script = document.createElement("script");
  script.async = true;
  script.crossOrigin = "anonymous";
  script.src = "https://us-assets.i.posthog.com/static/array.full.js";
  script.onload = () => {
    const lib = (window as unknown as { posthog?: PostHog }).posthog;
    if (!lib?.init) return;
    lib.init(KEY, {
      api_host: "https://us.i.posthog.com",
      persistence: "memory",
      autocapture: false,
      capture_pageview: false,
      capture_pageleave: true,
      disable_session_recording: true,
      disable_surveys: true,
      advanced_disable_feature_flags: true,
      person_profiles: "identified_only",
      mask_all_text: true,
      mask_all_element_attributes: true,
      sanitize_properties: (p: Record<string, unknown>) => {
        for (const k of ["$current_url", "$referrer", "$initial_current_url"]) {
          if (typeof p[k] === "string") p[k] = (p[k] as string).replace(/\?[^#]*/, "");
        }
        return p;
      },
    });
    ph = lib;
    for (const [event, props, options] of queue.splice(0)) lib.capture(event, props, options);
  };
  document.head.appendChild(script);

  let last: string | null = null;
  let timer: number | undefined;
  const view = () => {
    window.clearTimeout(timer);
    timer = window.setTimeout(() => {
      const url = window.location.pathname + (options.watchHash ? window.location.hash : "");
      if (url === last) return;
      last = url;
      track("$pageview");
    }, 700);
  };
  if (options.watchHash) window.addEventListener("hashchange", view);
  view();
}

/** Landing page: which button or link sent someone into the app, and from which part of the page. */
export function trackAppLinks(): void {
  if (!analyticsEnabled) return;
  const siteOrigin = new URL(SITE_URL, window.location.href).href;
  document.addEventListener(
    "click",
    (e) => {
      const a = (e.target as Element | null)?.closest?.("a[href]") as HTMLAnchorElement | null;
      if (!a || !a.href.startsWith(siteOrigin)) return;
      const to = a.href.slice(siteOrigin.length).split(/[/?#]/)[0];
      if (!(SITE_PAGES as readonly string[]).includes(to)) return; // only links to the join flow / assistants
      const where = a.closest(".lp-nav")
        ? "nav"
        : a.closest(".lp-hero")
          ? "hero"
          : a.closest(".lp-cta")
            ? "cta"
            : a.closest("footer")
              ? "footer"
              : (a.closest("section[id]")?.id ?? "page");
      track("app_link_click", { to, where }, true);
    },
    true,
  );
}

/** Fire an event once, the first time an element is mostly on screen. */
export function trackOnceVisible(el: Element | null, event: string): () => void {
  if (!analyticsEnabled || !el || typeof IntersectionObserver === "undefined") return () => {};
  const io = new IntersectionObserver(
    (entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        track(event);
        io.disconnect();
      }
    },
    { threshold: 0.4 },
  );
  io.observe(el);
  return () => io.disconnect();
}
