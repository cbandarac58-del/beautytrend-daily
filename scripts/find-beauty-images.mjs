
import fs from "node:fs";
import path from "node:path";

const inputPath = "generated/article.json";
const outputPath = "generated/beauty-images.json";

if (!fs.existsSync(inputPath)) {
  throw new Error(`Missing ${inputPath}`);
}

const data = JSON.parse(
  fs.readFileSync(inputPath, "utf8")
);

const article = data.article;

if (!article?.title) {
  throw new Error("Article title is missing");
}

const keywords = Array.isArray(article.keywords)
  ? article.keywords
  : [];

const query = [
  article.title,
  ...keywords.slice(0, 3),
  "beauty hairstyle hair manicure"
].join(" ");

const api = new URL(
  "https://commons.wikimedia.org/w/api.php"
);

api.searchParams.set("action", "query");
api.searchParams.set("generator", "search");
api.searchParams.set("gsrsearch", query);
api.searchParams.set("gsrnamespace", "6");
api.searchParams.set("gsrlimit", "15");
api.searchParams.set("gsrwhat", "text");
api.searchParams.set("prop", "imageinfo");
api.searchParams.set("iiprop", "url|extmetadata");
api.searchParams.set(
  "iiextmetadatafilter",
  "LicenseShortName|LicenseUrl|Artist|Credit|Attribution|UsageTerms"
);
api.searchParams.set("iiurlwidth", "1200");
api.searchParams.set("format", "json");

console.log("Searching Wikimedia Commons...");
console.log(`Topic: ${article.title}`);

const response = await fetch(api, {
  headers: {
    "User-Agent":
      "BeautyTrendDaily/1.0 (automated beauty magazine)"
  }
});

if (!response.ok) {
  throw new Error(
    `Wikimedia API error: ${response.status}`
  );
}

const json = await response.json();

const pages = Object.values(
  json.query?.pages || {}
);

const images = pages
  .map((page) => {
    const info = page.imageinfo?.[0];
    const meta = info?.extmetadata || {};

    const license = meta.LicenseShortName?.value || "";
    const licenseUrl = meta.LicenseUrl?.value || "";
    const artist =
      meta.Attribution?.value ||
      meta.Artist?.value ||
      meta.Credit?.value ||
      "Unknown";

    if (!info?.thumburl || !license) {
      return null;
    }

    return {
      title: page.title,
      url: info.thumburl,
      originalUrl: info.url,
      filePage: info.descriptionurl,
      artist: artist.replace(/<[^>]*>/g, "").trim(),
      license,
      licenseUrl,
      usageTerms:
        meta.UsageTerms?.value || license
    };
  })
  .filter(Boolean)
  .slice(0, 3);

fs.mkdirSync(path.dirname(outputPath), {
  recursive: true
});

fs.writeFileSync(
  outputPath,
  JSON.stringify(
    {
      topic: article.title,
      images
    },
    null,
    2
  ),
  "utf8"
);

console.log(`Images found: ${images.length}`);
console.log(`Saved: ${outputPath}`);

if (images.length < 3) {
  console.log(
    "NOTICE: Fewer than 3 reusable images were found."
  );
}

console.log(
  JSON.stringify(images, null, 2)
);
