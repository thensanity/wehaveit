const { identify, label } = require("./platforms.js");

function assert(cond, msg) {
  if (!cond) throw new Error(msg);
}

const cases = [
  ["https://shopee.sg/Anker-Cable-i.111.222", "shopee", "111.222"],
  ["https://shopee.sg/product/111/222", "shopee", "111.222"],
  ["https://www.lazada.sg/products/anker-cable-i12345-s678.html", "lazada", "12345-s678"],
  ["https://www.amazon.sg/dp/B0ABCDEF12", "amazon", "B0ABCDEF12"],
  ["https://www.amazon.com/gp/product/B0ABCDEF12", "amazon", "B0ABCDEF12"],
  ["https://www.ebay.com/itm/123456789012", "ebay", "123456789012"],
  ["https://www.etsy.com/listing/123456789/cute-cable", "etsy", "123456789"],
  ["https://www.aliexpress.com/item/100500123.html", "aliexpress", "100500123"],
  ["https://www.shein.com/foo-p-998877.html", "shein", "998877"],
  ["https://www.temu.com/anker-cable-g-555666.html", "temu", "555666"],
  ["https://www.walmart.com/ip/Anker-Cable/123456789", "walmart", "123456789"],
  ["https://www.target.com/p/cable/-/A-12345678", "target", "12345678"],
  ["https://www.bestbuy.com/site/anker-cable/6501234.p", "bestbuy", "6501234"],
  ["https://www.fairprice.com.sg/product/anker-usb-c-13001234", "fairprice", "13001234"],
  ["https://www.carousell.sg/p/anker-cable-123456789", "carousell", "123456789"],
  ["https://www.qoo10.sg/g/123456", "qoo10", "123456"],
  ["https://www.uniqlo.com/sg/en/products/E123456-000", "uniqlo", "E123456-000"],
  ["https://www.ikea.com/sg/en/p/name-90312345/", "ikea", "90312345"],
  ["https://www.sephora.sg/products/foo-P123456", "sephora", "P123456"],
  ["https://www.iherb.com/pr/vitamin-d/12345", "iherb", "12345"],
  ["https://www.asos.com/prd/12345678", "asos", "12345678"],
  ["https://item.taobao.com/item.htm?id=987654", "taobao", "987654"],
  ["https://item.jd.com/100012345.html", "jd", "100012345"],
  ["https://www.tokopedia.com/myshop/anker-cable", "tokopedia", "myshop/anker-cable"],
  ["https://allbirds.com/products/wool-runner?variant=111", "allbirds.com", "wool-runner:111"],
  ["https://www.google.com/search?q=cable", null, null],
];

for (const [url, platform, id] of cases) {
  const found = identify(url);
  if (!platform) {
    assert(!found, `should skip ${url}`);
    continue;
  }
  assert(found, `should detect ${url}`);
  assert(found.platform === platform, `${url} platform ${found.platform} != ${platform}`);
  assert(found.productId === id, `${url} id ${found.productId} != ${id}`);
}

assert(label("shopee") === "Shopee", "label shopee");
assert(label("allbirds.com") === "allbirds.com", "label host");
assert(!identify("https://www.amazon.sg/cart"), "skip cart");

console.log("platform tests passed");
