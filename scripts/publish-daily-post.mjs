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
// 1. TOPIC POOL (2026 Trends)
// ============================================================
const TOPICS = [
  "Korean Butterfly Haircut Trends 2026",
  "French Bob with Curtain Bangs 2026",
  "Modern Shag Haircut for Naturally Curly Hair 2026",
  "Sleek Glass Hair and High Gloss Treatments 2026",
  "Layered Wolf Cut Styling Guide 2026",
  "Cat Eye Velvet Magnetic Gel Nail Trends 2026",
  "Micro French Tip Elegant Manicure Designs 2026",
  "Glazed Donut Chrome Nails Style Guide 2026",
  "Minimalist 3D Floral Nail Art Trends 2026",
  "Espresso Brunette & Cherry Cola Hair Colors 2026",
  "Honey Vanilla Blonde Balayage 2026",
  "Mushroom Brown Soft Dimension Hair Color 2026",
  "Glass Skin Korean Skincare Routine 2026",
  "Natural Latte Makeup & Clean Girl Aesthetic 2026"
];

function selectUniqueTopic() {
  const existingFiles = fs.readdirSync(ARTICLES_DIR).map((f) => f.toLowerCase());
  const available = TOPICS.filter((topic) => {
    const slug = topic.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    return !existingFiles.some((f) => f.includes(slug));
  });
  const pool = available.length > 0 ? available : TOPICS;
  return pool[Math.floor(Math.random() * pool.length)];
}

// ============================================================
// 2. GEMINI API WITH RETRY
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
  if (!response.ok) throw new Error(data?.error?.message || "Gemini API Error");
  return data?.candidates?.[0]?.content?.parts?.map((p) => p.text || "").join("").trim();
}

async function callGeminiSafe(prompt) {
  for (const model of GEMINI_MODELS) {
    try {
      return await callGemini(prompt, model);
    } catch (e) {
      console.log(`Failed with ${model}, retrying... (${e.message})`);
    }
  }
  throw new Error("All Gemini models failed.");
}

function cleanJson(text) {
  let val = String(text || "").trim();
  val = val.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/\s*```$/i, "").trim();
  const firstBrace = val.indexOf("{");
  const lastBrace = val.lastIndexOf("}");
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    val = val.slice(firstBrace, lastBrace + 1);
  }
  return val.trim();
}

// ============================================================
// 3. YOUTUBE API WITH SAFE FALLBACK
// ============================================================
async function fetchYouTubeVideos(query) {
  if (!youtubeKey) return [];
  try {
    const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=2&q=${encodeURIComponent(query + " tutorial 2026")}&type=video&key=${youtubeKey}`;
    const res = await fetch(url);
    const data = await res.json();
    if (!data.items) return [];
    return data.items
      .filter((item) => item?.id?.videoId)
      .map((item) => ({
        title: item.snippet.title,
        videoId: item.id.videoId
      }));
  } catch (err) {
    console.warn("YouTube API warning:", err.message);
    return [];
  }
}

// ============================================================
// 4. MAIN GENERATION PIPELINE
// ============================================================
async function run() {
  const topic = selectUniqueTopic();
  console.log(`Generating article for: "${topic}"...`);

  const prompt = `
You are a senior beauty editor for "BeautyTrend Daily".
Write a comprehensive, human-written editorial beauty article about: "${topic}".
Current year: 2026.

Return ONLY a valid JSON object matching this structure (no markdown fences, no extra text):
{
  "title": "Compelling SEO Title 2026",
  "slug": "seo-friendly-slug-2026",
  "description": "Engaging meta description under 160 characters",
  "excerpt": "Short 2-sentence preview excerpt",
  "category": "Haircuts | Hairstyles | Nail Art | Hair Colors | Skincare",
  "keywords": ["keyword1", "keyword2", "keyword3", "keyword4", "keyword5"],
  "content": "Full Markdown article text with ## headings, styling guide, maintenance routines, and suitability tips.",
  "faq": [
    { "question": "Question 1?", "answer": "Detailed answer 1." },
    { "question": "Question 2?", "answer": "Detailed answer 2." },
    { "question": "Question 3?", "answer": "Detailed answer 3." }
  ]
}
`;

  const rawJson = await callGeminiSafe(prompt);
  const article = JSON.parse(cleanJson(rawJson));

  const videos = await fetchYouTubeVideos(article.title);
  const now = new Date().toISOString().split("T")[0];

  const imageUrl = "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=1200&q=80";
  const imageCredit = "Photo on Unsplash (Free Commercial Use)";

  // Strict Astro Content Collections Frontmatter
  const frontmatter = `---
title: ${JSON.stringify(article.title)}
description: ${JSON.stringify(article.description)}
excerpt: ${JSON.stringify(article.excerpt || article.description)}
category: ${JSON.stringify(article.category || "Beauty")}
keywords:
${(article.keywords || []).map((k) => `  - ${JSON.stringify(k)}`).join("\n")}
publishedAt: "${now}"
updatedAt: "${now}"
youtube:
${videos.length > 0 ? videos.map((v) => `  - title: ${JSON.stringify(v.title)}\n    videoId: ${JSON.stringify(v.videoId)}`).join("\n") : "  []"}
faq:
${(article.faq || []).map((f) => `  - question: ${JSON.stringify(f.question)}\n    answer: ${JSON.stringify(f.answer)}`).join("\n")}
---

<figure class="featured-image-container my-6">
  <img src="${imageUrl}" alt="${article.title}" class="w-full rounded-2xl shadow-lg object-cover max-h-[500px]" loading="lazy" />
  <figcaption class="text-xs text-gray-500 mt-2 text-center">${imageCredit}</figcaption>
</figure>

${article.content}

${
  videos.length > 0
    ? `\n## Video Tutorials & Inspiration\n\n` +
      videos
        .map(
          (v) =>
            `<div class="video-embed my-6 aspect-video w-full rounded-2xl overflow-hidden shadow-md"><iframe class="w-full h-full" src="https://www.youtube.com/embed/${v.videoId}" title="${v.title}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></div>`
        )
        .join("\n")
    : ""
}
`;

  const filename = `${article.slug}.md`;
  const filePath = path.join(ARTICLES_DIR, filename);

  fs.writeFileSync(filePath, frontmatter, "utf8");
  console.log(`✅ Successfully generated & saved: ${filePath}`);
}

run().catch((err) => {
  console.error("Fatal Error:", err);
  process.exit(1);
});
