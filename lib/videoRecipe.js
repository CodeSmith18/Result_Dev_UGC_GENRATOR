import { generateJsonWithClaude } from "@/lib/anthropic";
import { createMemoryCache } from "@/lib/memoryCache";
import { memeTemplates, productMemeHints, trendStyles } from "@/lib/memeTemplates";
import { VideoRecipeSchema } from "@/lib/schemas";

const recipeCache = createMemoryCache({
  maxEntries: 80,
  ttlMs: 1000 * 60 * 45
});

export async function createVideoRecipe({ productBrief, preferences }) {
  const cacheKey = JSON.stringify({
    product: productBrief.sourceUrl || productBrief.productName,
    tone: preferences.tone,
    audience: preferences.audience,
    goal: preferences.goal
  });
  const cached = recipeCache.get(cacheKey);

  if (cached) {
    return cached;
  }

  const hints = productMemeHints(productBrief);
  const aiRecipe = await createAiVideoRecipe({ productBrief, preferences, hints });
  const recipe = aiRecipe || createFallbackVideoRecipe({ productBrief, preferences });

  return recipeCache.set(cacheKey, recipe);
}

async function createAiVideoRecipe({ productBrief, preferences, hints }) {
  const json = await generateJsonWithClaude({
    system:
      "You are a sharp meme editor for TikTok/Reels UGC ads. Be specific, current, and funny. Return only valid JSON with no markdown.",
    prompt: `Create a 6 second vertical meme-style UGC video recipe for this product.

Constraints:
- It must look like the assignment examples: one background video, one large funny reaction GIF/cutout, one caption.
- No product badges, no CTA card, no product-description block, no audio label.
- The caption should be one funny line, 6-13 words max, written like a real social post.
- The caption should mention the product name only if it feels natural.
- Use product-specific humor, not generic "shocked reaction" humor.
- Prefer self-roast, POV, delulu confession, "be so real", "not me", or group-chat wording.
- No fake claims.
- Avoid animal or creature metaphors; keep jokes human and product-native.
- The GIF query must target a recognizable viral human reaction meme or creator/celebrity reaction.
- Prefer real human meme searches like "The Rock eyebrow reaction meme gif", "Kevin Hart confused reaction meme gif", or "Pedro Pascal laughing crying reaction meme gif".
- Never ask for cartoon, anime, animal, emoji, logo, text-only, icon, or abstract sticker GIFs.
- The background query should be product/use-case specific, not generic lifestyle.
- First create 5 candidate captions internally, score them for specificity and surprise, then return only the best one.

Meme templates to remix:
${memeTemplates.map((template) => `- ${template}`).join("\n")}

Trend styles to borrow:
${trendStyles.map((style) => `- ${style}`).join("\n")}

Product-specific meme hints:
${JSON.stringify(hints, null, 2)}

Return this exact JSON shape:
{
  "duration": 6,
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
  const hints = productMemeHints(productBrief);
  const tone = preferences.tone.toLowerCase();
  const isPremium = tone.includes("premium");
  const isEducational = tone.includes("educational");
  const isFounder = tone.includes("founder");

  if (isPremium) {
    return normalizeRecipe({
      duration: 6,
      format: "vertical",
      funnyText: `me pretending I did not need ${productName} this badly`,
      gifQuery: "the rock eyebrow",
      backgroundQuery: hints.backgroundQuery,
      audioMood: "smooth upbeat",
      whyThisWorks:
        "It keeps the joke simple while making the product feel like an obvious upgrade."
    });
  }

  if (isEducational || isFounder) {
    return normalizeRecipe({
      duration: 6,
      format: "vertical",
      funnyText: `me explaining why ${hints.oldWay} was never the move`,
      gifQuery: "kevin hart reaction",
      backgroundQuery: hints.backgroundQuery,
      audioMood: "confident tutorial beat",
      whyThisWorks:
        "It frames the product as the smarter shortcut without adding a salesy layout."
    });
  }

  return normalizeRecipe({
    duration: 6,
    format: "vertical",
    funnyText: `not me letting ${productName} handle the annoying part`,
    gifQuery: hints.gifQuery,
    backgroundQuery: hints.backgroundQuery,
    audioMood: "funny fast upbeat",
    whyThisWorks:
      "It mirrors the examples: one relatable joke, one reaction layer, and a simple background."
  });
}

function normalizeRecipe(recipe) {
  const legacyScene = recipe.scenes?.[0];
  const funnyText = recipe.funnyText || recipe.hook || legacyScene?.text || "";

  return {
    duration: Number(recipe.duration) || 6,
    format: "vertical",
    funnyText: shorten(String(funnyText).trim(), 92),
    gifQuery: String(
      recipe.gifQuery || legacyScene?.gifQuery || "the rock eyebrow"
    ).trim(),
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
