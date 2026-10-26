import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';

const siteUrl = 'https://beautytrend-daily.pages.dev';

export const GET: APIRoute = async () => {
  const articles = await getCollection('articles');

  const categories = [
    'haircuts',
    'hairstyles',
    'hair-color',
    'nail-styles',
    'nail-art',
    'beauty-trends',
    'mens-haircuts',
    'mens-grooming',
  ];

  const staticUrls = [
    `  <url>
    <loc>${siteUrl}/</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>`,
    `  <url>
    <loc>${siteUrl}/about/</loc>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>`,
    `  <url>
    <loc>${siteUrl}/privacy/</loc>
    <changefreq>monthly</changefreq>
    <priority>0.3</priority>
  </url>`,
    `  <url>
    <loc>${siteUrl}/terms/</loc>
    <changefreq>monthly</changefreq>
    <priority>0.3</priority>
  </url>`,
    `  <url>
    <loc>${siteUrl}/contact/</loc>
    <changefreq>monthly</changefreq>
    <priority>0.4</priority>
  </url>`,
  ];

  const categoryUrls = categories
    .map(
      (cat) => `  <url>
    <loc>${siteUrl}/category/${cat}/</loc>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>`
    )
    .join('\n');

  const articleUrls = articles
    .map((article) => {
      const slug = article.id.replace(/\.md$/, '');
      const rawDate = article.data.updatedAt || article.data.publishedAt;
      const date = rawDate ? new Date(rawDate).toISOString() : new Date().toISOString();
      return `  <url>
    <loc>${siteUrl}/articles/${slug}/</loc>
    <lastmod>${date}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>`;
    })
    .join('\n');

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${staticUrls.join('\n')}
${categoryUrls}
${articleUrls}
</urlset>`;

  return new Response(sitemap.trim(), {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'X-Robots-Tag': 'all',
      'Cache-Control': 'public, max-age=3600',
    },
  });
};