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

const escapeYaml = (value) => {
  return String(value ?? "")
    .replace(/\\/g, "\\\\")
    .replace(/"/g, '\\"')
    .replace(/\n/g, " ");
};

const keywords = Array.isArray(article.keywords)
  ? article.keywords
  : [];

const faq = Array.isArray(article.faq)
  ? article.faq
  : [];

const faqJson = JSON.stringify(faq)
  .replace(/\\/g, "\\\\")
  .replace(/"/g, '\\"');

const youtube = Array.isArray(data.youtube)
  ? data.youtube
  : [];

const youtubeJson = JSON.stringify(youtube)
  .replace(/\\/g, "\\\\")
  .replace(/"/g, '\\"');

const frontmatter = `---
title: "${escapeYaml(article.title)}"
description: "${escapeYaml(article.description)}"
excerpt: "${escapeYaml(article.excerpt)}"
category: "${escapeYaml(article.category)}"
keywords:
${keywords.map((keyword) => `  - "${escapeYaml(keyword)}"`).join("\n")}
publishedAt: "${new Date().toISOString()}"
faq: "${faqJson}"
youtube: "${youtubeJson}"
---

`;

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

console.log("=================================");
console.log("ASTRO ARTICLE CREATED");
console.log("=================================");
console.log(`Title: ${article.title}`);
console.log(`Category: ${article.category}`);
console.log(`Slug: ${article.slug}`);
console.log(`File: ${outputPath}`);
console.log(`YouTube videos: ${youtube.length}`);
console.log("=================================");
