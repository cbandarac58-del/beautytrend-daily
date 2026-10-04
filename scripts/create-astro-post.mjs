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

// ============================================================
// HELPERS
// ============================================================

const escapeYaml = (value) => {
  return String(value ?? "")
    .replace(/\\/g, "\\\\")
    .replace(/"/g, '\\"')
    .replace(/\n/g, " ")
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
  : [];

// ============================================================
// DATES
// ============================================================

const publishedAt = new Date().toISOString();

// ============================================================
// FRONTMATTER
// ============================================================

let frontmatter = `---
title: "${escapeYaml(article.title)}"
description: "${escapeYaml(article.description)}"
excerpt: "${escapeYaml(article.excerpt || article.description)}"
category: "${escapeYaml(article.category || "Beauty & Style")}"
keywords:
`;

for (const keyword of keywords) {
  frontmatter += `  - "${escapeYaml(keyword)}"\n`;
}

frontmatter += `publishedAt: "${publishedAt}"
`;

// ============================================================
// FAQ
// ============================================================

frontmatter += `faq:
`;

if (faq.length > 0) {
  for (const item of faq) {
    frontmatter += `  - question: "${escapeYaml(item.question)}"\n`;
    frontmatter += `    answer: "${escapeYaml(item.answer)}"\n`;
  }
} else {
  frontmatter += `  []\n`;
}

// ============================================================
// YOUTUBE
// ============================================================

frontmatter += `youtube:
`;

if (youtube.length > 0) {
  for (const video of youtube) {
    if (!video?.videoId) continue;

    frontmatter += `  - title: "${escapeYaml(video.title)}"\n`;
    frontmatter += `    videoId: "${escapeYaml(video.videoId)}"\n`;
  }
} else {
  frontmatter += `  []\n`;
}

frontmatter += `---

`;

// ============================================================
// FINAL ARTICLE
// ============================================================

const output = frontmatter + article.content;

const outputPath = path.join(
  outputDir,
  `${article.slug}.md`
);

fs.writeFileSync(
  outputPath,
  output,
  "utf8"
);

// ============================================================
// OUTPUT
// ============================================================

console.log("=================================");
console.log("ASTRO ARTICLE CREATED");
console.log("=================================");
console.log(`Title: ${article.title}`);
console.log(`Category: ${article.category}`);
console.log(`Slug: ${article.slug}`);
console.log(`File: ${outputPath}`);
console.log(`YouTube videos: ${youtube.length}`);
console.log(`FAQ items: ${faq.length}`);
console.log("=================================");
