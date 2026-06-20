import Anthropic from "@anthropic-ai/sdk";

let client;

export function hasAnthropicKey() {
  return Boolean(process.env.ANTHROPIC_API_KEY);
}

export function getAnthropicClient() {
  if (!hasAnthropicKey()) {
    return null;
  }

  if (!client) {
    client = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY
    });
  }

  return client;
}

export async function generateJsonWithClaude({ system, prompt, maxTokens = 900 }) {
  const anthropic = getAnthropicClient();

  if (!anthropic) {
    return null;
  }

  let response;

  try {
    response = await anthropic.messages.create({
      model: process.env.ANTHROPIC_MODEL || "claude-sonnet-4-6",
      max_tokens: maxTokens,
      temperature: 0.4,
      system,
      messages: [
        {
          role: "user",
          content: prompt
        }
      ]
    });
  } catch (error) {
    console.warn("Claude request failed; using deterministic fallback.", error.message);
    return null;
  }

  const text = response.content
    .filter((part) => part.type === "text")
    .map((part) => part.text)
    .join("\n")
    .trim();

  return parseJsonFromText(text);
}

function parseJsonFromText(text) {
  try {
    return JSON.parse(text);
  } catch (error) {
    const match = text.match(/\{[\s\S]*\}/);

    if (!match) {
      throw error;
    }

    return JSON.parse(match[0]);
  }
}
