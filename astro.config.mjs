import { defineConfig } from "astro/config";
import react from "@astrojs/react";
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

function getSiteUrl() {
  if (process.env.SITE_URL) {
    return process.env.SITE_URL;
  }

  const { owner } = getRepositoryContext();

  if (owner) {
    return `https://${owner}.github.io`;
  }

  return "https://zblcool.github.io";
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
  integrations: [react()],
  markdown: {
    remarkPlugins: [remarkMath],
    rehypePlugins: [rehypeKatex],
  },
});
