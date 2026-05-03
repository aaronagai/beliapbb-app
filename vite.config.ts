import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

/**
 * GitHub project Pages is served from https://<user>.github.io/<repo>/.
 * CI sets BASE_PATH=/beliapbb-app/ so asset URLs resolve. Local dev uses "/".
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
