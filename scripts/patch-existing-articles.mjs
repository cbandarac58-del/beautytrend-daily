import fs from "node:fs";
import path from "node:path";

const geminiKey = process.env.GEMINI_API_KEY;
const youtubeKey = process.env.YOUTUBE_API_KEY;

if (!geminiKey) {
  throw new Error("GEMINI_API_KEY is not configured");
}

const ARTICLES_DIR = "src/content/articles";

// ============================================================
// PATCH REGISTRY: Map each old article slug → proper topic data
// ============================================================
const PATCH_REGISTRY = [
  {
    filename: "2026-wispy-bangs-midi-cuts-hair-trend.md",
    topic: "Face-Framing Wispy Bangs & Midi Haircuts 2026",
    category: "Haircuts",
    searchKey: "Cutting wispy curtain bangs full tutorial",
    heroPhoto: "https://images.unsplash.com/photo-1595476108010-b4d1f102b1b1?auto=format&fit=crop&w=1200&h=675&q=85",
    detailPhoto: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=1200&h=675&q=85",
    photoCredit: "Photo by Ali Pazani on Unsplash"
  },
  {
    filename: "french-bob-curtain-bangs-2026-beauty-trend.md",
    topic: "French Bob with Airy Curtain Bangs 2026",
    category: "Haircuts",
    searchKey: "French bob haircut styling tutorial",
    heroPhoto: "https://images.unsplash.com/photo-1595476108010-b4d1f102b1b1?auto=format&fit=crop&w=1200&h=675&q=85",
    detailPhoto: "https://images.unsplash.com/photo-1580618672591-eb180b1a973f?auto=format&fit=crop&w=1200&h=675&q=85",
    photoCredit: "Photo by Ali Pazani on Unsplash"
  },
  {
    filename: "layered-wolf-cut-styling-guide-2026-beautytrend-daily.md",
    topic: "Layered Wolf Cut: Complete Styling Guide 2026",
    category: "Haircuts",
    searchKey: "Wolf cut layered haircut tutorial 2026 step by step",
    heroPhoto: "https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&w=1200&h=675&q=85",
    detailPhoto: "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=1200&h=675&q=85",
    photoCredit: "Photo by Aw Creative on Unsplash"
  },
  {
    filename: "manicure-trends-2026-guide.md",
    topic: "Top Manicure Trends & Nail Art Styles 2026",
    category: "Nail Art",
    searchKey: "Manicure nail art trends 2026 tutorial guide",
    heroPhoto: "https://images.unsplash.com/photo-1632345031435-8727f6897d53?auto=format&fit=crop&w=1200&h=675&q=85",
    detailPhoto: "https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&w=1200&h=675&q=85",
    photoCredit: "Photo by Giorgio Trovato on Unsplash"
  },
  {
    filename: "minimalist-3d-floral-nail-art-trends-2026-beauty.md",
    topic: "Minimalist 3D Floral Nail Art Masterclass 2026",
    category: "Nail Art",
    searchKey: "3D nail art floral design tutorial masterclass 2026",
    heroPhoto: "https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&w=1200&h=675&q=85",
    detailPhoto: "https://images.unsplash.com/photo-1632345031435-8727f6897d53?auto=format&fit=crop&w=1200&h=675&q=85",
    photoCredit: "Photo by Element5 Digital on Unsplash"
  }
];

// ============================================================
// GEMINI API CLIENT
// ============================================================
const GEMINI_MODELS = ["gemini-2.5-flash", "gemini-2.5-flash-lite"];
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 4000;
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function callGemini({ model, prompt, useSearch = false }) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;
  const body = {
    contents: [{ parts: [{ text: prompt }] }]
  };
  if (useSearch) {
    body.tools = [{ google_search: {} }];
  }
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-goog-api-key": geminiKey
    },
    body: JSON.stringify(body)
  });
  const text = await response.text();
  if (!response.ok) {
    let msg = text;
    try {
      const json = JSON.parse(text);
      msg = json?.error?.message || text;
    } catch {}
    const err = new Error(`Gemini API error (${response.status}): ${msg}`);
    err.status = response.status;
    throw err;
  }
  const data = JSON.parse(text);
  const output = data?.candidates?.[0]?.content?.parts?.map((p) => p.text || "").join("").trim();
  if (!output) throw new Error("Empty response from Gemini");
  return output;
}

async function callGeminiSafe({ prompt, useSearch = false }) {
  let lastError = null;
  for (const model of GEMINI_MODELS) {
    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        console.log(`[Gemini] Model ${model} - Attempt ${attempt}/${MAX_RETRIES}`);
        return await callGemini({ model, prompt, useSearch });
      } catch (err) {
        lastError = err;
        console.warn(`[Gemini] Attempt failed: ${err.message}`);
        if (attempt < MAX_RETRIES) await sleep(RETRY_DELAY_MS);
      }
    }
  }
  throw new Error(`All Gemini models failed. Last error: ${lastError?.message}`);
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
// YOUTUBE: Fetch 4–20 min tutorial masterclass
// ============================================================
async function fetchLongYouTubeTutorial(searchKey) {
  if (!youtubeKey) {
    console.log("[YouTube] No YOUTUBE_API_KEY found. Skipping video search.");
    return [];
  }
  try {
    const url = new URL("https://www.googleapis.com/youtube/v3/search");
    url.searchParams.set("part", "snippet");
    url.searchParams.set("q", searchKey);
    url.searchParams.set("type", "video");
    url.searchParams.set("videoDuration", "medium");
    url.searchParams.set("maxResults", "1");
    url.searchParams.set("order", "relevance");
    url.searchParams.set("videoEmbeddable", "true");
    url.searchParams.set("safeSearch", "strict");
    url.searchParams.set("key", youtubeKey);

    const res = await fetch(url);
    if (!res.ok) {
      console.warn(`[YouTube] Status ${res.status}. Continuing without videos.`);
      return [];
    }
    const data = await res.json();
    let videos = (data.items || [])
      .filter((item) => item?.id?.videoId)
      .map((item) => ({
        title: item.snippet.title.replace(/&#39;/g, "'").replace(/&quot;/g, '"'),
        videoId: item.id.videoId,
        channel: item.snippet.channelTitle
      }));

    // Fallback: any duration
    if (videos.length === 0) {
      url.searchParams.delete("videoDuration");
      const fallbackRes = await fetch(url);
      if (fallbackRes.ok) {
        const fbData = await fallbackRes.json();
        videos = (fbData.items || [])
          .filter((item) => item?.id?.videoId)
          .map((item) => ({
            title: item.snippet.title.replace(/&#39;/g, "'").replace(/&quot;/g, '"'),
            videoId: item.id.videoId,
            channel: item.snippet.channelTitle
          }));
      }
    }
    return videos;
  } catch (err) {
    console.warn(`[YouTube] Error: ${err.message}`);
    return [];
  }
}

// ============================================================
// CORE: Regenerate one article fully
// ============================================================
async function patchArticle(entry) {
  console.log(`\n========================================`);
  console.log(`🔄 PATCHING: ${entry.filename}`);
  console.log(`📝 Topic: ${entry.topic}`);
  console.log(`========================================`);

  const filePath = path.join(ARTICLES_DIR, entry.filename);
  if (!fs.existsSync(filePath)) {
    console.warn(`⚠️  File not found, skipping: ${filePath}`);
    return;
  }

  // Step 1: Research via Gemini + Google Search Grounding
  const researchPrompt = `
You are a senior beauty journalist and SEO specialist.
Search Google for the top-ranking international articles and salon tutorials about: "${entry.topic}".
Current year: 2026.

Synthesize:
- Detailed breakdown of what makes this trend unique in 2026
- Specific salon formulas, cutting angles, product ingredients, and tool recommendations
- Comprehensive face shape matching (oval, square, round, heart) and hair/skin texture analysis
- Step-by-step masterclass technique (at least 5 detailed steps)
- Common mistakes to avoid and pro stylist secrets
- Longevity, maintenance schedules, and at-home aftercare

Return ONLY a JSON object:
{
  "summary": "Exhaustive research summary",
  "keyTakeaways": ["Point 1", "Point 2", "Point 3", "Point 4", "Point 5", "Point 6"]
}
`;

  const researchText = await callGeminiSafe({ prompt: researchPrompt, useSearch: true });
  const research = JSON.parse(cleanJson(researchText));
  console.log(`✅ Research complete.`);

  // Step 2: Fetch YouTube tutorial
  const videos = await fetchLongYouTubeTutorial(entry.searchKey);
  const featuredVideo = videos[0] || null;
  console.log(`🎬 YouTube video: ${featuredVideo ? featuredVideo.title : "Not found"}`);

  // Step 3: Generate full 1200+ word article
  const articlePrompt = `
You are the Editor-in-Chief of "BeautyTrend Daily", an elite digital beauty magazine.
Write an exhaustive, authoritative, deeply detailed editorial masterclass guide on: "${entry.topic}".
Current year: 2026.

RESEARCH CONTEXT:
${research.summary}
KEY TAKEAWAYS: ${research.keyTakeaways.join("; ")}

CRITICAL EDITORIAL REQUIREMENTS:
1. WORD COUNT: Write at least 1,200 to 1,500 words of rich, practical, human-quality content. Do NOT skimp or summarize.
2. STRUCTURE (Strictly use these deep H2 and H3 sections):
   - ## The 2026 Trend Evolution & Aesthetic Allure (Deep context, why it dominates runways/social media)
   - ## Anatomy & Key Characteristics (Detailed breakdown of cuts/formulas/shapes)
   - ## Step-by-Step Styling & Application Masterclass (5+ thorough, actionable steps with product tips)
   - ## Face Shape & Texture Suitability Matrix (Specific advice for Round, Oval, Square, Heart faces & Fine/Thick textures)
   - ## Essential Tools & Product Recommendations (Specific formulas, serums, sprays, tools)
   - ## Salon Consultation Guide: What to Ask Your Stylist (Exact wording, reference advice)
   - ## Longevity, At-Home Aftercare & Maintenance Routine (Daily and weekly regimen)
3. Do NOT repeat the article title or H1 in the content field.
4. Start directly with an evocative, magazine-style opening paragraph.
5. Provide 5 detailed, authoritative FAQ entries.
6. Content must be 100% original, unique, and NOT copied from any source.

Return ONLY a valid JSON object:
{
  "title": "Compelling High-CTR SEO Headline for 2026",
  "slug": "url-friendly-slug-2026",
  "description": "Engaging meta description under 160 characters",
  "excerpt": "Compelling 2-sentence teaser for previews",
  "keywords": ["keyword 1", "keyword 2", "keyword 3", "keyword 4", "keyword 5", "keyword 6"],
  "content": "Full 1200+ word markdown content starting directly with the intro paragraph...",
  "faq": [
    { "question": "Question 1?", "answer": "In-depth answer 1..." },
    { "question": "Question 2?", "answer": "In-depth answer 2..." },
    { "question": "Question 3?", "answer": "In-depth answer 3..." },
    { "question": "Question 4?", "answer": "In-depth answer 4..." },
    { "question": "Question 5?", "answer": "In-depth answer 5..." }
  ]
}
`;

  const articleText = await callGeminiSafe({ prompt: articlePrompt, useSearch: false });
  const article = JSON.parse(cleanJson(articleText));
  console.log(`✅ Article generated.`);

  const now = new Date().toISOString().split("T")[0];
  let cleanContent = article.content.trim();
  // Remove any accidental H1 at the top
  cleanContent = cleanContent.replace(/^#\s+[^\n]+\n+/, "").trim();

  // IN-CONTEXT VIDEO INJECTION: right after Step-by-Step section
  if (featuredVideo) {
    const videoEmbedBlock = `\n\n<div class="in-article-video">
  <div class="video-label">📺 Masterclass Video Tutorial: ${featuredVideo.title}</div>
  <div class="video-responsive-frame">
    <iframe src="https://www.youtube-nocookie.com/embed/${featuredVideo.videoId}" title="${featuredVideo.title}" loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>
  </div>
</div>\n\n`;

    const stepMatch = cleanContent.match(/(##\s+Step-by-Step[\s\S]*?)(?=##\s+Face Shape|##\s+Essential Tools|\Z)/i);
    if (stepMatch) {
      cleanContent = cleanContent.replace(stepMatch[1], stepMatch[1] + videoEmbedBlock);
    } else {
      cleanContent += videoEmbedBlock;
    }
  }

  // IN-CONTEXT PHOTO INJECTION: before Face Shape / Salon Guide section
  if (entry.detailPhoto) {
    const detailImageBlock = `\n\n<figure class="in-article-figure">
  <img src="${entry.detailPhoto}" alt="${article.title} Visual Guide" class="in-article-img" loading="lazy" />
  <figcaption class="in-article-caption">Visual Inspiration: ${entry.topic} — ${entry.photoCredit}</figcaption>
</figure>\n\n`;

    const faceShapeMatch = cleanContent.match(/(##\s+Face Shape[\s\S]*?)(?=##\s+Essential Tools|##\s+Salon Consultation|\Z)/i);
    if (faceShapeMatch) {
      cleanContent = cleanContent.replace(faceShapeMatch[1], faceShapeMatch[1] + detailImageBlock);
    } else {
      cleanContent = detailImageBlock + cleanContent;
    }
  }

  const wordCount = cleanContent.split(/\s+/).length;
  console.log(`📊 Word Count: ${wordCount} words`);

  // Build frontmatter — keep the ORIGINAL filename (slug stays same for existing URLs)
  const frontmatter = `---
title: ${JSON.stringify(article.title)}
description: ${JSON.stringify(article.description)}
excerpt: ${JSON.stringify(article.excerpt || article.description)}
category: ${JSON.stringify(entry.category)}
keywords:
${(article.keywords || []).map((k) => `  - ${JSON.stringify(k)}`).join("\n")}
publishedAt: "${now}"
updatedAt: "${now}"
heroImage: ${JSON.stringify(entry.heroPhoto)}
imageCredit: ${JSON.stringify(entry.photoCredit)}
youtube:
${videos.length > 0 ? videos.map((v) => `  - title: ${JSON.stringify(v.title)}\n    videoId: ${JSON.stringify(v.videoId)}`).join("\n") : "  []"}
faq:
${(article.faq || []).map((f) => `  - question: ${JSON.stringify(f.question)}\n    answer: ${JSON.stringify(f.answer)}`).join("\n")}
---

${cleanContent}
`;

  fs.writeFileSync(filePath, frontmatter, "utf8");
  console.log(`✅ PATCHED & SAVED: ${filePath} (${wordCount} words)`);
}

// ============================================================
// MAIN
// ============================================================
async function main() {
  console.log(`\n🚀 BeautyTrend Daily — Patch Existing Articles`);
  console.log(`📂 Articles dir: ${ARTICLES_DIR}`);
  console.log(`🔧 Patching ${PATCH_REGISTRY.length} articles...\n`);

  for (let i = 0; i < PATCH_REGISTRY.length; i++) {
    const entry = PATCH_REGISTRY[i];
    try {
      await patchArticle(entry);
      if (i < PATCH_REGISTRY.length - 1) {
        console.log("\n⏳ Waiting 5s before next article...");
        await sleep(5000);
      }
    } catch (err) {
      console.error(`❌ Failed patching ${entry.filename}:`, err.message);
    }
  }

  console.log(`\n🎉 All articles patched successfully!`);
}

main().catch((err) => {
  console.error("Fatal Error:", err);
  process.exit(1);
});
