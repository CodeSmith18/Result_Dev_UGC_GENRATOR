import { extractUrl } from "@/lib/extractUrl";

const preferenceQuestions = `Nice, I can make a UGC video for this. Quick vibe check first:

1. What tone do you want? Funny, premium, chaotic, educational, founder-style, or bold?
2. Who should this feel made for? Gen Z, busy professionals, creators, parents, fitness people, or someone else?
3. What should the video optimize for? Clicks, laughs, trust, purchases, signups, or app installs?`;

export function createAssistantReply(messages) {
  const lastMessage = messages.at(-1)?.content?.trim() || "";
  const lower = lastMessage.toLowerCase();
  const url = extractUrl(lastMessage);

  if (url) {
    return {
      status: "awaiting_preferences",
      content: preferenceQuestions
    };
  }

  if (/^(hi|hey|hello|yo|gm|good morning|good evening)\b/i.test(lower)) {
    return {
      status: "idle",
      content:
        "Hey! Send me a product URL when you’re ready, and I’ll help shape it into a short UGC video."
    };
  }

  if (
    lower.includes("what can you do") ||
    lower.includes("help") ||
    lower.includes("how does this work")
  ) {
    return {
      status: "idle",
      content:
        "I can generate UGC videos for products. Send me any product URL, I’ll analyze the site, ask a quick tone/audience/goal check, then create a short-form video concept and render a video link."
    };
  }

  return {
    status: "idle",
    content:
      "I’m best at making product UGC videos. Send me a URL, or tell me the product in one sentence, and I’ll start shaping the creative direction."
  };
}
