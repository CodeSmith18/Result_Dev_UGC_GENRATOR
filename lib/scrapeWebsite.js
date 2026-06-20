import * as cheerio from "cheerio";

const maxTextLength = 6500;

export async function scrapeWebsite(url) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; UGCStudioBot/1.0; +https://localhost)"
      }
    });

    if (!response.ok) {
      throw new Error(`Could not fetch website. Status: ${response.status}`);
    }

    const html = await response.text();
    return extractPageFacts(url, html);
  } finally {
    clearTimeout(timeout);
  }
}

function extractPageFacts(url, html) {
  const $ = cheerio.load(html);

  $("script, style, noscript, svg").remove();

  const title = cleanText($("title").first().text());
  const metaDescription = readMeta($, "description");
  const ogTitle = readMeta($, "og:title");
  const ogDescription = readMeta($, "og:description");
  const ogImage = readMeta($, "og:image");

  const headings = $("h1, h2")
    .map((_, element) => cleanText($(element).text()))
    .get()
    .filter(Boolean)
    .slice(0, 14);

  const ctas = $("button, a")
    .map((_, element) => cleanText($(element).text()))
    .get()
    .filter((text) => text.length >= 2 && text.length <= 48)
    .filter((text, index, items) => items.indexOf(text) === index)
    .slice(0, 18);

  const visibleText = cleanText($("body").text()).slice(0, maxTextLength);

  return {
    url,
    domain: new URL(url).hostname.replace(/^www\./, ""),
    title,
    metaDescription,
    ogTitle,
    ogDescription,
    ogImage: normalizeAssetUrl(url, ogImage),
    headings,
    ctas,
    visibleText
  };
}

function readMeta($, name) {
  return cleanText(
    $(`meta[name="${name}"]`).attr("content") ||
      $(`meta[property="${name}"]`).attr("content") ||
      ""
  );
}

function normalizeAssetUrl(baseUrl, assetUrl) {
  if (!assetUrl) {
    return "";
  }

  try {
    return new URL(assetUrl, baseUrl).toString();
  } catch (error) {
    return "";
  }
}

function cleanText(value) {
  return value.replace(/\s+/g, " ").trim();
}
