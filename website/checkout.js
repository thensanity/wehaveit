(() => {
  const buyBtn = document.getElementById("buyPro");
  const noteEl = document.getElementById("checkoutNote");
  let started = false;

  function config() {
    return window.WEHAVEIT_PADDLE || {};
  }

  function configured() {
    const cfg = config();
    return Boolean(cfg.clientToken && cfg.priceId);
  }

  function successUrl() {
    return new URL("success.html", window.location.href).href;
  }

  function setNote(text, isError) {
    if (!noteEl) return;
    noteEl.textContent = text;
    noteEl.classList.toggle("error", Boolean(isError));
  }

  function transactionIdFromEvent(event) {
    const data = event && event.data;
    if (!data) return "";
    if (typeof data.transaction_id === "string") return data.transaction_id;
    if (data.transaction && typeof data.transaction.id === "string") return data.transaction.id;
    if (typeof data.id === "string" && data.id.startsWith("txn_")) return data.id;
    return "";
  }

  function goToSuccess(txn) {
    const url = new URL("success.html", window.location.href);
    if (txn) url.searchParams.set("_ptxn", txn);
    window.location.assign(url.href);
  }

  function startPaddle() {
    if (started) return true;
    if (typeof window.Paddle === "undefined") {
      setNote("Paddle checkout failed to load. Refresh and try again.", true);
      return false;
    }
    const cfg = config();
    if (cfg.environment !== "live" && typeof window.Paddle.Environment?.set === "function") {
      window.Paddle.Environment.set("sandbox");
    }
    window.Paddle.Initialize({
      token: cfg.clientToken,
      checkout: {
        settings: {
          displayMode: "overlay",
          theme: "light",
          locale: "en",
          successUrl: successUrl(),
        },
      },
      eventCallback: (event) => {
        if (!event || event.name !== "checkout.completed") return;
        goToSuccess(transactionIdFromEvent(event));
      },
    });
    started = true;
    return true;
  }

  function openCheckout() {
    if (!configured()) {
      setNote(
        "Checkout is not connected yet. Add your Paddle client-side token and price ID in website/paddle-config.js, then publish the site.",
        true
      );
      return;
    }
    if (!startPaddle()) return;
    setNote("Paid with Paddle. After checkout, Pro unlocks in the extension on this browser.");
    window.Paddle.Checkout.open({
      items: [{ priceId: config().priceId, quantity: 1 }],
      settings: {
        displayMode: "overlay",
        successUrl: successUrl(),
      },
    });
  }

  if (!buyBtn) return;

  if (!configured()) {
    setNote(
      "Paddle catalog is ready to connect. Checkout opens here after clientToken and priceId are set in paddle-config.js."
    );
  }

  buyBtn.addEventListener("click", openCheckout);
})();
