import { GoogleGenAI } from "@google/genai";
import fs from "node:fs";

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  throw new Error("GEMINI_API_KEY is not configured");
}

const ai = new GoogleGenAI({
  apiKey
});

const prompt = `
Create a high-quality editorial beauty magazine photograph
for an article about 2026 women's short haircut trends.

Show a stylish adult woman with a modern textured pixie haircut.
Natural realistic hair texture, professional salon photography,
soft studio lighting, clean elegant background,
photorealistic, premium beauty magazine aesthetic.

No text, no logos, no watermark-like graphics.
`;

const interaction = await ai.interactions.create({
  model: "gemini-3.1-flash-image",
  input: prompt,
  response_format: {
    type: "image",
    mime_type: "image/png",
    aspect_ratio: "16:9",
    image_size: "1K"
  }
});

if (!interaction.output_image?.data) {
  throw new Error("Gemini returned no image");
}

const imageBuffer = Buffer.from(
  interaction.output_image.data,
  "base64"
);

fs.mkdirSync("test-images", { recursive: true });

fs.writeFileSync(
  "test-images/pixie-test.png",
  imageBuffer
);

console.log("=================================");
console.log("IMAGE GENERATED SUCCESSFULLY");
console.log("=================================");
console.log("Saved: test-images/pixie-test.png");
