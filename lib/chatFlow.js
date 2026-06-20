import { extractUrl } from "@/lib/extractUrl";
import { analyzeProductUrl } from "@/lib/productAnalyzer";
import { parseCreativePreferences } from "@/lib/preferenceParser";

const preferenceQuestions = `Quick vibe check before I make the video:

1. What tone do you want? Funny, premium, chaotic, educational, founder-style, or bold?
2. Who should this feel made for? Gen Z, busy professionals, creators, parents, fitness people, or someone else?
3. What should the video optimize for? Clicks, laughs, trust, purchases, signups, or app installs?`;

export async function createAssistantReply(messages, context = {}) {
  const lastMessage = messages.at(-1)?.content?.trim() || "";
  const lower = lastMessage.toLowerCase();
  const url = extractUrl(lastMessage);

  if (context.step === "awaiting_preferences" && context.productBrief) {
    const preferences = await parseCreativePreferences(lastMessage);

    return {
      message: {
        status: "preferences_collected",
        content: `Perfect. I’ll aim for ${preferences.tone} energy, make it feel built for ${preferences.audience}, and optimize for ${preferences.goal}.\n\nNext I’ll turn that into a punchy UGC concept and renderable video recipe.`
      },
      contextPatch: {
        step: "preferences_collected",
        preferences
      }
    };
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
