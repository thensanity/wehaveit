const match = require("./match.js");

function assert(cond, msg) {
  if (!cond) throw new Error(msg);
}

const items = [
  {
    platform: "shopee",
    productId: "111.222",
    title: "Anker USB-C Cable 2m",
  },
];

const exact = match.findMatches(
  { platform: "shopee", productId: "111.222", title: "Anker USB-C Cable 2m" },
  items
);
assert(exact.level === "exact", "same Shopee id should be exact");

const likely = match.findMatches(
  {
    platform: "lazada",
    productId: "999",
    title: "Anker USB C Cable 2 meter braided",
  },
  items
);
assert(likely.level === "likely", "cross-shop similar title should be likely");

const different = match.findMatches(
  { platform: "shopee", productId: "333.444", title: "5L Digital Air Fryer" },
  items
);
assert(different.level === "none", "unrelated product should not match");

const lengthMismatch = match.findMatches(
  { platform: "amazon", productId: "B0CABLE3M0", title: "Anker USB-C Cable 3m" },
  items
);
assert(lengthMismatch.level === "none", "2m should not match 3m");

console.log("match tests passed");
