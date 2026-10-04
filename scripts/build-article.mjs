import fs from "node:fs";

const geminiKey = process.env.GEMINI_API_KEY;
const youtubeKey = process.env.YOUTUBE_API_KEY;

if (!geminiKey) {
  throw new Error("GEMINI_API_KEY is not configured");
}

if (!youtubeKey) {
  throw new Error("YOUTUBE_API_KEY is not configured");
}

// ==================================================
// CONFIG
// ==================================================

const GEMINI_MODEL = "gemini-2.5-flash";

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
  topics[Math.floor(Math.random() * topics.length)];

console.log("=================================");
console.log("AUTOMATIC BEAUTY ARTICLE");
console.log("=================================");
console.log(`Topic: ${topic}`);

// ==================================================
// HELPERS
// ==================================================

function cleanCodeFence(text) {
  return String(text ?? "")
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();
}

function extractJsonObject(text) {
  const cleaned = cleanCodeFence(text);

  // Direct JSON parse
  try {
    return JSON.parse(cleaned);
  } catch {
    // Continue
  }

  // Find JSON object inside extra text
  const firstBrace = cleaned.indexOf("{");
  const lastBrace = cleaned.lastIndexOf("}");

  if (
    firstBrace !== -1 &&
    lastBrace !== -1 &&
    lastBrace > firstBrace
  ) {
    const candidate = cleaned.slice(
      firstBrace,
      lastBrace + 1
    );

    try {
      return JSON.parse(candidate);
    } catch {
      return null;
    }
  }

  return null;
}

async function callGemini({
  prompt,
  useSearch = false,
  jsonMode = false
}) {
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

  // IMPORTANT:
  // JSON mode is only used when Google Search is NOT enabled.
  if (jsonMode && !useSearch) {
    body.generationConfig = {
      responseMimeType: "application/json"
    };
  }

  // Google Search
  if (useSearch) {
    body.tools = [
      {
        google_search: {}
      }
    ];
  }

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": geminiKey
      },
      body: JSON.stringify(body)
    }
  );

  const responseText = await response.text();

  if (!response.ok) {
    throw new Error(
      `Gemini API error: ${response.status}\n${responseText}`
    );
  }

  let data;

  try {
    data = JSON.parse(responseText);
  } catch {
    throw new Error(
      `Gemini API returned invalid JSON:\n${responseText}`
    );
  }

  const output =
    data?.candidates?.[0]?.content?.parts
      ?.map((part) => part.text || "")
      .join("");

  if (!output) {
    const finishReason =
      data?.candidates?.[0]?.finishReason ||
      "UNKNOWN";

    throw new Error(
      `No Gemini content returned. Finish reason: ${finishReason}`
    );
  }

  return output;
}

// ==================================================
// 1. RESEARCH
// ==================================================

const researchPrompt = `
Research the following beauty topic using current web information:

"${topic}"

You are researching for an international beauty magazine.

Focus on:

- current 2026 trends
- important style details
- practical information
- who the styles may suit
- maintenance ideas
- styling ideas
- recent developments
- useful information from reputable sources

Do not copy source articles.

Return ONLY valid JSON.

Do not use Markdown code fences.

Use exactly this structure:

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

console.log("");
console.log("Researching web information...");

let researchText;

try {
  researchText = await callGemini({
    prompt: researchPrompt,

    // Google Search ON
    useSearch: true,

    // IMPORTANT:
    // JSON mode OFF because Search + JSON mode
    // causes Gemini 400 error.
    jsonMode: false
  });
} catch (error) {
  console.error("");
  console.error("Research failed.");
  throw error;
}

const research = extractJsonObject(
  researchText
);

if (!research) {
  console.error("");
  console.error("RAW RESEARCH RESPONSE:");
  console.error(researchText);

  throw new Error(
    "Research JSON could not be parsed"
  );
}

console.log("Research completed.");

// ==================================================
// 2. ARTICLE GENERATION
// ==================================================

const articlePrompt = `
You are the senior editor of a modern international beauty magazine.

Create a completely original article using the research below.

TOPIC:
${topic}

ARTICLE REQUIREMENTS:

- Approximately 1,200 words
- Natural human editorial writing
- Original wording
- Useful and informative
- Mobile-friendly
- Clear headings
- Short paragraphs
- No keyword stuffing
- No invented statistics
- No invented quotes
- Do not copy source wording
- Do not mention AI
- Do not mention that the article was generated
- Avoid repetitive wording

SEO REQUIREMENTS:

- Attractive SEO title
- URL-friendly slug
- Meta description approximately 150-160 characters
- 5-10 relevant keywords
- Short excerpt
- Appropriate beauty category

STRUCTURE:

- Introduction
- Main trend discussion
- Practical ideas
- Who each style may suit
- Styling or maintenance tips
- Final thoughts
- 4 useful FAQs

The content field MUST contain Markdown.

IMPORTANT JSON RULES:

- Return ONLY valid JSON.
- Do NOT use Markdown code fences.
- Do NOT add explanations before or after JSON.
- Properly escape quotation marks inside strings.
- Properly escape newline characters.
- Make sure every JSON string is correctly closed.
- Make sure the result can be parsed directly by JSON.parse().

Return exactly:

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

console.log("Generating article...");

let articleText;

try {
  articleText = await callGemini({
    prompt: articlePrompt,

    // No Search here
    useSearch: false,

    // JSON mode ON
    jsonMode: true
  });
} catch (error) {
  console.error("");
  console.error("Article generation failed.");
  throw error;
}

// ==================================================
// 3. PARSE ARTICLE JSON
// ==================================================

let article = extractJsonObject(
  articleText
);

if (!article) {
  console.log("");
  console.log(
    "First article JSON parsing failed."
  );

  console.log(
    "Attempting automatic JSON repair..."
  );

  const repairPrompt = `
Repair the following malformed JSON.

Return ONLY valid JSON.

Rules:

- Preserve the article content.
- Do not shorten the article.
- Do not rewrite the article unnecessarily.
- Fix invalid quotation marks.
- Fix invalid newline characters.
- Fix invalid escape sequences.
- Make sure every string is properly closed.
- Do not use Markdown code fences.
- Do not add commentary.

MALFORMED JSON:

${articleText}
`;

  let repairedText;

  try {
    repairedText = await callGemini({
      prompt: repairPrompt,
      useSearch: false,
      jsonMode: true
    });
  } catch (error) {
    console.error("");
    console.error(
      "JSON repair request failed."
    );

    throw error;
  }

  article = extractJsonObject(
    repairedText
  );

  if (!article) {
    console.error("");
    console.error(
      "ORIGINAL ARTICLE RESPONSE:"
    );

    console.error(articleText);

    console.error("");
    console.error(
      "REPAIRED ARTICLE RESPONSE:"
    );

    console.error(repairedText);

    throw new Error(
      "Article JSON could not be parsed even after repair"
    );
  }

  console.log(
    "JSON repair successful."
  );
}

// ==================================================
// 4. VALIDATE ARTICLE
// ==================================================

if (
  !article.title ||
  !article.slug ||
  !article.description ||
  !article.content
) {
  console.error(
    JSON.stringify(article, null, 2)
  );

  throw new Error(
    "Article JSON is missing required fields"
  );
}

if (!Array.isArray(article.keywords)) {
  article.keywords = [];
}

if (!Array.isArray(article.faq)) {
  article.faq = [];
}

console.log(
  `Article title: ${article.title}`
);

// ==================================================
// 5. YOUTUBE SEARCH
// ==================================================

const searchTerms = [
  article.title,
  ...article.keywords.slice(0, 3)
];

const youtubeQuery =
  searchTerms.join(" ");

console.log(
  `Searching YouTube: ${youtubeQuery}`
);

const youtubeUrl = new URL(
  "https://www.googleapis.com/youtube/v3/search"
);

youtubeUrl.searchParams.set(
  "part",
  "snippet"
);

youtubeUrl.searchParams.set(
  "q",
  youtubeQuery
);

youtubeUrl.searchParams.set(
  "type",
  "video"
);

youtubeUrl.searchParams.set(
  "maxResults",
  "5"
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

const youtubeResponse = await fetch(
  youtubeUrl
);

if (!youtubeResponse.ok) {
  const error =
    await youtubeResponse.text();

  throw new Error(
    `YouTube API error: ${youtubeResponse.status}\n${error}`
  );
}

const youtubeData =
  await youtubeResponse.json();

const videos =
  (youtubeData.items || [])
    .filter(
      (item) =>
        item?.id?.videoId
    )
    .map((item) => ({
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
        item.snippet.thumbnails?.default?.url
    }));

console.log(
  `YouTube videos found: ${videos.length}`
);

// ==================================================
// 6. FINAL ARTICLE DATA
// ==================================================

const output = {
  generatedAt:
    new Date().toISOString(),

  topic,

  research,

  article,

  youtube: videos
};

// ==================================================
// 7. SAVE
// ==================================================

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

// ==================================================
// 8. SUCCESS
// ==================================================

console.log("");
console.log(
  "================================="
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
  `Keywords: ${article.keywords.join(", ")}`
);

console.log(
  `YouTube videos: ${videos.length}`
);

console.log(
  "Saved: generated/article.json"
);

console.log(
  "================================="
);
