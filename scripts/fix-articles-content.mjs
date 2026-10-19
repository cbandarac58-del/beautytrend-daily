import fs from "node:fs";
import path from "node:path";

const ARTICLES_DIR = "src/content/articles";
const files = fs.readdirSync(ARTICLES_DIR).filter((f) => f.endsWith(".md"));

console.log(`Checking ${files.length} articles...`);

for (const filename of files) {
  const filePath = path.join(ARTICLES_DIR, filename);
  const raw = fs.readFileSync(filePath, "utf8");
  const parts = raw.split("---");
  if (parts.length < 3) continue;

  let frontmatterStr = parts[1];
  let bodyStr = parts.slice(2).join("---").trim();
  let modified = false;

  // 1. Fix 404 image photo-1584297091622-af8e5fdcf9ef
  const brokenImg = "photo-1584297091622-af8e5fdcf9ef";
  const validImg = "https://images.unsplash.com/photo-1519699047748-de8e457a634e?auto=format&fit=crop&w=1200&h=675&q=85";
  if (frontmatterStr.includes(brokenImg)) {
    frontmatterStr = frontmatterStr.replace(/https:\/\/images\.unsplash\.com\/photo-1584297091622-af8e5fdcf9ef[^\s"]*/g, validImg);
    frontmatterStr = frontmatterStr.replace(/Photo by Ayo Ogunseinde on Unsplash/g, "Photo by Sarah Comeau on Unsplash");
    modified = true;
    console.log(`[FIXED IMAGE] in ${filename}`);
  }
  if (bodyStr.includes(brokenImg)) {
    bodyStr = bodyStr.replace(/https:\/\/images\.unsplash\.com\/photo-1584297091622-af8e5fdcf9ef[^\s"]*/g, validImg);
    modified = true;
  }

  // 2. Unpack raw JSON from body if present
  const trimmedBody = bodyStr.trim();
  if (trimmedBody.startsWith("{")) {
    console.log(`[UNPACKING JSON] in ${filename}`);

    // Extract JSON block between first { and last } before any <div> or <figure>
    const firstBrace = trimmedBody.indexOf("{");
    let lastBrace = trimmedBody.indexOf("\n<div");
    if (lastBrace === -1) lastBrace = trimmedBody.indexOf("\n<figure");
    if (lastBrace === -1) lastBrace = trimmedBody.lastIndexOf("}");
    else {
      // Find the last } before this HTML tag
      lastBrace = trimmedBody.lastIndexOf("}", lastBrace);
    }

    const jsonCandidate = trimmedBody.slice(firstBrace, lastBrace + 1);
    const extraHtml = trimmedBody.slice(lastBrace + 1).trim();

    let parsed = null;
    try {
      parsed = JSON.parse(jsonCandidate);
    } catch {
      try {
        const sanitized = jsonCandidate
          .replace(/[\u0000-\u0009\u000B-\u001F]+/g, " ")
          .replace(/\r\n/g, "\\n");
        parsed = JSON.parse(sanitized);
      } catch (err) {
        console.warn(`  ⚠️ JSON parse failed for ${filename}: ${err.message}`);
        // Regex fallback extraction
        const titleM = jsonCandidate.match(/"title"\s*:\s*"((?:[^"\\]|\\.)*)"/);
        const descM = jsonCandidate.match(/"description"\s*:\s*"((?:[^"\\]|\\.)*)"/);
        const excerptM = jsonCandidate.match(/"excerpt"\s*:\s*"((?:[^"\\]|\\.)*)"/);
        const contentM = jsonCandidate.match(/"content"\s*:\s*"((?:[^"\\]|\\.)*)"/s);
        if (titleM) {
          parsed = {
            title: titleM[1].replace(/\\"/g, '"'),
            description: descM ? descM[1].replace(/\\"/g, '"') : "",
            excerpt: excerptM ? excerptM[1].replace(/\\"/g, '"') : "",
            content: contentM ? contentM[1].replace(/\\n/g, "\n").replace(/\\"/g, '"') : ""
          };
        }
      }
    }

    if (parsed && (parsed.content || parsed.title)) {
      console.log(`  -> Unpacked Title: "${parsed.title}"`);
      if (parsed.title) {
        frontmatterStr = frontmatterStr.replace(/title:\s*["']?.*?["']?\r?\n/, `title: ${JSON.stringify(parsed.title)}\n`);
      }
      if (parsed.description) {
        frontmatterStr = frontmatterStr.replace(/description:\s*["']?.*?["']?\r?\n/, `description: ${JSON.stringify(parsed.description)}\n`);
      }
      if (parsed.excerpt) {
        frontmatterStr = frontmatterStr.replace(/excerpt:\s*["']?.*?["']?\r?\n/, `excerpt: ${JSON.stringify(parsed.excerpt)}\n`);
      }
      if (Array.isArray(parsed.keywords) && parsed.keywords.length > 0) {
        const kwYaml = parsed.keywords.map((k) => `  - ${JSON.stringify(k)}`).join("\n");
        frontmatterStr = frontmatterStr.replace(/keywords:(\s*\[\]|\s*\n(\s*-.*?\n)+)/, `keywords:\n${kwYaml}\n`);
      }
      if (Array.isArray(parsed.faq) && parsed.faq.length > 0) {
        const faqYaml = parsed.faq.map((f) => `  - question: ${JSON.stringify(f.question)}\n    answer: ${JSON.stringify(f.answer)}`).join("\n");
        frontmatterStr = frontmatterStr.replace(/faq:(\s*\[\]|\s*\n(\s*-.*?\n)+)/, `faq:\n${faqYaml}\n`);
      }

      let cleanBody = String(parsed.content || "").trim();
      // Remove any accidental JSON escape sequences
      cleanBody = cleanBody.replace(/\\n/g, "\n").replace(/\\"/g, '"');
      if (extraHtml) {
        cleanBody = cleanBody + "\n\n" + extraHtml;
      }
      bodyStr = cleanBody;
      modified = true;
    }
  }

  if (modified) {
    const finalContent = `---${frontmatterStr.trim()}\n---\n\n${bodyStr.trim()}\n`;
    fs.writeFileSync(filePath, finalContent, "utf8");
    console.log(`✅ Successfully updated: ${filename}`);
  }
}

console.log("All articles processed!");