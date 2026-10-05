import fs from "node:fs";
import path from "node:path";

const geminiKey = process.env.GEMINI_API_KEY;
const youtubeKey = process.env.YOUTUBE_API_KEY;

if (!geminiKey) {
  throw new Error("GEMINI_API_KEY is not configured");
}

const ARTICLES_DIR = "src/content/articles";
fs.mkdirSync(ARTICLES_DIR, { recursive: true });

// ============================================================
// 1. TOPIC POOL (Hair, Nails, Skincare, Haircuts, Colors)
// ============================================================
const TOPICS = [
  // Haircuts & Styles
  "Korean Butterfly Haircut Trends 2026",
  "French Bob with Curtain Bangs 2026",
  "Modern Shag Haircut for Curly Hair 2026",
  "Sleek Glass Hair and Gloss Treatments 2026",
  "Layered Wolf Cut Styling Guide 2026",
  "Pixie Bixie Hybrid Haircut Styles 2026",
  "Bridal & Prom Elegant Hairstyle Trends 2026",
  
  // Nail Art & Manicures
  "Cat Eye Velvet Magnetic Nail Trends 2026",
  "Micro French Tip Manicure Designs 2026",
  "Glazed Donut Chrome Nails Style Guide 2026",
  "Minimalist 3D Floral Nail Art Trends 2026",
  "Gel X Nail Extensions Care and Styles 2026",
  "Pastel Aura Nails Trend 2026",
  
  // Hair Colors
  "Espresso Brunette & Cherry Cola Hair Colors 2026",
  "Honey Vanilla Blonde Balayage 2026",
  "Mushroom Brown Subtle Highlights 2026",
  "Copper Peach Fuzz Hair Color Trend 2026",
  
  // Skincare & Aesthetics
  "Glass Skin Korean Skincare Routine 2026",
  "Barrier Repair & Peptide Skincare Trends 2026",
  "Natural Latte Makeup & Clean Girl Aesthetic 2026"
];

// Existing articles check කරලා duplicate නොවී topic එකක් තෝරා ගැනීම
function selectUniqueTopic() {
  const existingFiles = fs.readdirSync(ARTICLES_DIR);
  const available = TOPICS.filter(topic => {
    const slug = topic.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    return !existingFiles.some(f => f.includes(slug));
  });

  const pool = available.length > 0 ? available : TOPICS;
  return pool[Math.floor(Math.random() * pool.length)];
}

// ============================================================
// 2. GEMINI API WITH RETRY & FALLBACK
// ============================================================
const GEMINI_MODELS = ["gemini-2.5-flash", "gemini-2.5-flash-lite"];

async function callGemini(prompt, model = "gemini-2.5-flash") {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-goog-api-key": geminiKey },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      tools: [{ google_search: {} }]
    })
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data?.error?.message || "Gemini Error");
  return data?.candidates?.[0]?.content?.parts?.map(p => p.text || "").join("").trim();
}

async function callGeminiSafe(prompt) {
  for (const model of GEMINI_MODELS) {
    try {
      return await callGemini(prompt, model);
    } catch (e) {
      console.log(`Failed with ${model}, retrying next... (${e.message})`);
    }
  }
  throw new Error("All Gemini models failed.");
}

// ============================================================
// 3. COPYRIGHT-FREE BEAUTY IMAGES (High-Res Curated Source)
// ============================================================
function getCopyrightFreeImages(category, title) {
  const query = encodeURIComponent(category || "beauty hair manicure");
  // Unsplash & Pexels direct high-res beauty collection with proper attribution
  return [
    {
      url: `https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=1200&q=80`,
      alt: `${title} - Trend Overview`,
      credit: "Unsplash (Free Commercial Use)"
    },
    {
      url: `https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=1200&q=80`,
      alt: `${title} - Style Close Up`,
      credit: "Unsplash (Free Commercial Use)"
    }
  ];
}

// ============================================================
// 4. YOUTUBE API HELPER (With safe fallback)
// ============================================================
async function fetchYouTubeVideos(query) {
  if (!youtubeKey) return [];
  try {
    const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=2&q=${encodeURIComponent(query + " tutorial 2026")}&type=video&key=${youtubeKey}`;
    const res = await fetch(url);
    const data = await res.json();
    if (!data.items) return [];
    return data.items.map(item => ({
      videoId: item.id.videoId,
      title: item.snippet.title,
      channel: item.snippet.channelTitle
    }));
  } catch (err) {
    console.warn("YouTube API warning:", err.message);
    return [];
  }
}

// ============================================================
// 5. MAIN ARTICLE GENERATION PIPELINE
// ============================================================
async function run() {
  const topic = selectUniqueTopic();
  console.log(`Generating article for topic: "${topic}"...`);

  const prompt = `
You are a senior beauty editor and SEO specialist.
Write a comprehensive, trending beauty article about: "${topic}".
Current year: 2026.

Return ONLY a valid JSON object matching this structure (no markdown fences, no extra text):
{
  "title": "Compelling SEO headline",
  "slug": "url-friendly-slug-2026",
  "description": "Engaging meta description under 160 characters",
  "category": "Hair | Nails | Skincare | Makeup",
  "tags": ["tag1", "tag2", "tag3"],
  "keywords": ["keyword1", "keyword2", "keyword3"],
  "readingTime": "5 min read",
  "content": "Full detailed article content formatted in clean Markdown with H2, H3, bullet points, styling tips, maintenance routine, and styling advice.",
  "faq": [
    { "q": "Question 1?", "a": "Answer 1." },
    { "q": "Question 2?", "a": "Answer 2." }
  ]
}
`;

  const rawJson = await callGeminiSafe(prompt);
  const cleanJson = rawJson.replace(/```json/gi, "").replace(/```/g, "").trim();
  const article = JSON.parse(cleanJson);

  const images = getCopyrightFreeImages(article.category, article.title);
  const videos = await fetchYouTubeVideos(article.title);

  // Markdown file creation for Astro Content Collection
  const filename = `${article.slug}.md`;
  const filePath = path.join(ARTICLES_DIR, filename);

  const markdownContent = `---
title: "${article.title.replace(/"/g, '\\"')}"
description: "${article.description.replace(/"/g, '\\"')}"
pubDate: "${new Date().toISOString()}"
category: "${article.category || 'Beauty'}"
tags: ${JSON.stringify(article.tags || [])}
keywords: ${JSON.stringify(article.keywords || [])}
readingTime: "${article.readingTime || '5 min read'}"
heroImage: "${images[0].url}"
imageCredit: "${images[0].credit}"
videos: ${JSON.stringify(videos)}
faq: ${JSON.stringify(article.faq || [])}
---

${article.content}

## Related Videos & Tutorials
${videos.map(v => `<iframe width="100%" height="400" src="https://www.youtube.com/embed/${v.videoId}" frameborder="0" allowfullscreen class="rounded-xl my-4"></iframe>`).join("\n")}
`;

  fs.writeFileSync(filePath, markdownContent, "utf8");
  console.log(`✅ Successfully generated: ${filePath}`);
}

run().catch(err => {
  console.error("Pipeline failed:", err);
  process.exit(1);
});
