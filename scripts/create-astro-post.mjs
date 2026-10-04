import fs from "node:fs";
import path from "node:path";

const inputPath = "generated/article.json";
const outputDir = "src/content/articles";

if (!fs.existsSync(inputPath)) {
  throw new Error(`Missing ${inputPath}`);
}

const data = JSON.parse(
  fs.readFileSync(inputPath, "utf8")
);

const article = data.article;

if (!article?.title || !article?.slug || !article?.content) {
  throw new Error("Invalid article data");
}

fs.mkdirSync(outputDir, {
  recursive: true
});

// ------------------------------------------------------------
// Helpers
// ------------------------------------------------------------

const escapeYaml = (value) => {
  return String(value ?? "")
    .replace(/\\/g, "\\\\")
    .replace(/"/g, '\\"')
    .replace(/\r?\n/g, " ")
    .trim();
};

const keywords = Array.isArray(article.keywords)
  ? article.keywords
  : [];

const faq = Array.isArray(article.faq)
  ? article.faq
  : [];

const youtube = Array.isArray(data.youtube)
  ? data.youtube
      .filter((video) => video?.videoId)
      .map((video) => ({
        title: String(video.title || "Related Beauty Video"),
        videoId: String(video.videoId)
      }))
  : [];

// ------------------------------------------------------------
// YAML arrays
// ------------------------------------------------------------

const keywordYaml =
  keywords.length > 0
    ? keywords
        .map(
          (keyword) =>
            `  - "${escapeYaml(keyword)}"`
        )
        .join("\n")
    : "  []";

const faqYaml =
  faq.length > 0
    ? faq
        .map((item) => {
          return [
            "  - question: \"" +
              escapeYaml(item.question) +
              "\"",
            "    answer: \"" +
              escapeYaml(item.answer) +
              "\""
          ].join("\n");
        })
        .join("\n")
    : "  []";

const youtubeYaml =
  youtube.length > 0
    ? youtube
        .map((video) => {
          return [
            "  - title: \"" +
              escapeYaml(video.title) +
              "\"",
            "    videoId: \"" +
              escapeYaml(video.videoId) +
              "\""
          ].join("\n");
        })
        .join("\n")
    : "  []";

// ------------------------------------------------------------
// Frontmatter
// ------------------------------------------------------------

const publishedAt =
  new Date().toISOString();

const frontmatter = `---
title: "${escapeYaml(article.title)}"
description: "${escapeYaml(article.description)}"
excerpt: "${escapeYaml(article.excerpt || article.description)}"
category: "${escapeYaml(article.category || "Beauty & Style")}"
keywords:
${keywordYaml}
publishedAt: "${publishedAt}"
faq:
${faqYaml}
youtube:
${youtubeYaml}
---

`;

// ------------------------------------------------------------
// Final Markdown
// ------------------------------------------------------------

const output =
  frontmatter +
  article.content.trim() +
  "\n";

const outputPath = path.join(
  outputDir,
  `${article.slug}.md`
);

fs.writeFileSync(
  outputPath,
  output,
  "utf8"
);

console.log("=================================");
console.log("ASTRO ARTICLE CREATED");
console.log("=================================");
console.log(`Title: ${article.title}`);
console.log(`Category: ${article.category}`);
console.log(`Slug: ${article.slug}`);
console.log(`File: ${outputPath}`);
console.log(`YouTube videos: ${youtube.length}`);
console.log("=================================");
