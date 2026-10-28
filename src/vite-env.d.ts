/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_CONSTITUTION_CHAT_API?: string;
  /** Public site origin, e.g. https://beliapbb.com — defaults to this build's base */
  readonly VITE_SITE_URL?: string;
  /** App origin, e.g. https://app.beliapbb.com — defaults to `${base}app/` */
  readonly VITE_APP_URL?: string;
}
