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
Create a photorealistic international beauty magazine photograph.

Subject:
A stylish adult woman with a modern 2026 bob haircut.

Style:
- Professional salon photography
- Natural realistic hair
- Elegant modern fashion
- Soft studio lighting
- Clean luxury beauty background
- Photorealistic
- High quality editorial photography
- Suitable for a beauty magazine article

Do not include:
- Text
- Logos
- Brand names
- Watermarks
- Borders
- Collage
`;

console.log("=================================");
console.log("GEMINI IMAGE LITE TEST");
console.log("=================================");

const response = await ai.models.generateContent({
  model: "gemini-3.1-flash-lite-image",
  contents: prompt,
  config: {
    responseModalities: ["TEXT", "IMAGE"],
    imageConfig: {
      aspectRatio: "16:9",
      imageSize: "1K"
    }
  }
});

const parts = response.candidates?.[0]?.content?.parts || [];

let imageFound = false;

fs.mkdirSync("test-images", {
  recursive: true
});

for (const part of parts) {
  if (part.inlineData?.data) {
    const buffer = Buffer.from(
      part.inlineData.data,
      "base64"
    );

    fs.writeFileSync(
      "test-images/gemini-image-test.png",
      buffer
    );

    console.log("IMAGE GENERATED SUCCESSFULLY");
    console.log(
      "Saved: test-images/gemini-image-test.png"
    );

    imageFound = true;
    break;
  }
}

if (!imageFound) {
  console.log("Gemini returned no image.");

  for (const part of parts) {
    if (part.text) {
      console.log("Model response:");
      console.log(part.text);
    }
  }

  throw new Error("No image was returned by Gemini");
}

console.log("=================================");
console.log("IMAGE TEST COMPLETE");
console.log("=================================");
