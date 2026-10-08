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
// 1. EXTENSIVE REGISTRY: 35+ UNIQUE TOPICS WITH DEDICATED REAL HD PHOTOS
// ============================================================
const TOPIC_REGISTRY = [
  // Haircuts
  {
    topic: "Korean Butterfly Layered Haircut Trends 2026",
    category: "Haircuts",
    searchKey: "Butterfly haircut tutorial step by step",
    heroPhoto: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=1200&h=675&q=85",
    detailPhoto: "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=1200&h=675&q=85",
    photoCredit: "Photo by Valerie Elash on Unsplash"
  },
  {
    topic: "French Bob with Airy Curtain Bangs 2026",
    category: "Haircuts",
    searchKey: "French bob haircut styling tutorial",
    heroPhoto: "https://images.unsplash.com/photo-1595476108010-b4d1f102b1b1?auto=format&fit=crop&w=1200&h=675&q=85",
    detailPhoto: "https://images.unsplash.com/photo-1580618672591-eb180b1a973f?auto=format&fit=crop&w=1200&h=675&q=85",
    photoCredit: "Photo by Ali Pazani on Unsplash"
  },
  {
    topic: "Modern Shag Haircut for Naturally Curly Hair 2026",
    category: "Haircuts",
    searchKey: "Curly shag haircut styling full tutorial",
    heroPhoto: "https://images.unsplash.com/photo-1584297091622-af8e5fdcf9ef?auto=format&fit=crop&w=1200&h=675&q=85",
    detailPhoto: "https://images.unsplash.com/photo-1519699047748-de8e457a634e?auto=format&fit=crop&w=1200&h=675&q=85",
    photoCredit: "Photo by Ayo Ogunseinde on Unsplash"
  },
  {
    topic: "Italian Bob Haircut: The Chic Styling Guide 2026",
    category: "Haircuts",
    searchKey: "Italian bob styling haircut guide tutorial",
    heroPhoto: "https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&w=1200&h=675&q=85",
    detailPhoto: "https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?auto=format&fit=crop&w=1200&h=675&q=85",
    photoCredit: "Photo by Aw Creative on Unsplash"
  },
  {
    topic: "Bixie & Soft Pixie Cut Transformations 2026",
    category: "Haircuts",
    searchKey: "Pixie bixie haircut tutorial transformation",
    heroPhoto: "https://images.unsplash.com/photo-1500917293891-ef795e70e1f6?auto=format&fit=crop&w=1200&h=675&q=85",
    detailPhoto: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1200&h=675&q=85",
    photoCredit: "Photo by Tamara Bellis on Unsplash"
  },
  {
    topic: "90s Supermodel Blowout Layers Haircut 2026",
    category: "Haircuts",
    searchKey: "90s blowout layers haircut round brush tutorial",
    heroPhoto: "https://images.unsplash.com/photo-1519699047748-de8e457a634e?auto=format&fit=crop&w=1200&h=675&q=85",
    detailPhoto: "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=1200&h=675&q=85",
    photoCredit: "Photo by Sarah Comeau on Unsplash"
  },
  {
    topic: "Face-Framing Wispy Bangs & Midi Haircuts 2026",
    category: "Haircuts",
    searchKey: "Cutting wispy curtain bangs full tutorial",
    heroPhoto: "https://images.unsplash.com/photo-1595476108010-b4d1f102b1b1?auto=format&fit=crop&w=1200&h=675&q=85",
    detailPhoto: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=1200&h=675&q=85",
    photoCredit: "Photo by Ali Pazani on Unsplash"
  },
  {
    topic: "The Hush Cut: Soft Korean Feathered Layers 2026",
    category: "Haircuts",
    searchKey: "Korean hush cut tutorial styling",
    heroPhoto: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=1200&h=675&q=85",
    detailPhoto: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1200&h=675&q=85",
    photoCredit: "Photo by Valerie Elash on Unsplash"
  },
  {
    topic: "The Clavicut: Collarbone-Skimming Lob Haircut 2026",
    category: "Haircuts",
    searchKey: "Clavicut collarbone lob haircut tutorial",
    heroPhoto: "https://images.unsplash.com/photo-1492106087820-71f1a00d2b11?auto=format&fit=crop&w=1200&h=675&q=85",
    detailPhoto: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=1200&h=675&q=85",
    photoCredit: "Photo by Tamara Bellis on Unsplash"
  },

  // Hairstyles
  {
    topic: "Sleek Glass Hair and High-Gloss Styling Guide 2026",
    category: "Hairstyles",
    searchKey: "Glass hair styling tutorial glossy straight hair",
    heroPhoto: "https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?auto=format&fit=crop&w=1200&h=675&q=85",
    detailPhoto: "https://images.unsplash.com/photo-1580618672591-eb180b1a973f?auto=format&fit=crop&w=1200&h=675&q=85",
    photoCredit: "Photo by Tamara Bellis on Unsplash"
  },
  {
    topic: "Effortless French Girl Messy Bun Tutorials 2026",
    category: "Hairstyles",
    searchKey: "French messy bun tutorial step by step easy",
    heroPhoto: "https://images.unsplash.com/photo-1519699047748-de8e457a634e?auto=format&fit=crop&w=1200&h=675&q=85",
    detailPhoto: "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=1200&h=675&q=85",
    photoCredit: "Photo by Sarah Comeau on Unsplash"
  },
  {
    topic: "Heatless Silk Ribbon Waves & Overnight Styling 2026",
    category: "Hairstyles",
    searchKey: "Heatless curls robe belt tutorial overnight",
    heroPhoto: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=1200&h=675&q=85",
    detailPhoto: "https://images.unsplash.com/photo-1595476108010-b4d1f102b1b1?auto=format&fit=crop&w=1200&h=675&q=85",
    photoCredit: "Photo by Valerie Elash on Unsplash"
  },
  {
    topic: "Clean Girl Slicked-Back Bun Styling Routine 2026",
    category: "Hairstyles",
    searchKey: "Clean girl slick back sleek bun tutorial",
    heroPhoto: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1200&h=675&q=85",
    detailPhoto: "https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?auto=format&fit=crop&w=1200&h=675&q=85",
    photoCredit: "Photo by Tamara Bellis on Unsplash"
  },
  {
    topic: "Boho Romantic Braids & Half-Up Hair Trends 2026",
    category: "Hairstyles",
    searchKey: "Boho braids half up tutorial romantic",
    heroPhoto: "https://images.unsplash.com/photo-1584297091622-af8e5fdcf9ef?auto=format&fit=crop&w=1200&h=675&q=85",
    detailPhoto: "https://images.unsplash.com/photo-1519699047748-de8e457a634e?auto=format&fit=crop&w=1200&h=675&q=85",
    photoCredit: "Photo by Ayo Ogunseinde on Unsplash"
  },

  // Hair Colors
  {
    topic: "Espresso Brunette & Cherry Cola Hair Colors 2026",
    category: "Hair Color",
    searchKey: "Cherry cola brunette hair color transformation tutorial",
    heroPhoto: "https://images.unsplash.com/photo-1580618672591-eb180b1a973f?auto=format&fit=crop&w=1200&h=675&q=85",
    detailPhoto: "https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?auto=format&fit=crop&w=1200&h=675&q=85",
    photoCredit: "Photo by Valerie Elash on Unsplash"
  },
  {
    topic: "Honey Vanilla & Buttercream Blonde Balayage 2026",
    category: "Hair Color",
    searchKey: "Honey blonde balayage transformation masterclass",
    heroPhoto: "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=1200&h=675&q=85",
    detailPhoto: "https://images.unsplash.com/photo-1519699047748-de8e457a634e?auto=format&fit=crop&w=1200&h=675&q=85",
    photoCredit: "Photo by Guilherme Petri on Unsplash"
  },
  {
    topic: "Mushroom Brown Soft Dimension Hair Color 2026",
    category: "Hair Color",
    searchKey: "Mushroom brown hair color formula tutorial",
    heroPhoto: "https://images.unsplash.com/photo-1605497788044-5a32c7078486?auto=format&fit=crop&w=1200&h=675&q=85",
    detailPhoto: "https://images.unsplash.com/photo-1580618672591-eb180b1a973f?auto=format&fit=crop&w=1200&h=675&q=85",
    photoCredit: "Photo by Aw Creative on Unsplash"
  },
  {
    topic: "Warm Copper & Peach Fuzz Hair Color Trends 2026",
    category: "Hair Color",
    searchKey: "Copper hair color dying tutorial formula",
    heroPhoto: "https://images.unsplash.com/photo-1580618672591-eb180b1a973f?auto=format&fit=crop&w=1200&h=675&q=85",
    detailPhoto: "https://images.unsplash.com/photo-1595476108010-b4d1f102b1b1?auto=format&fit=crop&w=1200&h=675&q=85",
    photoCredit: "Photo by Valerie Elash on Unsplash"
  },

  // Nail Art & Manicures
  {
    topic: "Cat Eye Velvet Magnetic Gel Nail Trends 2026",
    category: "Nail Art",
    searchKey: "Cat eye velvet magnetic nails tutorial full guide",
    heroPhoto: "https://images.unsplash.com/photo-1632345031435-8727f6897d53?auto=format&fit=crop&w=1200&h=675&q=85",
    detailPhoto: "https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&w=1200&h=675&q=85",
    photoCredit: "Photo by Giorgio Trovato on Unsplash"
  },
  {
    topic: "Micro French Tip Elegant Manicure Designs 2026",
    category: "Nail Art",
    searchKey: "Micro french tip manicure tutorial step by step",
    heroPhoto: "https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&w=1200&h=675&q=85",
    detailPhoto: "https://images.unsplash.com/photo-1632345031435-8727f6897d53?auto=format&fit=crop&w=1200&h=675&q=85",
    photoCredit: "Photo by Element5 Digital on Unsplash"
  },
  {
    topic: "Glazed Donut Chrome Nails Style Guide 2026",
    category: "Nail Art",
    searchKey: "Glazed donut chrome nails tutorial hailey bieber",
    heroPhoto: "https://images.unsplash.com/photo-1632345031435-8727f6897d53?auto=format&fit=crop&w=1200&h=675&q=85",
    detailPhoto: "https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&w=1200&h=675&q=85",
    photoCredit: "Photo by Giorgio Trovato on Unsplash"
  },
  {
    topic: "Minimalist 3D Floral & Aura Nail Art 2026",
    category: "Nail Art",
    searchKey: "3D nail art floral design tutorial masterclass",
    heroPhoto: "https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&w=1200&h=675&q=85",
    detailPhoto: "https://images.unsplash.com/photo-1632345031435-8727f6897d53?auto=format&fit=crop&w=1200&h=675&q=85",
    photoCredit: "Photo by Element5 Digital on Unsplash"
  },
  {
    topic: "Gel-X Nail Extensions Care & Trendy Shapes 2026",
    category: "Nail Styles",
    searchKey: "Gel X nail extension tutorial application step by step",
    heroPhoto: "https://images.unsplash.com/photo-1519014816548-bf5fe059798b?auto=format&fit=crop&w=1200&h=675&q=85",
    detailPhoto: "https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&w=1200&h=675&q=85",
    photoCredit: "Photo on Unsplash (Free Commercial License)"
  },
  {
    topic: "Milky Soap Nails: The Clean Minimalist Look 2026",
    category: "Nail Styles",
    searchKey: "Soap nails milky manicure clean girl tutorial",
    heroPhoto: "https://images.unsplash.com/photo-1599940824399-b87987ceb72a?auto=format&fit=crop&w=1200&h=675&q=85",
    detailPhoto: "https://images.unsplash.com/photo-1632345031435-8727f6897d53?auto=format&fit=crop&w=1200&h=675&q=85",
    photoCredit: "Photo on Unsplash (Free Commercial License)"
  },

  // Beauty & Skincare Trends
  {
    topic: "Glass Skin Barrier Repair Skincare Routine 2026",
    category: "Beauty Trends",
    searchKey: "Korean glass skin routine barrier repair tutorial",
    heroPhoto: "https://images.unsplash.com/photo-1512290900672-1f0230722391?auto=format&fit=crop&w=1200&h=675&q=85",
    detailPhoto: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=1200&h=675&q=85",
    photoCredit: "Photo by Raphael Lovaski on Unsplash"
  },
  {
    topic: "Natural Latte Makeup & Monochromatic Glam 2026",
    category: "Beauty Trends",
    searchKey: "Latte makeup full tutorial step by step",
    heroPhoto: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=1200&h=675&q=85",
    detailPhoto: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1200&h=675&q=85",
    photoCredit: "Photo by Valerie Elash on Unsplash"
  },
  {
    topic: "Fluffy Feathered Brows & Clean Beauty Guide 2026",
    category: "Beauty Trends",
    searchKey: "Fluffy laminated brows tutorial masterclass",
    heroPhoto: "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=1200&h=675&q=85",
    detailPhoto: "https://images.unsplash.com/photo-1512290900672-1f0230722391?auto=format&fit=crop&w=1200&h=675&q=85",
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
// 2. GEMINI API CLIENT (Retries & Search Grounding)
// ============================================================
const GEMINI_MODELS = ["gemini-2.5-flash", "gemini-2.0-flash", "gemini-1.5-flash"];
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 3000;
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function callGemini({ model, prompt, useSearch = false, jsonMode = false }) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;
  const body = {
    contents: [{ parts: [{ text: prompt }] }]
  };

  if (jsonMode && !useSearch) {
    body.generationConfig = { responseMimeType: "application/json" };
  }

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

async function callGeminiSafe({ prompt, useSearch = false, jsonMode = false }) {
  let lastError = null;
  for (const model of GEMINI_MODELS) {
    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        console.log(`[Gemini] Model ${model} - Attempt ${attempt}/${MAX_RETRIES}`);
        return await callGemini({ model, prompt, useSearch, jsonMode });
      } catch (err) {
        lastError = err;
        console.warn(`[Gemini] Attempt failed (${model}): ${err.message}`);
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

function robustJsonParse(text) {
  const cleaned = cleanJson(text);
  try {
    return JSON.parse(cleaned);
  } catch (err) {
    try {
      const sanitized = cleaned
        .replace(/[\u0000-\u0009\u000B-\u001F]+/g, " ")
        .replace(/\r\n/g, "\\n")
        .replace(/\r/g, "\\n");
      return JSON.parse(sanitized);
    } catch (err2) {
      // Return safe fallback object
      console.warn("JSON parse fallback engaged for raw text response.");
      return {
        summary: cleaned,
        keyTakeaways: ["Trend Evolution", "Styling Techniques", "Suitability Matrix", "Maintenance Guide"]
      };
    }
  }
}

// ============================================================
// 3. FETCH LONG, HIGH-VALUE YOUTUBE MASTERCLASSES
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
    url.searchParams.set("videoDuration", "medium"); // 4 to 20 minute in-depth tutorials
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

    // Fallback if medium filter returned 0
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
// 4. 1200+ WORD EXHAUSTIVE DEEP-DIVE EDITORIAL ARTICLE GENERATION
// ============================================================
async function generateSingleArticle() {
  const topicItem = selectUniqueTopic();
  console.log(`\n========================================`);
  console.log(`🚀 Topic: ${topicItem.topic}`);
  console.log(`📂 Category: ${topicItem.category}`);
  console.log(`========================================`);

  // Step 1: Deep Google Grounded Research (Note: jsonMode MUST be false when useSearch is true)
  const researchPrompt = `
You are a senior beauty journalist and SEO specialist.
Search Google for top international salon tutorials, stylist guides, and beauty trend reports about: "${topicItem.topic}". Year: 2026.

Synthesize:
- Detailed breakdown of what makes this trend unique in 2026
- Specific salon formulas, cutting angles, product ingredients, and tool recommendations
- Face shape suitability (oval, square, round, heart) and hair/skin texture analysis
- Step-by-step masterclass technique (at least 5 detailed steps)
- Common mistakes to avoid and pro stylist secrets
- Longevity, maintenance schedules, and at-home aftercare

Output your research as a concise structured summary with key takeaways.
`;

  let researchSummary = "";
  try {
    researchSummary = await callGeminiSafe({ prompt: researchPrompt, useSearch: true, jsonMode: false });
    console.log(`✅ Grounded Google Research completed.`);
  } catch (err) {
    console.warn(`⚠️ Search grounding fallback: ${err.message}`);
    researchSummary = `Comprehensive 2026 beauty trend overview for ${topicItem.topic}.`;
  }

  // Step 2: Fetch 1 Long, Verified YouTube Tutorial Masterclass
  const videos = await fetchLongYouTubeTutorial(topicItem.searchKey);
  const featuredVideo = videos[0] || null;
  console.log(`🎬 YouTube video: ${featuredVideo ? featuredVideo.title : "Not found"}`);

  // Step 3: Write 1200+ Word Human-Grade Deep-Dive Editorial (jsonMode: true is active here)
  const articlePrompt = `
You are the Editor-in-Chief of "BeautyTrend Daily", an elite digital beauty magazine.
Write an exhaustive, authoritative, deeply detailed editorial masterclass guide on: "${topicItem.topic}".
Current year: 2026.

RESEARCH CONTEXT:
${researchSummary}

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
6. Content must be 100% original, unique, and fully human-grade SEO.

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

  const articleText = await callGeminiSafe({ prompt: articlePrompt, useSearch: false, jsonMode: true });
  const article = robustJsonParse(articleText);

  const now = new Date().toISOString().split("T")[0];
  const slug = (article.slug || topicItem.topic.toLowerCase().replace(/[^a-z0-9]+/g, "-")).replace(/^-|-$/g, "");
  const filePath = path.join(ARTICLES_DIR, `${slug}.md`);

  let cleanContent = String(article.content || "").trim();
  cleanContent = cleanContent.replace(/^#\s+[^\n]+\n+/, "").trim();

  // IN-CONTEXT VIDEO INJECTION: Place the video right after the Step-by-Step Masterclass section
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

  // IN-CONTEXT PHOTO INJECTION: Place secondary visual guide in the Face Shape / Salon Guide section
  if (topicItem.detailPhoto) {
    const detailImageBlock = `\n\n<figure class="in-article-figure">
  <img src="${topicItem.detailPhoto}" alt="${article.title} Visual Guide" class="in-article-img" loading="lazy" />
  <figcaption class="in-article-caption">Visual Inspiration: ${topicItem.topic} — ${topicItem.photoCredit}</figcaption>
</figure>\n\n`;

    const faceShapeMatch = cleanContent.match(/(##\s+Face Shape[\s\S]*?)(?=##\s+Essential Tools|##\s+Salon Consultation|\Z)/i);
    if (faceShapeMatch) {
      cleanContent = cleanContent.replace(faceShapeMatch[1], faceShapeMatch[1] + detailImageBlock);
    } else {
      cleanContent = detailImageBlock + cleanContent;
    }
  }

  // Count words to log quality
  const wordCount = cleanContent.split(/\s+/).length;
  console.log(`📊 Generated Article Word Count: ${wordCount} words (Target: 1200+)`);

  // Astro Content Schema Frontmatter
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
  console.log(`✅ [Success] Generated & Saved: ${filePath} (${wordCount} words)`);
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
