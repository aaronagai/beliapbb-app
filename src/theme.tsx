import { useEffect, type ReactNode } from "react";

export type ThemeMode = "light" | "dark";

function applyTheme(mode: ThemeMode) {
  document.documentElement.setAttribute("data-theme", mode);
  document.documentElement.style.colorScheme = mode;
}

/**
 * Keeps the document theme locked to the operating-system appearance setting.
 *
 * The initial `data-theme` attribute is set pre-paint by the inline script in
 * index.html (so there's no flash); this provider keeps it in sync live when
 * the user flips their OS light/dark setting while the page is open.
 */
export function ThemeProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const sync = () => applyTheme(mq.matches ? "dark" : "light");
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  return <>{children}</>;
}
