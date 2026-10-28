import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

/**
 * Served from the custom domain https://beliapbb.com/ (root path).
 * BASE_PATH can override the base if the site is ever served from a subpath.
 */
function baseFromEnv(): string {
  const raw = process.env.BASE_PATH?.trim();
  if (!raw || raw === "/") return "/";
  return raw.endsWith("/") ? raw : `${raw}/`;
}

export default defineConfig({
  base: baseFromEnv(),
  plugins: [react()],
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:8787",
        changeOrigin: true,
      },
    },
  },
});
