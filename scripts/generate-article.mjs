const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  throw new Error("GEMINI_API_KEY is not configured");
}

const research = process.env.RESEARCH_DATA;

if (!research) {
  throw new Error("RESEARCH_DATA is missing");
}

const prompt = `
You are the senior editor of a modern international beauty magazine.

Using ONLY the research information provided below, create an original,
useful and natural English beauty article.

ARTICLE REQUIREMENTS:
- Approximately 1,200 words
- Human-sounding editorial style
- Original wording
- Do not copy sentences from sources
- Do not invent statistics, quotes or claims
- Clearly explain the beauty trend
- Include practical advice
- Include useful subheadings
- Make the article easy to read on mobile
- Avoid keyword stuffing
- Do not mention that AI was used

SEO REQUIREMENTS:
- Create an attractive SEO title
- Create a URL-friendly slug
- Create a meta description of approximately 150-160 characters
- Create 5-10 relevant keywords
- Create a short excerpt

CONTENT STRUCTURE:
1. Introduction
2. Main trend/style discussion
3. Practical ideas
4. Who it may suit
5. Styling or maintenance tips
6. Final thoughts
7. 4 frequently asked questions

Return ONLY valid JSON in exactly this structure:

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

The "content" field must contain Markdown.

RESEARCH:
${research}
`;

const response = await fetch(
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent",
  {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-goog-api-key": apiKey
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
      ]
    })
  }
);

if (!response.ok) {
  const error = await response.text();
  throw new Error(
    `Gemini Article API error: ${response.status}\n${error}`
  );
}

const data = await response.json();

const output =
  data?.candidates?.[0]?.content?.parts?.[0]?.text;

if (!output) {
  throw new Error("Gemini returned no article");
}

const cleaned = output
  .replace(/^```json\s*/i, "")
  .replace(/\s*```$/i, "")
  .trim();

let article;

try {
  article = JSON.parse(cleaned);
} catch (error) {
  console.error("Gemini returned invalid JSON:");
  console.error(cleaned);
  throw new Error("Could not parse Gemini article JSON");
}

if (!article.title || !article.slug || !article.content) {
  throw new Error("Article is missing required fields");
}

console.log("=================================");
console.log("ARTICLE GENERATED SUCCESSFULLY");
console.log("=================================");

console.log(`Title: ${article.title}`);
console.log(`Slug: ${article.slug}`);
console.log(`Category: ${article.category}`);
console.log(`Keywords: ${article.keywords.join(", ")}`);

console.log("\n--- ARTICLE ---\n");
console.log(article.content);

console.log("\n--- FAQ ---\n");
console.log(JSON.stringify(article.faq, null, 2));

console.log("\n=================================");
console.log("ARTICLE GENERATION COMPLETE");
console.log("=================================");
