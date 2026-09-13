(() => {
  if (window.top !== window) return;
  const params = new URLSearchParams(location.search);
  const hash = new URLSearchParams(location.hash.replace(/^#/, ""));
  const raw = params.get("_ptxn") || params.get("txn") || hash.get("_ptxn") || "";
  if (!raw || !WHI.license) return;

  WHI.license
    .activate(raw)
    .then(() => {
      document.documentElement.setAttribute("data-whi-pro", "on");
      window.dispatchEvent(new CustomEvent("wehaveit-pro", { detail: { ok: true } }));
    })
    .catch(() => {
      document.documentElement.setAttribute("data-whi-pro", "error");
    });
})();
