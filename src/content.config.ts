import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const articles = defineCollection({
  loader: glob({ pattern: '**/*.md', base: 'src/content/articles' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    excerpt: z.string().optional(),
    category: z.string(),
    keywords: z.array(z.string()).default([]),
    publishedAt: z.coerce.date(),
    updatedAt: z.coerce.date().optional(),
    heroImage: z.string().optional(),
    imageCredit: z.string().optional(),
    youtube: z
      .array(
        z.object({
          title: z.string(),
          videoId: z.string(),
        })
      )
      .default([]),
    faq: z
      .array(
        z.object({
          question: z.string(),
          answer: z.string(),
        })
      )
      .default([]),
  }),
});

export const collections = { articles };