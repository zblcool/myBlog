import type { APIRoute } from "astro";

/** robots.txt pointing at the sitemap; the origin follows SITE_URL / the deploy target. */
export const GET: APIRoute = ({ site }) => {
  const sitemap = new URL(`${import.meta.env.BASE_URL}sitemap-index.xml`, site).toString();
  return new Response(`User-agent: *\nAllow: /\n\nSitemap: ${sitemap}\n`, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
};
