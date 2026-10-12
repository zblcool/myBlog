# Ash Zhang's Blog

## Site

[Live site](https://ashmartisan.com)

> The Ashmartisan business site at the root, and my personal blog (thoughts and notes from exploring broad areas) under `/blog/`.

This site started on VuePress and now runs on an Astro-first architecture. Markdown content in `blog/_posts` and `blog/_notes` remains the source of truth, while `src/` contains the active site shell, structured data, and interactive islands.

## Site Structure

One Astro build serves two sites on the same domain:

| Path | What | Code |
|---|---|---|
| `/`, `/privacy/` | **Ashmartisan** business site (English), built around the [Interactive Equipment Explainer](https://github.com/zblcool/Interactive-Equipment-Explainer) | `src/studio/` (copy in `src/studio/i18n/en.ts`; `zh.ts` is an unpublished translation), assets in `public/studio/` |
| `/blog/…` | Personal blog, portfolio and CV | `src/pages/blog/`, `src/components/`, `src/layouts/BaseLayout.astro` |

The two sites share nothing but `src/lib/paths.ts`; each layout imports its own stylesheet, so their CSS never mixes. The business site deliberately does not link to the blog; the blog is reachable at `/blog/` and links back to the root.
The blog moved from the root to `/blog/`: `scripts/postbuild.mjs` writes a redirect at every pre-move address (`/post/…`, `/notes/…`, `/tag/…`, `/portfolio/…`, `/cv/`, `/tool/`).

Ashmartisan wiring comes from optional `PUBLIC_*` variables (see `.env.example`; in CI set them as repository variables):
`PUBLIC_DEMO_URL` (overrides the explainer address; defaults to its Vercel deployment), `PUBLIC_FORM_ENDPOINT` (overrides the Formspree form), `PUBLIC_ANALYTICS_DOMAIN`.

The product renders in `public/studio/shots/` are frames captured from the explainer's canvas, one per device and view (`<id>.webp`, `<id>-xray.webp`, …). Model credits are in `src/studio/data/devices.ts`.

### Product pages (`/showcase/<device>/`)

One brochure-style page per demo device (`src/pages/showcase/[device].astro`, content in `src/studio/data/products.ts`): a structure diagram whose numbered labels open the live demo on that part (`?part=<annotation id>`), what the demo shows, technical data tables and a strip of views. Part names, specs and parameters are copied from the explainer's `src/locales/en/devices/<id>.json`; re-sync them there when the demo copy changes.

The diagram images in `public/studio/products/` are transparent cut-outs from the explainer's overview camera, with each annotation's anchor projected into them (`diagram.anchors`, % of the image). To re-capture one, run the explainer's dev server, open `?equipment=<id>`, and in the console use the dev handle `window.__viewer.controller`:
1. Hide everything that isn't the model: disable `scene.meshes` that aren't in `session.shownMeshes` or one of their ancestors (the glTF `__root__` is a mesh too), disable `scene.layers`, and `scene.clearColor.set(0, 0, 0, 0)`.
2. `engine.setHardwareScalingLevel(0.5); engine.resize()` for a 2× render.
3. Project the model's bounding boxes and each `session.annotations.getWorldPoint(id)` with `scene.getTransformMatrix()` into canvas pixels.
4. Crop the canvas to the model plus a 5 % margin, save it as WebP, and store the anchors as percentages of the crop.

## Local Development

```bash
nvm use
yarn install
yarn dev
yarn check
yarn build
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

Optional:

- `PAGES_DEPLOY_KEY_PASSPHRASE` if the private key is encrypted with a passphrase

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

These redirects help old bookmarks and indexed URLs survive the architecture transition.
