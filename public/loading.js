/* Overlay de loading compartilhado: entrada, saida e fallback.
   Incluido com <script src="loading.js" defer> em todas as paginas. */
(function () {
  var MIN_VISIBLE_MS = 400;
  var FALLBACK_HIDE_MS = 2500;
  var EXIT_MS = 320;
  var startTime = Date.now();
  var overlay = null;
  var hidden = false;

  function getOverlay() {
    if (!overlay) overlay = document.getElementById("loading-overlay");
    return overlay;
  }

  function reduceMotion() {
    return (
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    );
  }

  function hideOverlay() {
    var el = getOverlay();
    if (!el || hidden) return;
    hidden = true;
    var elapsed = Date.now() - startTime;
    var wait = reduceMotion() ? 0 : Math.max(0, MIN_VISIBLE_MS - elapsed);
    window.setTimeout(function () {
      el.classList.add("is-hidden");
      el.setAttribute("aria-hidden", "true");
    }, wait);
  }

  function goWithTransition(url) {
    var el = getOverlay();
    if (!el || reduceMotion()) {
      window.location.href = url;
      return;
    }
    el.classList.remove("is-hidden");
    el.classList.add("is-leaving");
    el.removeAttribute("aria-hidden");
    window.setTimeout(function () {
      window.location.href = url;
    }, EXIT_MS);
  }

  function isInternalPage(href) {
    if (!href) return false;
    if (href.indexOf("mailto:") === 0 || href.indexOf("tel:") === 0) return false;
    if (href.indexOf("#") !== -1 && href.split("#")[0] === "") return false;
    // Mesma origem ou caminho relativo terminando em .html (com ou sem #ancora).
    var clean = href.split("#")[0].split("?")[0];
    if (!/\.html?$/i.test(clean)) return false;
    if (/^https?:\/\//i.test(href)) {
      try {
        var target = new URL(href, window.location.href);
        if (target.origin !== window.location.origin) return false;
      } catch (e) {
        return false;
      }
    }
    return true;
  }

  document.addEventListener("click", function (event) {
    var anchor = event.target && event.target.closest
      ? event.target.closest("a[href]")
      : null;
    if (!anchor) return;
    if (event.defaultPrevented || event.button !== 0) return;
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    if (anchor.target === "_blank" || anchor.hasAttribute("download")) return;
    var href = anchor.getAttribute("href");
    if (!isInternalPage(href)) return;
    event.preventDefault();
    goWithTransition(href);
  });

  window.addEventListener("load", hideOverlay);
  document.addEventListener("DOMContentLoaded", function () {
    window.setTimeout(hideOverlay, FALLBACK_HIDE_MS);
  });
  window.addEventListener("pageshow", function (event) {
    if (event.persisted) hideOverlay();
  });
})();
