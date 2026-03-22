# Blog Project TODO

## Current Direction

### Deployment Constraint
- [x] Keep the project compatible with GitHub Pages static hosting.
- [x] Prefer workflows that can build to static assets and deploy cleanly with GitHub Actions.

### 1. Brand Upgrade
- [ ] Clarify the site's core positioning: personal brand site, technical blog, or both.
- [x] Redesign the home page so it better introduces Ash, key strengths, and featured work.
- [ ] Refresh the visual system so the blog, portfolio, CV, and tool pages feel unified.
- [x] Rework the portfolio page into a clearer project showcase instead of a media dump.
- [ ] Improve the CV page so it works as both an embedded resume and a concise online profile.

### 2. Content Experience Upgrade
- [x] Review the current information architecture for Blog, Notes, Tags, Portfolio, CV, and Tools.
- [x] Define a consistent writing template for posts and notes.
- [x] Improve archive, tag browsing, and reading flow.
- [ ] Decide which older notes should stay as raw study notes and which should be polished into articles.
- [ ] Create a content backlog for future featured posts and evergreen pages.

### 3. Technical Upgrade
- [x] Review whether VuePress 1 should be kept, upgraded, or replaced.
- [x] Make sure any future stack choice still fits GitHub Pages well.
- [ ] Reduce page-level inline styling and move toward a clearer global style structure.
  - Progress 2026-03-22: extracted shared panel padding and ThreeMigrationCard spacing into `src/styles/global.css`, removing a first batch of repeated inline styles.
- [ ] Review old dependencies and remove unused or experimental pieces where appropriate.
- [x] Improve deployment workflow and reduce reliance on manual release steps.
- [ ] Add basic project maintenance tooling if needed, such as linting or build checks.

## Open Decision: React Migration
- [ ] Current recommendation: do not migrate to React immediately.
- [ ] Decide whether this project should stay content-first on VuePress or move to a React-based stack.
- [ ] If moving to React, keep the solution compatible with static export on GitHub Pages.
- [ ] If migration is considered, compare the value of React against keeping the current static-site workflow.
- [ ] Only migrate if the future site needs richer component-driven interaction, stronger design flexibility, or a longer-term platform refresh.

## Suggested Starting Order
- [ ] First: clarify positioning and desired site outcome.
- [ ] Second: redesign the home page and portfolio structure.
- [ ] Third: tidy content architecture and templates.
- [ ] Fourth: revisit React or another framework migration after the product direction is clearer.
