(() => {
  const codeEl = document.getElementById("licenseCode");
  const statusEl = document.getElementById("status");
  const copyBtn = document.getElementById("copyLicense");

  function txnFromPage() {
    const params = new URLSearchParams(window.location.search);
    const fromQuery = (params.get("_ptxn") || params.get("txn") || "").trim();
    if (fromQuery) return fromQuery;
    const hash = window.location.hash.replace(/^#/, "");
    if (!hash) return "";
    return new URLSearchParams(hash).get("_ptxn") || "";
  }

  const txn = txnFromPage();
  if (txn) {
    codeEl.textContent = txn;
  } else {
    codeEl.textContent = "No transaction id in this link. Open the receipt email from Paddle and paste the transaction id (it starts with txn_) in the extension.";
    copyBtn.disabled = true;
  }

  window.addEventListener("wehaveit-pro", () => {
    statusEl.textContent = "Pro is unlocked in WeHaveIt on this Chrome profile. You can save more than 50 items now.";
  });

  setTimeout(() => {
    if (document.documentElement.getAttribute("data-whi-pro") === "on") {
      statusEl.textContent = "Pro is unlocked in WeHaveIt on this Chrome profile. You can save more than 50 items now.";
    }
  }, 400);

  copyBtn.addEventListener("click", async () => {
    if (!txn) return;
    try {
      await navigator.clipboard.writeText(txn);
      copyBtn.textContent = "Copied";
    } catch {
      copyBtn.textContent = "Copy failed";
    }
  });
})();
