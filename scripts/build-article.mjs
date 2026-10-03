import { GoogleGenAI } from "@google/genai";
import fs from "node:fs";

const geminiKey = process.env.GEMINI_API_KEY;
const youtubeKey = process.env.YOUTUBE_API_KEY;

if (!geminiKey) {
  throw new Error("GEMINI_API_KEY is not configured");
}

if (!youtubeKey) {
  throw new Error("YOUTUBE_API_KEY is not configured");
}

const ai = new GoogleGenAI({
  apiKey: geminiKey
});

// --------------------------------------------------
// 1. BEAUTY TOPIC
// --------------------------------------------------

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

// --------------------------------------------------
// 2. RESEARCH
// --------------------------------------------------

const researchPrompt = `
Research the following beauty topic using current web information:

"${topic}"

Focus on information relevant to an international beauty magazine.

Find:
- current trends
- style details
- practical information
- who the style may suit
- maintenance ideas
- recent developments
- useful information from reputable sources

Do not copy articles.

Return ONLY valid JSON:

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

console.log("\nResearching web information...");

const researchResponse = await fetch(
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent",
  {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-goog-api-key": geminiKey
    },
    body: JSON.stringify({
      contents: [
        {
          parts: [
            {
              text: researchPrompt
            }
          ]
        }
      ],
      tools: [
        {
          google_search: {}
        }
      ]
    })
  }
);

if (!researchResponse.ok) {
  const error = await researchResponse.text();

  throw new Error(
    `Research API error: ${researchResponse.status}\n${error}`
  );
}

const researchJson = await researchResponse.json();

const researchText =
  researchJson?.candidates?.[0]?.content?.parts?.[0]?.text;

if (!researchText) {
  throw new Error("No research result returned");
}

const cleanResearch = researchText
  .replace(/^```json\s*/i, "")
  .replace(/\s*```$/i, "")
  .trim();

let research;

try {
  research = JSON.parse(cleanResearch);
} catch {
  console.error(cleanResearch);
  throw new Error("Research JSON could not be parsed");
}

console.log("Research completed.");

// --------------------------------------------------
// 3. ARTICLE
// --------------------------------------------------

const articlePrompt = `
You are the senior editor of a modern international beauty magazine.

Create an original article using the research below.

ARTICLE:
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

SEO:
- attractive SEO title
- URL-friendly slug
- 150-160 character meta description
- 5-10 keywords
- short excerpt

STRUCTURE:
- Introduction
- Main trend discussion
- Practical ideas
- Who it may suit
- Styling or maintenance tips
- Final thoughts
- 4 FAQs

Return ONLY valid JSON:

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

The content field must contain Markdown.

RESEARCH:
${JSON.stringify(research)}
`;

console.log("Generating article...");

const articleResponse = await fetch(
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent",
  {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-goog-api-key": geminiKey
    },
    body: JSON.stringify({
      contents: [
        {
          parts: [
            {
              text: articlePrompt
            }
          ]
        }
      ]
    })
  }
);

if (!articleResponse.ok) {
  const error = await articleResponse.text();

  throw new Error(
    `Article API error: ${articleResponse.status}\n${error}`
  );
}

const articleJson = await articleResponse.json();

const articleText =
  articleJson?.candidates?.[0]?.content?.parts?.[0]?.text;

if (!articleText) {
  throw new Error("No article returned");
}

const cleanArticle = articleText
  .replace(/^```json\s*/i, "")
  .replace(/\s*```$/i, "")
  .trim();

let article;

try {
  article = JSON.parse(cleanArticle);
} catch {
  console.error(cleanArticle);
  throw new Error("Article JSON could not be parsed");
}

console.log(`Article title: ${article.title}`);

// --------------------------------------------------
// 4. YOUTUBE SEARCH
// --------------------------------------------------

const searchTerms = [
  article.title,
  ...(article.keywords || []).slice(0, 3)
];

const youtubeQuery = searchTerms.join(" ");

console.log(`Searching YouTube: ${youtubeQuery}`);

const youtubeUrl = new URL(
  "https://www.googleapis.com/youtube/v3/search"
);

youtubeUrl.searchParams.set("part", "snippet");
youtubeUrl.searchParams.set("q", youtubeQuery);
youtubeUrl.searchParams.set("type", "video");
youtubeUrl.searchParams.set("maxResults", "5");
youtubeUrl.searchParams.set("order", "relevance");
youtubeUrl.searchParams.set("safeSearch", "strict");
youtubeUrl.searchParams.set("key", youtubeKey);

const youtubeResponse = await fetch(youtubeUrl);

if (!youtubeResponse.ok) {
  const error = await youtubeResponse.text();

  throw new Error(
    `YouTube API error: ${youtubeResponse.status}\n${error}`
  );
}

const youtubeData = await youtubeResponse.json();

const videos = (youtubeData.items || []).map((item) => ({
  title: item.snippet.title,
  channel: item.snippet.channelTitle,
  videoId: item.id.videoId,
  url: `https://www.youtube.com/watch?v=${item.id.videoId}`,
  thumbnail:
    item.snippet.thumbnails?.high?.url ||
    item.snippet.thumbnails?.medium?.url ||
    item.snippet.thumbnails?.default?.url
}));

console.log(`YouTube videos found: ${videos.length}`);

// --------------------------------------------------
// 5. SAVE FINAL DATA
// --------------------------------------------------

const output = {
  generatedAt: new Date().toISOString(),
  topic,
  research,
  article,
  youtube: videos
};

fs.mkdirSync("generated", {
  recursive: true
});

fs.writeFileSync(
  "generated/article.json",
  JSON.stringify(output, null, 2)
);

console.log("\n=================================");
console.log("BUILD COMPLETE");
console.log("=================================");
console.log(`Title: ${article.title}`);
console.log(`Slug: ${article.slug}`);
console.log(`Category: ${article.category}`);
console.log(
  `Keywords: ${(article.keywords || []).join(", ")}`
);
console.log(`YouTube videos: ${videos.length}`);
console.log("Saved: generated/article.json");
console.log("=================================");
