# Astro Migration Notes

## Goals

- Keep Markdown content as the source of truth while rebuilding the site shell.
- Keep content, site data, presentation, and future interactive code in separate layers.
- Make a future migration to another framework easier by reducing Astro-specific lock-in.

## Current Structure

- `blog/_posts` and `blog/_notes`: existing writing content that remains editable in Markdown.
- `src/content.config.ts`: content layer bridge that reads the existing Markdown files.
- `src/data`: site data for navigation, featured projects, and tool metadata.
- `src/data/projects.ts`: project stories stored as data instead of being buried in page templates.
- `src/layouts` and `src/pages`: thin presentation layer for Astro pages.
- `src/pages/portfolio/[slug].astro`: case study route built from data, not from hardcoded page copies.
- `src/components/react/three`: reserved space for future React and Three.js islands.
- `.github/workflows/deploy-pages.yml`: GitHub Pages deployment pipeline for the Astro build.
- `scripts/postbuild.mjs`: post-build compatibility layer for redirects and Pages-specific files.

## Portability Rules

- Keep project data in `src/data`, not scattered through page markup.
- Keep Three.js code isolated in React components instead of embedding it directly into every page.
- Keep route-independent logic in `src/lib`.
- Prefer Markdown and data files as durable content sources.
- Use environment-driven site and base settings so GitHub Pages is not hardcoded into every file.
- Keep legacy redirects in a small post-build layer instead of scattering compatibility hacks across page templates.
