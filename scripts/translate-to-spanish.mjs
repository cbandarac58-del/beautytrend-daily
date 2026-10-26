#!/usr/bin/env node
// scripts/translate-to-spanish.mjs
// Auto-translates latest English articles to Spanish and publishes to src/content/es/

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const geminiKey = process.env.GEMINI_API_KEY;
if (!geminiKey) {
  console.error('GEMINI_API_KEY not set');
  process.exit(1);
}

const ARTICLES_DIR = path.join(process.cwd(), 'src/content/articles');
const ES_DIR = path.join(process.cwd(), 'src/content/es');
const GEMINI_API = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

// Ensure ES dir exists
if (!fs.existsSync(ES_DIR)) fs.mkdirSync(ES_DIR, { recursive: true });

async function callGemini(prompt) {
  const res = await fetch(`${GEMINI_API}?key=${geminiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.3, maxOutputTokens: 8192 }
    })
  });
  if (!res.ok) throw new Error(`Gemini API error: ${res.status}`);
  const data = await res.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
}

async function translateArticle(filename) {
  const esFilename = filename.replace('.md', '-es.md');
  const esPath = path.join(ES_DIR, esFilename);

  if (fs.existsSync(esPath)) {
    console.log(`  Already translated: ${esFilename}`);
    return null;
  }

  const fullPath = path.join(ARTICLES_DIR, filename);
  const content = fs.readFileSync(fullPath, 'utf8');

  // Extract frontmatter and body
  const fmMatch = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!fmMatch) {
    console.log(`  Skipping ${filename} - no frontmatter`);
    return null;
  }

  const frontmatter = fmMatch[1];
  const body = fmMatch[2];

  // Extract key fields
  const titleMatch = frontmatter.match(/^title:\s*"?(.+?)"?\s*$/m);
  const descMatch = frontmatter.match(/^description:\s*"?(.+?)"?\s*$/m);
  const excerptMatch = frontmatter.match(/^excerpt:\s*"?(.+?)"?\s*$/m);

  const originalTitle = titleMatch ? titleMatch[1] : '';
  const originalDesc = descMatch ? descMatch[1] : '';
  const originalExcerpt = excerptMatch ? excerptMatch[1] : '';

  console.log(`  Translating: ${originalTitle}`);

  const prompt = `Translate this beauty/hair article from English to Spanish (Latin American Spanish, friendly tone).

INSTRUCTIONS:
- Translate ALL text including headings (## H2 sections), paragraphs, FAQ questions and answers, and blockquotes
- Keep ALL markdown formatting exactly (##, **, >, -, etc.)
- Keep all URLs unchanged (https://... links stay in English)
- Keep all Markdown image syntax unchanged
- Do NOT translate the YouTube embed code blocks
- The title to translate: "${originalTitle}"
- The description to translate: "${originalDesc}"
- The excerpt to translate: "${originalExcerpt}"

Return your response in this EXACT format:
TITLE: [translated title here]
DESCRIPTION: [translated description here]
EXCERPT: [translated excerpt here]
BODY:
[full translated body markdown here]

ARTICLE BODY TO TRANSLATE:
${body.substring(0, 6000)}`;

  const translated = await callGemini(prompt);

  // Parse response
  const titleTr = translated.match(/^TITLE:\s*(.+)$/m)?.[1]?.trim() || originalTitle;
  const descTr = translated.match(/^DESCRIPTION:\s*(.+)$/m)?.[1]?.trim() || originalDesc;
  const excerptTr = translated.match(/^EXCERPT:\s*(.+)$/m)?.[1]?.trim() || originalExcerpt;
  const bodyMatch = translated.match(/^BODY:\n([\s\S]*)$/m);
  const bodyTr = bodyMatch ? bodyMatch[1].trim() : body;

  // Build Spanish frontmatter (keep all original fields, replace translatable ones)
  const newFrontmatter = frontmatter
    .replace(/^title:\s*.+$/m, `title: "${titleTr.replace(/"/g, "'")}"`)
    .replace(/^description:\s*.+$/m, `description: "${descTr.replace(/"/g, "'")}"`)
    .replace(/^excerpt:\s*.+$/m, `excerpt: "${excerptTr.replace(/"/g, "'")}"`)
    + '\nlang: "es"\ntranslatedFrom: "' + filename.replace('.md', '') + '"';

  const esContent = `---\n${newFrontmatter}\n---\n${bodyTr}\n`;

  fs.writeFileSync(esPath, esContent, 'utf8');
  console.log(`  ✅ Saved: ${esFilename}`);
  return { filename: esFilename, title: titleTr };
}

async function main() {
  const count = parseInt(process.argv[2] || '3', 10);
  console.log(`\n🇪🇸 BeautyTrend Daily - Translating ${count} article(s) to Spanish...\n`);

  // Get latest articles not yet translated
  const allArticles = fs.readdirSync(ARTICLES_DIR)
    .filter(f => f.endsWith('.md'))
    .sort((a, b) => {
      const statA = fs.statSync(path.join(ARTICLES_DIR, a));
      const statB = fs.statSync(path.join(ARTICLES_DIR, b));
      return statB.mtime - statA.mtime;
    })
    .slice(0, count * 2); // Get more than needed to skip already-translated

  let done = 0;
  for (const article of allArticles) {
    if (done >= count) break;
    try {
      const result = await translateArticle(article);
      if (result) done++;
      await new Promise(r => setTimeout(r, 2000)); // Rate limiting
    } catch (err) {
      console.error(`  Error translating ${article}: ${err.message}`);
    }
  }

  console.log(`\n✅ Translated ${done} article(s) to Spanish`);
  console.log(`📁 Files saved to: ${ES_DIR}`);
}

main().catch(console.error);
