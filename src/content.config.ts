import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const toArray = (val: unknown) => {
  if (Array.isArray(val)) return val;
  if (!val) return [];
  return [];
};

const articles = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/articles' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    excerpt: z.string().optional(),
    category: z.string(),
    keywords: z.preprocess(toArray, z.array(z.string())).optional().default([]),
    publishedAt: z.coerce.date(),
    updatedAt: z.coerce.date().optional(),
    heroImage: z.string().optional(),
    imageCredit: z.string().optional(),
    youtube: z.preprocess(
      toArray,
      z.array(
        z.object({
          title: z.string(),
          videoId: z.string(),
        })
      )
    ).optional().default([]),
    faq: z.preprocess(
      toArray,
      z.array(
        z.object({
          question: z.string(),
          answer: z.string(),
        })
      )
    ).optional().default([]),
  }),
});

const es = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/es' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    excerpt: z.string().optional(),
    category: z.string(),
    keywords: z.preprocess(toArray, z.array(z.string())).optional().default([]),
    publishedAt: z.coerce.date(),
    updatedAt: z.coerce.date().optional(),
    heroImage: z.string().optional(),
    imageCredit: z.string().optional(),
    lang: z.string().optional().default('es'),
    translatedFrom: z.string().optional(),
    youtube: z.preprocess(toArray, z.array(z.object({ title: z.string(), videoId: z.string() }))).optional().default([]),
    faq: z.preprocess(toArray, z.array(z.object({ question: z.string(), answer: z.string() }))).optional().default([]),
  }),
});

export const collections = { articles, es };