const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  throw new Error("GEMINI_API_KEY is not configured");
}

const prompt = `
Write a short test article about modern women's haircut trends.

Requirements:
- Around 250 words
- Original wording
- Natural English
- Helpful and informative
- Do not copy text from another website

Return only the article text.
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
  throw new Error(`Gemini API error: ${response.status}\n${error}`);
}

const data = await response.json();

const article =
  data?.candidates?.[0]?.content?.parts?.[0]?.text;

if (!article) {
  throw new Error("Gemini returned no article text");
}

console.log(article);
