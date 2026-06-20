const maxHistoryItems = 24;

export function normalizeAssetHistory(history = {}) {
  return {
    gifUrls: normalizeList(history.gifUrls),
    backgroundUrls: normalizeList(history.backgroundUrls),
    gifQueries: normalizeList(history.gifQueries),
    backgroundQueries: normalizeList(history.backgroundQueries)
  };
}

export function updateAssetHistory(history, assets = {}) {
  const current = normalizeAssetHistory(history);

  return {
    gifUrls: appendUnique(current.gifUrls, assets.gif?.url),
    backgroundUrls: appendUnique(current.backgroundUrls, assets.background?.url),
    gifQueries: appendUnique(current.gifQueries, assets.gif?.query),
    backgroundQueries: appendUnique(current.backgroundQueries, assets.background?.query)
  };
}

function normalizeList(value) {
  return Array.isArray(value) ? value.filter(Boolean).slice(-maxHistoryItems) : [];
}

function appendUnique(items, value) {
  if (!value) {
    return items;
  }

  return [...items.filter((item) => item !== value), value].slice(-maxHistoryItems);
}
