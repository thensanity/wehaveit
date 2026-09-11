(function (root) {
  const WHI = root.WHI || {};

  const LABELS = {
    shopee: "Shopee",
    lazada: "Lazada",
    amazon: "Amazon",
    ebay: "eBay",
    etsy: "Etsy",
    aliexpress: "AliExpress",
    shein: "SHEIN",
    temu: "Temu",
    walmart: "Walmart",
    target: "Target",
    bestbuy: "Best Buy",
    costco: "Costco",
    homedepot: "Home Depot",
    newegg: "Newegg",
    flipkart: "Flipkart",
    myntra: "Myntra",
    tokopedia: "Tokopedia",
    bukalapak: "Bukalapak",
    blibli: "Blibli",
    qoo10: "Qoo10",
    carousell: "Carousell",
    zalora: "Zalora",
    asos: "ASOS",
    uniqlo: "Uniqlo",
    zara: "Zara",
    hm: "H&M",
    nike: "Nike",
    adidas: "Adidas",
    ikea: "IKEA",
    decathlon: "Decathlon",
    sephora: "Sephora",
    iherb: "iHerb",
    yesstyle: "YesStyle",
    fairprice: "FairPrice",
    watsons: "Watsons",
    guardian: "Guardian",
    coldstorage: "Cold Storage",
    taobao: "Taobao",
    tmall: "Tmall",
    jd: "JD",
    pinduoduo: "Pinduoduo",
    rakuten: "Rakuten",
    mercari: "Mercari",
    shopify: "Shopify",
    demo: "Demo shop",
    web: "Saved",
  };

  const SKIP_HOSTS = [
    "google.com",
    "google.com.sg",
    "googleapis.com",
    "gstatic.com",
    "youtube.com",
    "youtu.be",
    "facebook.com",
    "instagram.com",
    "twitter.com",
    "x.com",
    "reddit.com",
    "github.com",
    "gitlab.com",
    "linkedin.com",
    "whatsapp.com",
    "telegram.org",
    "netflix.com",
    "spotify.com",
    "twitch.tv",
    "discord.com",
    "openai.com",
    "chatgpt.com",
    "bing.com",
    "duckduckgo.com",
    "wikipedia.org",
    "slack.com",
    "zoom.us",
    "microsoft.com",
    "office.com",
    "live.com",
    "outlook.com",
    "notion.so",
    "medium.com",
    "substack.com",
    "nytimes.com",
    "bbc.com",
    "cnn.com",
    "straitstimes.com",
    "channelnewsasia.com",
  ];

  const SKIP_PATH =
    /\/(cart|checkout|bag|basket|login|signin|sign-in|account|search|wishlist|orders?|order-history|help|support|blog|news|collections|category|categories)(\/|$)/i;

  function hostOf(hostname) {
    return String(hostname || "")
      .toLowerCase()
      .replace(/^www\./, "");
  }

  function hostHas(hostname, needles) {
    const h = hostOf(hostname);
    return needles.some((n) => h === n || h.endsWith("." + n) || h.includes(n));
  }

  function isSkippedHost(hostname) {
    const h = hostOf(hostname);
    return SKIP_HOSTS.some((n) => h === n || h.endsWith("." + n));
  }

  function siteKey(u) {
    return hostOf(u.hostname);
  }

  function label(platform) {
    if (LABELS[platform]) return LABELS[platform];
    return String(platform || "Saved").replace(/^www\./, "");
  }

  function meta(doc, key) {
    return (
      doc.querySelector(`meta[property="${key}"]`)?.getAttribute("content") ||
      doc.querySelector(`meta[name="${key}"]`)?.getAttribute("content") ||
      ""
    );
  }

  function firstJsonLdProduct(doc) {
    if (!doc) return null;
    const scripts = [...doc.querySelectorAll('script[type="application/ld+json"]')];
    for (const script of scripts) {
      try {
        const raw = JSON.parse(script.textContent || "null");
        const stack = Array.isArray(raw) ? raw.slice() : [raw];
        while (stack.length) {
          const node = stack.shift();
          if (!node || typeof node !== "object") continue;
          const type = node["@type"];
          const types = Array.isArray(type) ? type : [type];
          if (types.some((t) => String(t).toLowerCase().includes("product"))) return node;
          if (node["@graph"]) stack.push(...node["@graph"]);
        }
      } catch {
        /* ignore */
      }
    }
    return null;
  }

  function cleanTitle(title, hostLabel) {
    let out = String(title || "").replace(/\s+/g, " ").trim();
    if (hostLabel) {
      out = out.replace(new RegExp(`\\s*[\\|\\-–]\\s*${hostLabel}.*$`, "i"), "").trim();
    }
    return out;
  }

  function offerPrice(ld) {
    const offers = ld?.offers;
    const offer = Array.isArray(offers) ? offers[0] : offers;
    if (offer?.price) return { price: String(offer.price), currency: offer.priceCurrency || "" };
    return { price: "", currency: "" };
  }

  function textPrice(doc) {
    const ld = firstJsonLdProduct(doc);
    const fromLd = offerPrice(ld);
    if (fromLd.price) return fromLd;
    const amount = meta(doc, "product:price:amount") || meta(doc, "og:price:amount");
    const currency = meta(doc, "product:price:currency") || meta(doc, "og:price:currency");
    if (amount) return { price: amount, currency };
    return { price: "", currency: "" };
  }

  function h1(doc) {
    return (doc.querySelector("h1")?.textContent || "").replace(/\s+/g, " ").trim();
  }

  function capture(re, text) {
    const m = String(text || "").match(re);
    return m ? m[1] : "";
  }

  const RULES = [
    {
      id: "shopee",
      test: (u) => hostHas(u.hostname, ["shopee.", "xiapibuy.com"]),
      productId: (u) => {
        const a = capture(/-i\.(\d+\.\d+)/, u.pathname);
        if (a) return a;
        const b = capture(/\/product\/(\d+\/\d+)/, u.pathname);
        return b ? b.replace("/", ".") : "";
      },
    },
    {
      id: "lazada",
      test: (u) => hostHas(u.hostname, ["lazada."]),
      productId: (u) => capture(/-i(\d+(?:-s\d+)?)/, u.pathname),
    },
    {
      id: "amazon",
      test: (u) => hostHas(u.hostname, ["amazon.", "amzn."]),
      productId: (u) => capture(/\/(?:dp|gp\/product|gp\/aw\/d)\/([A-Z0-9]{10})/i, u.pathname).toUpperCase(),
    },
    {
      id: "ebay",
      test: (u) => hostHas(u.hostname, ["ebay."]),
      productId: (u) => capture(/\/itm\/(?:[^/]+\/)?(\d{6,})/, u.pathname) || u.searchParams.get("item"),
    },
    {
      id: "etsy",
      test: (u) => hostHas(u.hostname, ["etsy.com"]),
      productId: (u) => capture(/\/listing\/(\d+)/, u.pathname),
    },
    {
      id: "aliexpress",
      test: (u) => hostHas(u.hostname, ["aliexpress."]),
      productId: (u) => capture(/\/(?:item|i)\/(\d+)/, u.pathname),
    },
    {
      id: "shein",
      test: (u) => hostHas(u.hostname, ["shein.", "shein.com"]),
      productId: (u) =>
        capture(/-p-(\d+)/, u.pathname) || u.searchParams.get("goods_id") || u.searchParams.get("id"),
    },
    {
      id: "temu",
      test: (u) => hostHas(u.hostname, ["temu.com"]),
      productId: (u) => capture(/[/-]g-(\d+)/, u.pathname) || u.searchParams.get("goods_id"),
    },
    {
      id: "walmart",
      test: (u) => hostHas(u.hostname, ["walmart."]),
      productId: (u) => capture(/\/ip\/(?:[^/]+\/)?(\d+)/, u.pathname),
    },
    {
      id: "target",
      test: (u) => hostHas(u.hostname, ["target.com"]),
      productId: (u) => capture(/\/A-(\d+)/, u.pathname) || u.searchParams.get("preselect"),
    },
    {
      id: "bestbuy",
      test: (u) => hostHas(u.hostname, ["bestbuy."]),
      productId: (u) => capture(/\/(\d+)\.p/, u.pathname) || u.searchParams.get("skuId"),
    },
    {
      id: "costco",
      test: (u) => hostHas(u.hostname, ["costco."]),
      productId: (u) => capture(/\.product\.(\d+)/, u.pathname) || capture(/\/p\/(\d+)/, u.pathname),
    },
    {
      id: "homedepot",
      test: (u) => hostHas(u.hostname, ["homedepot."]),
      productId: (u) => capture(/\/(\d{5,})$/, u.pathname.replace(/\/$/, "")),
    },
    {
      id: "newegg",
      test: (u) => hostHas(u.hostname, ["newegg."]),
      productId: (u) => capture(/\/p\/([^/?#]+)/i, u.pathname) || u.searchParams.get("Item"),
    },
    {
      id: "flipkart",
      test: (u) => hostHas(u.hostname, ["flipkart.com"]),
      productId: (u) => u.searchParams.get("pid") || capture(/\/p\/([^/?#]+)/, u.pathname),
    },
    {
      id: "myntra",
      test: (u) => hostHas(u.hostname, ["myntra.com"]),
      productId: (u) => capture(/\/(\d+)\/buy/i, u.pathname) || capture(/\/(\d{5,})/, u.pathname),
    },
    {
      id: "tokopedia",
      test: (u) => hostHas(u.hostname, ["tokopedia.com"]),
      productId: (u) => {
        const parts = u.pathname.split("/").filter(Boolean);
        if (parts.length < 2) return "";
        if (/^(search|discovery|cart|login|help|official)/i.test(parts[0])) return "";
        return parts.slice(0, 2).join("/");
      },
    },
    {
      id: "bukalapak",
      test: (u) => hostHas(u.hostname, ["bukalapak.com"]),
      productId: (u) => capture(/\/p\/([^/?#]+)/, u.pathname),
    },
    {
      id: "blibli",
      test: (u) => hostHas(u.hostname, ["blibli.com"]),
      productId: (u) => capture(/\/p\/([^/?#]+)/, u.pathname),
    },
    {
      id: "qoo10",
      test: (u) => hostHas(u.hostname, ["qoo10."]),
      productId: (u) => capture(/\/g\/(\d+)/, u.pathname) || u.searchParams.get("itemid") || u.searchParams.get("gid"),
    },
    {
      id: "carousell",
      test: (u) => hostHas(u.hostname, ["carousell."]),
      productId: (u) => capture(/\/p\/(?:[^/]+-)?(\d+)/, u.pathname) || capture(/\/(\d{5,})/, u.pathname),
    },
    {
      id: "zalora",
      test: (u) => hostHas(u.hostname, ["zalora."]),
      productId: (u) => capture(/-(\d+)\.html/i, u.pathname) || capture(/\/(\d{5,})/, u.pathname),
    },
    {
      id: "asos",
      test: (u) => hostHas(u.hostname, ["asos.com"]),
      productId: (u) => capture(/\/prd\/(\d+)/, u.pathname),
    },
    {
      id: "uniqlo",
      test: (u) => hostHas(u.hostname, ["uniqlo.com"]),
      productId: (u) => capture(/\/products\/([^/?#]+)/i, u.pathname),
    },
    {
      id: "zara",
      test: (u) => hostHas(u.hostname, ["zara.com"]),
      productId: (u) => capture(/-p(\d+)\.html/i, u.pathname) || u.searchParams.get("v1"),
    },
    {
      id: "hm",
      test: (u) => hostHas(u.hostname, ["hm.com"]),
      productId: (u) => capture(/productpage\.(\d+)/i, u.pathname),
    },
    {
      id: "nike",
      test: (u) => hostHas(u.hostname, ["nike.com"]),
      productId: (u) => u.searchParams.get("productId") || capture(/\/t\/[^/]+\/([A-Z0-9-]+)/i, u.pathname) || capture(/\/([A-Z]{2}\d{4}-\d{3})/i, u.pathname),
    },
    {
      id: "adidas",
      test: (u) => hostHas(u.hostname, ["adidas.", "adidas.com"]),
      productId: (u) => capture(/\/([A-Z0-9]{5,12})\.html/i, u.pathname),
    },
    {
      id: "ikea",
      test: (u) => hostHas(u.hostname, ["ikea.com"]),
      productId: (u) => capture(/\/p\/(?:[^/]+-)?(\d{5,})/i, u.pathname) || capture(/-(\d{8})\/?$/, u.pathname),
    },
    {
      id: "decathlon",
      test: (u) => hostHas(u.hostname, ["decathlon."]),
      productId: (u) => capture(/\/(?:p|products)\/(\d+)/i, u.pathname) || capture(/^(\d{5,})/, u.pathname.split("/").pop() || ""),
    },
    {
      id: "sephora",
      test: (u) => hostHas(u.hostname, ["sephora."]),
      productId: (u) => capture(/-(P\d+)/i, u.pathname) || u.searchParams.get("skuId"),
    },
    {
      id: "iherb",
      test: (u) => hostHas(u.hostname, ["iherb.com"]),
      productId: (u) => capture(/\/pr\/(?:[^/]+\/)?(\d+)/i, u.pathname),
    },
    {
      id: "yesstyle",
      test: (u) => hostHas(u.hostname, ["yesstyle.com"]),
      productId: (u) => u.searchParams.get("sn") || u.searchParams.get("itemid") || capture(/\/(\d{5,})/, u.pathname),
    },
    {
      id: "fairprice",
      test: (u) => hostHas(u.hostname, ["fairprice.com.sg", "fairprice.com"]),
      productId: (u) => capture(/\/product\/(?:[^/]+-)?(\d+)/i, u.pathname),
    },
    {
      id: "watsons",
      test: (u) => hostHas(u.hostname, ["watsons."]),
      productId: (u) => capture(/\/p\/([^/?#]+)/i, u.pathname),
    },
    {
      id: "guardian",
      test: (u) => hostHas(u.hostname, ["guardian.com.sg", "guardian.com.my"]),
      productId: (u) => capture(/\/p\/([^/?#]+)/i, u.pathname) || capture(/\/products\/([^/?#]+)/i, u.pathname),
    },
    {
      id: "coldstorage",
      test: (u) => hostHas(u.hostname, ["coldstorage.com.sg", "giant.sg"]),
      productId: (u) => capture(/\/product\/(?:[^/]+-)?(\d+)/i, u.pathname) || capture(/\/p\/([^/?#]+)/i, u.pathname),
    },
    {
      id: "taobao",
      test: (u) => hostHas(u.hostname, ["taobao.com"]),
      productId: (u) => u.searchParams.get("id"),
    },
    {
      id: "tmall",
      test: (u) => hostHas(u.hostname, ["tmall.com"]),
      productId: (u) => u.searchParams.get("id"),
    },
    {
      id: "jd",
      test: (u) => hostHas(u.hostname, ["jd.com", "jd.hk"]),
      productId: (u) => capture(/\/(\d+)\.html/, u.pathname),
    },
    {
      id: "pinduoduo",
      test: (u) => hostHas(u.hostname, ["pinduoduo.com", "yangkeduo.com"]),
      productId: (u) => u.searchParams.get("goods_id"),
    },
    {
      id: "rakuten",
      test: (u) => hostHas(u.hostname, ["rakuten."]),
      productId: (u) => capture(/\/(\d{5,})/, u.pathname) || u.searchParams.get("item_id"),
    },
    {
      id: "mercari",
      test: (u) => hostHas(u.hostname, ["mercari.com"]),
      productId: (u) => capture(/\/(?:item|us\/item)\/(m?\d+)/i, u.pathname),
    },
  ];

  function genericUrlId(u) {
    const path = u.pathname;
    const handle = capture(/\/products\/([^/?#]+)/i, path);
    if (handle) {
      const variant = u.searchParams.get("variant") || "";
      return { platform: siteKey(u), productId: variant ? `${handle}:${variant}` : handle };
    }
    const woo = capture(/\/product\/([^/?#]+)/i, path);
    if (woo) return { platform: siteKey(u), productId: woo };
    const prd = capture(/\/(?:dp|itm|listing|prd|ip|item|sku)\/([^/?#]+)/i, path);
    if (prd) return { platform: siteKey(u), productId: prd };
    const queryId =
      u.searchParams.get("product_id") ||
      u.searchParams.get("productId") ||
      u.searchParams.get("sku") ||
      u.searchParams.get("goods_id");
    if (queryId) return { platform: siteKey(u), productId: queryId };
    return null;
  }

  function identify(url) {
    try {
      const u = new URL(url);
      if (isSkippedHost(u.hostname)) return null;
      if (u.pathname.endsWith("/demo.html") || u.searchParams.has("whi")) {
        return { platform: "demo", productId: u.searchParams.get("id") || "demo-1" };
      }
      for (const rule of RULES) {
        if (!rule.test(u)) continue;
        const id = rule.productId(u);
        if (id) return { platform: rule.id, productId: String(id) };
      }
      if (SKIP_PATH.test(u.pathname)) return null;
      return genericUrlId(u);
    } catch {
      return null;
    }
  }

  function isShopify(doc) {
    if (!doc || !doc.querySelector) return false;
    return Boolean(
      doc.querySelector(
        'meta[name="shopify-checkout-api-token"], script#shopify-features, link[href*="cdn.shopify.com"]'
      )
    );
  }

  function isProductDocument(doc, u) {
    const ogType = (meta(doc, "og:type") || "").toLowerCase();
    if (ogType.includes("product")) return true;
    if (firstJsonLdProduct(doc)) return true;
    if (doc.querySelector('[itemtype*="schema.org/Product"]')) return true;
    if (isShopify(doc) && /\/products\//i.test(u.pathname)) return true;
    return false;
  }

  function hydrate(identity, url, doc) {
    const price = textPrice(doc);
    const ld = firstJsonLdProduct(doc);
    const title = cleanTitle(
      h1(doc) || ld?.name || meta(doc, "og:title") || (doc && doc.title) || "",
      label(identity.platform)
    );
    const sku = ld?.sku || ld?.productID || ld?.gtin13 || ld?.gtin || "";
    return {
      platform: identity.platform,
      productId: identity.productId || sku || url,
      title,
      url,
      image: meta(doc, "og:image") || ld?.image || "",
      price: price.price,
      currency: price.currency,
    };
  }

  function detectDemo(url, doc) {
    try {
      const u = new URL(url);
      const isDemo =
        u.pathname.endsWith("/demo.html") ||
        u.searchParams.has("whi") ||
        doc?.documentElement?.dataset?.whiDemo === "1" ||
        doc?.body?.dataset?.whiDemo === "1";
      if (!isDemo) return null;
      return {
        platform: "demo",
        productId: u.searchParams.get("id") || doc.body?.dataset?.whiId || "demo-1",
      };
    } catch {
      return null;
    }
  }

  function extract(url, doc) {
    if (!url || !doc) return null;
    const demo = detectDemo(url, doc);
    if (demo) {
      return {
        platform: "demo",
        productId: demo.productId,
        title: h1(doc) || meta(doc, "og:title") || doc.title,
        url,
        image: meta(doc, "og:image") || doc.querySelector("img")?.src || "",
        price: doc.body?.dataset?.whiPrice || "",
        currency: doc.body?.dataset?.whiCurrency || "SGD",
      };
    }

    let identity = identify(url);
    if (!identity) {
      try {
        const u = new URL(url);
        if (isSkippedHost(u.hostname) || SKIP_PATH.test(u.pathname)) return null;
        if (!isProductDocument(doc, u)) return null;
        const ld = firstJsonLdProduct(doc);
        const sku = ld?.sku || ld?.productID || capture(/\/products\/([^/?#]+)/i, u.pathname);
        if (!sku && !ld) return null;
        identity = { platform: siteKey(u), productId: String(sku || u.pathname) };
      } catch {
        return null;
      }
    }
    return hydrate(identity, url, doc);
  }

  function fromAnyPage(url, doc) {
    const known = extract(url, doc);
    if (known) return known;
    const title = cleanTitle(meta(doc, "og:title") || h1(doc) || doc.title, "");
    if (!title) return null;
    const price = textPrice(doc);
    let platform = "web";
    try {
      platform = siteKey(new URL(url));
    } catch {
      /* keep web */
    }
    return {
      platform,
      productId: url,
      title,
      url,
      image: meta(doc, "og:image"),
      price: price.price,
      currency: price.currency,
    };
  }

  WHI.platforms = {
    extract,
    fromAnyPage,
    identify,
    label,
    RULES,
  };
  root.WHI = WHI;

  if (typeof module !== "undefined" && module.exports) {
    module.exports = WHI.platforms;
  }
})(typeof globalThis !== "undefined" ? globalThis : window);
