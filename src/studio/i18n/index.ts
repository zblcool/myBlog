import { en, type Copy } from "./en";
import { zh } from "./zh";
import { withBase } from "@/lib/paths";

// The site is published in English only; zh.ts is kept as a resource and has no pages.
export type Lang = "en" | "zh";
export const copies: Record<Lang, Copy> = { en, zh };

/** Site path for a page in a language: "/" → "/" (en) or "/zh/" (zh). */
export const localePath = (lang: Lang, path = "/") => withBase(lang === "en" ? path : `/zh${path}`);

