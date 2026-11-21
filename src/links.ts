/**
 * Where the public site and the app live. The combined build serves both from one origin
 * (site at `/`); the split builds (VITE_BUILD_TARGET=site|app) default to beliapbb.com. The app build is now only
 * a redirect to beliapbb.com. VITE_SITE_URL overrides it.
 */
const BASE = import.meta.env.BASE_URL;
const SPLIT = import.meta.env.VITE_BUILD_TARGET === "site" || import.meta.env.VITE_BUILD_TARGET === "app";

function withSlash(url: string) {
  return url.endsWith("/") ? url : `${url}/`;
}

export const SITE_URL = withSlash(
  import.meta.env.VITE_SITE_URL?.trim() || (SPLIT ? "https://beliapbb.com/" : BASE),
);

/** Pages of the (former) app that now live on the public site. */
export const SITE_PAGES = ["sertai", "tanya", "ftes", "perlembagaan"] as const;
export type SitePage = (typeof SITE_PAGES)[number];

/** Old app addresses (app.beliapbb.com/#tab and pre-2026 hashes) → where they live now. "" = the landing page. */
export const LEGACY_HASH_TO_PATH: Record<string, string> = {
  sertai: "sertai",
  apply: "sertai",
  resources: "sertai",
  tanya: "tanya",
  ftes: "ftes",
  perlembagaan: "perlembagaan",
  members: "kepimpinan",
  home: "",
  berita: "",
  saya: "",
  profile: "",
  education: "",
  employment: "",
  emergingtech: "",
  "emerging-tech": "",
};

/** A page of the old app, e.g. appLink("ftes") → https://beliapbb.com/ftes/ (kept so the landing's links stay short) */
export const appLink = (hash = "") => (SITE_PAGES.includes(hash as SitePage) ? `${SITE_URL}${hash}/` : SITE_URL);

/** A page on the public site, e.g. siteLink("kepimpinan/") */
export const siteLink = (path = "") => `${SITE_URL}${path}`;

export const LEADERSHIP_URL = siteLink("kepimpinan/");
