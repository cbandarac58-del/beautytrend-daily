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
const YOUTUBE_RESULTS_PER_QUERY = 10;

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
- Do not mention this instruction

SEO REQUIREMENTS:

- attractive SEO title
- URL-friendly slug
- 150-160 character meta description
- 5-10 relevant keywords
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

1. Do NOT put the article title inside content as an H1.
2. The website template already displays the article title as H1.
3. Do NOT repeat the article title as another heading.
4. Use H2 and H3 headings only where useful.
5. Every heading must be unique.
6. Never repeat the same heading.
7. Do NOT create:
   - Video Tutorials & Inspiration
   - Related Videos
   - YouTube Videos
   - Video Tutorials
   - Video Inspiration
8. Do NOT create any video section.
9. Do NOT mention YouTube anywhere in article content.
10. Do not create empty headings.

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
// TEXT NORMALIZATION
// ============================================================

function normalizeText(text) {

  return String(text || "")
    .toLowerCase()
    .normalize("NFKD")
    .replace(
      /[\u0300-\u036f]/g,
      ""
    )
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

// ============================================================
// TOKENIZER
// ============================================================

function tokenize(text) {

  return normalizeText(text)
    .split(" ")
    .filter(
      (word) =>
        word.length >= 3
    );
}

// ============================================================
// STOP WORDS
// ============================================================

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
  "these",
  "those",
  "are",
  "what",
  "when",
  "where",
  "how",
  "why",
  "into",
  "about",
  "over",
  "under",
  "best",
  "latest",
  "new",
  "2026",
  "ideas",
  "idea",
  "trend",
  "trends",
  "guide",
  "tutorial",
  "inspiration",
  "style",
  "styles",
  "beauty",
  "look",
  "looks",
  "women",
  "woman",
  "hair",
  "nails"
]);

function meaningfulTokens(text) {

  return tokenize(text)
    .filter(
      (word) =>
        !STOP_WORDS.has(word)
    );
}

// ============================================================
// ARTICLE TOPIC TOKENS
// ============================================================

function getArticleTokens(article) {

  const titleTokens =
    meaningfulTokens(
      article.title
    );

  const keywordTokens =
    meaningfulTokens(
      (article.keywords || []).join(" ")
    );

  const categoryTokens =
    meaningfulTokens(
      article.category
    );

  return {
    titleTokens,
    keywordTokens,
    categoryTokens
  };
}

// ============================================================
// CLEAN ARTICLE CONTENT
// ============================================================

function cleanArticleContent(
  content,
  title
) {

  let cleaned =
    String(content || "");

  // ----------------------------------------------------------
  // Remove title H1
  // ----------------------------------------------------------

  const normalizedTitle =
    normalizeText(title);

  const lines =
    cleaned.split(/\r?\n/);

  const outputLines = [];

  for (const line of lines) {

    const trimmed =
      line.trim();

    // Remove Markdown H1
    if (
      /^#\s+/.test(trimmed)
    ) {

      const headingText =
        trimmed
          .replace(/^#\s+/, "")
          .trim();

      if (
        normalizeText(
          headingText
        ) === normalizedTitle
      ) {
        continue;
      }
    }

    // --------------------------------------------------------
    // Remove unwanted video headings
    // --------------------------------------------------------

    const headingWithoutMarks =
      trimmed
        .replace(/^#{1,6}\s+/, "")
        .trim()
        .toLowerCase();

    const unwantedHeadings = [
      "video tutorials & inspiration",
      "video tutorials and inspiration",
      "related videos",
      "youtube videos",
      "youtube video",
      "video tutorials",
      "video inspiration",
      "video tutorial",
      "related youtube videos",
      "watch these videos",
      "video section"
    ];

    if (
      unwantedHeadings.includes(
        headingWithoutMarks
      )
    ) {
      continue;
    }

    outputLines.push(
      line
    );
  }

  cleaned =
    outputLines.join("\n");

  // ----------------------------------------------------------
  // Remove duplicate consecutive headings
  // ----------------------------------------------------------

  const finalLines = [];

  let previousHeading = "";

  for (
    const line of cleaned.split(/\r?\n/)
  ) {

    const trimmed =
      line.trim();

    const headingMatch =
      trimmed.match(
        /^#{2,6}\s+(.+?)\s*$/
      );

    if (headingMatch) {

      const heading =
        normalizeText(
          headingMatch[1]
        );

      if (
        heading &&
        heading === previousHeading
      ) {
        continue;
      }

      previousHeading =
        heading;

    } else if (trimmed) {

      previousHeading = "";

    }

    finalLines.push(
      line
    );
  }

  cleaned =
    finalLines.join("\n");

  // ----------------------------------------------------------
  // Remove excessive blank lines
  // ----------------------------------------------------------

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
// YOUTUBE SEARCH QUERY BUILDER
// ============================================================

function buildYouTubeQueries(article) {

  const queries = [];

  const category =
    String(
      article.category || ""
    ).trim();

  const keywords =
    Array.isArray(article.keywords)
      ? article.keywords
          .filter(Boolean)
          .map(
            (item) =>
              String(item).trim()
          )
          .filter(Boolean)
      : [];

  const {
    titleTokens,
    keywordTokens,
    categoryTokens
  } =
    getArticleTokens(
      article
    );

  // ----------------------------------------------------------
  // Strong title query
  // ----------------------------------------------------------

  if (
    titleTokens.length >= 2
  ) {

    queries.push(
      titleTokens
        .slice(0, 6)
        .join(" ")
    );
  }

  // ----------------------------------------------------------
  // Keyword-focused query
  // ----------------------------------------------------------

  if (
    keywordTokens.length >= 2
  ) {

    queries.push(
      keywordTokens
        .slice(0, 4)
        .join(" ")
    );
  }

  // ----------------------------------------------------------
  // Category + keywords
  // ----------------------------------------------------------

  if (
    category &&
    keywords.length
  ) {

    queries.push(
      `${category} ${keywords
        .slice(0, 3)
        .join(" ")}`
    );
  }

  // ----------------------------------------------------------
  // Category + strongest title terms
  // ----------------------------------------------------------

  if (
    category &&
    titleTokens.length >= 2
  ) {

    queries.push(
      `${category} ${titleTokens
        .slice(0, 3)
        .join(" ")}`
    );
  }

  // ----------------------------------------------------------
  // Beauty tutorial query
  // ----------------------------------------------------------

  if (
    titleTokens.length >= 2
  ) {

    queries.push(
      `${titleTokens
        .slice(0, 4)
        .join(" ")} tutorial`
    );
  }

  // ----------------------------------------------------------
  // Clean duplicate queries
  // ----------------------------------------------------------

  const uniqueQueries =
    Array.from(
      new Set(
        queries
          .map(
            (query) =>
              normalizeText(query)
          )
          .filter(
            (query) =>
              query.length >= 8
          )
      )
    );

  return uniqueQueries.slice(
    0,
    5
  );
}

// ============================================================
// YOUTUBE VIDEO OBJECT
// ============================================================

function mapYouTubeVideo(item) {

  return {
    title:
      item?.snippet?.title || "",

    channel:
      item?.snippet?.channelTitle || "",

    videoId:
      item?.id?.videoId || "",

    url:
      item?.id?.videoId
        ? `https://www.youtube.com/watch?v=${item.id.videoId}`
        : "",

    thumbnail:
      item?.snippet?.thumbnails?.high?.url ||
      item?.snippet?.thumbnails?.medium?.url ||
      item?.snippet?.thumbnails?.default?.url ||
      ""
  };
}

// ============================================================
// YOUTUBE RELEVANCE SCORING
// ============================================================

function scoreYouTubeVideo(
  video,
  article
) {

  const videoTitle =
    normalizeText(
      video.title
    );

  const channel =
    normalizeText(
      video.channel
    );

  const videoText =
    `${videoTitle} ${channel}`;

  const {
    titleTokens,
    keywordTokens,
    categoryTokens
  } =
    getArticleTokens(
      article
    );

  let score = 0;

  // ----------------------------------------------------------
  // Strong exact phrase matches
  // ----------------------------------------------------------

  const articleTitle =
    normalizeText(
      article.title
    );

  if (
    articleTitle.length >= 12 &&
    videoTitle.includes(articleTitle)
  ) {

    score += 25;
  }

  // ----------------------------------------------------------
  // Title token matches
  // ----------------------------------------------------------

  let titleMatches = 0;

  for (
    const token of titleTokens
  ) {

    if (
      videoText.includes(token)
    ) {
      titleMatches++;
    }
  }

  score +=
    titleMatches * 5;

  // ----------------------------------------------------------
  // Keyword matches
  // ----------------------------------------------------------

  let keywordMatches = 0;

  for (
    const token of keywordTokens
  ) {

    if (
      videoText.includes(token)
    ) {
      keywordMatches++;
    }
  }

  score +=
    keywordMatches * 4;

  // ----------------------------------------------------------
  // Category matches
  // ----------------------------------------------------------

  let categoryMatches = 0;

  for (
    const token of categoryTokens
  ) {

    if (
      videoText.includes(token)
    ) {
      categoryMatches++;
    }
  }

  score +=
    categoryMatches * 3;

  // ----------------------------------------------------------
  // Helpful content signals
  // ----------------------------------------------------------

  const usefulWords = [
    "tutorial",
    "how to",
    "styling",
    "step",
    "steps",
    "ideas",
    "inspiration",
    "transformation",
    "cut",
    "haircut",
    "hairstyle",
    "nails",
    "manicure",
    "color",
    "colour"
  ];

  for (
    const word of usefulWords
  ) {

    if (
      videoTitle.includes(word)
    ) {

      score += 1;
    }
  }

  // ----------------------------------------------------------
  // Penalty for obviously generic videos
  // ----------------------------------------------------------

  const genericWords = [
    "compilation",
    "random",
    "funny",
    "meme",
    "shorts",
    "short",
    "reaction",
    "celebrity news",
    "gossip"
  ];

  for (
    const word of genericWords
  ) {

    if (
      videoTitle.includes(word)
    ) {

      score -= 4;
    }
  }

  return score;
}

// ============================================================
// VIDEO TITLE TOKEN SIMILARITY
// ============================================================

function calculateTitleSimilarity(
  titleA,
  titleB
) {

  const tokensA =
    new Set(
      meaningfulTokens(
        titleA
      )
    );

  const tokensB =
    new Set(
      meaningfulTokens(
        titleB
      )
    );

  if (
    tokensA.size === 0 ||
    tokensB.size === 0
  ) {
    return 0;
  }

  let overlap = 0;

  for (
    const word of tokensA
  ) {

    if (
      tokensB.has(word)
    ) {
      overlap++;
    }
  }

  const smaller =
    Math.min(
      tokensA.size,
      tokensB.size
    );

  const larger =
    Math.max(
      tokensA.size,
      tokensB.size
    );

  const containment =
    overlap /
    smaller;

  const jaccard =
    overlap /
    (
      tokensA.size +
      tokensB.size -
      overlap
    );

  return Math.max(
    containment,
    jaccard
  );
}

// ============================================================
// DUPLICATE VIDEO TITLE FILTER
// ============================================================

function removeSimilarVideoTitles(
  videos
) {

  const selected = [];

  for (
    const video of videos
  ) {

    let duplicate = false;

    for (
      const existing of selected
    ) {

      const similarity =
        calculateTitleSimilarity(
          video.title,
          existing.title
        );

      if (
        similarity >= 0.70
      ) {

        duplicate = true;

        console.log(
          `Duplicate/similar title removed: ${video.title}`
        );

        break;
      }
    }

    if (!duplicate) {

      selected.push(
        video
      );
    }

    if (
      selected.length >=
      MAX_YOUTUBE_VIDEOS
    ) {
      break;
    }
  }

  return selected;
}

// ============================================================
// YOUTUBE SEARCH
// ============================================================

const youtubeQueries =
  buildYouTubeQueries(
    article
  );

console.log(
  "\n================================="
);

console.log(
  "YOUTUBE SEARCH"
);

console.log(
  "================================="
);

console.log(
  "Search queries:"
);

youtubeQueries.forEach(
  (query, index) => {

    console.log(
      `${index + 1}. ${query}`
    );

  }
);

let videos = [];

try {

  let allVideos = [];

  // ----------------------------------------------------------
  // Execute multiple focused searches
  // ----------------------------------------------------------

  for (
    const query of youtubeQueries
  ) {

    console.log(
      `\nSearching YouTube for: ${query}`
    );

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
      String(
        YOUTUBE_RESULTS_PER_QUERY
      )
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

    const response =
      await fetch(
        youtubeUrl
      );

    if (!response.ok) {

      const error =
        await response.text();

      console.error(
        `YouTube query failed: ${query}`
      );

      console.error(
        error
      );

      continue;
    }

    const data =
      await response.json();

    const results =
      (data.items || [])
        .filter(
          (item) =>
            item?.id?.videoId
        )
        .map(
          mapYouTubeVideo
        )
        .filter(
          (video) =>
            video.videoId &&
            video.title
        );

    console.log(
      `Results: ${results.length}`
    );

    allVideos.push(
      ...results
    );
  }

  console.log(
    `\nRaw YouTube videos collected: ${allVideos.length}`
  );

  // ----------------------------------------------------------
  // Remove duplicate video IDs
  // ----------------------------------------------------------

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

  console.log(
    `Unique video IDs: ${uniqueVideos.length}`
  );

  // ----------------------------------------------------------
  // Score all videos
  // ----------------------------------------------------------

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
    "\nTop YouTube relevance scores:"
  );

  scoredVideos
    .slice(0, 15)
    .forEach(
      (video, index) => {

        console.log(
          `${index + 1}. ${video.relevanceScore} → ${video.title}`
        );

      }
    );

  // ----------------------------------------------------------
  // Strong relevance threshold
  // ----------------------------------------------------------

  const stronglyRelevant =
    scoredVideos.filter(
      (video) =>
        video.relevanceScore >= 12
    );

  console.log(
    `\nStrongly relevant candidates: ${stronglyRelevant.length}`
  );

  // ----------------------------------------------------------
  // Remove similar titles
  // ----------------------------------------------------------

  const selectedVideos =
    removeSimilarVideoTitles(
      stronglyRelevant
    );

  // ----------------------------------------------------------
  // Final output
  // ----------------------------------------------------------

  videos =
    selectedVideos
      .slice(
        0,
        MAX_YOUTUBE_VIDEOS
      )
      .map(
        ({
          relevanceScore,
          ...video
        }) =>
          video
      );

  console.log(
    `\nFinal YouTube videos selected: ${videos.length}`
  );

  videos.forEach(
    (video, index) => {

      console.log(
        `${index + 1}. ${video.title}`
      );

      console.log(
        `   Channel: ${video.channel}`
      );

      console.log(
        `   ID: ${video.videoId}`
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
// FINAL ARTICLE CLEANUP
// ============================================================

// Safety cleanup in case unwanted headings
// somehow survived the first cleaning pass.

article.content =
  cleanArticleContent(
    article.content,
    article.title
  );

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
  "Duplicate video IDs removed."
);

console.log(
  "Similar video titles removed."
);

console.log(
  "Strong YouTube relevance filtering enabled."
);

console.log(
  "Duplicate article headings cleaned."
);

console.log(
  "Video-related article headings removed."
);

console.log(
  "Saved: generated/article.json"
);

console.log(
  "================================="
);
