const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  throw new Error("GEMINI_API_KEY is not configured");
}

const topics = [
  "latest women's haircut trends 2026",
  "latest women's hairstyle trends 2026",
  "latest nail art trends 2026",
  "latest manicure trends 2026",
  "latest hair color trends 2026",
  "latest short haircut trends 2026",
  "latest long hairstyle trends 2026",
  "latest curly hairstyle trends 2026",
  "latest bob haircut trends 2026",
  "latest bridal hairstyle trends 2026"
];

const selectedTopic =
  topics[Math.floor(Math.random() * topics.length)];

const prompt = `
You are a beauty trend research assistant.

Research the following topic using current web information:

"${selectedTopic}"

Today's year is 2026.

Find useful, recent and verifiable information about this beauty trend.

Focus on:
- Current trends
- Important style details
- Who the style may suit
- Hair or nail characteristics
- Styling or maintenance information
- Recent trend developments
- Useful facts from reputable sources

Do NOT copy articles.

Return ONLY valid JSON in this structure:

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

Include the actual URLs of the sources you used.
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
      ],
      tools: [
        {
          google_search: {}
        }
      ]
    })
  }
);

if (!response.ok) {
  const error = await response.text();
  throw new Error(`Gemini Research API error: ${response.status}\n${error}`);
}

const data = await response.json();

const text =
  data?.candidates?.[0]?.content?.parts?.[0]?.text;

if (!text) {
  throw new Error("Gemini returned no research result");
}

console.log("=================================");
console.log("BEAUTY RESEARCH RESULT");
console.log("=================================");
console.log(text);

console.log("\n=================================");
console.log("RESEARCH COMPLETE");
console.log("=================================");
