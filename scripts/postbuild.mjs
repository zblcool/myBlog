import { mkdir, readdir, writeFile } from "node:fs/promises";
import path from "node:path";

const distDir = path.resolve("dist");

// The blog lives under /blog/ (the Ashmartisan site owns the root). Every page it builds also
// gets a redirect at its pre-move address, e.g. /post/foo/ → /blog/post/foo/.
const blogPrefix = "/blog";

const legacyRedirects = [
  // Hanzi Workshop was renamed Hanzi Hero (字海残卷).
  ["/blog/portfolio/hanzi-workshop/", "/blog/portfolio/hanzi-hero/"],
  ["/portfolio/hanzi-workshop/", "/blog/portfolio/hanzi-hero/"],
  ["/notes/page/2/", "/blog/notes/"],
  ["/notes/page/3/", "/blog/notes/"],
  ["/tag/Algorithms/", "/blog/tag/algorithms/"],
  ["/tag/C%23/", "/blog/tag/c-sharp/"],
  ["/tag/C++/", "/blog/tag/c-plus-plus/"],
  ["/tag/Clean%20Code/", "/blog/tag/clean-code/"],
  ["/tag/Computer%20Graphics/", "/blog/tag/computer-graphics/"],
  ["/tag/Computer%20Science/", "/blog/tag/computer-science/"],
  ["/tag/Data%20Visualization/", "/blog/tag/data-visualization/"],
  ["/tag/Database/", "/blog/tag/database/"],
  ["/tag/Front%20End/", "/blog/tag/front-end/"],
  ["/tag/Functional%20Programming/", "/blog/tag/functional-programming/"],
  ["/tag/Inspire/", "/blog/tag/inspire/"],
  ["/tag/Machine%20Learning/", "/blog/tag/machine-learning/"],
  ["/tag/Math/", "/blog/tag/math/"],
  ["/tag/Notes/", "/blog/tag/notes/"],
  ["/tag/Notes/page/2/", "/blog/tag/notes/"],
  ["/tag/Notes/page/3/", "/blog/tag/notes/"],
  ["/tag/Project%20Management/", "/blog/tag/project-management/"],
  ["/tag/React/", "/blog/tag/react/"],
  ["/tag/Softerware%20Development/", "/blog/tag/softerware-development/"],
  ["/tag/Tableau/", "/blog/tag/tableau/"],
  ["/tag/Unity/", "/blog/tag/unity/"],
  ["/tag/Vue/", "/blog/tag/vue/"],
];

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

function withBase(pathname) {
  const basePath = getBasePath(getSiteUrl());

  if (basePath === "/") {
    return pathname;
  }

  return `${basePath}${pathname.replace(/^\/+/, "")}`;
}

function createRedirectHtml(targetPath) {
  const escapedTarget = targetPath.replace(/"/g, "&quot;");

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <title>Redirecting...</title>
    <meta http-equiv="refresh" content="0; url=${escapedTarget}">
    <link rel="canonical" href="${escapedTarget}">
    <script>
      window.location.replace(${JSON.stringify(targetPath)});
    </script>
  </head>
  <body>
    <p>Redirecting to <a href="${escapedTarget}">${escapedTarget}</a>.</p>
  </body>
</html>
`;
}

async function writeRedirect(fromPath, toPath) {
  const relativePath = decodeURIComponent(fromPath).replace(/^\/+|\/+$/g, "");
  const destination = path.join(distDir, relativePath, "index.html");

  await mkdir(path.dirname(destination), { recursive: true });
  await writeFile(destination, createRedirectHtml(withBase(toPath)), "utf8");
}

/** Site paths ("/post/foo/") of every page built under dist/blog/, except the blog home. */
async function listBlogPages(dir = path.join(distDir, "blog"), prefix = "/") {
  const pages = [];

  for (const entry of await readdir(dir, { withFileTypes: true })) {
    if (!entry.isDirectory()) {
      continue;
    }

    const sitePath = `${prefix}${entry.name}/`;
    const children = await readdir(path.join(dir, entry.name));

    if (children.includes("index.html")) {
      pages.push(sitePath);
    }

    pages.push(...(await listBlogPages(path.join(dir, entry.name), sitePath)));
  }

  return pages;
}

async function main() {
  await writeFile(path.join(distDir, ".nojekyll"), "", "utf8");

  if (process.env.CNAME_DOMAIN) {
    await writeFile(
      path.join(distDir, "CNAME"),
      `${process.env.CNAME_DOMAIN}\n`,
      "utf8",
    );
  }

  const movedPages = await listBlogPages();
  await Promise.all(movedPages.map((page) => writeRedirect(page, `${blogPrefix}${page}`)));

  await Promise.all(
    legacyRedirects.map(([fromPath, toPath]) => writeRedirect(fromPath, toPath)),
  );
}

await main();
