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

Visual requirements:
- Photorealistic
- Professional salon photography
- Natural-looking hair texture
- Modern fashionable haircut
- Soft studio lighting
- Clean elegant background
- Premium international beauty magazine aesthetic
- Realistic skin and hair
- Composition suitable for a website article
- Wide 16:9 composition

Do not include:
- Text
- Logos
- Brand names
- Watermarks
- Collages
- Borders
- Graphic overlays
`;

console.log("=================================");
console.log("STARTING GEMINI IMAGE GENERATION");
console.log("=================================");

const interaction = await ai.interactions.create({
  model: "gemini-3.1-flash-image",
  input: prompt,
  response_format: {
    type: "image",
    mime_type: "image/jpeg",
    aspect_ratio: "16:9",
    image_size: "1K"
  }
});

if (!interaction.output_image?.data) {
  throw new Error("Gemini returned no image data");
}

const imageBuffer = Buffer.from(
  interaction.output_image.data,
  "base64"
);

fs.mkdirSync("test-images", {
  recursive: true
});

const outputPath = "test-images/pixie-test.jpg";

fs.writeFileSync(
  outputPath,
  imageBuffer
);

console.log("=================================");
console.log("IMAGE GENERATED SUCCESSFULLY");
console.log("=================================");
console.log(`Saved: ${outputPath}`);
console.log(`File size: ${imageBuffer.length} bytes`);
console.log("=================================");
