const apiKey = process.env.YOUTUBE_API_KEY;

if (!apiKey) {
  throw new Error("YOUTUBE_API_KEY is not configured");
}

const topic = process.env.VIDEO_TOPIC || "pixie haircut trends 2026";

const url = new URL(
  "https://www.googleapis.com/youtube/v3/search"
);

url.searchParams.set("part", "snippet");
url.searchParams.set("q", topic);
url.searchParams.set("type", "video");
url.searchParams.set("maxResults", "5");
url.searchParams.set("order", "relevance");
url.searchParams.set("safeSearch", "strict");
url.searchParams.set("key", apiKey);

console.log("=================================");
console.log("YOUTUBE VIDEO SEARCH");
console.log("=================================");
console.log(`Topic: ${topic}`);

const response = await fetch(url);

if (!response.ok) {
  const error = await response.text();
  throw new Error(
    `YouTube API error: ${response.status}\n${error}`
  );
}

const data = await response.json();

const videos = (data.items || []).map((item) => ({
  title: item.snippet.title,
  channel: item.snippet.channelTitle,
  videoId: item.id.videoId,
  url: `https://www.youtube.com/watch?v=${item.id.videoId}`,
  thumbnail:
    item.snippet.thumbnails?.high?.url ||
    item.snippet.thumbnails?.medium?.url ||
    item.snippet.thumbnails?.default?.url
}));

console.log("\n=================================");
console.log(`FOUND ${videos.length} VIDEOS`);
console.log("=================================");

console.log(JSON.stringify(videos, null, 2));

if (videos.length === 0) {
  console.log("\nNo relevant videos found.");
}

console.log("\n=================================");
console.log("YOUTUBE SEARCH COMPLETE");
console.log("=================================");
