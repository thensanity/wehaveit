const fs = require("fs");
const path = require("path");
const vm = require("vm");

function assert(cond, msg) {
  if (!cond) throw new Error(msg);
}

const root = {
  WHI: {
    storage: {
      async setSettings(patch) {
        root._patch = patch;
        return patch;
      },
    },
  },
};
root.globalThis = root;
vm.runInNewContext(fs.readFileSync(path.join(__dirname, "license.js"), "utf8"), root);

const { license } = root.WHI;
const txn = "txn_abcdefghijklmnopqrstuvwxyz";
assert(license.isTransactionId(txn), "plain txn id should be valid");
assert(license.isTransactionId("WHI-PRO-" + txn), "prefixed txn should be valid");
assert(
  license.isTransactionId("https://thensanity.github.io/wehaveit/website/success.html?_ptxn=" + txn),
  "success url should be valid"
);
assert(!license.isTransactionId("not-a-license"), "garbage should be rejected");

license.activate(txn).then(() => {
  assert(root._patch.pro === true, "activate should set pro");
  assert(root._patch.paddleTransactionId === txn, "activate should store txn");
  console.log("license tests ok");
});
