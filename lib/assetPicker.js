const fallbackPalettes = {
  fitness: ["#111827", "#0f766e", "#f3c14f"],
  beauty: ["#3f1d2b", "#e05263", "#f7c8d0"],
  saas: ["#101828", "#2563eb", "#7dd3fc"],
  finance: ["#10251f", "#16a34a", "#d9f99d"],
  travel: ["#18324a", "#0ea5e9", "#fde68a"],
  default: ["#171717", "#0f766e", "#e05263"]
};

export async function pickAssets({ productBrief, pageFacts, recipe }) {
  const gifUrl = await findGiphyUrl(recipe.gifQuery || "reaction sticker");
  const pexelsVideoUrl = await findPexelsVideoUrl(recipe.backgroundQuery);
  const pexelsImageUrl = pexelsVideoUrl ? "" : await findPexelsImageUrl(recipe.backgroundQuery);
  const backgroundUrl = pexelsVideoUrl || pexelsImageUrl || pageFacts?.ogImage || "";

  return {
    background: {
      type: pexelsVideoUrl ? "video" : backgroundUrl ? "image" : "generated",
      url: backgroundUrl,
      palette: pickPalette(productBrief.category)
    },
    gif: {
      type: gifUrl ? "gif" : "sticker",
      url: gifUrl,
      label: stickerLabel(recipe)
    },
    audio: {
      mood: recipe.audioMood,
      path: "audio/generated-beat.wav"
    }
  };
}

async function findGiphyUrl(query) {
  const apiKey = process.env.GIPHY_API_KEY;

  if (!apiKey) {
    return "";
  }

  const simplified = simplifyGifQuery(query);
  const queries = [
    query,
    `${query} sticker`,
    simplified,
    `${simplified} sticker`,
    "shocked guy reaction sticker",
    "confused man reaction sticker",
    "mind blown reaction sticker"
  ].filter(Boolean);

  for (const searchQuery of queries) {
    const stickerTranslatedUrl = await fetchGiphyTranslate({
      apiKey,
      query: searchQuery,
      endpoint: "stickers"
    });

    if (stickerTranslatedUrl) {
      return stickerTranslatedUrl;
    }

    const stickerSearchedUrl = await fetchGiphySearch({
      apiKey,
      query: searchQuery,
      endpoint: "stickers"
    });

    if (stickerSearchedUrl) {
      return stickerSearchedUrl;
    }

    const translatedUrl = await fetchGiphyTranslate({ apiKey, query: searchQuery });

    if (translatedUrl) {
      return translatedUrl;
    }

    const searchedUrl = await fetchGiphySearch({ apiKey, query: searchQuery });

    if (searchedUrl) {
      return searchedUrl;
    }
  }

  return "";
}

async function fetchGiphyTranslate({ apiKey, query, endpoint = "gifs" }) {
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
    return getGiphyUrl(data?.data, endpoint === "stickers");
  } catch (error) {
    return "";
  }
}

async function fetchGiphySearch({ apiKey, query, endpoint = "gifs" }) {
  try {
    const search = new URL(`https://api.giphy.com/v1/${endpoint}/search`);
    search.searchParams.set("api_key", apiKey);
    search.searchParams.set("q", query);
    search.searchParams.set("rating", "pg-13");
    search.searchParams.set("limit", "6");

    const response = await fetch(search);

    if (!response.ok) {
      return "";
    }

    const data = await response.json();
    const gif = data?.data?.find((item) => getGiphyUrl(item, endpoint === "stickers"));
    return getGiphyUrl(gif, endpoint === "stickers");
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

function simplifyGifQuery(query) {
  return query
    .replace(/[^\w\s-]/g, " ")
    .replace(/\b(person|someone|reaction|gif|meme)\b/gi, " ")
    .replace(/\s+/g, " ")
    .trim()
    .split(" ")
    .slice(0, 4)
    .join(" ");
}

async function findPexelsImageUrl(query) {
  const apiKey = process.env.PEXELS_API_KEY;

  if (!apiKey) {
    return "";
  }

  try {
    const search = new URL("https://api.pexels.com/v1/search");
    search.searchParams.set("query", query);
    search.searchParams.set("orientation", "portrait");
    search.searchParams.set("per_page", "1");

    const response = await fetch(search, {
      headers: {
        Authorization: apiKey
      }
    });

    if (!response.ok) {
      return "";
    }

    const data = await response.json();
    return data?.photos?.[0]?.src?.portrait || data?.photos?.[0]?.src?.large2x || "";
  } catch (error) {
    return "";
  }
}

async function findPexelsVideoUrl(query) {
  const apiKey = process.env.PEXELS_API_KEY;

  if (!apiKey) {
    return "";
  }

  try {
    const search = new URL("https://api.pexels.com/videos/search");
    search.searchParams.set("query", query);
    search.searchParams.set("orientation", "portrait");
    search.searchParams.set("per_page", "6");

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
    const rankedFiles = videos
      .flatMap((video) => video.video_files || [])
      .filter((file) => file.link && file.width && file.height)
      .filter((file) => file.height >= file.width)
      .sort((a, b) => {
        const aScore = Math.abs(a.height - 1920) + Math.abs(a.width - 1080);
        const bScore = Math.abs(b.height - 1920) + Math.abs(b.width - 1080);
        return aScore - bScore;
      });

    return rankedFiles[0]?.link || "";
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
