(function (root) {
  const WHI = root.WHI || {};
  const FREE_LIMIT = 50;
  const DEFAULT_STATE = {
    items: [],
    settings: {
      pro: false,
      personName: "Me",
      householdName: "",
    },
  };

  function uuid() {
    if (root.crypto && crypto.randomUUID) return crypto.randomUUID();
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === "x" ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }

  function chromeStore() {
    return root.chrome && chrome.storage && chrome.storage.local;
  }

  const MEM_KEY = "wehaveit-state";

  function readFallback() {
    try {
      if (root.localStorage) {
        const raw = localStorage.getItem(MEM_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          return {
            items: Array.isArray(parsed.items) ? parsed.items : [],
            settings: { ...DEFAULT_STATE.settings, ...(parsed.settings || {}) },
          };
        }
      }
    } catch {
      /* ignore */
    }
    root.__WHI_MEM__ = root.__WHI_MEM__ || {
      items: [],
      settings: { ...DEFAULT_STATE.settings },
    };
    return root.__WHI_MEM__;
  }

  function writeFallback(next) {
    root.__WHI_MEM__ = next;
    try {
      if (root.localStorage) localStorage.setItem(MEM_KEY, JSON.stringify(next));
    } catch {
      /* ignore */
    }
    return next;
  }

  async function getState() {
    const store = chromeStore();
    if (!store) return readFallback();
    const data = await chrome.storage.local.get(DEFAULT_STATE);
    return {
      items: Array.isArray(data.items) ? data.items : [],
      settings: { ...DEFAULT_STATE.settings, ...(data.settings || {}) },
    };
  }

  async function setState(next) {
    const store = chromeStore();
    if (!store) return writeFallback(next);
    await chrome.storage.local.set(next);
    return next;
  }

  async function addItem(product, extras = {}) {
    const state = await getState();
    const limit = state.settings.pro ? Infinity : FREE_LIMIT;
    if (state.items.length >= limit) {
      const err = new Error("FREE_LIMIT");
      err.code = "FREE_LIMIT";
      throw err;
    }

    const item = {
      id: uuid(),
      platform: product.platform || "web",
      productId: product.productId || "",
      title: (product.title || "Untitled item").trim(),
      titleNorm: WHI.match ? WHI.match.normalizeTitle(product.title || "") : "",
      price: product.price || "",
      currency: product.currency || "",
      url: product.url || "",
      image: product.image || "",
      boughtAt: extras.boughtAt || new Date().toISOString(),
      quantity: extras.quantity || 1,
      owner: extras.owner || state.settings.personName || "Me",
      note: extras.note || "",
    };

    state.items.unshift(item);
    await setState(state);
    return item;
  }

  async function removeItem(id) {
    const state = await getState();
    state.items = state.items.filter((item) => item.id !== id);
    await setState(state);
    return state;
  }

  async function clearAll() {
    const state = await getState();
    state.items = [];
    await setState(state);
    return state;
  }

  async function setSettings(patch) {
    const state = await getState();
    state.settings = { ...state.settings, ...patch };
    await setState(state);
    return state.settings;
  }

  WHI.FREE_LIMIT = FREE_LIMIT;
  WHI.storage = {
    getState,
    setState,
    addItem,
    removeItem,
    clearAll,
    setSettings,
  };
  root.WHI = WHI;
})(typeof globalThis !== "undefined" ? globalThis : window);
