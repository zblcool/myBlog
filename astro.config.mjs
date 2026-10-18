import { readFileSync } from "node:fs";
import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";

function normalizeBase(rawBase = "/") {
  if (!rawBase || rawBase === "/") {
    return "/";
  }

  const trimmed = rawBase.replace(/^\/+|\/+$/g, "");
  return `/${trimmed}/`;
}

function getRepositoryContext() {
  const repository = process.env.GITHUB_REPOSITORY;
  const owner = process.env.GITHUB_REPOSITORY_OWNER;

  if (!repository) {
    return {
      owner,
      name: undefined,
    };
  }

  const [, name] = repository.split("/");

  return {
    owner,
    name,
  };
}

/** The site's own domain (GitHub Pages custom domain); SITE_URL overrides it. */
const DEFAULT_SITE_URL = "https://ashmartisan.com";

function getSiteUrl() {
  return process.env.SITE_URL || DEFAULT_SITE_URL;
}

function getBasePath(siteUrl) {
  if (process.env.BASE_PATH) {
    return normalizeBase(process.env.BASE_PATH);
  }

  const { owner, name } = getRepositoryContext();

  if (!name) {
    return "/";
  }

  if (siteUrl && !siteUrl.includes("github.io")) {
    return "/";
  }

  if (owner && name.toLowerCase() === `${owner}.github.io`.toLowerCase()) {
    return "/";
  }

  return normalizeBase(name);
}

const site = getSiteUrl();
const base = getBasePath(site);

/**
 * lastmod for posts and notes: the publish date their built page already carries
 * (sitemap entries are written after the pages, so the HTML is in dist/ by then).
 */
function publishedDate(pageUrl) {
  const pathname = decodeURIComponent(new URL(pageUrl).pathname).slice(base.length);
  try {
    const html = readFileSync(new URL(`./dist/${pathname}index.html`, import.meta.url), "utf8");
    return html.match(/<meta property="article:published_time" content="([^"]+)"/)?.[1];
  } catch {
    return undefined;
  }
}

export default defineConfig({
  site,
  base,
  integrations: [
    react(),
    // The Chinese copy at /zh/ is reachable by URL only, so it stays out of the sitemap.
    sitemap({
      filter: (page) => !new URL(page).pathname.startsWith(`${base}zh/`),
      serialize(item) {
        const lastmod = publishedDate(item.url);
        return lastmod ? { ...item, lastmod } : item;
      },
    }),
  ],
  markdown: {
    remarkPlugins: [remarkMath],
    rehypePlugins: [rehypeKatex],
  },
  vite: {
    // Dev only: pre-bundling Babylon splits its lazily imported shaders into chunks that register
    // with a second copy of its shader store, and shaders then fail to load. Serve it unbundled.
    optimizeDeps: { exclude: ["@babylonjs/core", "@babylonjs/loaders"] },
  },
});
