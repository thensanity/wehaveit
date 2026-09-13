(function (root) {
  const WHI = root.WHI || {};
  const TXN_RE = /^txn_[a-z0-9]{26}$/i;

  function fromUrlOrText(raw) {
    const text = String(raw || "").trim();
    if (!text) return "";
    const stripped = text.replace(/^WHI-PRO-/i, "").trim();
    const embedded = stripped.match(/txn_[a-z0-9]{26}/i);
    if (embedded) return embedded[0];
    try {
      if (/^https?:\/\//i.test(stripped) || stripped.includes("_ptxn=")) {
        const url = new URL(stripped, "https://thensanity.github.io");
        const id = url.searchParams.get("_ptxn") || url.searchParams.get("txn");
        if (id) return id.trim();
      }
    } catch {
      /* ignore */
    }
    return stripped;
  }

  function isTransactionId(raw) {
    return TXN_RE.test(fromUrlOrText(raw));
  }

  async function activate(raw) {
    const id = fromUrlOrText(raw);
    if (!TXN_RE.test(id)) {
      const err = new Error("INVALID_LICENSE");
      err.code = "INVALID_LICENSE";
      throw err;
    }
    await WHI.storage.setSettings({
      pro: true,
      paddleTransactionId: id,
      proActivatedAt: new Date().toISOString(),
    });
    return id;
  }

  WHI.license = { fromUrlOrText, isTransactionId, activate };
  root.WHI = WHI;
})(typeof globalThis !== "undefined" ? globalThis : window);
