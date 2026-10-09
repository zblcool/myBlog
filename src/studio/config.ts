/**
 * Site wiring. Values that differ per deployment come from PUBLIC_* environment variables
 * (see .env.example); a value still holding a YOUR_… / YOUR-… marker counts as unset.
 */
const env = import.meta.env;

const configured = (value: string | undefined) => (value && !/YOUR[_-]/i.test(value) ? value : "");

export const brand = {
  name: "Ashmartisan",
  nameParts: ["Ash", "martisan"] as const,
  palette: { navy: "#16202A", steel: "#597592", orange: "#F2A250" },
};

export const contactEmail = "ash.zhang.work@gmail.com";
export const socialLinks = [
  { label: "LinkedIn", href: "https://www.linkedin.com/in/ash-zhang/" },
  { label: "GitHub", href: "https://github.com/zblcool" },
];

/**
 * The live Interactive Equipment Explainer. Dev builds fall back to its local dev server;
 * a production build without PUBLIC_DEMO_URL hides the live-demo buttons.
 */
export const demoUrl = configured(env.PUBLIC_DEMO_URL) || (env.DEV ? "http://localhost:5173" : "");

export const form = {
  endpoint: configured(env.PUBLIC_FORM_ENDPOINT),
  accessKey: env.PUBLIC_FORM_ACCESS_KEY ?? "",
};

export const analytics = {
  domain: configured(env.PUBLIC_ANALYTICS_DOMAIN),
  host: env.PUBLIC_ANALYTICS_HOST || "https://plausible.io",
};

/** Deep link into the explainer: a device and optionally a part. */
export function demoLink(equipment?: string, extra: Record<string, string> = {}) {
  if (!demoUrl) return "";
  const url = new URL(demoUrl);
  if (equipment) url.searchParams.set("equipment", equipment);
  for (const [key, value] of Object.entries(extra)) url.searchParams.set(key, value);
  return url.toString();
}
