import fs from "node:fs";
import path from "node:path";

const geminiKey = process.env.GEMINI_API_KEY;
const youtubeKey = process.env.YOUTUBE_API_KEY;

if (!geminiKey) {
  throw new Error("GEMINI_API_KEY is not configured");
}

const ARTICLES_DIR = "src/content/articles";

fs.mkdirSync(ARTICLES_DIR, {
  recursive: true
});

// ============================================================
// 1. TOPIC POOL
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

function slugify(text) {
  return String(text || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function selectUniqueTopic() {
  const existingFiles = fs
    .readdirSync(ARTICLES_DIR)
    .map((file) => file.toLowerCase());

  const available = TOPICS.filter((topic) => {
    const slug = slugify(topic);

    return !existingFiles.some((file) =>
      file.includes(slug)
    );
  });

  const pool =
    available.length > 0
      ? available
      : TOPICS;

  return pool[
    Math.floor(Math.random() * pool.length)
  ];
}

// ============================================================
// 2. GEMINI CONFIG
// ============================================================

const GEMINI_MODELS = [
  "gemini-2.5-flash",
  "gemini-2.5-flash-lite"
];

const MAX_ATTEMPTS = 3;
const RETRY_DELAY = 4000;

function sleep(ms) {
  return new Promise((resolve) =>
    setTimeout(resolve, ms)
  );
}

// ============================================================
// 3. GEMINI API
// ============================================================

async function callGemini(
  prompt,
  model = "gemini-2.5-flash"
) {
  const url =
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;

  const controller =
    new AbortController();

  const timeout = setTimeout(
    () => controller.abort(),
    120000
  );

  try {
    const response = await fetch(
      url,
      {
        method: "POST",

        headers: {
          "Content-Type":
            "application/json",
          "x-goog-api-key":
            geminiKey
        },

        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt
                }
              ]
            }
          ],

          tools: [
            {
              google_search: {}
            }
          ]
        }),

        signal: controller.signal
      }
    );

    const text =
      await response.text();

    if (!response.ok) {
      let message = text;

      try {
        const data =
          JSON.parse(text);

        message =
          data?.error?.message ||
          text;
      } catch {}

      const error =
        new Error(
          `Gemini API ${response.status}: ${message}`
        );

      error.status =
        response.status;

      throw error;
    }

    let data;

    try {
      data =
        JSON.parse(text);
    } catch {
      throw new Error(
        "Gemini returned invalid HTTP JSON"
      );
    }

    const output =
      data?.candidates?.[0]
        ?.content?.parts
        ?.map(
          (part) =>
            part.text || ""
        )
        .join("")
        .trim();

    if (!output) {
      throw new Error(
        "Gemini returned an empty response"
      );
    }

    return output;

  } catch (error) {

    if (
      error?.name ===
      "AbortError"
    ) {
      const timeoutError =
        new Error(
          "Gemini request timed out after 120 seconds"
        );

      timeoutError.status =
        408;

      throw timeoutError;
    }

    throw error;

  } finally {
    clearTimeout(timeout);
  }
}

// ============================================================
// 4. GEMINI SAFE RETRY
// ============================================================

async function callGeminiSafe(prompt) {
  let lastError = null;

  for (
    const model of GEMINI_MODELS
  ) {

    for (
      let attempt = 1;
      attempt <= MAX_ATTEMPTS;
      attempt++
    ) {

      try {

        console.log(
          `Gemini ${model} - attempt ${attempt}/${MAX_ATTEMPTS}`
        );

        const result =
          await callGemini(
            prompt,
            model
          );

        console.log(
          `Gemini response received from ${model}`
        );

        return result;

      } catch (error) {

        lastError =
          error;

        console.log(
          `Gemini error: ${error.message}`
        );

        const retryable =
          error?.status === 408 ||
          error?.status === 429 ||
          error?.status === 500 ||
          error?.status === 502 ||
          error?.status === 503 ||
          error?.status === 504 ||
          error?.name ===
            "AbortError" ||
          String(
            error?.message || ""
          )
            .toLowerCase()
            .includes("fetch failed");

        if (
          retryable &&
          attempt < MAX_ATTEMPTS
        ) {

          console.log(
            `Waiting ${RETRY_DELAY / 1000}s before retry...`
          );

          await sleep(
            RETRY_DELAY
          );

        } else if (
          !retryable
        ) {
          break;
        }
      }
    }

    console.log(
      `Trying next Gemini model...`
    );
  }

  throw new Error(
    `All Gemini attempts failed. Last error: ${lastError?.message}`
  );
}

// ============================================================
// 5. JSON CLEANER
// ============================================================

function cleanJson(text) {

  let value =
    String(text || "")
      .trim();

  value =
    value
      .replace(
        /^```json\s*/i,
        ""
      )
      .replace(
        /^```\s*/i,
        ""
      )
      .replace(
        /\s*```$/i,
        ""
      )
      .trim();

  const firstBrace =
    value.indexOf("{");

  const lastBrace =
    value.lastIndexOf("}");

  if (
    firstBrace !== -1 &&
    lastBrace !== -1 &&
    lastBrace > firstBrace
  ) {

    value =
      value.slice(
        firstBrace,
        lastBrace + 1
      );
  }

  return value.trim();
}

// ============================================================
// 6. PARSE GEMINI JSON
// ============================================================

function parseArticleJson(raw) {

  const cleaned =
    cleanJson(raw);

  try {

    return JSON.parse(
      cleaned
    );

  } catch (error) {

    console.error(
      "Gemini returned invalid article JSON."
    );

    console.error(
      cleaned.slice(0, 5000)
    );

    throw new Error(
      `Invalid article JSON: ${error.message}`
    );
  }
}

// ============================================================
// 7. YOUTUBE
// ============================================================

async function fetchYouTubeVideos(
  query
) {

  if (!youtubeKey) {
    console.log(
      "YouTube API key not configured. Continuing without videos."
    );

    return [];
  }

  try {

    const url =
      new URL(
        "https://www.googleapis.com/youtube/v3/search"
      );

    url.searchParams.set(
      "part",
      "snippet"
    );

    url.searchParams.set(
      "maxResults",
      "2"
    );

    url.searchParams.set(
      "q",
      `${query} tutorial 2026`
    );

    url.searchParams.set(
      "type",
      "video"
    );

    url.searchParams.set(
      "safeSearch",
      "strict"
    );

    url.searchParams.set(
      "key",
      youtubeKey
    );

    const controller =
      new AbortController();

    const timeout =
      setTimeout(
        () => controller.abort(),
        30000
      );

    let response;

    try {

      response =
        await fetch(
          url,
          {
            signal:
              controller.signal
          }
        );

    } finally {

      clearTimeout(
        timeout
      );
    }

    const text =
      await response.text();

    if (!response.ok) {
      throw new Error(
        `YouTube API ${response.status}: ${text}`
      );
    }

    const data =
      JSON.parse(text);

    if (
      !Array.isArray(
        data?.items
      )
    ) {
      return [];
    }

    return data.items
      .filter(
        (item) =>
          item?.id?.videoId
      )
      .map((item) => ({
        title:
          item?.snippet
            ?.title ||
          "Beauty Tutorial",

        videoId:
          item.id.videoId
      }));

  } catch (error) {

    console.warn(
      "YouTube API warning:",
      error.message
    );

    return [];
  }
}

// ============================================================
// 8. ARTICLE VALIDATION
// ============================================================

function validateArticle(article) {

  if (
    !article ||
    typeof article !== "object"
  ) {
    throw new Error(
      "Gemini article response is not an object"
    );
  }

  const required =
    [
      "title",
      "slug",
      "description",
      "content"
    ];

  for (
    const field of required
  ) {

    if (
      !article[field] ||
      typeof article[field] !==
        "string"
    ) {
      throw new Error(
        `Article field missing: ${field}`
      );
    }
  }

  if (
    !Array.isArray(
      article.keywords
    )
  ) {
    article.keywords = [];
  }

  if (
    !Array.isArray(
      article.faq
    )
  ) {
    article.faq = [];
  }

  return article;
}

// ============================================================
// 9. MAIN PIPELINE
// ============================================================

async function run() {

  const topic =
    selectUniqueTopic();

  console.log(
    "================================="
  );

  console.log(
    "DAILY BEAUTY ARTICLE"
  );

  console.log(
    "================================="
  );

  console.log(
    `Generating article for: "${topic}"`
  );

  // ----------------------------------------------------------
  // GEMINI PROMPT
  // ----------------------------------------------------------

  const prompt = `
You are a senior beauty editor for
"BeautyTrend Daily".

Write a comprehensive,
original beauty editorial about:

"${topic}"

Current year: 2026.

The article should be useful for an
international audience.

Requirements:

- Around 1200 words
- Natural human editorial style
- Original wording
- Strong SEO
- Helpful information
- Mobile-friendly structure
- No keyword stuffing
- No invented statistics
- No invented quotes
- No AI references
- No source copying

Include:

- Introduction
- Main trend discussion
- Styling ideas
- Practical tips
- Maintenance
- Who the style suits
- Final thoughts
- 4 FAQs

Return ONLY valid JSON.

IMPORTANT:

Do NOT use markdown code fences.

Do NOT write anything before the JSON.

Do NOT write anything after the JSON.

The content field MUST contain Markdown.

Escape quotation marks correctly
inside JSON strings.

Required structure:

{
  "title": "SEO title",
  "slug": "seo-friendly-slug",
  "description": "Meta description under 160 characters",
  "excerpt": "Short article preview",
  "category": "Haircuts",
  "keywords": [
    "keyword 1",
    "keyword 2",
    "keyword 3",
    "keyword 4",
    "keyword 5"
  ],
  "content": "Markdown article",
  "faq": [
    {
      "question": "Question?",
      "answer": "Answer."
    },
    {
      "question": "Question?",
      "answer": "Answer."
    },
    {
      "question": "Question?",
      "answer": "Answer."
    },
    {
      "question": "Question?",
      "answer": "Answer."
    }
  ]
}
`;

  // ----------------------------------------------------------
  // GENERATE ARTICLE
  // ----------------------------------------------------------

  let article;

  let lastArticleError;

  for (
    let attempt = 1;
    attempt <= 2;
    attempt++
  ) {

    try {

      console.log(
        `Article generation attempt ${attempt}/2`
      );

      const rawJson =
        await callGeminiSafe(
          prompt
        );

      article =
        parseArticleJson(
          rawJson
        );

      article =
        validateArticle(
          article
        );

      break;

    } catch (error) {

      lastArticleError =
        error;

      console.error(
        `Article generation failed: ${error.message}`
      );

      if (
        attempt < 2
      ) {

        console.log(
          "Retrying article generation..."
        );

        await sleep(3000);
      }
    }
  }

  if (!article) {

    throw new Error(
      `Article generation failed after retries: ${lastArticleError?.message}`
    );
  }

  console.log(
    `Article title: ${article.title}`
  );

  // ----------------------------------------------------------
  // YOUTUBE
  // ----------------------------------------------------------

  const videos =
    await fetchYouTubeVideos(
      article.title
    );

  console.log(
    `YouTube videos found: ${videos.length}`
  );

  // ----------------------------------------------------------
  // DATE
  // ----------------------------------------------------------

  const now =
    new Date()
      .toISOString()
      .split("T")[0];

  // ----------------------------------------------------------
  // FRONTMATTER
  // ----------------------------------------------------------

  const keywords =
    Array.isArray(
      article.keywords
    )
      ? article.keywords
      : [];

  const faq =
    Array.isArray(
      article.faq
    )
      ? article.faq
      : [];

  const frontmatter = `---
title: ${JSON.stringify(article.title)}
description: ${JSON.stringify(article.description)}
excerpt: ${JSON.stringify(article.excerpt || article.description)}
category: ${JSON.stringify(article.category || "Beauty")}
keywords:
${
  keywords.length > 0
    ? keywords
        .map(
          (keyword) =>
            `  - ${JSON.stringify(keyword)}`
        )
        .join("\n")
    : "  []"
}
publishedAt: "${now}"
updatedAt: "${now}"
youtube:
${
  videos.length > 0
    ? videos
        .map(
          (video) =>
            `  - title: ${JSON.stringify(video.title)}
    videoId: ${JSON.stringify(video.videoId)}`
        )
        .join("\n")
    : "  []"
}
faq:
${
  faq.length > 0
    ? faq
        .map(
          (item) =>
            `  - question: ${JSON.stringify(item.question)}
    answer: ${JSON.stringify(item.answer)}`
        )
        .join("\n")
    : "  []"
}
---

`;

  // ----------------------------------------------------------
  // ARTICLE CONTENT
  // ----------------------------------------------------------

  let content =
    article.content
      .trim();

  // YouTube embeds are added only
  // when valid videos exist.

  if (
    videos.length > 0
  ) {

    content +=
      `\n\n## Video Tutorials & Inspiration\n\n`;

    content +=
      videos
        .map(
          (video) =>
            `<div class="video-embed" style="position:relative;width:100%;aspect-ratio:16/9;margin:24px 0;overflow:hidden;border-radius:16px;">
  <iframe
    src="https://www.youtube.com/embed/${video.videoId}"
    title="${video.title.replace(/"/g, "&quot;")}"
    loading="lazy"
    style="width:100%;height:100%;border:0;"
    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
    allowfullscreen>
  </iframe>
</div>`
        )
        .join("\n\n");
  }

  // ----------------------------------------------------------
  // FINAL MARKDOWN
  // ----------------------------------------------------------

  const finalContent =
    frontmatter +
    content +
    "\n";

  // ----------------------------------------------------------
  // SAFE SLUG
  // ----------------------------------------------------------

  const safeSlug =
    slugify(
      article.slug
    );

  if (!safeSlug) {
    throw new Error(
      "Generated article has an invalid slug"
    );
  }

  const filename =
    `${safeSlug}.md`;

  const filePath =
    path.join(
      ARTICLES_DIR,
      filename
    );

  // ----------------------------------------------------------
  // WRITE ARTICLE
  // ----------------------------------------------------------

  fs.writeFileSync(
    filePath,
    finalContent,
    "utf8"
  );

  console.log(
    "================================="
  );

  console.log(
    "ARTICLE CREATED SUCCESSFULLY"
  );

  console.log(
    "================================="
  );

  console.log(
    `Title: ${article.title}`
  );

  console.log(
    `Slug: ${safeSlug}`
  );

  console.log(
    `Category: ${article.category || "Beauty"}`
  );

  console.log(
    `YouTube videos: ${videos.length}`
  );

  console.log(
    `File: ${filePath}`
  );

  console.log(
    "================================="
  );
}

// ============================================================
// RUN
// ============================================================

run().catch(
  (error) => {

    console.error(
      "================================="
    );

    console.error(
      "FATAL ERROR"
    );

    console.error(
      "================================="
    );

    console.error(
      error
    );

    process.exit(1);
  }
);
