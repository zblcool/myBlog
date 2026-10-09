import { brand, contactEmail, socialLinks } from "@/studio/config";
import type { Copy } from "@/studio/i18n/en";

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
        sameAs: socialLinks.map((link) => link.href),
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
