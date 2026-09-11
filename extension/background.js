importScripts("lib/match.js", "lib/storage.js");

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.removeAll(() => {
    chrome.contextMenus.create({
      id: "wehaveit-save",
      title: "WeHaveIt: I already bought this",
      contexts: ["page", "image", "link"],
    });
  });
});

async function readProductFromTab(tabId) {
  await chrome.scripting.executeScript({
    target: { tabId },
    files: ["lib/platforms.js"],
  });
  const [found] = await chrome.scripting.executeScript({
    target: { tabId },
    func: () => globalThis.WHI && WHI.platforms.fromAnyPage(location.href, document),
  });
  return found?.result || null;
}

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId !== "wehaveit-save" || !tab?.id) return;
  try {
    const product = await readProductFromTab(tab.id);
    if (!product) return;
    await WHI.storage.addItem(product);
    chrome.action.setBadgeBackgroundColor({ color: "#1f4a3a" });
    chrome.action.setBadgeText({ text: "OK", tabId: tab.id });
    setTimeout(() => chrome.action.setBadgeText({ text: "", tabId: tab.id }), 1500);
  } catch (err) {
    if (String(err.message).includes("FREE_LIMIT") || err.code === "FREE_LIMIT") {
      chrome.action.setBadgeBackgroundColor({ color: "#8a3b16" });
      chrome.action.setBadgeText({ text: "MAX", tabId: tab.id });
    }
  }
});
