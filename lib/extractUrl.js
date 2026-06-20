const urlPattern = /(https?:\/\/[^\s]+|(?:www\.)?[a-z0-9-]+(?:\.[a-z0-9-]+)+(?:\/[^\s]*)?)/i;

export function extractUrl(text) {
  const match = text.match(urlPattern);

  if (!match) {
    return null;
  }

  const rawUrl = match[0].replace(/[),.!?]+$/, "");
  return rawUrl.startsWith("http") ? rawUrl : `https://${rawUrl}`;
}
