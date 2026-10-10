import { brand, contactEmail, socialLinks } from "@/studio/config";
import type { Copy } from "@/studio/i18n/en";
import { solutions, type Solution } from "@/studio/data/solutions";

/**
 * schema.org data for the home page: the business, the site, and the FAQ section.
 * `siteUrl` is the absolute home URL; `asset` turns a site path into an absolute URL.
 */
export function homeStructuredData(t: Copy, siteUrl: string, asset: (path: string) => string) {
  const org = `${siteUrl}#organization`;

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": org,
        name: brand.name,
        url: siteUrl,
        logo: asset("/studio/apple-touch-icon.png"),
        image: asset("/studio/og-image.jpg"),
        description: t.meta.description,
        slogan: t.tagline,
        email: contactEmail,
        address: { "@type": "PostalAddress", addressCountry: "AU" },
        areaServed: "Worldwide",
        sameAs: socialLinks.map((link) => link.href),
        founder: {
          "@type": "Person",
          name: "Ash Zhang",
          jobTitle: "Computer graphics engineer",
          url: new URL("blog/", siteUrl).toString(),
          sameAs: socialLinks.map((link) => link.href),
        },
        knowsAbout: [
          "Interactive 3D product visualisation",
          "Industrial equipment marketing",
          "Trade-show interactive displays",
          "WebGL",
          "Babylon.js",
          "Three.js",
        ],
        // The three ways the explainer is used, each with its own page.
        makesOffer: solutions.map((s) => ({
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: s.name,
            description: s.description,
            url: new URL(`${s.slug}/`, siteUrl).toString(),
          },
        })),
      },
      {
        "@type": "WebSite",
        "@id": `${siteUrl}#website`,
        name: brand.name,
        url: siteUrl,
        inLanguage: t.htmlLang,
        publisher: { "@id": org },
      },
      {
        "@type": "FAQPage",
        "@id": `${siteUrl}#faq`,
        mainEntity: t.faq.items.map((item) => ({
          "@type": "Question",
          name: item.q,
          acceptedAnswer: { "@type": "Answer", text: item.a },
        })),
      },
    ],
  };
}

/** schema.org data for a landing page: the service it offers, its FAQ and the breadcrumb trail. */
export function solutionStructuredData(
  s: Pick<Solution, "name" | "description" | "faq">,
  pageUrl: string,
  siteUrl: string,
) {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Service",
        "@id": `${pageUrl}#service`,
        name: s.name,
        description: s.description,
        serviceType: "Interactive 3D product visualisation",
        provider: { "@id": `${siteUrl}#organization` },
        areaServed: "Worldwide",
        url: pageUrl,
      },
      {
        "@type": "FAQPage",
        "@id": `${pageUrl}#faq`,
        mainEntity: s.faq.map((item) => ({
          "@type": "Question",
          name: item.q,
          acceptedAnswer: { "@type": "Answer", text: item.a },
        })),
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: brand.name, item: siteUrl },
          { "@type": "ListItem", position: 2, name: s.name, item: pageUrl },
        ],
      },
    ],
  };
}
