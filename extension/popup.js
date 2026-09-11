const listEl = document.getElementById("list");
const countEl = document.getElementById("count");
const queryEl = document.getElementById("query");
const flashEl = document.getElementById("flash");
const nameEl = document.getElementById("personName");
const saveBtn = document.getElementById("saveCurrent");
const siteLink = document.getElementById("siteLink");

function shopLabel(platform) {
  if (WHI.platforms && typeof WHI.platforms.label === "function") {
    return WHI.platforms.label(platform);
  }
  return platform || "Web";
}

function formatDate(iso) {
  try {
    return new Intl.DateTimeFormat("en-SG", { day: "numeric", month: "short" }).format(new Date(iso));
  } catch {
    return "";
  }
}

function showFlash(text) {
  flashEl.hidden = !text;
  flashEl.textContent = text || "";
}

async function currentTab() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  return tab;
}

async function originPattern(tab) {
  if (!tab?.url) return "";
  const u = new URL(tab.url);
  if (!/^https?:$/.test(u.protocol)) return "";
  return `${u.origin}/*`;
}

async function ensureTabAccess(tab) {
  const origin = await originPattern(tab);
  if (!origin) {
    throw new Error("Cannot run on this page.");
  }
  try {
    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => true,
    });
    return;
  } catch {
    const granted = await chrome.permissions.request({ origins: [origin] });
    if (!granted) throw new Error("Chrome needs permission for this shop.");
  }
}

async function saveCurrentPage() {
  showFlash("");
  const tab = await currentTab();
  if (!tab?.id) return;
  try {
    await ensureTabAccess(tab);
    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ["lib/platforms.js"],
    });
    const [found] = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => WHI.platforms.fromAnyPage(location.href, document),
    });
    const product = found?.result;
    if (!product) {
      showFlash("This page does not look like a product.");
      return;
    }
    await WHI.storage.addItem(product);
    showFlash("Saved. Next time you see it, WeHaveIt will warn you.");
    await render();
  } catch (err) {
    if (err.code === "FREE_LIMIT") {
      showFlash("Free list is full (50).");
      return;
    }
    showFlash(err.message || "Could not save this page.");
  }
}

function itemRow(item) {
  const li = document.createElement("li");
  const img = item.image
    ? `<img src="${item.image}" alt="" />`
    : `<div class="ph">HAVE</div>`;
  li.innerHTML = `
    ${img}
    <div class="meta">
      <p class="title"></p>
      <p class="sub"></p>
    </div>
    <button class="delete" type="button" aria-label="Remove">Remove</button>
  `;
  li.querySelector(".title").textContent = item.title;
  li.querySelector(".sub").textContent = [shopLabel(item.platform), formatDate(item.boughtAt), item.price && `${item.currency} ${item.price}`]
    .filter(Boolean)
    .join(" · ");
  li.querySelector(".delete").addEventListener("click", async () => {
    await WHI.storage.removeItem(item.id);
    await render();
  });
  if (item.url) {
    li.querySelector(".title").style.cursor = "pointer";
    li.querySelector(".title").addEventListener("click", () => chrome.tabs.create({ url: item.url }));
  }
  return li;
}

async function render() {
  const { items, settings } = await WHI.storage.getState();
  const q = queryEl.value.trim().toLowerCase();
  const shown = items.filter((item) => !q || item.title.toLowerCase().includes(q));
  const limit = settings.pro ? "∞" : String(WHI.FREE_LIMIT);
  countEl.textContent = settings.pro
    ? `${items.length} saved · Pro`
    : `${items.length} / ${limit} saved`;
  nameEl.value = settings.personName || "Me";
  listEl.innerHTML = "";
  if (!shown.length) {
    const empty = document.createElement("li");
    empty.className = "empty";
    empty.textContent = items.length
      ? "No matching items."
      : "Nothing saved yet. Open a product page and click We have this.";
    empty.style.display = "block";
    listEl.appendChild(empty);
    return;
  }
  shown.forEach((item) => listEl.appendChild(itemRow(item)));
}

saveBtn.addEventListener("click", saveCurrentPage);
queryEl.addEventListener("input", render);
nameEl.addEventListener("change", async () => {
  await WHI.storage.setSettings({ personName: nameEl.value.trim() || "Me" });
});

siteLink.href = "https://thensanity.github.io/wehaveit/#pricing";

render();
