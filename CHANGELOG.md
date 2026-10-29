# Changelog

All notable changes to this project are documented in this file.

## 0.0.11.2 — 2026-10-29

### Fixed
- Kepimpinan cards: name and position are centred beside the photo, spacing is even, and the social icons line up with the text edge on phones as well as laptops

## 0.0.11.1 — 2026-10-29

### Changed
- Kepimpinan reads one Google Sheet ("Kepimpinan Belia PBB Sarawak") with two tabs, Majlis Tertinggi and Ketua Belia Cawangan, instead of two separate sheets

## 0.0.11.0 — 2026-10-28

### Changed
- Moved hosting from GitHub Pages to Cloudflare Pages: beliapbb.com and www serve the site (landing, /kepimpinan), app.beliapbb.com serves the app
- Old links keep working: beliapbb.com/app/… and beliapbb.com/#ftes-style links forward to the same place on app.beliapbb.com
- DNS moved to Cloudflare; hello@beliapbb.com forwarding moves to Cloudflare Email Routing

### Removed
- GitHub Pages deploy workflow and CNAME file

## 0.0.10.2 — 2026-10-28

### Added
- Separate builds for the two domains: `npm run build:site` (beliapbb.com, with `/app/*` redirecting to app.beliapbb.com) and `npm run build:app` (app.beliapbb.com, app at the root with its own install manifest), ready for Cloudflare Pages
- Each split build ships only its own code; the combined build used on GitHub Pages now loads the site and app halves on demand

## 0.0.10.1 — 2026-10-28

### Added
- Membership applications (Sertai tab) are sent to a private Google Sheet through an Apps Script web app (`scripts/apps-script/permohonan.gs`): each application gets a reference number (BPBB-YYYY-NNNNN) and a "Baharu" status for the secretariat, and hello@beliapbb.com gets a short alert (name and cawangan only)
- The form checks required fields and the 12-digit IC number before sending, shows "Menghantar…", then the reference number; if sending fails, the details stay saved on the device

### Security
- The receiving script validates every field, stores all answers as plain text (no formulas, IC and phone numbers keep their leading zeros), caps submissions at 30 a minute and drops bot submissions caught by a hidden field

## 0.0.10.0 — 2026-10-28

### Changed
- App restructured around a 5-tab bar: Utama, Tanya, Berita, Sertai, Saya (bottom bar on phones, header pill on laptops)
- Tanya hub for both AI assistants; the constitution chat (Perlembagaan AI) is now reachable as its own screen
- Membership card on Utama is a clearly labelled sample built from the visitor's own profile (no QR code or verified tick)
- App styling matches the landing page: neutral colours, Geist 400/500
- All cross-links between site and app come from one place (`src/links.ts`), ready for app.beliapbb.com
- Old app links (#apply, #profile, #resources, #education, …) land on their new tabs; #members goes to /kepimpinan

### Removed
- Ahli list (now /kepimpinan), Kenali Parti, Sayap Parti, the empty focus pages, the welcome pop-up, the floating Join button and the old footer
- Unused images, styles, translation strings and the QR code library

## 0.0.9.2 — 2026-10-28

### Added
- Kepimpinan page (beliapbb.com/kepimpinan): Majlis Tertinggi grid (photo or initials, position, cawangan, social and WhatsApp links) and a searchable list of Ketua Belia Cawangan for all 82 DUN
- Kepimpinan reads two Google Sheets live, so the committee can edit names, photos and links without a deploy; falls back to the bundled list if the sheets can't be reached
- Landing: "Tentang Belia PBB" section with a scroll-linked statement and three numbered points
- Landing: party structure section (Majlis Kerja Tertinggi, Wanita dan Pemuda, Belia PBB) with illustration placeholders
- "Kepimpinan" link in the landing nav and footer

### Changed
- Ketua Belia Cawangan list updated from the 2025/27 spreadsheet; all 82 DUN now have a leader

## 0.0.9.1 — 2026-10-28

### Changed
- Landing hero follows Mobbin: the headline lines blur in, gaps open and app icons resolve into the words, then one icon at a time cross-fades to another
- New app-icon set (squircle icons with one glyph each) replaces the stickers across the landing page
- Calmer palette and type: neutrals only with colour kept to the icons, black buttons, and weights capped at 500 (no more faux-bold headings)

### Removed
- Floating sticker burst, sticker characters and mascot

## 0.0.9.0 — 2026-10-28

### Added
- New landing page at beliapbb.com: "Minat dengan pembangunan belia di Sarawak?" headline with app-icon tiles that cycle through stickers, an illustrated sticker burst (hornbill, hibiscus, mascot and friends), app preview, feature cards, FAQ and a join call-to-action, in BM and English
- Site is served from the custom domain beliapbb.com

### Changed
- The app now lives at `/app/`; the home-screen app opens there
- Old links such as `beliapbb.com/#ftes` forward to the same page in the app

## 0.0.8.2 — 2026-10-24

### Added
- Every page now has its own URL (`#ftes`, `#education`, …): Back/Forward move between pages, refresh stays put, links are shareable
- Ask FTES entry points: card on the home page and the Education page, and a footer link
- Ask FTES top bar shows "Belia PBB / Tanya FTES": the logo goes to the app home, "Tanya FTES" returns to the FTES landing
- Language switch in the Ask FTES footer

### Fixed
- Back from an FTES chat returns to the FTES landing instead of leaving the site; coming back restores the chat (kept for this tab only)
- A fast first reply could be overwritten by the ask-bar transition, leaving a question with no answer
- "Not connected yet" state no longer leaves the ask bar disabled

## 0.0.8.1 — 2026-10-24

### Changed
- Ask FTES: Inter display type and an X-blog-style monochrome palette (light by default, inverted in dark theme); photos are the only colour
- Ask FTES polish: fading example placeholder, solid ask dock with scrim, balanced two-column feature rows, pill "Ask a question" buttons, document cards labelled with the real FTES sources

### Removed
- Newsreader font

## 0.0.8.0 — 2026-10-24

### Added
- Ask FTES (`#ftes`): America.gov-style AI chat page for the Sarawak Free Tertiary Education Scheme — hero ask bar with rotating example questions and photo carousel, scroll-reveal manifesto, feature rows, sticky ask dock, cited answers with source cards (BM/EN)
- `/api/ftes-chat` RAG endpoint and `npm run ingest:ftes` script
- FTES source texts in `server/data/ftes-sources/` (MEITD booklet and FAQ, Swinburne, Curtin and i-CATS FAQs, UKAS and news coverage)
- Newsreader display font

## 0.0.7.3 — 2026-08-24

### Changed
- Latest news feed no longer pins a specific Jiwa Bakti article; shows the six most recent items

## 0.0.7.2 — 2026-08-24

### Changed
- OpenAI-style design tokens: subtler borders, `--color-bg-subtle`, refined light/dark palettes, header frost and shadow
- Hamburger nav overlay typography, spacing, and secondary link hover underlines
- Footer: subtle background, sentence-case column titles, external link arrows on wiki/PDF/Jiwa Bakti links, refined social and language bar
- Join FAB, home greeting, focus agenda titles, and in-content link hover underlines
- `ExternalLinkArrowIcon` stroke weight; body font smoothing and kerning

## 0.0.7.1 — 2026-06-24

### Added
- Open Graph and Twitter Card meta tags in `index.html` for link previews
- Branded share image assets `public/og-image.png` and `public/og-image.svg` (1200×630)

## 0.0.7.0 — 2026-06-24

### Added
- Full-screen hamburger navigation overlay (OpenAI-style) with primary/secondary links and escape-to-close
- Footer social icon row and footer-only language pill (globe + language name)
- Local focus agenda photos in `public/focus/` with 16:9 desktop card aspect
- Shared `ExternalLinkArrowIcon` and `FooterSocialIcons` components
- Setiausaha Eksekutif cawangan option on the membership application form

### Changed
- Site brand unified to **Belia PBB** (header, document titles, welcome modal, membership card)
- Focus Agenda section uses title case headings and refreshed card layout
- Home section order and Kenali/Sayap polish; membership card logo alignment
- Nav overlay dark-mode logo treatment; language toggle removed from header (footer only)
- Footer copyright: Belia PBB © 2026 with bilingual i18n strings

## 0.0.6.0 — 2026-06-24

### Added
- Kenali Parti Instagram-style story row with photos (`public/kenali/`) and i18n labels
- Sayap party wings horizontal carousel with updated PNG wing imagery
- Floating join CTA (`JoinFab`) with Caveat pencil annotation
- Welcome modal, focus agenda section, agenda placeholder route, and shared `Logo` component
- Self-hosted Geist Sans and Caveat via `@fontsource`; `assets/` for bundled imagery
- Nav icon (`navicon.svg`) for PWA manifest and document favicon

### Changed
- Home layout and `App.css`: immersive header on hero, nav scrim, carousel spacing, and dead-space fixes
- `PartyWingsSection`, `LatestNews`, footer, membership card, and profile polish
- Replaced legacy root `logo.svg` / JPEG–WebP sayap assets with PNG pipeline

## 0.0.5.0 — 2026-06-06

### Changed
- Typography simplified to Inter only; removed Universal Sans wiring and unused font assets

### Removed
- `src/fonts/universal-sans.css` and `public/fonts/` placeholder

## 0.0.4.0 — 2026-06-06

### Changed
- App-wide typography uses Universal Sans with Inter fallback (replaces DM Sans on body and UI)
- Google Fonts preload trimmed to Inter only; favicon and profile icons use the same stack
- Membership card top party-color stripe removed for a cleaner card face

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
