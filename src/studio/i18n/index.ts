import { en, type Copy } from "./en";
import { zh } from "./zh";
import { withBase } from "@/lib/paths";

// English is the public site. Chinese is a hidden copy at /zh/: reachable by URL, but not
// linked, not in the sitemap and marked noindex.
export type Lang = "en" | "zh";
export const copies: Record<Lang, Copy> = { en, zh };

/** Site path for a page in a language: "/" → "/" (en) or "/zh/" (zh). */
export const localePath = (lang: Lang, path = "/") => withBase(lang === "en" ? path : `/zh${path}`);

