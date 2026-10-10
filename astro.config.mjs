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

export default defineConfig({
  site,
  base,
  integrations: [react(), sitemap()],
  markdown: {
    remarkPlugins: [remarkMath],
    rehypePlugins: [rehypeKatex],
  },
});
