import fs from "node:fs";

const geminiKey = process.env.GEMINI_API_KEY;
const youtubeKey = process.env.YOUTUBE_API_KEY;

if (!geminiKey) {
  throw new Error("GEMINI_API_KEY is not configured");
}

if (!youtubeKey) {
  throw new Error("YOUTUBE_API_KEY is not configured");
}

// ============================================================
// CONFIG
// ============================================================

const GEMINI_MODELS = [
  "gemini-2.5-flash",
  "gemini-2.5-flash-lite"
];

const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 5000;

const MAX_YOUTUBE_VIDEOS = 3;

const sleep = (ms) =>
  new Promise((resolve) => setTimeout(resolve, ms));

// ============================================================
// GEMINI API HELPER
// ============================================================

async function callGemini({
  model,
  prompt,
  useSearch = false
}) {
  const url =
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;

  const body = {
    contents: [
      {
        parts: [
          {
            text: prompt
          }
        ]
      }
    ]
  };

  if (useSearch) {
    body.tools = [
      {
        google_search: {}
      }
    ];
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
    let errorMessage = text;

    try {
      const json = JSON.parse(text);

      errorMessage =
        json?.error?.message ||
        text;

    } catch {}

    const error = new Error(
      `Gemini API error: ${response.status} ${errorMessage}`
    );

    error.status = response.status;

    throw error;
  }

  let json;

  try {
    json = JSON.parse(text);

  } catch {
    throw new Error(
      "Gemini returned invalid HTTP JSON"
    );
  }

  const output =
    json?.candidates?.[0]?.content?.parts
      ?.map((part) => part.text || "")
      .join("")
      .trim();

  if (!output) {
    throw new Error(
      "Gemini returned an empty response"
    );
  }

  return output;
}

// ============================================================
// SAFE GEMINI CALL
// ============================================================

async function callGeminiSafe({
  prompt,
  useSearch = false
}) {
  let lastError = null;

  for (const model of GEMINI_MODELS) {

    console.log(
      `\nTrying Gemini model: ${model}`
    );

    for (
      let attempt = 1;
      attempt <= MAX_RETRIES;
      attempt++
    ) {

      try {

        console.log(
          `Attempt ${attempt}/${MAX_RETRIES}`
        );

        const result =
          await callGemini({
            model,
            prompt,
            useSearch
          });

        console.log(
          `Gemini success: ${model}`
        );

        return result;

      } catch (error) {

        lastError = error;

        console.log(
          `Gemini failed: ${error.message}`
        );

        const retryable =
          error.status === 429 ||
          error.status === 500 ||
          error.status === 502 ||
          error.status === 503 ||
          error.status === 504;

        if (!retryable) {
          throw error;
        }

        if (attempt < MAX_RETRIES) {

          console.log(
            `Waiting ${RETRY_DELAY_MS / 1000}s before retry...`
          );

          await sleep(RETRY_DELAY_MS);
        }
      }
    }

    console.log(
      `Model ${model} failed after ${MAX_RETRIES} attempts.`
    );

    console.log(
      "Trying next Gemini model..."
    );
  }

  throw new Error(
    `All Gemini models failed.\nLast error: ${lastError?.message}`
  );
}

// ============================================================
// JSON CLEANER
// ============================================================

function cleanJson(text) {

  let value =
    String(text || "")
      .trim();

  value =
    value
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/\s*```$/i, "")
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
// JSON PARSER
// ============================================================

function parseJson(text, label) {

  const cleaned =
    cleanJson(text);

  try {

    return JSON.parse(cleaned);

  } catch (error) {

    console.error(
      `\n${label} JSON parsing failed.`
    );

    console.error(
      cleaned.slice(0, 3000)
    );

    throw new Error(
      `${label} JSON could not be parsed`
    );
  }
}

// ============================================================
// TOPICS
// ============================================================

const topics = [
  "latest women's haircut trends 2026",
  "latest women's hairstyle trends 2026",
  "latest nail art trends 2026",
  "latest manicure trends 2026",
  "latest hair color trends 2026",
  "latest short haircut trends 2026",
  "latest bob haircut trends 2026",
  "latest curly hairstyle trends 2026",
  "latest bridal hairstyle trends 2026",
  "latest summer beauty trends 2026"
];

const topic =
  topics[
    Math.floor(
      Math.random() * topics.length
    )
  ];

console.log(
  "================================="
);

console.log(
  "AUTOMATIC BEAUTY ARTICLE"
);

console.log(
  "================================="
);

console.log(
  `Topic: ${topic}`
);

// ============================================================
// RESEARCH
// ============================================================

const researchPrompt = `
You are a research editor for an international beauty magazine.

Research this topic using current web information:

"${topic}"

Focus on:

- current 2026 trends
- style details
- practical information
- who the styles may suit
- maintenance
- styling
- recent developments
- useful information from reputable sources

Do not copy source text.

IMPORTANT:

Return ONLY valid JSON.

Do not use Markdown code fences.

Do not include any text before or after the JSON.

Required format:

{
  "topic": "",
  "summary": "",
  "key_points": [],
  "sources": [
    {
      "title": "",
      "url": ""
    }
  ]
}
`;

console.log(
  "\nResearching web information..."
);

let research;

try {

  const researchText =
    await callGeminiSafe({
      prompt: researchPrompt,
      useSearch: true
    });

  research =
    parseJson(
      researchText,
      "Research"
    );

  console.log(
    "Research completed."
  );

} catch (error) {

  console.error(
    "\nResearch failed."
  );

  throw error;
}

// ============================================================
// ARTICLE GENERATION
// ============================================================

const articlePrompt = `
You are the senior editor of a modern international beauty magazine.

Create an original article based on the research below.

TOPIC:
${topic}

ARTICLE REQUIREMENTS:

- Approximately 1,200 words
- Natural human editorial writing
- Original wording
- Useful and informative
- Mobile friendly
- No keyword stuffing
- No invented statistics
- No invented quotes
- Do not copy source wording
- Do not mention AI

SEO REQUIREMENTS:

- attractive SEO title
- URL-friendly slug
- 150-160 character meta description
- 5-10 keywords
- short excerpt
- suitable category

STRUCTURE:

- Introduction
- Main trend discussion
- Practical ideas
- Who it may suit
- Styling or maintenance tips
- Final thoughts
- 4 FAQs

IMPORTANT HEADING RULES:

- Do NOT repeat the article title as an H1 inside the content.
- The article page already displays the title as the H1.
- Do NOT create any heading named:
  "Video Tutorials & Inspiration"
- Do NOT create any heading named:
  "Related Videos"
- Do NOT create a video section.
- Do NOT mention YouTube.
- Do NOT create duplicate headings.
- Use unique H2/H3 headings only.

CONTENT:

The content field must contain Markdown.

CRITICAL JSON RULE:

Return ONLY a valid JSON object.

Do NOT use Markdown fences.

Do NOT use \`\`\`json.

Do NOT put any explanation outside the JSON.

Escape all quotation marks inside JSON strings.

Do not insert raw line breaks inside JSON string values.

Required format:

{
  "title": "",
  "slug": "",
  "description": "",
  "excerpt": "",
  "keywords": [],
  "category": "",
  "content": "",
  "faq": [
    {
      "question": "",
      "answer": ""
    }
  ]
}

RESEARCH:

${JSON.stringify(research)}
`;

console.log(
  "Generating article..."
);

let article;

let articleGenerationError = null;

for (
  let attempt = 1;
  attempt <= 2;
  attempt++
) {

  try {

    const articleText =
      await callGeminiSafe({
        prompt: articlePrompt,
        useSearch: false
      });

    article =
      parseJson(
        articleText,
        "Article"
      );

    break;

  } catch (error) {

    articleGenerationError =
      error;

    console.error(
      `\nArticle generation attempt ${attempt} failed.`
    );

    console.error(
      error.message
    );

    if (attempt < 2) {

      console.log(
        "Retrying article generation..."
      );

      await sleep(3000);
    }
  }
}

if (!article) {

  throw new Error(
    `Article generation failed after retries.\n${articleGenerationError?.message}`
  );
}

// ============================================================
// VALIDATE ARTICLE
// ============================================================

if (
  !article.title ||
  !article.slug ||
  !article.description ||
  !article.content
) {
  throw new Error(
    "Generated article is missing required fields"
  );
}

if (!Array.isArray(article.keywords)) {
  article.keywords = [];
}

if (!Array.isArray(article.faq)) {
  article.faq = [];
}

// ============================================================
// CLEAN ARTICLE CONTENT
// ============================================================

function cleanArticleContent(content, title) {

  let cleaned =
    String(content || "");

  // Remove duplicate H1 article title
  const escapedTitle =
    title.replace(
      /[.*+?^${}()|[\]\\]/g,
      "\\$&"
    );

  cleaned =
    cleaned.replace(
      new RegExp(
        `^\\s*#\\s+${escapedTitle}\\s*$`,
        "gim"
      ),
      ""
    );

  // Remove unwanted video headings
  cleaned =
    cleaned.replace(
      /^\s*#{1,6}\s*Video Tutorials\s*&\s*Inspiration\s*$/gim,
      ""
    );

  cleaned =
    cleaned.replace(
      /^\s*#{1,6}\s*Related Videos\s*$/gim,
      ""
    );

  // Remove empty repeated headings
  cleaned =
    cleaned.replace(
      /^\s*#{1,6}\s*Video Tutorials.*$/gim,
      ""
    );

  // Remove excessive blank lines
  cleaned =
    cleaned.replace(
      /\n{3,}/g,
      "\n\n"
    );

  return cleaned.trim();
}

article.content =
  cleanArticleContent(
    article.content,
    article.title
  );

console.log(
  "Article content cleaned."
);

console.log(
  `Article title: ${article.title}`
);

// ============================================================
// YOUTUBE KEYWORD NORMALIZATION
// ============================================================

function normalizeText(text) {

  return String(text || "")
    .toLowerCase()
    .replace(
      /[^a-z0-9\s]/g,
      " "
    )
    .replace(
      /\s+/g,
      " "
    )
    .trim();
}

function tokenize(text) {

  return normalizeText(text)
    .split(" ")
    .filter(
      (word) =>
        word.length >= 3
    );
}

// Common words that do not help determine
// whether a YouTube video is relevant.

const STOP_WORDS = new Set([
  "the",
  "and",
  "for",
  "with",
  "from",
  "your",
  "you",
  "this",
  "that",
  "2026",
  "latest",
  "best",
  "ideas",
  "trend",
  "trends",
  "guide",
  "tutorial",
  "inspiration",
  "style",
  "styles",
  "beauty"
]);

function meaningfulTokens(text) {

  return tokenize(text)
    .filter(
      (word) =>
        !STOP_WORDS.has(word)
    );
}

// ============================================================
// YOUTUBE RELEVANCE SCORE
// ============================================================

function scoreYouTubeVideo(
  video,
  article
) {

  const videoText =
    normalizeText(
      `${video.title} ${video.channel}`
    );

  const articleText =
    normalizeText(
      `${article.title} ${article.category} ${(article.keywords || []).join(" ")}`
    );

  const articleTokens =
    meaningfulTokens(
      articleText
    );

  if (!articleTokens.length) {
    return 0;
  }

  let score = 0;

  // Exact phrase match
  const articleTitle =
    normalizeText(
      article.title
    );

  if (
    articleTitle.length > 8 &&
    videoText.includes(articleTitle)
  ) {
    score += 12;
  }

  // Keyword matches
  for (
    const token of articleTokens
  ) {

    if (
      videoText.includes(token)
    ) {
      score += 2;
    }
  }

  // Category-specific strong signals
  const category =
    normalizeText(
      article.category
    );

  const categoryWords =
    meaningfulTokens(
      category
    );

  for (
    const word of categoryWords
  ) {

    if (
      videoText.includes(word)
    ) {
      score += 4;
    }
  }

  return score;
}

// ============================================================
// YOUTUBE SEARCH QUERY BUILDER
// ============================================================

function buildYouTubeQueries(article) {

  const queries = [];

  const title =
    String(article.title || "")
      .trim();

  const keywords =
    Array.isArray(article.keywords)
      ? article.keywords
          .filter(Boolean)
          .slice(0, 5)
      : [];

  const category =
    String(
      article.category || ""
    ).trim();

  // Most specific search
  if (title) {
    queries.push(
      `"${title}"`
    );
  }

  // Title without unnecessary words
  if (keywords.length) {
    queries.push(
      `${keywords
        .slice(0, 3)
        .join(" ")} ${category}`
    );
  }

  // Category + strongest keywords
  if (keywords.length >= 2) {
    queries.push(
      `${category} ${keywords
        .slice(0, 2)
        .join(" ")} tutorial`
    );
  }

  // Remove duplicate queries
  return [
    ...new Set(
      queries
        .map(
          (q) => q.trim()
        )
        .filter(Boolean)
    )
  ];
}

// ============================================================
// YOUTUBE SEARCH
// ============================================================

const youtubeQueries =
  buildYouTubeQueries(
    article
  );

console.log(
  "\nYouTube search queries:"
);

youtubeQueries.forEach(
  (query, index) => {
    console.log(
      `${index + 1}. ${query}`
    );
  }
);

let allVideos = [];

try {

  for (
    const query of youtubeQueries
  ) {

    const youtubeUrl =
      new URL(
        "https://www.googleapis.com/youtube/v3/search"
      );

    youtubeUrl.searchParams.set(
      "part",
      "snippet"
    );

    youtubeUrl.searchParams.set(
      "q",
      query
    );

    youtubeUrl.searchParams.set(
      "type",
      "video"
    );

    youtubeUrl.searchParams.set(
      "maxResults",
      "10"
    );

    youtubeUrl.searchParams.set(
      "order",
      "relevance"
    );

    youtubeUrl.searchParams.set(
      "safeSearch",
      "strict"
    );

    youtubeUrl.searchParams.set(
      "key",
      youtubeKey
    );

    const youtubeResponse =
      await fetch(
        youtubeUrl
      );

    if (!youtubeResponse.ok) {

      const error =
        await youtubeResponse.text();

      console.error(
        `YouTube query failed: ${query}`
      );

      console.error(
        error
      );

      continue;
    }

    const youtubeData =
      await youtubeResponse.json();

    const results =
      (youtubeData.items || [])
        .filter(
          (item) =>
            item?.id?.videoId
        )
        .map(
          (item) => ({
            title:
              item.snippet.title,

            channel:
              item.snippet.channelTitle,

            videoId:
              item.id.videoId,

            url:
              `https://www.youtube.com/watch?v=${item.id.videoId}`,

            thumbnail:
              item.snippet.thumbnails?.high?.url ||
              item.snippet.thumbnails?.medium?.url ||
              item.snippet.thumbnails?.default?.url ||
              ""
          })
        );

    allVideos.push(
      ...results
    );
  }

  console.log(
    `Raw YouTube videos collected: ${allVideos.length}`
  );

  // ==========================================================
  // REMOVE DUPLICATE VIDEO IDS
  // ==========================================================

  const uniqueVideos =
    Array.from(
      new Map(
        allVideos.map(
          (video) => [
            video.videoId,
            video
          ]
        )
      ).values()
    );

  // ==========================================================
  // SCORE VIDEOS
  // ==========================================================

  const scoredVideos =
    uniqueVideos
      .map(
        (video) => ({
          ...video,
          relevanceScore:
            scoreYouTubeVideo(
              video,
              article
            )
        })
      )
      .sort(
        (a, b) =>
          b.relevanceScore -
          a.relevanceScore
      );

  console.log(
    "\nYouTube relevance scores:"
  );

  scoredVideos
    .slice(0, 10)
    .forEach(
      (video) => {

        console.log(
          `${video.relevanceScore} → ${video.title}`
        );

      }
    );

  // ==========================================================
  // ONLY STRONGLY RELEVANT VIDEOS
  // ==========================================================

  const relevantVideos =
    scoredVideos
      .filter(
        (video) =>
          video.relevanceScore >= 6
      );

  // ==========================================================
  // REMOVE SIMILAR VIDEO TITLES
  // ==========================================================

  const selectedVideos = [];

  for (
    const video of relevantVideos
  ) {

    const videoTokens =
      new Set(
        meaningfulTokens(
          video.title
        )
      );

    let tooSimilar = false;

    for (
      const selected of selectedVideos
    ) {

      const selectedTokens =
        new Set(
          meaningfulTokens(
            selected.title
          )
        );

      if (
        videoTokens.size === 0 ||
        selectedTokens.size === 0
      ) {
        continue;
      }

      let overlap = 0;

      for (
        const word of videoTokens
      ) {

        if (
          selectedTokens.has(word)
        ) {
          overlap++;
        }
      }

      const smallerSize =
        Math.min(
          videoTokens.size,
          selectedTokens.size
        );

      const similarity =
        overlap /
        smallerSize;

      if (
        similarity >= 0.75
      ) {

        tooSimilar = true;
        break;
      }
    }

    if (!tooSimilar) {

      selectedVideos.push(
        video
      );
    }

    if (
      selectedVideos.length >=
      MAX_YOUTUBE_VIDEOS
    ) {
      break;
    }
  }

  videos =
    selectedVideos.map(
      ({
        relevanceScore,
        ...video
      }) => video
    );

  console.log(
    `\nStrongly relevant YouTube videos selected: ${videos.length}`
  );

  videos.forEach(
    (video, index) => {

      console.log(
        `${index + 1}. ${video.title}`
      );

    }
  );

} catch (error) {

  console.error(
    "\nYouTube search failed."
  );

  console.error(
    error.message
  );

  videos = [];

  console.log(
    "Continuing without YouTube videos."
  );
}

// ============================================================
// SAVE FINAL DATA
// ============================================================

const output = {

  generatedAt:
    new Date().toISOString(),

  topic,

  research,

  article,

  youtube:
    videos
};

fs.mkdirSync(
  "generated",
  {
    recursive: true
  }
);

fs.writeFileSync(
  "generated/article.json",
  JSON.stringify(
    output,
    null,
    2
  ),
  "utf8"
);

// ============================================================
// FINAL OUTPUT
// ============================================================

console.log(
  "\n================================="
);

console.log(
  "BUILD COMPLETE"
);

console.log(
  "================================="
);

console.log(
  `Title: ${article.title}`
);

console.log(
  `Slug: ${article.slug}`
);

console.log(
  `Category: ${article.category}`
);

console.log(
  `Keywords: ${
    article.keywords.join(", ")
  }`
);

console.log(
  `YouTube videos: ${videos.length}`
);

console.log(
  "Duplicate headings cleaned."
);

console.log(
  "YouTube relevance filtering enabled."
);

console.log(
  "Saved: generated/article.json"
);

console.log(
  "================================="
);
