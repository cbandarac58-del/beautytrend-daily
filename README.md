# 🌸 BeautyTrend Daily - AI-Powered Automated Magazine

An automated, modern beauty magazine built with **Astro** and powered by **Google Gemini 2.5** and the **YouTube Data API**.

---

## ✨ Features
- **🤖 Automated Editorial Content:** Generates 1,000+ word trend articles with structured FAQs, styling guides, and SEO metadata.
- **📅 Daily 3 Auto-Posts:** Runs automatically 3 times a day via GitHub Actions (`03:00 UTC`, `09:00 UTC`, `15:00 UTC`).
- **📸 100% Royalty-Free Beauty Images:** Curated, copyright-safe high-resolution imagery with proper CC attribution.
- **🎥 YouTube Tutorial Integration:** Searches and auto-embeds relevant, top-rated tutorials for each beauty trend.
- **⚡ Supercharged SEO:** Dynamic XML Sitemap, structured schema (`Article`, `FAQPage`), and Astro Content Collections.

---

## 🔑 Required Repository Secrets
In your GitHub Repository (`Settings` ➔ `Secrets and variables` ➔ `Actions`):
- `GEMINI_API_KEY`: Google AI Studio API Key
- `YOUTUBE_API_KEY`: Google Cloud YouTube Data API v3 Key

---

## ⚙️ GitHub Actions Workflow Permissions
To allow the automated bot to commit new articles to your repository:
1. Go to **Settings** ➔ **Actions** ➔ **General**
2. Scroll to **Workflow permissions**
3. Select **"Read and write permissions"**
4. Click **Save**

---

## 🚀 Manual Generation
To generate a single article locally or test the script:
```bash
export GEMINI_API_KEY="your_gemini_key"
export YOUTUBE_API_KEY="your_youtube_key"
npm run publish:daily
```

To generate multiple articles at once (e.g. 3 articles):
```bash
node scripts/publish-daily-post.mjs 3
```
