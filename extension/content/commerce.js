(() => {
  if (window.top !== window) return;

  let lastHref = "";
  let hideForKey = "";
  let timer = 0;
  let attempts = 0;

  function keyFor(product) {
    if (!product) return "";
    return `${product.platform}:${product.productId || product.url}`;
  }

  async function paint() {
    const product = WHI.platforms.extract(location.href, document);
    const key = keyFor(product);

    if (!product) {
      WHI.overlay.unmount();
      return;
    }

    if (hideForKey && hideForKey === key) return;

    const { items, settings } = await WHI.storage.getState();
    WHI.overlay.render({
      product,
      match: WHI.match.findMatches(product, items),
      itemCount: items.length,
      limit: WHI.FREE_LIMIT,
      pro: Boolean(settings.pro),
      onHide: () => {
        hideForKey = key;
        WHI.overlay.unmount();
      },
      onSave: async (current) => {
        try {
          await WHI.storage.addItem(current);
          hideForKey = "";
          await paint();
        } catch (err) {
          WHI.overlay.render({
            product: current,
            match: WHI.match.findMatches(current, items),
            itemCount: items.length,
            limit: WHI.FREE_LIMIT,
            pro: Boolean(settings.pro),
            error: err.code === "FREE_LIMIT" ? "Free list is full (50)." : "Could not save this item.",
            onHide: () => {
              hideForKey = keyFor(current);
              WHI.overlay.unmount();
            },
            onSave: () => {},
          });
        }
      },
    });
  }

  function schedule() {
    clearTimeout(timer);
    timer = setTimeout(() => {
      paint();
    }, 180);
  }

  function looksLikeShopPage() {
    try {
      if (WHI.platforms.identify(location.href)) return true;
      return /\/(dp|gp\/product|itm|listing|products|product|prd|ip|item|p\/)/i.test(location.pathname);
    } catch {
      return false;
    }
  }

  function onNavigate() {
    if (location.href === lastHref) return;
    lastHref = location.href;
    hideForKey = "";
    attempts = 0;
    schedule();
    if (!looksLikeShopPage()) return;
    const retry = () => {
      attempts += 1;
      paint();
      if (attempts < 8) setTimeout(retry, 700);
    };
    setTimeout(retry, 700);
  }

  const push = history.pushState;
  history.pushState = function () {
    const ret = push.apply(this, arguments);
    onNavigate();
    return ret;
  };
  const replace = history.replaceState;
  history.replaceState = function () {
    const ret = replace.apply(this, arguments);
    onNavigate();
    return ret;
  };
  window.addEventListener("popstate", onNavigate);

  chrome.storage.onChanged.addListener(() => {
    hideForKey = "";
    schedule();
  });

  setInterval(() => {
    if (location.href !== lastHref) onNavigate();
  }, 800);

  lastHref = location.href;
  schedule();
  setTimeout(paint, 900);
})();
