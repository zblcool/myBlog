/**
 * The three packages on the home page, from docs/Ashmartisan_Pricing_Strategy_V1.md. Tiers with
 * `from` show a starting price; the rest are quoted to scope. Wording lives in
 * i18n (`pricing.tiers[id]`). `need` is the index into `contact.fields.needOptions` that the
 * card's button selects in the enquiry form.
 */
export interface Tier {
  id: "pilot" | "experience" | "complete";
  need: number;
  featured?: boolean;
  /** Starting price in AUD, before GST. */
  from?: number;
}

export const tiers: Tier[] = [
  { id: "pilot", need: 2, from: 1500 },
  { id: "experience", need: 0, featured: true, from: 4500 },
  { id: "complete", need: 1 },
];

export const currency = "AUD";

/** "A$4,500" in every language: the site's buyers are quoted in Australian dollars. */
export const formatPrice = (amount: number) => `A$${amount.toLocaleString("en-AU")}`;

/**
 * Where the one build runs, per package (the `runs` table under the cards). "yes" is included,
 * "upgrade" is reached by moving up from the pilot (the exhibition credit applies).
 */
export type Cover = "yes" | "upgrade";

export const channels: { id: "embed" | "sales" | "stand"; cover: Record<Tier["id"], Cover> }[] = [
  { id: "embed", cover: { pilot: "upgrade", experience: "yes", complete: "yes" } },
  { id: "sales", cover: { pilot: "upgrade", experience: "yes", complete: "yes" } },
  { id: "stand", cover: { pilot: "yes", experience: "yes", complete: "yes" } },
];

/** The landing page that explains embedding (studio/data/solutions.ts). English only. */
export const embedSlug = "embed-3d-product-viewer";
