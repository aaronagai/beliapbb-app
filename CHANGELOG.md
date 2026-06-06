# Changelog

All notable changes to this project are documented in this file.

## 0.0.3.0 — 2026-06-06

### Added
- Expanded site footer with wing branding, site/resource link groups, and bilingual copyright
- Universal Sans font wiring (`src/fonts/universal-sans.css`) with Inter fallback for footer brand typography
- Membership card checkmark asset and refreshed home membership styling
- Footer and header i18n strings (Apply label, language toggle aria, footer nav headings)

### Changed
- Footer layout and theme/language controls redesigned for mobile and desktop
- App shell CSS polish across header, membership card, and global theme variables
- Google Fonts preload in `index.html` (DM Sans + Inter)

## 0.0.2.1 — 2026-06-06

### Changed
- Header navigation is always behind a hamburger menu (dropdown on all breakpoints)
- Red header button is now **Apply** and navigates to the membership application tab
- Hamburger icon uses CSS line animation; Escape closes the menu

### Removed
- Constitution AI chat entry point from the header (component remains in repo for future wiring)

## 0.0.2.0 — 2026-06-06

### Added
- Light/dark theme with `ThemeProvider`, `localStorage` persistence, and flash-free boot script in `index.html`
- Footer theme toggle (`SiteFooter`) with bilingual labels
- Mobile hamburger navigation with collapsible menu and resize handling

### Changed
- Header layout uses a responsive grid on small screens and flex on desktop (`48rem` breakpoint)
- Semantic CSS variables in `index.css` for light/dark surfaces, text, and accents
- Partial migration of `App.css` to theme variables (news/membership sections still use legacy hex colors)
