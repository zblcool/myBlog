# Ash Zhang's Blog

## Site

[Live site](https://zblcool.github.io)

> This is my personal blog that stores the thought I had and the notes I took during the exploration of broad areas.

This site started on VuePress and is now being migrated to Astro with a data-first structure that keeps content, project metadata, and interactive components easier to move later.

## Local Development

```bash
nvm use
yarn install
yarn dev
```

Legacy VuePress commands are still available during migration:

```bash
yarn legacy:dev
yarn legacy:build
```

## GitHub Pages Deployment

The repository now includes a GitHub Actions workflow that builds and deploys the Astro site to GitHub Pages from `master`.

- If this repository is used as a project page, the Astro `base` path is derived automatically from the repository name.
- If you use a custom domain or a root user page, set repository variables in GitHub:
  - `SITE_URL`
  - `BASE_PATH`
  - `CNAME_DOMAIN`

Examples:

- Project page on `https://zblcool.github.io/myBlog`: leave the variables empty.
- Root site or custom domain: set `SITE_URL` to your final origin and set `BASE_PATH` to `/`.

## URL Compatibility

The Astro build writes legacy redirect files for old GitHub Pages tag URLs such as:

- `/tag/Computer%20Graphics/`
- `/tag/C++/`
- `/tag/C%23/`
- `/notes/page/2/`

These redirects help old bookmarks and indexed URLs survive the migration.
