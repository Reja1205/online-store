/** Parse "Label: value" lines for Top highlights accordion. */
export function parseHighlightRows(text) {
  if (!text || typeof text !== "string") return [];
  return text
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const colon = line.indexOf(":");
      if (colon > 0 && colon < 48) {
        return {
          key: line.slice(0, colon).trim(),
          value: line.slice(colon + 1).trim(),
        };
      }
      return { key: "•", value: line };
    });
}

export function hasDetailSection(text) {
  return Boolean(String(text || "").trim());
}

export function productDetailSections(product) {
  return [
    {
      id: "highlights",
      title: "Top highlights",
      content: product?.detailTopHighlights,
      type: "highlights",
    },
    {
      id: "style",
      title: "Style",
      content: product?.detailStyle,
      type: "text",
    },
    {
      id: "item-details",
      title: "Item details",
      content: product?.detailItemDetails,
      type: "text",
    },
  ].filter((s) => hasDetailSection(s.content));
}
