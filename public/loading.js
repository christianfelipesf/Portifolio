/* Overlay de loading compartilhado: entrada inicial + transicao entre secoes.
   Uso: window.pageTransition(swap) mostra o overlay, executa swap(), esconde. */
(function () {
  var MIN_VISIBLE_MS = 400;
  var FALLBACK_HIDE_MS = 2500;
  var EXIT_MS = 300;
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

  function showOverlay() {
    var el = getOverlay();
    if (!el) return;
    hidden = false;
    el.classList.remove("is-hidden");
    el.classList.add("is-leaving");
    el.removeAttribute("aria-hidden");
  }

  function hideOverlay() {
    var el = getOverlay();
    if (!el || hidden) return;
    hidden = true;
    el.classList.remove("is-leaving");
    var elapsed = Date.now() - startTime;
    var wait = reduceMotion() ? 0 : Math.max(0, MIN_VISIBLE_MS - elapsed);
    window.setTimeout(function () {
      el.classList.add("is-hidden");
      el.setAttribute("aria-hidden", "true");
    }, wait);
  }

  // Troca de secao com efeito de transicao (usado pelo roteador do index.html).
  window.pageTransition = function (swap) {
    if (reduceMotion() || typeof swap !== "function") {
      if (typeof swap === "function") swap();
      return;
    }
    showOverlay();
    window.setTimeout(function () {
      swap();
      hideOverlay();
    }, EXIT_MS);
  };

  window.addEventListener("load", hideOverlay);
  document.addEventListener("DOMContentLoaded", function () {
    window.setTimeout(hideOverlay, FALLBACK_HIDE_MS);
  });
  window.addEventListener("pageshow", function (event) {
    if (event.persisted) hideOverlay();
  });
})();
