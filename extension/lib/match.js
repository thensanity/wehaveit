(function (root) {
  const WHI = root.WHI || {};

  const STOP = new Set([
    "the",
    "and",
    "for",
    "with",
    "from",
    "into",
    "your",
    "you",
    "this",
    "that",
    "pcs",
    "pc",
    "pack",
    "set",
    "new",
    "original",
    "official",
    "authentic",
    "ready",
    "stock",
    "free",
    "shipping",
    "sale",
    "hot",
    "best",
    "seller",
    "shopee",
    "lazada",
    "amazon",
    "singapore",
    "sg",
  ]);

  function normalizeTitle(title) {
    return String(title || "")
      .toLowerCase()
      .replace(/\|.*$/, " ")
      .replace(/\b(\d+)\s*(metres?|meters?|m)\b/g, "$1m")
      .replace(/\b(\d+)\s*(litres?|liters?|l)\b/g, "$1l")
      .replace(/[^\p{L}\p{N}\s]/gu, " ")
      .replace(/\s+/g, " ")
      .trim()
      .split(" ")
      .filter((token) => token.length > 1 && !STOP.has(token))
      .join(" ");
  }

  function tokens(text) {
    return new Set(
      normalizeTitle(text)
        .split(" ")
        .filter(Boolean)
    );
  }

  function jaccard(a, b) {
    const A = tokens(a);
    const B = tokens(b);
    if (!A.size || !B.size) return 0;
    let inter = 0;
    A.forEach((token) => {
      if (B.has(token)) inter += 1;
    });
    return inter / (A.size + B.size - inter);
  }

  function numbers(text) {
    return new Set(String(text || "").toLowerCase().match(/\d+[a-z]*|\d+\.\d+/g) || []);
  }

  function numberAgreement(a, b) {
    const A = [...numbers(a)];
    const B = [...numbers(b)];
    if (!A.length || !B.length) return true;
    return A.some((n) =>
      B.some((m) => n === m || n.startsWith(m) || m.startsWith(n))
    );
  }

  function findMatches(product, items) {
    const list = Array.isArray(items) ? items : [];
    if (!product) return { level: "none", items: [] };

    const exact = list.filter((item) => {
      if (!product.productId || !item.productId) return false;
      return item.platform === product.platform && item.productId === product.productId;
    });
    if (exact.length) return { level: "exact", items: exact };

    const title = product.title || "";
    const fuzzy = list.filter((item) => {
      const score = jaccard(title, item.title);
      if (score >= 0.72) return numberAgreement(title, item.title);
      if (score >= 0.58 && numberAgreement(title, item.title)) {
        const shared = [...tokens(title)].filter((t) => tokens(item.title).has(t));
        return shared.length >= 3;
      }
      return false;
    });

    if (fuzzy.length) return { level: "likely", items: fuzzy };
    return { level: "none", items: [] };
  }

  WHI.match = { normalizeTitle, jaccard, findMatches };
  root.WHI = WHI;

  if (typeof module !== "undefined" && module.exports) {
    module.exports = WHI.match;
  }
})(typeof globalThis !== "undefined" ? globalThis : window);
