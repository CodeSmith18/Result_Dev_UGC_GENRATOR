import { readdirSync } from "node:fs";
import path from "node:path";

const fallbackPalettes = {
  fitness: ["#111827", "#0f766e", "#f3c14f"],
  beauty: ["#3f1d2b", "#e05263", "#f7c8d0"],
  saas: ["#101828", "#2563eb", "#7dd3fc"],
  finance: ["#10251f", "#16a34a", "#d9f99d"],
  travel: ["#18324a", "#0ea5e9", "#fde68a"],
  default: ["#171717", "#0f766e", "#e05263"]
};

const reactionQueryPool = [
  "side eye reaction sticker",
  "jaw drop reaction sticker",
  "crying laughing reaction sticker",
  "confused woman reaction sticker",
  "dramatic disbelief reaction sticker",
  "screaming reaction sticker",
  "thinking face reaction sticker",
  "caught in 4k reaction sticker",
  "ok sure reaction sticker",
  "staring camera reaction sticker",
  "panic reaction sticker",
  "speechless reaction sticker"
];

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

  const gifUrl =
    (await findGiphyUrl(gifQueries, usedGifUrls)) || findLocalGifUrl(usedGifUrls);
  const pexelsVideoUrl = await findPexelsVideoUrl(backgroundQuery, usedBackgroundUrls);
  const pexelsImageUrl = pexelsVideoUrl
    ? ""
    : await findPexelsImageUrl(backgroundQuery, usedBackgroundUrls);
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

async function findGiphyUrl(queries, usedUrls = []) {
  const apiKey = process.env.GIPHY_API_KEY;

  if (!apiKey) {
    return "";
  }

  for (const searchQuery of queries) {
    const stickerUrl = await fetchGiphySearch({
      apiKey,
      query: searchQuery,
      endpoint: "stickers",
      usedUrls
    });

    if (stickerUrl) {
      return stickerUrl;
    }

    const gifUrl = await fetchGiphySearch({
      apiKey,
      query: searchQuery,
      endpoint: "gifs",
      usedUrls
    });

    if (gifUrl) {
      return gifUrl;
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

    const translatedGifUrl = await fetchGiphyTranslate({
      apiKey,
      query: searchQuery,
      endpoint: "gifs",
      usedUrls
    });

    if (translatedGifUrl) {
      return translatedGifUrl;
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
    `${query} ${rotatedPool[0]}`,
    `${simplified} ${rotatedPool[1]}`,
    `${productContext} ${rotatedPool[2]}`,
    query,
    `${query} sticker`,
    simplified,
    `${simplified} sticker`,
    ...rotatedPool.slice(3, 8)
  ]).filter((item) => !usedGifQueries.includes(item));
}

async function fetchGiphyTranslate({
  apiKey,
  query,
  endpoint = "gifs",
  usedUrls = []
}) {
  try {
    const search = new URL(`https://api.giphy.com/v1/${endpoint}/translate`);
    search.searchParams.set("api_key", apiKey);
    search.searchParams.set("s", query);
    search.searchParams.set("rating", "pg-13");

    const response = await fetch(search);

    if (!response.ok) {
      return "";
    }

    const data = await response.json();
    const url = isAcceptableGiphyItem(data?.data)
      ? getGiphyUrl(data?.data, endpoint === "stickers")
      : "";
    return url && !usedUrls.includes(url) ? url : "";
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
    const search = new URL(`https://api.giphy.com/v1/${endpoint}/search`);
    search.searchParams.set("api_key", apiKey);
    search.searchParams.set("q", query);
    search.searchParams.set("rating", "pg-13");
    search.searchParams.set("limit", "18");
    search.searchParams.set("offset", String(Math.floor(Math.random() * 12)));

    const response = await fetch(search);

    if (!response.ok) {
      return "";
    }

    const data = await response.json();
    const urls = (data?.data || [])
      .filter(isAcceptableGiphyItem)
      .map((item) => getGiphyUrl(item, endpoint === "stickers"))
      .filter(Boolean)
      .filter((url) => !usedUrls.includes(url));

    return chooseRandom(urls);
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

function isAcceptableGiphyItem(item) {
  const title = `${item?.title || ""} ${item?.slug || ""}`.toLowerCase();

  if (!title.trim()) {
    return true;
  }

  if (
    /logo|icon|emoji|emoticon|alphabet|letter|font|text|word|sticker pack|brand|google|loading|arrow|heart|star|subscribe|follow/.test(
      title
    )
  ) {
    return false;
  }

  if (/reaction|react|shocked|confused|laugh|cry|panic|scream|side eye|jaw|face|guy|man|woman|girl|boy|person|celebrity|meme/.test(title)) {
    return true;
  }

  return true;
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

    return chooseRandom(urls.slice(0, 6));
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

    return chooseRandom(rankedUrls.slice(0, 8));
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
