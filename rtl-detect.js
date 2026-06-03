/* ============================================================
   LevelUp: Auto-Detect Language & Adjust Layout
   ------------------------------------------------------------
   Detects when the page language changes (for example when the
   user runs Google Translate) and switches the document between
   right-to-left (RTL) and left-to-right (LTR) automatically.

   How it works:
   1. We keep a list of language codes that are written RTL
      (Arabic, Hebrew, Persian, Urdu, etc.).
   2. We read the language from <html lang="..."> AND from the
      classes Google Translate adds to <html> ("translated-rtl"
      / "translated-ltr").
   3. A MutationObserver watches <html> for changes to those
      attributes, so the layout updates live when the user
      translates the page and when they switch back.
   ============================================================ */

(function () {
  // Language codes that use right-to-left scripts
  var RTL_LANGS = ["ar", "he", "iw", "fa", "ur", "ps", "sd", "ug", "yi", "dv"];

  function isRtlLang(code) {
    if (!code) return false;
    // Normalise "ar-EG" -> "ar"
    var base = code.toLowerCase().split("-")[0];
    return RTL_LANGS.indexOf(base) !== -1;
  }

  function applyDirection() {
    var html = document.documentElement;

    // Signal 1: Google Translate adds these helper classes
    var translatedRtl = html.classList.contains("translated-rtl");
    var translatedLtr = html.classList.contains("translated-ltr");

    // Signal 2: the lang attribute itself
    var langIsRtl = isRtlLang(html.getAttribute("lang"));

    var shouldBeRtl = translatedRtl || (langIsRtl && !translatedLtr);

    if (shouldBeRtl) {
      html.setAttribute("dir", "rtl");
    } else {
      html.setAttribute("dir", "ltr");
    }
  }

  // Run once on load
  applyDirection();

  // Watch <html> for changes to lang/dir/class (Google Translate edits these)
  var observer = new MutationObserver(applyDirection);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["lang", "class", "dir"]
  });
})();
