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
    prompt: `Create an 8 second vertical UGC-style ad recipe for this product.

Constraints:
- It must feel native to TikTok/Reels, not like a corporate ad.
- Keep text overlays very short.
- Use a clear meme/POV hook.
- No fake claims.
- The GIF query should describe a reaction GIF.

Return this exact JSON shape:
{
  "duration": 8,
  "format": "vertical",
  "hook": "string",
  "scenes": [
    {"start": 0, "end": 2.4, "text": "string", "visual": "string", "gifQuery": "string"},
    {"start": 2.4, "end": 5.3, "text": "string", "visual": "string", "gifQuery": "string"},
    {"start": 5.3, "end": 8, "text": "string", "visual": "string", "gifQuery": "string"}
  ],
  "backgroundQuery": "string",
  "audioMood": "string",
  "cta": "string",
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
      hook: `${productName}, but make it effortless`,
      scenes: [
        {
          start: 0,
          end: 2.4,
          text: "The old way was doing too much",
          visual: productBrief.painPoint,
          gifQuery: "tired reaction"
        },
        {
          start: 2.4,
          end: 5.3,
          text: `${productName} makes it feel lighter`,
          visual: productBrief.mainBenefit,
          gifQuery: "relieved reaction"
        },
        {
          start: 5.3,
          end: 8,
          text: productBrief.cta,
          visual: "clean product moment",
          gifQuery: "chef kiss reaction"
        }
      ],
      backgroundQuery: `${productBrief.category} premium lifestyle`,
      audioMood: "smooth upbeat",
      cta: productBrief.cta,
      whyThisWorks:
        "It frames the product as a tasteful upgrade and keeps the promise simple."
    });
  }

  if (isEducational || isFounder) {
    return normalizeRecipe({
      duration: 8,
      format: "vertical",
      hook: `Nobody talks about this part of ${productBrief.category}`,
      scenes: [
        {
          start: 0,
          end: 2.4,
          text: "Most people still do this manually",
          visual: productBrief.painPoint,
          gifQuery: "explaining reaction"
        },
        {
          start: 2.4,
          end: 5.3,
          text: `${productName} fixes the annoying part`,
          visual: productBrief.mainBenefit,
          gifQuery: "lightbulb reaction"
        },
        {
          start: 5.3,
          end: 8,
          text: `Try it when you want ${preferences.goal}`,
          visual: productBrief.cta,
          gifQuery: "nodding reaction"
        }
      ],
      backgroundQuery: `${productBrief.category} app demo`,
      audioMood: "confident tutorial beat",
      cta: productBrief.cta,
      whyThisWorks:
        "It teaches the pain point quickly, then makes the product feel like the obvious fix."
    });
  }

  return normalizeRecipe({
    duration: 8,
    format: "vertical",
    hook: `POV: ${productBrief.painPoint}`,
    scenes: [
      {
        start: 0,
        end: 2.4,
        text: `POV: ${shorten(productBrief.painPoint, 36)}`,
        visual: productBrief.painPoint,
        gifQuery: "shocked reaction"
      },
      {
        start: 2.4,
        end: 5.3,
        text: `${productName}: let me handle that`,
        visual: productBrief.mainBenefit,
        gifQuery: "mind blown reaction"
      },
      {
        start: 5.3,
        end: 8,
        text: productBrief.cta,
        visual: preferences.goal,
        gifQuery: "happy dance reaction"
      }
    ],
    backgroundQuery: `${productBrief.category} ${preferences.audience}`,
    audioMood: "funny fast upbeat",
    cta: productBrief.cta,
    whyThisWorks:
      "It uses a relatable frustration, a quick product save, and a simple CTA."
  });
}

function normalizeRecipe(recipe) {
  return {
    duration: Number(recipe.duration) || 8,
    format: "vertical",
    hook: String(recipe.hook || "").trim(),
    scenes: (recipe.scenes || []).slice(0, 3).map((scene, index) => ({
      start: Number(scene.start ?? [0, 2.4, 5.3][index]),
      end: Number(scene.end ?? [2.4, 5.3, 8][index]),
      text: shorten(String(scene.text || "").trim(), 54),
      visual: String(scene.visual || "").trim(),
      gifQuery: String(scene.gifQuery || "reaction gif").trim()
    })),
    backgroundQuery: String(recipe.backgroundQuery || "product lifestyle").trim(),
    audioMood: String(recipe.audioMood || "upbeat").trim(),
    cta: shorten(String(recipe.cta || "Try it now").trim(), 36),
    whyThisWorks: String(
      recipe.whyThisWorks ||
        "It turns a familiar pain point into a quick, native-feeling payoff."
    ).trim()
  };
}

function shorten(value, maxLength) {
  if (value.length <= maxLength) {
    return value;
  }

  return `${value.slice(0, maxLength - 1).trim()}…`;
}
