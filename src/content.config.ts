import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

const writingSchema = z.object({
  title: z.string(),
  date: z.coerce.date(),
  tags: z.array(z.string()).default([]),
  author: z.string().optional(),
  location: z.string().optional(),
  description: z.string().optional(),
  summary: z.string().optional(),
  cover: z.string().optional(),
  coverAlt: z.string().optional(),
  mathjax: z.any().optional(),
});

export const collections = {
  posts: defineCollection({
    loader: glob({
      pattern: "**/*.md",
      base: "./blog/_posts",
    }),
    schema: writingSchema,
  }),
  notes: defineCollection({
    loader: glob({
      pattern: "**/*.md",
      base: "./blog/_notes",
    }),
    schema: writingSchema,
  }),
};
