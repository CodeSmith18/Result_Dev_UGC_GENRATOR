import { extractUrl } from "@/lib/extractUrl";
import { pickAssets } from "@/lib/assetPicker";
import { analyzeProductUrl } from "@/lib/productAnalyzer";
import { parseCreativePreferences } from "@/lib/preferenceParser";
import { renderUgcVideo } from "@/lib/renderVideo";
import { createVideoRecipe } from "@/lib/videoRecipe";

const preferenceQuestions = `Quick vibe check before I make the video:

1. What tone do you want? Funny, premium, chaotic, educational, founder-style, or bold?
2. Who should this feel made for? Gen Z, busy professionals, creators, parents, fitness people, or someone else?
3. What should the video optimize for? Clicks, laughs, trust, purchases, signups, or app installs?`;

export async function createAssistantReply(messages, context = {}) {
  const lastMessage = messages.at(-1)?.content?.trim() || "";
  const lower = lastMessage.toLowerCase();
  const url = extractUrl(lastMessage);

  if (context.step === "needs_product_description" && context.productUrl) {
    const productBrief = createBriefFromDescription({
      description: lastMessage,
      sourceUrl: context.productUrl
    });

    return {
      message: {
        status: "awaiting_preferences",
        content: `Got it. I’ll use this product brief:\n\n${productBrief.productName} is a ${productBrief.category} for ${productBrief.targetAudience}.\n\nMain angle: ${productBrief.mainBenefit}\nLikely CTA: ${productBrief.cta}\n\n${preferenceQuestions}`
      },
      contextPatch: {
        step: "awaiting_preferences",
        productBrief,
        pageFacts: {
          ogImage: ""
        }
      }
    };
  }

  if (context.step === "awaiting_preferences" && context.productBrief) {
    return generateVideoReply({
      productBrief: context.productBrief,
      pageFacts: context.pageFacts,
      preferenceMessage: lastMessage
    });
  }

  if (context.step === "video_ready" && context.productBrief && wantsRevision(lower)) {
    const basePreferences = context.preferences
      ? `${context.preferences.tone}, ${context.preferences.audience}, ${context.preferences.goal}`
      : "funny, likely buyers, clicks";
    const preferenceMessage = `${basePreferences}. Revision request: ${lastMessage}`;

    return generateVideoReply({
      productBrief: context.productBrief,
      pageFacts: context.pageFacts,
      preferenceMessage,
      isRevision: true
    });
  }

  if (url) {
    try {
      const analysis = await analyzeProductUrl(url);
      const brief = analysis.brief;

      return {
        message: {
          status: "awaiting_preferences",
          content: `I read the site. It looks like ${brief.productName} is a ${brief.category} for ${brief.targetAudience}.\n\nMain angle: ${brief.mainBenefit}\nLikely CTA: ${brief.cta}\n\n${preferenceQuestions}`
        },
        contextPatch: {
          step: "awaiting_preferences",
          productUrl: url,
          productBrief: brief,
          pageFacts: analysis.pageFacts,
          usedAiForProductBrief: analysis.usedAi
        }
      };
    } catch (error) {
      return {
        message: {
          status: "needs_product_description",
          content:
            "I couldn’t read that site cleanly. Send me a one-line product description and I’ll still make the video direction from that."
        },
        contextPatch: {
          step: "needs_product_description",
          productUrl: url,
          scrapeError: error.message
        }
      };
    }
  }

  if (/^(hi|hey|hello|yo|gm|good morning|good evening)\b/i.test(lower)) {
    return {
      message: {
        status: "idle",
        content:
          "Hey! Send me a product URL when you’re ready, and I’ll help shape it into a short UGC video."
      },
      contextPatch: {}
    };
  }

  if (
    lower.includes("what can you do") ||
    lower.includes("help") ||
    lower.includes("how does this work")
  ) {
    return {
      message: {
        status: "idle",
        content:
          "I can generate UGC videos for products. Send me any product URL, I’ll analyze the site, ask a quick tone/audience/goal check, then create a short-form video concept and render a video link."
      },
      contextPatch: {}
    };
  }

  return {
    message: {
      status: "idle",
      content:
        "I’m best at making product UGC videos. Send me a URL, or tell me the product in one sentence, and I’ll start shaping the creative direction."
    },
    contextPatch: {}
  };
}

async function generateVideoReply({
  productBrief,
  pageFacts,
  preferenceMessage,
  isRevision = false
}) {
  const preferences = await parseCreativePreferences(preferenceMessage);
  const recipe = await createVideoRecipe({
    productBrief,
    preferences
  });
  const assets = await pickAssets({
    productBrief,
    pageFacts,
    recipe
  });
  const render = await renderUgcVideo({
    productBrief,
    preferences,
    recipe,
    assets
  });

  return {
    message: {
      status: "video_ready",
      videoUrl: render.videoUrl,
      content: `${isRevision ? "Fresh version done." : "Done."} I made this with ${preferences.tone} energy for ${preferences.audience}, optimized for ${preferences.goal}.\n\nHook: ${recipe.hook}\n\nWhy this works: ${recipe.whyThisWorks}\n\nVideo URL: ${render.videoUrl}`
    },
    contextPatch: {
      step: "video_ready",
      preferences,
      recipe,
      assets,
      videoUrl: render.videoUrl
    }
  };
}

function wantsRevision(text) {
  return /another|again|regenerate|rerender|new version|make it|more|less|try|different|change/.test(
    text
  );
}

function createBriefFromDescription({ description, sourceUrl }) {
  const trimmed = description.trim();
  const productName =
    trimmed.match(/(?:called|named|building|launching)\s+([A-Z][A-Za-z0-9 -]{1,28})/)?.[1] ||
    "the product";

  return {
    productName,
    category: "product or service",
    targetAudience: "people who need this solution",
    painPoint: "the old way feels harder than it should",
    mainBenefit: trimmed.slice(0, 180),
    tone: "clear, helpful, modern",
    cta: "Try it now",
    sourceUrl
  };
}
