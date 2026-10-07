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
// 1. EXTENSIVE TOPIC REGISTRY WITH PRECISE SEARCH KEYS & PHOTO POOLS
// ============================================================
const TOPIC_REGISTRY = [
  // Haircuts
  {
    topic: "Korean Butterfly Layered Haircut Trends 2026",
    category: "Haircuts",
    searchKey: "Butterfly haircut tutorial step by step",
    heroPhoto: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=1200&q=80",
    detailPhoto: "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=1000&q=80",
    photoCredit: "Photo by Valerie Elash on Unsplash"
  },
  {
    topic: "French Bob with Airy Curtain Bangs 2026",
    category: "Haircuts",
    searchKey: "French bob haircut styling tutorial",
    heroPhoto: "https://images.unsplash.com/photo-1595476108010-b4d1f102b1b1?auto=format&fit=crop&w=1200&q=80",
    detailPhoto: "https://images.unsplash.com/photo-1580618672591-eb180b1a973f?auto=format&fit=crop&w=1000&q=80",
    photoCredit: "Photo by Ali Pazani on Unsplash"
  },
  {
    topic: "Modern Shag Haircut for Naturally Curly Hair 2026",
    category: "Haircuts",
    searchKey: "Curly shag haircut styling full tutorial",
    heroPhoto: "https://images.unsplash.com/photo-1584297091622-af8e5fdcf9ef?auto=format&fit=crop&w=1200&q=80",
    detailPhoto: "https://images.unsplash.com/photo-1519699047748-de8e457a634e?auto=format&fit=crop&w=1000&q=80",
    photoCredit: "Photo by Ayo Ogunseinde on Unsplash"
  },
  {
    topic: "Italian Bob Haircut: The Chic Styling Guide 2026",
    category: "Haircuts",
    searchKey: "Italian bob styling haircut guide tutorial",
    heroPhoto: "https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&w=1200&q=80",
    detailPhoto: "https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?auto=format&fit=crop&w=1000&q=80",
    photoCredit: "Photo by Aw Creative on Unsplash"
  },
  {
    topic: "Bixie & Soft Pixie Cut Transformations 2026",
    category: "Haircuts",
    searchKey: "Pixie bixie haircut tutorial transformation",
    heroPhoto: "https://images.unsplash.com/photo-1500917293891-ef795e70e1f6?auto=format&fit=crop&w=1200&q=80",
    detailPhoto: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1000&q=80",
    photoCredit: "Photo by Tamara Bellis on Unsplash"
  },
  {
    topic: "90s Supermodel Blowout Layers Haircut 2026",
    category: "Haircuts",
    searchKey: "90s blowout layers haircut round brush tutorial",
    heroPhoto: "https://images.unsplash.com/photo-1519699047748-de8e457a634e?auto=format&fit=crop&w=1200&q=80",
    detailPhoto: "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=1000&q=80",
    photoCredit: "Photo by Sarah Comeau on Unsplash"
  },
  {
    topic: "Face-Framing Wispy Bangs & Midi Haircuts 2026",
    category: "Haircuts",
    searchKey: "Cutting wispy curtain bangs full tutorial",
    heroPhoto: "https://images.unsplash.com/photo-1595476108010-b4d1f102b1b1?auto=format&fit=crop&w=1200&q=80",
    detailPhoto: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=1000&q=80",
    photoCredit: "Photo by Ali Pazani on Unsplash"
  },

  // Hairstyles
  {
    topic: "Sleek Glass Hair and High-Gloss Styling Guide 2026",
    category: "Hairstyles",
    searchKey: "Glass hair styling tutorial glossy straight hair",
    heroPhoto: "https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?auto=format&fit=crop&w=1200&q=80",
    detailPhoto: "https://images.unsplash.com/photo-1580618672591-eb180b1a973f?auto=format&fit=crop&w=1000&q=80",
    photoCredit: "Photo by Tamara Bellis on Unsplash"
  },
  {
    topic: "Effortless French Girl Messy Bun Tutorials 2026",
    category: "Hairstyles",
    searchKey: "French messy bun tutorial step by step easy",
    heroPhoto: "https://images.unsplash.com/photo-1519699047748-de8e457a634e?auto=format&fit=crop&w=1200&q=80",
    detailPhoto: "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=1000&q=80",
    photoCredit: "Photo by Sarah Comeau on Unsplash"
  },
  {
    topic: "Heatless Silk Ribbon Waves & Overnight Styling 2026",
    category: "Hairstyles",
    searchKey: "Heatless curls robe belt tutorial overnight",
    heroPhoto: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=1200&q=80",
    detailPhoto: "https://images.unsplash.com/photo-1595476108010-b4d1f102b1b1?auto=format&fit=crop&w=1000&q=80",
    photoCredit: "Photo by Valerie Elash on Unsplash"
  },
  {
    topic: "Clean Girl Slicked-Back Bun Styling Routine 2026",
    category: "Hairstyles",
    searchKey: "Clean girl slick back sleek bun tutorial",
    heroPhoto: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1200&q=80",
    detailPhoto: "https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?auto=format&fit=crop&w=1000&q=80",
    photoCredit: "Photo by Tamara Bellis on Unsplash"
  },
  {
    topic: "Boho Romantic Braids & Half-Up Hair Trends 2026",
    category: "Hairstyles",
    searchKey: "Boho braids half up tutorial romantic",
    heroPhoto: "https://images.unsplash.com/photo-1584297091622-af8e5fdcf9ef?auto=format&fit=crop&w=1200&q=80",
    detailPhoto: "https://images.unsplash.com/photo-1519699047748-de8e457a634e?auto=format&fit=crop&w=1000&q=80",
    photoCredit: "Photo by Ayo Ogunseinde on Unsplash"
  },

  // Hair Colors
  {
    topic: "Espresso Brunette & Cherry Cola Hair Colors 2026",
    category: "Hair Color",
    searchKey: "Cherry cola brunette hair color transformation tutorial",
    heroPhoto: "https://images.unsplash.com/photo-1580618672591-eb180b1a973f?auto=format&fit=crop&w=1200&q=80",
    detailPhoto: "https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?auto=format&fit=crop&w=1000&q=80",
    photoCredit: "Photo by Valerie Elash on Unsplash"
  },
  {
    topic: "Honey Vanilla & Buttercream Blonde Balayage 2026",
    category: "Hair Color",
    searchKey: "Honey blonde balayage transformation masterclass",
    heroPhoto: "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=1200&q=80",
    detailPhoto: "https://images.unsplash.com/photo-1519699047748-de8e457a634e?auto=format&fit=crop&w=1000&q=80",
    photoCredit: "Photo by Guilherme Petri on Unsplash"
  },
  {
    topic: "Mushroom Brown Soft Dimension Hair Color 2026",
    category: "Hair Color",
    searchKey: "Mushroom brown hair color formula tutorial",
    heroPhoto: "https://images.unsplash.com/photo-1605497788044-5a32c7078486?auto=format&fit=crop&w=1200&q=80",
    detailPhoto: "https://images.unsplash.com/photo-1580618672591-eb180b1a973f?auto=format&fit=crop&w=1000&q=80",
    photoCredit: "Photo by Aw Creative on Unsplash"
  },
  {
    topic: "Warm Copper & Peach Fuzz Hair Color Trends 2026",
    category: "Hair Color",
    searchKey: "Copper hair color dying tutorial formula",
    heroPhoto: "https://images.unsplash.com/photo-1580618672591-eb180b1a973f?auto=format&fit=crop&w=1200&q=80",
    detailPhoto: "https://images.unsplash.com/photo-1595476108010-b4d1f102b1b1?auto=format&fit=crop&w=1000&q=80",
    photoCredit: "Photo by Valerie Elash on Unsplash"
  },

  // Nail Art & Manicures
  {
    topic: "Cat Eye Velvet Magnetic Gel Nail Trends 2026",
    category: "Nail Art",
    searchKey: "Cat eye velvet magnetic nails tutorial full guide",
    heroPhoto: "https://images.unsplash.com/photo-1632345031435-8727f6897d53?auto=format&fit=crop&w=1200&q=80",
    detailPhoto: "https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&w=1000&q=80",
    photoCredit: "Photo by Giorgio Trovato on Unsplash"
  },
  {
    topic: "Micro French Tip Elegant Manicure Designs 2026",
    category: "Nail Art",
    searchKey: "Micro french tip manicure tutorial step by step",
    heroPhoto: "https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&w=1200&q=80",
    detailPhoto: "https://images.unsplash.com/photo-1632345031435-8727f6897d53?auto=format&fit=crop&w=1000&q=80",
    photoCredit: "Photo by Element5 Digital on Unsplash"
  },
  {
    topic: "Glazed Donut Chrome Nails Style Guide 2026",
    category: "Nail Art",
    searchKey: "Glazed donut chrome nails tutorial hailey bieber",
    heroPhoto: "https://images.unsplash.com/photo-1632345031435-8727f6897d53?auto=format&fit=crop&w=1200&q=80",
    detailPhoto: "https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&w=1000&q=80",
    photoCredit: "Photo by Giorgio Trovato on Unsplash"
  },
  {
    topic: "Minimalist 3D Floral & Aura Nail Art 2026",
    category: "Nail Art",
    searchKey: "3D nail art floral design tutorial masterclass",
    heroPhoto: "https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&w=1200&q=80",
    detailPhoto: "https://images.unsplash.com/photo-1632345031435-8727f6897d53?auto=format&fit=crop&w=1000&q=80",
    photoCredit: "Photo by Element5 Digital on Unsplash"
  },
  {
    topic: "Gel-X Nail Extensions Care & Trendy Shapes 2026",
    category: "Nail Styles",
    searchKey: "Gel X nail extension tutorial application step by step",
    heroPhoto: "https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&w=1200&q=80",
    detailPhoto: "https://images.unsplash.com/photo-1632345031435-8727f6897d53?auto=format&fit=crop&w=1000&q=80",
    photoCredit: "Photo on Unsplash (Free Commercial Use)"
  },
  {
    topic: "Milky Soap Nails: The Clean Minimalist Look 2026",
    category: "Nail Styles",
    searchKey: "Soap nails milky manicure clean girl tutorial",
    heroPhoto: "https://images.unsplash.com/photo-1632345031435-8727f6897d53?auto=format&fit=crop&w=1200&q=80",
    detailPhoto: "https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&w=1000&q=80",
    photoCredit: "Photo on Unsplash (Free Commercial Use)"
  },

  // Beauty & Skincare Trends
  {
    topic: "Glass Skin Barrier Repair Skincare Routine 2026",
    category: "Beauty Trends",
    searchKey: "Korean glass skin routine barrier repair tutorial",
    heroPhoto: "https://images.unsplash.com/photo-1512290900672-1f0230722391?auto=format&fit=crop&w=1200&q=80",
    detailPhoto: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=1000&q=80",
    photoCredit: "Photo by Raphael Lovaski on Unsplash"
  },
  {
    topic: "Natural Latte Makeup & Monochromatic Glam 2026",
    category: "Beauty Trends",
    searchKey: "Latte makeup full tutorial step by step",
    heroPhoto: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=1200&q=80",
    detailPhoto: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1000&q=80",
    photoCredit: "Photo by Valerie Elash on Unsplash"
  },
  {
    topic: "Fluffy Feathered Brows & Clean Beauty Guide 2026",
    category: "Beauty Trends",
    searchKey: "Fluffy laminated brows tutorial masterclass",
    heroPhoto: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1200&q=80",
    detailPhoto: "https://images.unsplash.com/photo-1512290900672-1f0230722391?auto=format&fit=crop&w=1000&q=80",
    photoCredit: "Photo by Tamara Bellis on Unsplash"
  }
];

function selectUniqueTopic() {
  const existingFiles = fs.readdirSync(ARTICLES_DIR).map((f) => f.toLowerCase());
  const available = TOPIC_REGISTRY.filter((item) => {
    const slug = item.topic
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
    return !existingFiles.some((f) => f.includes(slug));
  });

  const pool = available.length > 0 ? available : TOPIC_REGISTRY;
  return pool[Math.floor(Math.random() * pool.length)];
}

// ============================================================
// 2. GEMINI API CLIENT (Retries & Fail-safes)
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
// 3. FETCH LONG, IN-DEPTH YOUTUBE TUTORIAL MASTERCLASSES
// ============================================================
async function fetchLongYouTubeTutorial(searchKey) {
  if (!youtubeKey) {
    console.log("[YouTube] No YOUTUBE_API_KEY found. Skipping video search.");
    return [];
  }

  try {
    const query = `${searchKey}`;
    const url = new URL("https://www.googleapis.com/youtube/v3/search");
    url.searchParams.set("part", "snippet");
    url.searchParams.set("q", query);
    url.searchParams.set("type", "video");
    url.searchParams.set("videoDuration", "medium"); // Filter for 4 to 20 minute in-depth tutorials!
    url.searchParams.set("maxResults", "2");
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

    // Fallback if medium duration filter was too strict
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
// 4. MASTER POST GENERATION FLOW
// ============================================================
async function generateSingleArticle() {
  const topicItem = selectUniqueTopic();
  console.log(`\n========================================`);
  console.log(`🚀 Topic: ${topicItem.topic}`);
  console.log(`📂 Category: ${topicItem.category}`);
  console.log(`========================================`);

  // Step 1: Web Research with Gemini Search Grounding
  const researchPrompt = `
You are a senior international beauty editor for 2026.
Conduct fresh, verified research on the beauty trend: "${topicItem.topic}".
Current year: 2026.

Focus on:
- What defines this 2026 trend and why it went viral
- Step-by-step masterclass styling/application technique
- Face shapes and hair/skin types it flatters best
- Maintenance, salon advice, and product recommendations

Return ONLY valid JSON (no markdown):
{
  "summary": "3-sentence editorial summary",
  "keyTakeaways": ["Point 1", "Point 2", "Point 3", "Point 4"]
}
`;

  const researchText = await callGeminiSafe({ prompt: researchPrompt, useSearch: true });
  const research = JSON.parse(cleanJson(researchText));

  // Step 2: Fetch Long YouTube Tutorials
  const videos = await fetchLongYouTubeTutorial(topicItem.searchKey);

  // Step 3: Write Full Article Content
  const articlePrompt = `
You are the Editor-in-Chief of "BeautyTrend Daily".
Write a comprehensive, captivating, human-written editorial article about: "${topicItem.topic}".
Current year: 2026.

Research context:
${research.summary}
Key Takeaways: ${research.keyTakeaways.join("; ")}

CRITICAL EDITORIAL FORMATTING RULES:
1. Do NOT repeat the article title or H1 in the content field.
2. Start directly with an engaging, magazine-style opening paragraph.
3. Structure with high-value H2 sections:
   - ## The 2026 Trend Breakdown & Aesthetic Allure
   - ## Step-by-Step Styling & Application Masterclass
   - ## Face Shape & Skin Type Suitability Guide
   - ## Maintenance, Aftercare & Expert Salon Tips
4. Do NOT insert any raw iframe tags or video embed codes.
5. Provide 4 comprehensive, authoritative FAQ entries.

Return ONLY a valid JSON object matching this structure:
{
  "title": "Compelling High-CTR SEO Headline for 2026",
  "slug": "url-friendly-slug-2026",
  "description": "Engaging meta description under 160 characters",
  "excerpt": "Short 2-sentence teaser for article previews",
  "keywords": ["keyword 1", "keyword 2", "keyword 3", "keyword 4", "keyword 5"],
  "content": "Full markdown content with ## headings starting directly with the intro paragraph...",
  "faq": [
    { "question": "Question 1?", "answer": "Detailed answer 1." },
    { "question": "Question 2?", "answer": "Detailed answer 2." },
    { "question": "Question 3?", "answer": "Detailed answer 3." },
    { "question": "Question 4?", "answer": "Detailed answer 4." }
  ]
}
`;

  const articleText = await callGeminiSafe({ prompt: articlePrompt, useSearch: false });
  const article = JSON.parse(cleanJson(articleText));

  const now = new Date().toISOString().split("T")[0];
  const slug = (article.slug || topicItem.topic.toLowerCase().replace(/[^a-z0-9]+/g, "-")).replace(/^-|-$/g, "");
  const filePath = path.join(ARTICLES_DIR, `${slug}.md`);

  // Ensure content doesn't start with duplicate H1
  let cleanContent = article.content.trim();
  cleanContent = cleanContent.replace(/^#\s+[^\n]+\n+/, "").trim();

  // In-Context Visual Placement: Inject secondary detail image inside the article
  if (topicItem.detailPhoto) {
    const inlineImageMarkdown = `\n\n![${article.title} In-Depth Visual Guide](${topicItem.detailPhoto})\n*Visual Guide: ${topicItem.topic} — ${topicItem.photoCredit}*\n\n`;
    const splitSections = cleanContent.split(/(?=##\s+Face Shape|##\s+Maintenance)/i);
    if (splitSections.length > 1) {
      cleanContent = splitSections[0] + inlineImageMarkdown + splitSections.slice(1).join("");
    }
  }

  // Strict Astro Content Collection Schema Frontmatter
  const frontmatter = `---
title: ${JSON.stringify(article.title)}
description: ${JSON.stringify(article.description)}
excerpt: ${JSON.stringify(article.excerpt || article.description)}
category: ${JSON.stringify(topicItem.category)}
keywords:
${(article.keywords || []).map((k) => `  - ${JSON.stringify(k)}`).join("\n")}
publishedAt: "${now}"
updatedAt: "${now}"
heroImage: ${JSON.stringify(topicItem.heroPhoto)}
imageCredit: ${JSON.stringify(topicItem.photoCredit)}
youtube:
${videos.length > 0 ? videos.map((v) => `  - title: ${JSON.stringify(v.title)}\n    videoId: ${JSON.stringify(v.videoId)}`).join("\n") : "  []"}
faq:
${(article.faq || []).map((f) => `  - question: ${JSON.stringify(f.question)}\n    answer: ${JSON.stringify(f.answer)}`).join("\n")}
---

${cleanContent}
`;

  fs.writeFileSync(filePath, frontmatter, "utf8");
  console.log(`✅ [Success] Generated & Saved: ${filePath}`);
}

async function main() {
  const count = parseInt(process.argv[2] || "1", 10);
  console.log(`Starting publication cycle for ${count} post(s)...`);

  for (let i = 1; i <= count; i++) {
    console.log(`\n--- Generating Post ${i} of ${count} ---`);
    try {
      await generateSingleArticle();
      if (i < count) {
        console.log("Waiting 4 seconds before next generation...");
        await sleep(4000);
      }
    } catch (err) {
      console.error(`❌ Failed generating post ${i}:`, err.message);
    }
  }
}

main().catch((err) => {
  console.error("Pipeline Fatal Error:", err);
  process.exit(1);
});
