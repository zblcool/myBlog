import type { CollectionEntry } from "astro:content";

export type PostEntry = CollectionEntry<"posts">;
export type NoteEntry = CollectionEntry<"notes">;
export type WritingEntry = PostEntry | NoteEntry;
export type WritingKind = "post" | "notes";

export function sortEntriesByDateDesc<T extends WritingEntry>(entries: T[]) {
  return [...entries].sort(
    (left, right) => right.data.date.getTime() - left.data.date.getTime(),
  );
}

export function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en-AU", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

export function stripMarkdown(markdown: string) {
  return markdown
    .replace(/^---[\s\S]*?---/, "")
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/!\[[^\]]*\]\([^)]+\)/g, " ")
    .replace(/\[[^\]]+\]\([^)]+\)/g, "$1")
    .replace(/^>\s+/gm, "")
    .replace(/[#>*_~-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function getExcerpt(markdown: string, maxLength = 180) {
  const plain = stripMarkdown(markdown);
  if (plain.length <= maxLength) {
    return plain;
  }

  return `${plain.slice(0, maxLength).trim()}...`;
}

export function getEntryUrl(kind: WritingKind, entryOrId: WritingEntry | string) {
  const id = typeof entryOrId === "string" ? entryOrId : entryOrId.id;
  return `/${kind}/${id}/`;
}

export function slugifyTag(tag: string) {
  return tag
    .toLowerCase()
    .trim()
    .replace(/&/g, " and ")
    .replace(/#/g, " sharp ")
    .replace(/\+/g, " plus ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function getTagUrl(tag: string) {
  return `/tag/${slugifyTag(tag)}/`;
}

export function collectTagCounts(entries: WritingEntry[]) {
  const counts = new Map<string, number>();

  for (const entry of entries) {
    for (const tag of entry.data.tags) {
      counts.set(tag, (counts.get(tag) ?? 0) + 1);
    }
  }

  return [...counts.entries()]
    .map(([tag, count]) => ({
      tag,
      count,
      slug: slugifyTag(tag),
    }))
    .sort((left, right) => {
      if (right.count !== left.count) {
        return right.count - left.count;
      }

      return left.tag.localeCompare(right.tag);
    });
}
