const CATALOG = {
  "anker-usbc-2m": {
    title: "Anker USB-C Cable 2m",
    price: "12.90",
    currency: "SGD",
    blurb: "A boring cable you will buy twice unless something stops you.",
    photoClass: "usb",
  },
  "air-fryer-5l": {
    title: "5L Digital Air Fryer",
    price: "89.00",
    currency: "SGD",
    blurb: "The classic household duplicate. Someone already ordered one last month.",
    photoClass: "fryer",
  },
};

function productId() {
  return new URL(location.href).searchParams.get("id") || "anker-usbc-2m";
}

function paintPage() {
  const id = productId();
  const item = CATALOG[id] || CATALOG["anker-usbc-2m"];
  document.body.dataset.whiDemo = "1";
  document.body.dataset.whiId = id;
  document.body.dataset.whiPrice = item.price;
  document.body.dataset.whiCurrency = item.currency;
  document.getElementById("title").textContent = item.title;
  document.getElementById("price").textContent = `${item.currency} ${item.price}`;
  document.getElementById("blurb").textContent = item.blurb;
  const photo = document.getElementById("photo");
  photo.classList.remove("usb", "fryer");
  photo.classList.add(item.photoClass);
  document.title = `${item.title} · Demo shop`;
}

async function seedOwnedCable() {
  const { items } = await WHI.storage.getState();
  const hasCable = items.some((item) => item.productId === "anker-usbc-2m");
  if (hasCable) return;
  await WHI.storage.addItem({
    platform: "demo",
    productId: "anker-usbc-2m",
    title: "Anker USB-C Cable 2m",
    price: "12.90",
    currency: "SGD",
    url: `${location.origin}${location.pathname}?id=anker-usbc-2m`,
    image: "",
  });
}

async function paintOverlay() {
  const product = WHI.platforms.extract(location.href, document);
  const { items, settings } = await WHI.storage.getState();
  WHI.overlay.render({
    product,
    match: WHI.match.findMatches(product, items),
    itemCount: items.length,
    limit: WHI.FREE_LIMIT,
    pro: Boolean(settings.pro),
    onHide: () => WHI.overlay.unmount(),
    onSave: async (current) => {
      try {
        await WHI.storage.addItem(current);
        await paintOverlay();
      } catch (err) {
        WHI.overlay.render({
          product: current,
          match: WHI.match.findMatches(current, items),
          itemCount: items.length,
          limit: WHI.FREE_LIMIT,
          pro: Boolean(settings.pro),
          error: err.code === "FREE_LIMIT" ? "Free list is full (50)." : "Could not save this item.",
          onHide: () => WHI.overlay.unmount(),
          onSave: () => {},
        });
      }
    },
  });
}

(async function init() {
  paintPage();
  await seedOwnedCable();
  await paintOverlay();
})();
