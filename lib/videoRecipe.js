import { generateJsonWithClaude } from "@/lib/anthropic";
import { VideoRecipeSchema } from "@/lib/schemas";

export async function createVideoRecipe({ productBrief, preferences }) {
  const aiRecipe = await createAiVideoRecipe({ productBrief, preferences });
  return aiRecipe || createFallbackVideoRecipe({ productBrief, preferences });
}

async function createAiVideoRecipe({ productBrief, preferences }) {
  const json = await generateJsonWithClaude({
    system:
      "You create funny, current, UGC-style short video recipes. Return only valid JSON with no markdown.",
    prompt: `Create an 8 second vertical meme-style UGC video recipe for this product.

Constraints:
- It must look like the assignment examples: one background video, one large funny reaction GIF/cutout, one caption.
- No product badges, no CTA card, no product-description block, no audio label.
- The caption should be one funny line, 7-14 words max, written like social media text.
- The caption should mention the product name only if it feels natural.
- No fake claims.
- Avoid animal or creature metaphors; keep jokes human and product-native.
- The GIF query should target a big cutout human meme sticker, like "shocked guy sticker", "confused man sticker", "mind blown reaction sticker", or "celebrity thinking sticker".

Return this exact JSON shape:
{
  "duration": 8,
  "format": "vertical",
  "funnyText": "string",
  "gifQuery": "string",
  "backgroundQuery": "string",
  "audioMood": "string",
  "whyThisWorks": "string"
}

Product:
${JSON.stringify(productBrief, null, 2)}

User creative preferences:
${JSON.stringify(preferences, null, 2)}`,
    maxTokens: 1100
  });

  if (!json) {
    return null;
  }

  const parsed = VideoRecipeSchema.safeParse(normalizeRecipe(json));
  return parsed.success ? parsed.data : null;
}

function createFallbackVideoRecipe({ productBrief, preferences }) {
  const productName = productBrief.productName;
  const tone = preferences.tone.toLowerCase();
  const isPremium = tone.includes("premium");
  const isEducational = tone.includes("educational");
  const isFounder = tone.includes("founder");

  if (isPremium) {
    return normalizeRecipe({
      duration: 8,
      format: "vertical",
      funnyText: `me pretending I did not need ${productName} this badly`,
      gifQuery: "classy impressed reaction sticker",
      backgroundQuery: `${productBrief.category} luxury lifestyle vertical video`,
      audioMood: "smooth upbeat",
      whyThisWorks:
        "It keeps the joke simple while making the product feel like an obvious upgrade."
    });
  }

  if (isEducational || isFounder) {
    return normalizeRecipe({
      duration: 8,
      format: "vertical",
      funnyText: `me explaining why I stopped doing this manually`,
      gifQuery: "explaining pointing reaction sticker",
      backgroundQuery: `${productBrief.category} app demo vertical video`,
      audioMood: "confident tutorial beat",
      whyThisWorks:
        "It frames the product as the smarter shortcut without adding a salesy layout."
    });
  }

  return normalizeRecipe({
    duration: 8,
    format: "vertical",
    funnyText: `me when ${productName} handles the part I kept avoiding`,
    gifQuery: "shocked confused reaction sticker",
    backgroundQuery: `${productBrief.category} ${preferences.audience} vertical video`,
    audioMood: "funny fast upbeat",
    whyThisWorks:
      "It mirrors the examples: one relatable joke, one reaction layer, and a simple background."
  });
}

function normalizeRecipe(recipe) {
  const legacyScene = recipe.scenes?.[0];
  const funnyText = recipe.funnyText || recipe.hook || legacyScene?.text || "";

  return {
    duration: Number(recipe.duration) || 8,
    format: "vertical",
    funnyText: shorten(String(funnyText).trim(), 92),
    gifQuery: String(recipe.gifQuery || legacyScene?.gifQuery || "funny shocked reaction sticker").trim(),
    backgroundQuery: String(recipe.backgroundQuery || "product lifestyle").trim(),
    audioMood: String(recipe.audioMood || "upbeat").trim(),
    whyThisWorks: String(
      recipe.whyThisWorks ||
        "It uses the simple meme format from the examples: background, caption, reaction GIF."
    ).trim()
  };
}

function shorten(value, maxLength) {
  if (value.length <= maxLength) {
    return value;
  }

  return `${value.slice(0, maxLength - 1).trim()}…`;
}
