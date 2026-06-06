# Changelog

All notable changes to this project are documented in this file.

## 0.0.2.0 — 2026-06-06

### Added
- Light/dark theme with `ThemeProvider`, `localStorage` persistence, and flash-free boot script in `index.html`
- Footer theme toggle (`SiteFooter`) with bilingual labels
- Mobile hamburger navigation with collapsible menu and resize handling

### Changed
- Header layout uses a responsive grid on small screens and flex on desktop (`48rem` breakpoint)
- Semantic CSS variables in `index.css` for light/dark surfaces, text, and accents
- Partial migration of `App.css` to theme variables (news/membership sections still use legacy hex colors)
