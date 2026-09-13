(function (root) {
  const WHI = root.WHI || {};
  const HOST_ID = "wehaveit-root";

  const CSS = `
    :host { all: initial; }
    * { box-sizing: border-box; font-family: "Segoe UI", "PingFang SC", "Noto Sans", sans-serif; }
    .bar {
      position: fixed;
      top: 14px;
      left: 50%;
      transform: translateX(-50%);
      z-index: 2147483646;
      width: min(560px, calc(100vw - 24px));
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 10px 12px 10px 14px;
      flex-wrap: wrap;
      background: #f7f1e3;
      color: #17352b;
      border: 1px solid #1f4a3a;
      border-radius: 16px;
      box-shadow: 0 18px 40px rgba(23, 53, 43, 0.18);
      pointer-events: auto;
    }
    .bar.hit { background: #e7f3c9; }
    .bar.likely { background: #fbe7c6; }
    .stamp {
      flex: 0 0 auto;
      width: 42px;
      height: 42px;
      border-radius: 12px;
      background: #1f4a3a;
      color: #f4e6c3;
      display: grid;
      place-items: center;
      font-size: 11px;
      font-weight: 800;
      letter-spacing: 0.04em;
      text-transform: uppercase;
      line-height: 1.05;
      text-align: center;
      padding: 4px;
    }
    .body { flex: 1 1 auto; min-width: 0; }
    .status {
      font-size: 14px;
      font-weight: 750;
      letter-spacing: -0.02em;
    }
    .detail {
      margin-top: 2px;
      font-size: 12px;
      color: #3e5c50;
      white-space: normal;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .actions { display: flex; gap: 8px; flex: 0 0 auto; }
    button {
      appearance: none;
      border: 0;
      cursor: pointer;
      border-radius: 999px;
      padding: 8px 12px;
      font-size: 12px;
      font-weight: 700;
      pointer-events: auto;
    }
    .primary { background: #1f4a3a; color: #f7f1e3; }
    .primary:hover { background: #16382c; }
    .ghost { background: transparent; color: #17352b; border: 1px solid #1f4a3a; }
    .ghost:disabled, .primary:disabled { opacity: 0.55; cursor: default; }
    .msg { font-size: 11px; color: #8a3b16; margin-top: 3px; }
  `;

  function host() {
    return document.getElementById(HOST_ID);
  }

  function formatDate(iso) {
    if (!iso) return "";
    try {
      return new Intl.DateTimeFormat("en-SG", {
        day: "numeric",
        month: "short",
        year: "numeric",
      }).format(new Date(iso));
    } catch {
      return iso.slice(0, 10);
    }
  }

  function shopLabel(platform) {
    if (WHI.platforms && typeof WHI.platforms.label === "function") {
      return WHI.platforms.label(platform);
    }
    return platform || "Saved";
  }

  function mount() {
    let el = host();
    if (el) return el;
    el = document.createElement("div");
    el.id = HOST_ID;
    el.style.cssText = "position:fixed;inset:0 auto auto 0;width:0;height:0;z-index:2147483646;overflow:visible;pointer-events:none;";
    document.documentElement.appendChild(el);
    const shadow = el.attachShadow({ mode: "open" });
    const style = document.createElement("style");
    style.textContent = CSS;
    shadow.appendChild(style);
    const wrap = document.createElement("div");
    wrap.className = "wrap";
    shadow.appendChild(wrap);
    return el;
  }

  function unmount() {
    host()?.remove();
  }

  function render(view) {
    if (!view || !view.product) {
      unmount();
      return;
    }
    const el = mount();
    const wrap = el.shadowRoot.querySelector(".wrap");
    const match = view.match || { level: "none", items: [] };
    const hit = match.items[0];
    const atLimit = !view.pro && view.itemCount >= (view.limit || 50);

    let status = "Not on your list yet";
        let detail = "Save it after you buy.";
    let klass = "bar";
    if (match.level === "exact") {
      klass += " hit";
      status = "Already in your home";
      detail = [
        shopLabel(hit.platform),
        formatDate(hit.boughtAt),
        [hit.currency, hit.price].filter(Boolean).join(" "),
      ]
        .filter(Boolean)
        .join(" · ");
    } else if (match.level === "likely") {
      klass += " likely";
      status = "Looks like you already have this";
      detail = hit.title;
    }

    const showPro = atLimit && match.level === "none";
    wrap.innerHTML = `
      <div class="${klass}">
        <div class="stamp">${match.level === "none" ? "New" : "Have it"}</div>
        <div class="body">
          <div class="status">${status}</div>
          <div class="detail">${detail}</div>
          ${showPro ? '<div class="msg">Free list is full (50). Pro unlocks unlimited.</div>' : ""}
          ${view.error ? `<div class="msg">${view.error}</div>` : ""}
        </div>
        <div class="actions">
          <button class="ghost" type="button" data-whi="hide">Hide</button>
          ${
            showPro
              ? '<button class="primary" type="button" data-whi="pro">Get Pro</button>'
              : `<button class="primary" type="button" data-whi="save">${
                  match.level === "none" ? "We have this" : "Bought another"
                }</button>`
          }
        </div>
      </div>
    `;

    wrap.querySelector('[data-whi="hide"]')?.addEventListener("click", () => {
      if (typeof view.onHide === "function") view.onHide();
      else unmount();
    });
    wrap.querySelector('[data-whi="save"]')?.addEventListener("click", () => {
      if (typeof view.onSave === "function") view.onSave(view.product);
    });
    wrap.querySelector('[data-whi="pro"]')?.addEventListener("click", () => {
      window.open("https://thensanity.github.io/wehaveit/website/index.html#pricing", "_blank", "noopener");
    });
  }

  WHI.overlay = { mount, unmount, render, HOST_ID };
  root.WHI = WHI;
})(typeof globalThis !== "undefined" ? globalThis : window);
