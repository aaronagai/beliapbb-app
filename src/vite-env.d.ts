/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_CONSTITUTION_CHAT_API?: string;
  /** "site" (beliapbb.com), "app" (app.beliapbb.com) or unset for the combined build */
  readonly VITE_BUILD_TARGET?: "site" | "app";
  /** Public site origin, e.g. https://beliapbb.com — defaults to this build's base */
  readonly VITE_SITE_URL?: string;
  /** App origin, e.g. https://app.beliapbb.com — defaults to `${base}app/` */
  readonly VITE_APP_URL?: string;
  /** Apps Script web app URL that stores membership applications */
  readonly VITE_APPLICATION_ENDPOINT?: string;
}
