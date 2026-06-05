/* ============================================================
   LevelUp: Auto-Detect Language & Adjust Layout
   ------------------------------------------------------------
   Detects when the page language changes (via the Google
   Translate widget) and switches the document between
   right-to-left (RTL) and left-to-right (LTR) automatically.

   How it works:
   1. Embeds the Google Translate website widget so the page
      content can be translated reliably. When it translates,
      Google adds a "translated-rtl" / "translated-ltr" class to
      <html> and updates the <html lang> attribute.
   2. A MutationObserver watches ONLY the <html> attributes for
      those changes and flips the layout direction. We also run a
      light polling check as a fallback.

   Important: the script never writes the "dir" attribute unless
   it is actually changing, so it can never trigger its own
   observer in a loop.
   ============================================================ */

(function () {
  // ---- Load the Google Translate widget ----
  window.googleTranslateElementInit = function () {
    new google.translate.TranslateElement(
      {
        pageLanguage: "en",
        includedLanguages: "ar,he,fa,ur,es,fr,de,zh-CN,en",
        layout: google.translate.TranslateElement.InlineLayout.SIMPLE
      },
      "google_translate_element"
    );
  };

  var s = document.createElement("script");
  s.src = "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
  document.head.appendChild(s);

  // ---- RTL detection ----
  var RTL_LANGS = ["ar", "he", "iw", "fa", "ur", "ps", "sd", "ug", "yi", "dv"];

  function isRtlLang(code) {
    if (!code) return false;
    var base = code.toLowerCase().split("-")[0];
    return RTL_LANGS.indexOf(base) !== -1;
  }

  function applyDirection() {
    var html = document.documentElement;

    var translatedRtl = html.classList.contains("translated-rtl");
    var translatedLtr = html.classList.contains("translated-ltr");
    var langIsRtl = isRtlLang(html.getAttribute("lang"));

    var shouldBeRtl = translatedRtl || (langIsRtl && !translatedLtr);
    var want = shouldBeRtl ? "rtl" : "ltr";

    // Only write when it actually changes — prevents any observer loop.
    if (html.getAttribute("dir") !== want) {
      html.setAttribute("dir", want);
    }
  }

  function start() {
    applyDirection();

    // Watch only <html> attributes (lang / class set by the widget).
    var observer = new MutationObserver(applyDirection);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["lang", "class"]
    });

    // Lightweight fallback poll (cheap; runs a few times a second).
    setInterval(applyDirection, 750);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start);
  } else {
    start();
  }
})();
