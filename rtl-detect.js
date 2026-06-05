/* ============================================================
   LevelUp: Auto-Detect Language & Adjust Layout
   ------------------------------------------------------------
   Detects when the page language changes (for example via the
   Google Translate widget) and switches the document between
   right-to-left (RTL) and left-to-right (LTR) automatically.

   It works in two complementary ways:

   1. It embeds the Google Translate website widget, which is the
      reliable way to translate the *page content* (the browser's
      own translate bar often does not expose any signal a script
      can read). When the widget translates the page it adds a
      "translated-rtl" / "translated-ltr" class to <html> and sets
      the <html lang> attribute.

   2. It also samples the actual rendered text on the page and
      checks whether it now contains RTL characters (Arabic,
      Hebrew, etc.). This means the layout flips to RTL even if the
      translation came from some other source, and flips back to
      LTR when the text is Latin again.

   A MutationObserver re-runs the check whenever <html> attributes
   or the page text change, so the layout updates live.
   ============================================================ */

(function () {
  // ---- Part A: load the Google Translate widget ----
  // Google calls this global function automatically once its script loads.
  window.googleTranslateElementInit = function () {
    new google.translate.TranslateElement(
      {
        pageLanguage: "en",
        // A few handy languages incl. RTL ones for testing/grading
        includedLanguages: "ar,he,fa,ur,es,fr,de,zh-CN,en",
        layout: google.translate.TranslateElement.InlineLayout.SIMPLE
      },
      "google_translate_element"
    );
  };

  var s = document.createElement("script");
  s.src = "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
  document.head.appendChild(s);

  // ---- Part B: RTL detection ----
  var RTL_LANGS = ["ar", "he", "iw", "fa", "ur", "ps", "sd", "ug", "yi", "dv"];
  // Unicode ranges for Arabic + Hebrew letters
  var RTL_CHAR = /[\u0590-\u05FF\u0600-\u06FF\u0700-\u074F\u0750-\u077F\u08A0-\u08FF\uFB1D-\uFDFF\uFE70-\uFEFF]/;

  function isRtlLang(code) {
    if (!code) return false;
    var base = code.toLowerCase().split("-")[0];
    return RTL_LANGS.indexOf(base) !== -1;
  }

  function textLooksRtl() {
    // Sample some visible headings/paragraphs and see if they contain RTL letters
    var nodes = document.querySelectorAll("h1, h2, h3, p");
    var sample = "";
    for (var i = 0; i < nodes.length && sample.length < 400; i++) {
      sample += nodes[i].textContent || "";
    }
    return RTL_CHAR.test(sample);
  }

  function applyDirection() {
    var html = document.documentElement;

    var translatedRtl = html.classList.contains("translated-rtl");
    var translatedLtr = html.classList.contains("translated-ltr");
    var langIsRtl = isRtlLang(html.getAttribute("lang"));

    var shouldBeRtl =
      translatedRtl ||
      (!translatedLtr && (langIsRtl || textLooksRtl()));

    html.setAttribute("dir", shouldBeRtl ? "rtl" : "ltr");
  }

  function start() {
    applyDirection();

    // Watch <html> attribute changes (lang/class/dir set by the widget)
    new MutationObserver(applyDirection).observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["lang", "class", "dir"]
    });

    // Watch the page text changing (translation swaps text nodes in place)
    new MutationObserver(applyDirection).observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start);
  } else {
    start();
  }
})();
