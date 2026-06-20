const fallbackPalettes = {
  fitness: ["#111827", "#0f766e", "#f3c14f"],
  beauty: ["#3f1d2b", "#e05263", "#f7c8d0"],
  saas: ["#101828", "#2563eb", "#7dd3fc"],
  finance: ["#10251f", "#16a34a", "#d9f99d"],
  travel: ["#18324a", "#0ea5e9", "#fde68a"],
  default: ["#171717", "#0f766e", "#e05263"]
};

export async function pickAssets({ productBrief, pageFacts, recipe }) {
  const gifUrl = await findGiphyUrl(recipe.scenes[0]?.gifQuery || "reaction");
  const pexelsImageUrl = await findPexelsImageUrl(recipe.backgroundQuery);
  const backgroundUrl = pexelsImageUrl || pageFacts?.ogImage || "";

  return {
    background: {
      type: backgroundUrl ? "image" : "generated",
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

  try {
    const search = new URL("https://api.giphy.com/v1/gifs/translate");
    search.searchParams.set("api_key", apiKey);
    search.searchParams.set("s", query);
    search.searchParams.set("rating", "pg-13");

    const response = await fetch(search);

    if (!response.ok) {
      return "";
    }

    const data = await response.json();
    return (
      data?.data?.images?.downsized_medium?.url ||
      data?.data?.images?.original?.url ||
      ""
    );
  } catch (error) {
    return "";
  }
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
  const text = `${recipe.hook} ${recipe.cta}`.toLowerCase();

  if (text.includes("premium")) {
    return "ok wow";
  }

  if (text.includes("manual") || text.includes("old way")) {
    return "not again";
  }

  if (text.includes("try") || text.includes("start")) {
    return "send it";
  }

  return "wait what";
}
