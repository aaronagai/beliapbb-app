import { useI18n } from "./i18n";
import { useTheme } from "./theme";

function IconSun() {
  return (
    <svg className="theme-toggle-icon" viewBox="0 0 24 24" aria-hidden>
      <path
        fill="currentColor"
        d="M12 7a5 5 0 100 10 5 5 0 000-10zm0-5a1 1 0 011 1v1.5a1 1 0 11-2 0V3a1 1 0 011-1zm0 19a1 1 0 011 1V22a1 1 0 11-2 0v-1.5a1 1 0 011-1zM3 12a1 1 0 011-1h1.5a1 1 0 110 2H4a1 1 0 01-1-1zm17.5 0a1 1 0 011-1H22a1 1 0 110 2h-1.5a1 1 0 01-1-1zM5.64 5.64a1 1 0 011.41 0l1.06 1.06a1 1 0 11-1.41 1.41L5.64 7.05a1 1 0 010-1.41zm12.02 12.02a1 1 0 011.41 0l1.06 1.06a1 1 0 11-1.41 1.41l-1.06-1.06a1 1 0 010-1.41zM18.36 5.64a1 1 0 010 1.41l-1.06 1.06a1 1 0 11-1.41-1.41l1.06-1.06a1 1 0 011.41 0zM6.7 17.66a1 1 0 010 1.41l-1.06 1.06a1 1 0 11-1.41-1.41l1.06-1.06a1 1 0 011.41 0z"
      />
    </svg>
  );
}

function IconMoon() {
  return (
    <svg className="theme-toggle-icon" viewBox="0 0 24 24" aria-hidden>
      <path
        fill="currentColor"
        d="M9.37 4.51A7.5 7.5 0 1018.5 15.63 6.5 6.5 0 019.37 4.51z"
      />
    </svg>
  );
}

export function SiteFooter() {
  const { t } = useI18n();
  const { theme, toggleTheme } = useTheme();

  return (
    <footer className="site-footer" aria-label={t("footerAria")}>
      <div className="site-footer-inner">
        <button
          type="button"
          className="theme-toggle"
          onClick={toggleTheme}
          aria-label={t("themeToggleAria")}
        >
          {theme === "dark" ? <IconSun /> : <IconMoon />}
          <span>{theme === "dark" ? t("themeLight") : t("themeDark")}</span>
        </button>
        <p className="site-footer-meta" translate="no">
          Belia PBB · beliapbb.app
        </p>
      </div>
    </footer>
  );
}
