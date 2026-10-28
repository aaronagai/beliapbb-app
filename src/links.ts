/**
 * Where the public site and the app live. Today both are served from one build (site at `/`,
 * app at `/app/`); when the app moves to app.beliapbb.com, set VITE_SITE_URL and VITE_APP_URL
 * and every cross-link follows.
 */
const BASE = import.meta.env.BASE_URL;

function withSlash(url: string) {
  return url.endsWith("/") ? url : `${url}/`;
}

export const SITE_URL = withSlash(import.meta.env.VITE_SITE_URL?.trim() || BASE);
export const APP_URL = withSlash(import.meta.env.VITE_APP_URL?.trim() || `${BASE}app/`);

/** A page inside the app, e.g. appLink("ftes") → /app/#ftes */
export const appLink = (hash = "") => (hash ? `${APP_URL}#${hash}` : APP_URL);

/** A page on the public site, e.g. siteLink("kepimpinan/") */
export const siteLink = (path = "") => `${SITE_URL}${path}`;

export const LEADERSHIP_URL = siteLink("kepimpinan/");
