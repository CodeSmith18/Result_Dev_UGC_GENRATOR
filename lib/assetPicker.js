import { readdirSync } from "node:fs";
import path from "node:path";
import { createMemoryCache } from "@/lib/memoryCache";
import { productMemeHints } from "@/lib/memeTemplates";

const fallbackPalettes = {
  fitness: ["#111827", "#0f766e", "#f3c14f"],
  beauty: ["#3f1d2b", "#e05263", "#f7c8d0"],
  saas: ["#101828", "#2563eb", "#7dd3fc"],
  finance: ["#10251f", "#16a34a", "#d9f99d"],
  travel: ["#18324a", "#0ea5e9", "#fde68a"],
  default: ["#171717", "#0f766e", "#e05263"]
};

const reactionQueryPool = [
  "kevin hart reaction",
  "the rock eyebrow",
  "pedro pascal laughing",
  "nick young confused",
  "michael scott no",
  "ryan reynolds reaction",
  "confused little girl",
  "kai cenat reaction",
  "ishowspeed shocked",
  "jimmy fallon reaction",
  "steve harvey reaction",
  "side eye reaction"
];

const humanMemeSignals =
  /human|person|people|guy|man|woman|girl|boy|face|celebrity|actor|actress|comedian|creator|interview|camera|selfie|reaction/i;

const viralMemeSignals =
  /meme|reaction|react|shocked|confused|laugh|cry|panic|scream|side eye|eye roll|jaw drop|blink|blinking|stare|staring|caught in 4k|eyebrow|no god|sorry to this man|delulu|pov/i;

const knownHumanMemeSignals =
  /drew scanlon|the rock|dwayne johnson|kevin hart|pedro pascal|keke palmer|nick young|michael scott|steve carell|the office|lebron|ishowspeed|speed|kai cenat|jennifer lawrence|steve harvey|wendy williams|drake|zendaya|ryan gosling|ryan reynolds|jimmy fallon|janet jackson|will smith|snoop|cardi b|real housewives/i;

const nonHumanOrLowQualitySignals =
  /logo|icon|emoji|emoticon|alphabet|letter|font|text|word|quote|sticker pack|brand|google|loading|arrow|heart|star|subscribe|follow|sale|banner|template|clipart|illustration|cartoon|anime|spongebob|simpsons|minion|pixar|disney|marvel|pokemon|cat|dog|puppy|kitty|monkey|animal|robot|alien|monster|skeleton/i;

const mediaCache = createMemoryCache({
  maxEntries: 120,
  ttlMs: 1000 * 60 * 45
});

export async function pickAssets({
  productBrief,
  pageFacts,
  recipe,
  assetHistory = {}
}) {
  const gifQuery = recipe.gifQuery || "reaction sticker";
  const backgroundQuery = recipe.backgroundQuery || "vertical lifestyle video";
  const usedGifUrls = assetHistory.gifUrls || [];
  const usedGifQueries = assetHistory.gifQueries || [];
  const usedBackgroundUrls = assetHistory.backgroundUrls || [];
  const gifQueries = buildGifQueryList({
    query: gifQuery,
    productBrief,
    usedGifQueries,
    usedGifUrls
  });

  const [remoteGifUrl, pexelsVideoUrl, pexelsImageUrl] = await Promise.all([
    findGiphyUrl(gifQueries, usedGifUrls),
    findPexelsVideoUrl(backgroundQuery, usedBackgroundUrls),
    findPexelsImageUrl(backgroundQuery, usedBackgroundUrls)
  ]);
  const gifUrl = remoteGifUrl || findLocalGifUrl(usedGifUrls);
  const backgroundUrl = pexelsVideoUrl || pexelsImageUrl || pageFacts?.ogImage || "";

  return {
    background: {
      type: pexelsVideoUrl ? "video" : backgroundUrl ? "image" : "generated",
      url: backgroundUrl,
      palette: pickPalette(productBrief.category),
      query: backgroundQuery
    },
    gif: {
      type: gifUrl ? "gif" : "sticker",
      url: gifUrl,
      label: stickerLabel(recipe),
      query: gifQueries[0] || gifQuery
    },
    audio: {
      mood: recipe.audioMood,
      path: "audio/generated-beat.wav"
    }
  };
}

export function warmAssetCache({ productBrief, pageFacts = {}, assetHistory = {} }) {
  const hints = productMemeHints(productBrief);

  return pickAssets({
    productBrief,
    pageFacts,
    assetHistory,
    recipe: {
      funnyText: "",
      gifQuery: hints.gifQuery,
      backgroundQuery: hints.backgroundQuery,
      audioMood: "funny fast upbeat"
    }
  }).catch(() => null);
}

async function findGiphyUrl(queries, usedUrls = []) {
  const apiKey = process.env.GIPHY_API_KEY;

  if (!apiKey) {
    return "";
  }

  for (const searchQuery of queries) {
    const gifUrl = await fetchGiphySearch({
      apiKey,
      query: searchQuery,
      endpoint: "gifs",
      usedUrls
    });

    if (gifUrl) {
      return gifUrl;
    }

    const stickerUrl = await fetchGiphySearch({
      apiKey,
      query: searchQuery,
      endpoint: "stickers",
      usedUrls
    });

    if (stickerUrl) {
      return stickerUrl;
    }

    const translatedGifUrl = await fetchGiphyTranslate({
      apiKey,
      query: searchQuery,
      endpoint: "gifs",
      usedUrls
    });

    if (translatedGifUrl) {
      return translatedGifUrl;
    }

    const translatedStickerUrl = await fetchGiphyTranslate({
      apiKey,
      query: searchQuery,
      endpoint: "stickers",
      usedUrls
    });

    if (translatedStickerUrl) {
      return translatedStickerUrl;
    }
  }

  return "";
}

function buildGifQueryList({ query, productBrief, usedGifQueries = [], usedGifUrls = [] }) {
  const simplified = simplifyGifQuery(query);
  const poolStart = usedGifUrls.length % reactionQueryPool.length;
  const rotatedPool = [
    ...reactionQueryPool.slice(poolStart),
    ...reactionQueryPool.slice(0, poolStart)
  ];
  const productContext = [
    productBrief.category,
    productBrief.painPoint,
    productBrief.productName
  ]
    .join(" ")
    .toLowerCase()
    .replace(/[^\w\s-]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .split(" ")
    .slice(0, 4)
    .join(" ");

  return uniqueList([
    query,
    simplified,
    `${simplified} reaction`,
    `${query} reaction`,
    `${productContext} reaction`,
    `${simplified} funny reaction`,
    ...rotatedPool
  ]).filter((item) => !usedGifQueries.includes(item));
}

async function fetchGiphyTranslate({
  apiKey,
  query,
  endpoint = "gifs",
  usedUrls = []
}) {
  try {
    const cacheKey = `giphy:${endpoint}:translate:${query}`;
    const cached = mediaCache.get(cacheKey);

    if (cached && !usedUrls.includes(cached)) {
      return cached;
    }

    const search = new URL(`https://api.giphy.com/v1/${endpoint}/translate`);
    search.searchParams.set("api_key", apiKey);
    search.searchParams.set("s", query);
    search.searchParams.set("rating", "pg-13");

    const response = await fetch(search);

    if (!response.ok) {
      return "";
    }

    const data = await response.json();
    const url = isAcceptableGiphyItem(data?.data, endpoint, query)
      ? getGiphyUrl(data?.data, endpoint === "stickers")
      : "";
    const selectedUrl = url && !usedUrls.includes(url) ? url : "";

    if (selectedUrl) {
      mediaCache.set(cacheKey, selectedUrl);
    }

    return selectedUrl;
  } catch (error) {
    return "";
  }
}

async function fetchGiphySearch({
  apiKey,
  query,
  endpoint = "gifs",
  usedUrls = []
}) {
  try {
    const cacheKey = `giphy:${endpoint}:search:${query}`;
    const cached = mediaCache.get(cacheKey);

    if (cached && !usedUrls.includes(cached)) {
      return cached;
    }

    const search = new URL(`https://api.giphy.com/v1/${endpoint}/search`);
    search.searchParams.set("api_key", apiKey);
    search.searchParams.set("q", query);
    search.searchParams.set("rating", "pg-13");
    search.searchParams.set("limit", "25");
    search.searchParams.set("offset", String(Math.floor(Math.random() * 10)));

    const response = await fetch(search);

    if (!response.ok) {
      return "";
    }

    const data = await response.json();
    const urls = rankGiphyItems(data?.data || [], endpoint, query)
      .map(({ item }) => getGiphyUrl(item, endpoint === "stickers"))
      .filter(Boolean)
      .filter((url) => !usedUrls.includes(url));

    const selectedUrl = chooseRandom(urls.slice(0, 7));

    if (selectedUrl) {
      mediaCache.set(cacheKey, selectedUrl);
    }

    return selectedUrl;
  } catch (error) {
    return "";
  }
}

function getGiphyUrl(gif, preferSticker = false) {
  if (preferSticker) {
    return (
      gif?.images?.original?.url ||
      gif?.images?.fixed_width?.url ||
      gif?.images?.downsized_medium?.url ||
      ""
    );
  }

  return gif?.images?.downsized_medium?.url || gif?.images?.original?.url || "";
}

function rankGiphyItems(items, endpoint, query) {
  return items
    .map((item) => ({
      item,
      score: scoreGiphyItem(item, endpoint, query)
    }))
    .filter(({ score }) => score >= 7)
    .sort((a, b) => b.score - a.score);
}

function isAcceptableGiphyItem(item, endpoint, query) {
  return scoreGiphyItem(item, endpoint, query) >= 7;
}

function scoreGiphyItem(item, endpoint = "gifs", query = "") {
  const title = [
    item?.title,
    item?.slug,
    item?.username,
    item?.user?.display_name,
    item?.user?.username
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  const searchText = `${title} ${query}`.toLowerCase();

  if (!title.trim() && !query.trim()) {
    return 0;
  }

  if (nonHumanOrLowQualitySignals.test(title)) {
    return -8;
  }

  let score = 0;

  if (knownHumanMemeSignals.test(searchText)) {
    score += 8;
  }

  if (humanMemeSignals.test(searchText)) {
    score += 4;
  }

  if (viralMemeSignals.test(searchText)) {
    score += 4;
  }

  if (/gif|gifs|giphy|reactiongifs/.test(title)) {
    score += 1;
  }

  if (endpoint === "stickers" && /sticker|cutout|transparent/.test(title)) {
    score += 2;
  }

  if (item?.user?.is_verified) {
    score += 1;
  }

  if (item?.trending_datetime && item.trending_datetime !== "0000-00-00 00:00:00") {
    score += 2;
  }

  return score;
}

function simplifyGifQuery(query) {
  return query
    .replace(/[^\w\s-]/g, " ")
    .replace(/\b(person|someone|reaction|gif|meme|cutout)\b/gi, " ")
    .replace(/\s+/g, " ")
    .trim()
    .split(" ")
    .slice(0, 5)
    .join(" ");
}

async function findPexelsImageUrl(query, usedUrls = []) {
  const apiKey = process.env.PEXELS_API_KEY;

  if (!apiKey) {
    return "";
  }

  try {
    const cacheKey = `pexels:image:${query}`;
    const cached = mediaCache.get(cacheKey);

    if (cached && !usedUrls.includes(cached)) {
      return cached;
    }

    const search = new URL("https://api.pexels.com/v1/search");
    search.searchParams.set("query", query);
    search.searchParams.set("orientation", "portrait");
    search.searchParams.set("per_page", "10");

    const response = await fetch(search, {
      headers: {
        Authorization: apiKey
      }
    });

    if (!response.ok) {
      return "";
    }

    const data = await response.json();
    const urls = (data?.photos || [])
      .map((photo) => photo?.src?.portrait || photo?.src?.large2x || "")
      .filter(Boolean)
      .filter((url) => !usedUrls.includes(url));

    const selectedUrl = chooseRandom(urls.slice(0, 6));

    if (selectedUrl) {
      mediaCache.set(cacheKey, selectedUrl);
    }

    return selectedUrl;
  } catch (error) {
    return "";
  }
}

async function findPexelsVideoUrl(query, usedUrls = []) {
  const apiKey = process.env.PEXELS_API_KEY;

  if (!apiKey) {
    return "";
  }

  try {
    const cacheKey = `pexels:video:${query}`;
    const cached = mediaCache.get(cacheKey);

    if (cached && !usedUrls.includes(cached)) {
      return cached;
    }

    const search = new URL("https://api.pexels.com/videos/search");
    search.searchParams.set("query", query);
    search.searchParams.set("orientation", "portrait");
    search.searchParams.set("per_page", "12");

    const response = await fetch(search, {
      headers: {
        Authorization: apiKey
      }
    });

    if (!response.ok) {
      return "";
    }

    const data = await response.json();
    const videos = data?.videos || [];
    const rankedUrls = videos
      .flatMap((video) => video.video_files || [])
      .filter((file) => file.link && file.width && file.height)
      .filter((file) => file.height >= file.width)
      .sort((a, b) => {
        const aScore = Math.abs(a.height - 1920) + Math.abs(a.width - 1080);
        const bScore = Math.abs(b.height - 1920) + Math.abs(b.width - 1080);
        return aScore - bScore;
      })
      .map((file) => file.link)
      .filter((url) => !usedUrls.includes(url));

    const selectedUrl = chooseRandom(rankedUrls.slice(0, 8));

    if (selectedUrl) {
      mediaCache.set(cacheKey, selectedUrl);
    }

    return selectedUrl;
  } catch (error) {
    return "";
  }
}

function findLocalGifUrl(usedUrls = []) {
  try {
    const gifDir = path.join(process.cwd(), "public", "gifs");
    const candidates = readdirSync(gifDir)
      .filter((file) => /\.(gif|webp|png)$/i.test(file))
      .map((file) => `/gifs/${file}`)
      .filter((url) => !usedUrls.includes(url));

    return chooseRandom(candidates);
  } catch (error) {
    return "";
  }
}

function pickPalette(category = "") {
  const lower = category.toLowerCase();

  if (lower.includes("fitness") || lower.includes("health")) {
    return fallbackPalettes.fitness;
  }

  if (lower.includes("beauty") || lower.includes("skin")) {
    return fallbackPalettes.beauty;
  }

  if (lower.includes("saas") || lower.includes("productivity")) {
    return fallbackPalettes.saas;
  }

  if (lower.includes("finance") || lower.includes("money")) {
    return fallbackPalettes.finance;
  }

  if (lower.includes("travel")) {
    return fallbackPalettes.travel;
  }

  return fallbackPalettes.default;
}

function stickerLabel(recipe) {
  const text = `${recipe.funnyText || ""}`.toLowerCase();

  if (text.includes("premium")) {
    return "ok wow";
  }

  if (text.includes("manual") || text.includes("old way")) {
    return "not again";
  }

  if (text.includes("calorie") || text.includes("macro")) {
    return "wait what";
  }

  return "nahhh";
}

function chooseRandom(items) {
  if (!items.length) {
    return "";
  }

  return items[Math.floor(Math.random() * items.length)];
}

function uniqueList(items) {
  return [...new Set(items.filter(Boolean))];
}
