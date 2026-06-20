import { generateJsonWithClaude } from "@/lib/anthropic";
import { CreativePreferencesSchema } from "@/lib/schemas";

export async function parseCreativePreferences(message) {
  const aiPreferences = await createAiPreferences(message);
  return aiPreferences || createFallbackPreferences(message);
}

async function createAiPreferences(message) {
  const json = await generateJsonWithClaude({
    system:
      "You extract short-form video creative preferences. Return only valid JSON with no markdown.",
    prompt: `Extract the user's desired UGC video direction.

Return this exact JSON shape:
{
  "tone": "string",
  "audience": "string",
  "goal": "string",
  "extraInstructions": ["string"]
}

If the user omits a field, infer a practical default.

User message:
${message}`,
    maxTokens: 500
  });

  if (!json) {
    return null;
  }

  const parsed = CreativePreferencesSchema.safeParse(json);
  return parsed.success ? parsed.data : null;
}

function createFallbackPreferences(message) {
  const lower = message.toLowerCase();

  return {
    tone: pickFirst(lower, [
      "funny",
      "premium",
      "chaotic",
      "educational",
      "founder-style",
      "bold",
      "trustworthy"
    ]),
    audience: inferAudience(lower),
    goal: pickFirst(lower, [
      "app installs",
      "purchases",
      "signups",
      "clicks",
      "laughs",
      "trust"
    ]),
    extraInstructions: []
  };
}

function pickFirst(text, options) {
  return options.find((option) => text.includes(option)) || options[0];
}

function inferAudience(text) {
  if (text.includes("gen z") || text.includes("genz")) {
    return "Gen Z";
  }

  if (text.includes("founder")) {
    return "founders";
  }

  if (text.includes("professional")) {
    return "busy professionals";
  }

  if (text.includes("creator")) {
    return "creators";
  }

  if (text.includes("parent")) {
    return "parents";
  }

  if (text.includes("fitness")) {
    return "fitness people";
  }

  if (text.includes("student") || text.includes("college")) {
    return "students";
  }

  return "the product's likely buyers";
}
