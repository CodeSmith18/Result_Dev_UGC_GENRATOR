import { generateJsonWithClaude } from "@/lib/anthropic";
import { ProductBriefSchema } from "@/lib/schemas";
import { scrapeWebsite } from "@/lib/scrapeWebsite";

export async function analyzeProductUrl(url) {
  const pageFacts = await scrapeWebsite(url);
  const aiBrief = await createAiProductBrief(pageFacts);
  const brief = aiBrief || createFallbackProductBrief(pageFacts);

  return {
    brief,
    pageFacts,
    usedAi: Boolean(aiBrief)
  };
}

async function createAiProductBrief(pageFacts) {
  const json = await generateJsonWithClaude({
    system:
      "You analyze product websites for short-form UGC ad generation. Return only valid JSON with no markdown.",
    prompt: `Analyze this product website and infer the product positioning.

Return this exact JSON shape:
{
  "productName": "string",
  "category": "string",
  "targetAudience": "string",
  "painPoint": "string",
  "mainBenefit": "string",
  "tone": "string",
  "cta": "string",
  "sourceUrl": "${pageFacts.url}"
}

Website facts:
${JSON.stringify(pageFacts, null, 2)}`,
    maxTokens: 900
  });

  if (!json) {
    return null;
  }

  const parsed = ProductBriefSchema.safeParse({
    ...json,
    sourceUrl: pageFacts.url
  });

  return parsed.success ? parsed.data : null;
}

function createFallbackProductBrief(pageFacts) {
  const productName =
    stripTitle(pageFacts.ogTitle) ||
    stripTitle(pageFacts.title) ||
    titleFromDomain(pageFacts.domain);
  const combinedText = [
    pageFacts.title,
    pageFacts.metaDescription,
    pageFacts.ogDescription,
    pageFacts.headings.join(" "),
    pageFacts.visibleText
  ]
    .join(" ")
    .toLowerCase();

  return {
    productName,
    category: inferCategory(combinedText),
    targetAudience: inferAudience(combinedText),
    painPoint: inferPainPoint(combinedText),
    mainBenefit:
      pageFacts.metaDescription ||
      pageFacts.ogDescription ||
      firstMeaningfulHeading(pageFacts) ||
      "helps customers get the outcome they want faster",
    tone: "clear, helpful, modern",
    cta: inferCta(pageFacts.ctas),
    sourceUrl: pageFacts.url
  };
}

function stripTitle(title) {
  return title.split(/[|–-]/)[0]?.trim() || "";
}

function titleFromDomain(domain) {
  return domain
    .split(".")[0]
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function firstMeaningfulHeading(pageFacts) {
  return pageFacts.headings.find((heading) => heading.length > 8) || "";
}

function inferCategory(text) {
  if (text.includes("calorie") || text.includes("fitness") || text.includes("workout")) {
    return "health and fitness product";
  }

  if (text.includes("skin") || text.includes("beauty") || text.includes("serum")) {
    return "beauty and skincare product";
  }

  if (text.includes("invoice") || text.includes("crm") || text.includes("workflow")) {
    return "SaaS productivity tool";
  }

  if (text.includes("course") || text.includes("learn") || text.includes("lesson")) {
    return "education product";
  }

  if (text.includes("travel") || text.includes("hotel") || text.includes("flight")) {
    return "travel product";
  }

  return "consumer product or service";
}

function inferAudience(text) {
  if (text.includes("founder") || text.includes("team")) {
    return "busy teams and founders";
  }

  if (text.includes("creator") || text.includes("influencer")) {
    return "creators";
  }

  if (text.includes("parent") || text.includes("family")) {
    return "families";
  }

  if (text.includes("student") || text.includes("college")) {
    return "students";
  }

  return "people who want a faster, easier solution";
}

function inferPainPoint(text) {
  if (text.includes("manual") || text.includes("spreadsheet")) {
    return "doing the work manually takes too much time";
  }

  if (text.includes("track") || text.includes("tracking")) {
    return "tracking progress is annoying and easy to skip";
  }

  if (text.includes("save time") || text.includes("faster")) {
    return "the current way is slow";
  }

  return "the old way feels harder than it should";
}

function inferCta(ctas) {
  const preferred = ctas.find((cta) =>
    /start|try|get|book|sign|download|join|shop/i.test(cta)
  );

  return preferred || ctas[0] || "Try it now";
}
