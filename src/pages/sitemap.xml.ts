import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';

const siteUrl = 'https://beautytrend-daily.pages.dev';

export const GET: APIRoute = async () => {
  const articles = await getCollection('articles');

  const articleUrls = articles.map((article) => {
    return `
  <url>
    <loc>${siteUrl}/articles/${article.slug}</loc>
    <lastmod>${article.data.updatedAt
      ? article.data.updatedAt.toISOString()
      : article.data.publishedAt.toISOString()}</lastmod>
  </url>`;
  }).join('');

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${siteUrl}/</loc>
  </url>
${articleUrls}
</urlset>`;

  return new Response(sitemap.trim(), {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
    },
  });
};
