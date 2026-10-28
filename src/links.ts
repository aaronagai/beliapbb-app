/**
 * Where the public site and the app live. The combined build serves both from one origin
 * (site at `/`, app at `/app/`); the split builds (VITE_BUILD_TARGET=site|app) default to
 * beliapbb.com and app.beliapbb.com. VITE_SITE_URL / VITE_APP_URL override either.
 */
const BASE = import.meta.env.BASE_URL;
const SPLIT = import.meta.env.VITE_BUILD_TARGET === "site" || import.meta.env.VITE_BUILD_TARGET === "app";

function withSlash(url: string) {
  return url.endsWith("/") ? url : `${url}/`;
}

export const SITE_URL = withSlash(
  import.meta.env.VITE_SITE_URL?.trim() || (SPLIT ? "https://beliapbb.com/" : BASE),
);
export const APP_URL = withSlash(
  import.meta.env.VITE_APP_URL?.trim() || (SPLIT ? "https://app.beliapbb.com/" : `${BASE}app/`),
);

/** A page inside the app, e.g. appLink("ftes") → /app/#ftes */
export const appLink = (hash = "") => (hash ? `${APP_URL}#${hash}` : APP_URL);

/** A page on the public site, e.g. siteLink("kepimpinan/") */
export const siteLink = (path = "") => `${SITE_URL}${path}`;

export const LEADERSHIP_URL = siteLink("kepimpinan/");
