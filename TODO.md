# Blog Project TODO

## Current Direction

### Deployment Constraint
- [x] Keep the project compatible with GitHub Pages static hosting.
- [x] Prefer workflows that can build to static assets and deploy cleanly with GitHub Actions.

### 1. Brand Upgrade
- [x] Clarify the site's core positioning: personal brand site, technical blog, or both.
- [x] Redesign the home page so it better introduces Ash, key strengths, and featured work.
- [x] Refresh the visual system so the blog, portfolio, CV, and tool pages feel unified.
  - Progress 2026-03-22: introduced a shared `PageMasthead` surface and fact-card system across archive, tag, portfolio, CV, and tool pages to align page headers, actions, and summary metrics.
- [x] Rework the portfolio page into a clearer project showcase instead of a media dump.
- [x] Improve the CV page so it works as both an embedded resume and a concise online profile.

### 2. Content Experience Upgrade
- [x] Review the current information architecture for Blog, Notes, Tags, Portfolio, CV, and Tools.
- [x] Define a consistent writing template for posts and notes.
- [x] Improve archive, tag browsing, and reading flow.
- [x] Decide which older notes should stay as raw study notes and which should be polished into articles.
- [x] Create a content backlog for future featured posts and evergreen pages.

### 3. Technical Upgrade
- [x] Review whether VuePress 1 should be kept, upgraded, or replaced.
- [x] Make sure any future stack choice still fits GitHub Pages well.
- [x] Reduce page-level inline styling and move toward a clearer global style structure.
  - Progress 2026-03-22: extracted shared panel padding and ThreeMigrationCard spacing into `src/styles/global.css`, removing a first batch of repeated inline styles.
  - Progress 2026-03-22: introduced shared `page-intro` and `page-actions` utilities in `src/styles/global.css`, replacing repeated intro-panel and archive action layout patterns across portfolio, CV, tools, posts, notes, and tag pages.
  - Progress 2026-03-22: extracted a shared `SectionHeader` component for repeated `section-head` page scaffolding across the home page, portfolio pages, tag pages, and archive year groups, reducing another batch of page-level presentation duplication.
  - Progress 2026-03-23: removed the remaining inline `style` attributes from the legacy `blog/README.md` home page, moving image layout/shadow and the section heading size into scoped stylesheet classes.
  - Progress 2026-03-23: centralized the remaining legacy VuePress `.content-wrapper` and embed wrapper rules in `blog/.vuepress/styles/index.styl`, and removed dead or duplicate page-local style blocks from the legacy CV, tool, and portfolio pages.
- [x] Review old dependencies and remove unused or experimental pieces where appropriate.
  - Progress 2026-03-22: kept legacy VuePress packages that still power `legacy:*` scripts and removed unused `@types/react-dom` after `yarn check` and `yarn build` passed on Node 22.17.0.
- [x] Improve deployment workflow and reduce reliance on manual release steps.
- [x] Add basic project maintenance tooling if needed, such as linting or build checks.
  - Progress 2026-03-22: deploy workflow now runs `yarn check` before `yarn build`, so type/content validation blocks broken deploys.

## 4. Architecture Direction
- [x] Commit to Astro as the primary site architecture and stop planning around legacy VuePress as a parallel path.
- [x] Keep the active architecture compatible with static export on GitHub Pages.
- [x] Use React only for isolated interactive islands when Astro alone is not enough.
- [x] Remove leftover VuePress maintenance hooks from the active toolchain.
  - Progress 2026-03-25: removed `legacy:*` scripts from `package.json`, dropped VuePress-only packages, updated the README to describe Astro as the active stack, and deleted the outdated manual deploy script that still targeted `blog/.vuepress/dist`.

## Suggested Starting Order
- [x] First: clarify positioning and desired site outcome.
- [x] Second: redesign the home page and portfolio structure.
- [x] Third: tidy content architecture and templates.
- [x] Fourth: commit to the Astro-first architecture and clear out leftover VuePress maintenance overhead.
