/**
 * Auto-apply formatProse to static page text blocks (loaded after format-prose.js).
 */
(function () {
  const SELECTORS = [
    ".lede",
    ".intro p",
    ".sec-lead",
    ".method p:not(.method-sub)",
    ".notes p",
    ".note",
    ".table-source",
    ".know-body p",
    ".know-note",
    ".lead",
    ".summary-box p",
    ".price-caution",
    ".reliability-intro-text",
    "[data-prose]",
  ];

  function run() {
    if (typeof formatProse !== "function") return;
    for (const sel of SELECTORS) {
      document.querySelectorAll(sel).forEach((el) => {
        if (el.dataset.proseDone) return;
        if (el.closest("h1, h2, h3, h4, a")) return;
        const raw = el.textContent;
        if (!raw || !raw.trim()) return;
        el.innerHTML = formatProse(raw);
        el.dataset.proseDone = "1";
      });
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", run);
  } else {
    run();
  }
})();
