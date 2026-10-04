import type { APIRoute } from 'astro';

const siteUrl = 'https://beautytrend-daily.pages.dev';

export const GET: APIRoute = () => {
  const robots = `User-agent: *
Allow: /

Sitemap: ${siteUrl}/sitemap.xml
`;

  return new Response(robots, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
    },
  });
};
