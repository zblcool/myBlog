import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const distDir = path.resolve("dist");

const legacyRedirects = [
  ["/notes/page/2/", "/notes/"],
  ["/notes/page/3/", "/notes/"],
  ["/tag/Algorithms/", "/tag/algorithms/"],
  ["/tag/C%23/", "/tag/c-sharp/"],
  ["/tag/C++/", "/tag/c-plus-plus/"],
  ["/tag/Clean%20Code/", "/tag/clean-code/"],
  ["/tag/Computer%20Graphics/", "/tag/computer-graphics/"],
  ["/tag/Computer%20Science/", "/tag/computer-science/"],
  ["/tag/Data%20Visualization/", "/tag/data-visualization/"],
  ["/tag/Database/", "/tag/database/"],
  ["/tag/Front%20End/", "/tag/front-end/"],
  ["/tag/Functional%20Programming/", "/tag/functional-programming/"],
  ["/tag/Inspire/", "/tag/inspire/"],
  ["/tag/Machine%20Learning/", "/tag/machine-learning/"],
  ["/tag/Math/", "/tag/math/"],
  ["/tag/Notes/", "/tag/notes/"],
  ["/tag/Notes/page/2/", "/tag/notes/"],
  ["/tag/Notes/page/3/", "/tag/notes/"],
  ["/tag/Project%20Management/", "/tag/project-management/"],
  ["/tag/React/", "/tag/react/"],
  ["/tag/Softerware%20Development/", "/tag/softerware-development/"],
  ["/tag/Tableau/", "/tag/tableau/"],
  ["/tag/Unity/", "/tag/unity/"],
  ["/tag/Vue/", "/tag/vue/"],
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

async function main() {
  await writeFile(path.join(distDir, ".nojekyll"), "", "utf8");

  if (process.env.CNAME_DOMAIN) {
    await writeFile(
      path.join(distDir, "CNAME"),
      `${process.env.CNAME_DOMAIN}\n`,
      "utf8",
    );
  }

  await Promise.all(
    legacyRedirects.map(([fromPath, toPath]) => writeRedirect(fromPath, toPath)),
  );
}

await main();
