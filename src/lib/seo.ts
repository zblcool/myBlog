import { about, profile, socialLinks } from "@/data/site";
import type { WritingEntry } from "@/lib/content";

/** schema.org Person for Ash; `siteUrl` is the absolute site root. */
export function person(siteUrl: string) {
  return {
    "@type": "Person",
    "@id": new URL("blog/#person", siteUrl).toString(),
    name: profile.name,
    jobTitle: profile.title,
    knowsAbout: about.stack,
    description: profile.description,
    url: new URL("blog/", siteUrl).toString(),
    // Personal profiles only; the LinkedIn link is the company page.
    sameAs: socialLinks.filter((link) => link.label !== "LinkedIn").map((link) => link.href),
    worksFor: { "@type": "Organization", name: "Ashmartisan", url: siteUrl, sameAs: socialLinks.find((l) => l.label === "LinkedIn")?.href },
    address: { "@type": "PostalAddress", addressLocality: profile.location, addressCountry: "AU" },
  };
}

/** schema.org data for the blog home and the About page: Ash, plus the page as his profile. */
export function profileStructuredData(pageUrl: string, siteUrl: string, profilePage = false) {
  const me = person(siteUrl);

  return {
    "@context": "https://schema.org",
    "@graph": [
      me,
      {
        "@type": profilePage ? "ProfilePage" : "WebSite",
        "@id": `${pageUrl}#page`,
        url: pageUrl,
        name: profilePage ? `About ${profile.name}` : profile.name,
        inLanguage: "en",
        [profilePage ? "mainEntity" : "publisher"]: { "@id": me["@id"] },
      },
    ],
  };
}

/** schema.org data for a post or note: the article and its breadcrumb trail. */
export function articleStructuredData(
  entry: WritingEntry,
  section: { name: string; url: string },
  pageUrl: string,
  siteUrl: string,
  description: string,
  image?: string,
) {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BlogPosting",
        "@id": `${pageUrl}#article`,
        mainEntityOfPage: pageUrl,
        headline: entry.data.title,
        description,
        datePublished: entry.data.date.toISOString(),
        keywords: entry.data.tags.join(", ") || undefined,
        image,
        inLanguage: "en",
        author: person(siteUrl),
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: profile.name, item: new URL("blog/", siteUrl).toString() },
          { "@type": "ListItem", position: 2, name: section.name, item: section.url },
          { "@type": "ListItem", position: 3, name: entry.data.title, item: pageUrl },
        ],
      },
    ],
  };
}
