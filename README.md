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

The repository now includes a GitHub Actions workflow that builds the Astro site from this source repository and pushes the generated `dist/` output to a separate GitHub Pages repository.

Current default target:

- source repo: `zblcool/myBlog`
- deploy repo: `zblcool/zblcool.github.io`
- deploy branch: `master`

### Required setup

1. Generate an SSH key pair for deployment.
2. Add the public key as a deploy key with write access on the target Pages repository.
3. Add the private key to this source repository as a secret named `PAGES_DEPLOY_KEY`.

`PAGES_DEPLOY_KEY` can be either:

- the raw private key content
- a base64-encoded copy of the private key content

Do not store the public key in this secret. If GitHub Actions reports `error in libcrypto`, the secret content is usually malformed or newline-normalized incorrectly.

### Optional repository variables

- `TARGET_PAGES_REPOSITORY`
- `TARGET_PAGES_BRANCH`
- `SITE_URL`
- `BASE_PATH`
- `CNAME_DOMAIN`

Examples:

- Deploy to `zblcool/zblcool.github.io` as the root site: leave `BASE_PATH` empty or set it to `/`.
- Deploy to a project Pages repo: set `SITE_URL` and `BASE_PATH` to match the final public URL.
- Use a custom domain: set `SITE_URL` to the public origin and `CNAME_DOMAIN` to the hostname.

If `TARGET_PAGES_REPOSITORY` is not set, the workflow defaults to `zblcool/zblcool.github.io`.
If `TARGET_PAGES_BRANCH` is not set, the workflow defaults to `master`.

## URL Compatibility

The Astro build writes legacy redirect files for old GitHub Pages tag URLs such as:

- `/tag/Computer%20Graphics/`
- `/tag/C++/`
- `/tag/C%23/`
- `/notes/page/2/`

These redirects help old bookmarks and indexed URLs survive the migration.
