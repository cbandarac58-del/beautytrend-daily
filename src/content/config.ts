import { defineCollection, z } from 'astro:content';

const articles = defineCollection({
  type: 'content',
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
      .optional()
      .default([]),
    faq: z
      .union([
        z.array(
          z.object({
            question: z.string(),
            answer: z.string(),
          })
        ),
        z.null(),
        z.object({}).passthrough(),
      ])
      .optional()
      .transform((val) => {
        if (!val || !Array.isArray(val)) return [];
        return val;
      }),
  }),
});

export const collections = { articles };