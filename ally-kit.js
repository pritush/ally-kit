/*!
 * AllyKit v1.3.0
 * © Pritush M.
 * MIT License
 *
 * UMD wrapper — works as:
 *   • Plain <script> tag  →  window.AllyKit
 *   • CommonJS require()  →  const AllyKit = require('@preepo/allykit')
 *   • ES module import    →  import AllyKit from '@preepo/allykit'
 */
(function (root, factory) {
  "use strict";
  if (typeof define === "function" && define.amd) {
    // AMD (e.g. RequireJS)
    define([], factory);
  } else if (typeof module !== "undefined" && typeof module.exports !== "undefined") {
    // CommonJS / Node-compatible bundlers (webpack, Rollup, Vite, etc.)
    module.exports = factory();
  } else {
    // Plain <script> — attach to window and auto-init
    root.AllyKit = factory();
  }
}(typeof globalThis !== "undefined" ? globalThis : typeof self !== "undefined" ? self : this, function () {
  "use strict";

  if (typeof window !== "undefined" && window.AllyKit && window.AllyKit.version) return {};

  const VERSION = "1.3.0";
  const ROOT_ID = "allykit-root";
  const STYLE_ID = "allykit-page-styles";
  const MASK_ID = "allykit-adhd-mask";
  const STORAGE_KEY = "allyKitSettings";
  const TEXT_SELECTOR =
    "p, h1, h2, h3, h4, h5, h6, li, a, label, button, input, textarea, select, td, th, blockquote, figcaption, summary, caption";

  // Selector matching every top-level page element except the widget root and ADHD mask.
  const TOP_LEVEL_SELECTOR = "body > *:not(#" + ROOT_ID + "):not(#" + MASK_ID + ")";

  const STRINGS = {
    menuTitle: "Accessibility options",
    openMenu: "Open accessibility options",
    closeMenu: "Close accessibility options",
    reset: "Reset all settings",
    on: "On",
    off: "Off",
    default: "Default",
    changed: "updated",
    resetDone: "Accessibility settings reset",
    textSize: "Text size",
    highContrast: "High contrast",
    textSpacing: "Text spacing",
    lineHeight: "Line height",
    dyslexia: "Dyslexia Friendly",
    adhd: "ADHD mode",
    saturation: "Saturation",
    invert: "Invert color",
    bigCursor: "Big cursor",
    hideImages: "Hide images",
    pauseAnimation: "Pause animation",
    highlightLinks: "Highlight links",
    screenReader: "Screen Reader",
    screenReaderOn: "Screen reader on",
    screenReaderOff: "Screen reader off",
    notSupportedBrowser: "is not supported in this browser",
    autoFixBadge: "issues auto-fixed",
    skipToContent: "Skip to main content"
  };

  // ── Default accent palette ────────────────────────────────────────────────
  // Derive a full Material-style tonal surface from a single hex accent colour.
  // All values are used as CSS custom properties inside the shadow root so that
  // the entire widget recolours consistently from one setting.
  //
  // Defaults ship a clean indigo (#4f46e5) that is WCAG AA on white.
  // Override via window.AllyKitConfig.accentColor (any valid CSS colour).
  const DEFAULT_ACCENT = "#4f46e5";

  /**
   * Given a CSS hex colour string, returns the 6-char lowercase hex without #.
   * Returns null if the input cannot be parsed as a hex colour.
   */
  function parseHex(color) {
    if (!color || typeof color !== "string") return null;
    const s = color.trim().replace(/^#/, "");
    if (/^[0-9a-fA-F]{6}$/.test(s)) return s.toLowerCase();
    if (/^[0-9a-fA-F]{3}$/.test(s)) {
      return (s[0] + s[0] + s[1] + s[1] + s[2] + s[2]).toLowerCase();
    }
    return null;
  }

  /**
   * Convert 6-char hex to { r, g, b } (0–255).
   */
  function hexToRgb(hex) {
    return {
      r: parseInt(hex.slice(0, 2), 16),
      g: parseInt(hex.slice(2, 4), 16),
      b: parseInt(hex.slice(4, 6), 16)
    };
  }

  /**
   * Convert { r, g, b } to relative luminance (WCAG formula).
   */
  function luminance(r, g, b) {
    const toLinear = function (c) {
      const s = c / 255;
      return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
    };
    return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
  }

  /**
   * Returns "#ffffff" or "#000000" — whichever has the higher contrast ratio
   * against the given hex colour — for use as the on-colour token.
   */
  function onColor(hex) {
    const { r, g, b } = hexToRgb(hex);
    const lum = luminance(r, g, b);
    // Contrast ratios against white and black
    const vsWhite = (1 + 0.05) / (lum + 0.05);
    const vsBlack = (lum + 0.05) / (0 + 0.05);
    return vsWhite >= vsBlack ? "#ffffff" : "#000000";
  }

  /**
   * Blends a hex colour toward white by `amount` (0 = original, 1 = white).
   * Used to derive the primary-container (light tint) token.
   */
  function tintHex(hex, amount) {
    const { r, g, b } = hexToRgb(hex);
    const blend = function (c) {
      return Math.round(c + (255 - c) * amount).toString(16).padStart(2, "0");
    };
    return "#" + blend(r) + blend(g) + blend(b);
  }

  /**
   * Blends a hex colour toward black by `amount` (0 = original, 1 = black).
   * Used to derive the on-primary-container (dark shade) token.
   */
  function shadeHex(hex, amount) {
    const { r, g, b } = hexToRgb(hex);
    const blend = function (c) {
      return Math.round(c * (1 - amount)).toString(16).padStart(2, "0");
    };
    return "#" + blend(r) + blend(g) + blend(b);
  }

  /**
   * Build the full set of colour tokens from a single accent hex.
   * Returns an object whose keys map 1-to-1 with CSS custom properties.
   */
  function buildPalette(accentHex) {
    const hex = parseHex(accentHex) || parseHex(DEFAULT_ACCENT);
    const full = "#" + hex;
    return {
      primary:             full,
      onPrimary:           onColor(hex),
      primaryContainer:    tintHex(hex, 0.82),
      onPrimaryContainer:  shadeHex(hex, 0.70)
    };
  }

  const DEFAULT_CONFIG = {
    position: "right",
    buttonOffset: "24px",
    panelWidth: "560px",
    // Single accent colour — drives the entire widget palette.
    // Accepts any 3- or 6-digit CSS hex string (e.g. "#4f46e5" or "#f60").
    accentColor: DEFAULT_ACCENT,
    // WCAG 2.2 auto-fixer — scans the page and fixes common a11y violations.
    // Set to false to disable entirely.
    autoFix: true,
    // Default lang attribute applied to <html> if missing.
    autoFixLang: "en",
    // Feature toggles - set to false to disable any feature
    features: {
      textSize: true,
      highContrast: true,
      textSpacing: true,
      lineHeight: true,
      dyslexia: true,
      adhd: true,
      saturation: true,
      invert: true,
      bigCursor: true,
      hideImages: true,
      pauseAnimation: true,
      highlightLinks: true,
      screenReader: true
    }
  };

  // Config is flat, so a shallow assign is sufficient (and avoids a recursive merge).
  // For the features object, merge it separately to preserve both default and custom values
  const userConfig = window.AllyKitConfig || {};
  const config = Object.assign({}, DEFAULT_CONFIG, userConfig);
  
  // Merge features separately to ensure all feature flags are present
  if (userConfig.features) {
    config.features = Object.assign({}, DEFAULT_CONFIG.features, userConfig.features);
  }

  // Derive the widget colour palette from the configured accent colour.
  const palette = buildPalette(config.accentColor);

  const defaultState = {
    textSize: 0,
    highContrast: 0,
    textSpacing: 0,
    lineHeight: 0,
    dyslexia: false,
    adhd: false,
    saturation: 0,
    invert: false,
    bigCursor: false,
    hideImages: false,
    pauseAnimation: false,
    highlightLinks: false,
    screenReader: false
  };

  const levelLabels = {
    textSize: ["Default", "110%", "120%", "130%", "140%"],
    highContrast: ["Default", "Enhanced", "Black / White", "Black / Yellow", "Dark Mode"],
    textSpacing: ["Default", "Loose", "Wider", "Widest"],
    lineHeight: ["Default", "1.5x", "1.8x", "2x"],
    saturation: ["Default", "Low", "High", "Grayscale"]
  };

  const features = [
    { key: "textSize", label: STRINGS.textSize, icon: "format_size", type: "level", max: 4 },
    { key: "highContrast", label: STRINGS.highContrast, icon: "contrast", type: "level", max: 4 },
    { key: "textSpacing", label: STRINGS.textSpacing, icon: "format_letter_spacing", type: "level", max: 3 },
    { key: "lineHeight", label: STRINGS.lineHeight, icon: "format_line_spacing", type: "level", max: 3 },
    { key: "dyslexia", label: STRINGS.dyslexia, icon: "font_download", type: "toggle" },
    { key: "adhd", label: STRINGS.adhd, icon: "center_focus_strong", type: "toggle" },
    { key: "saturation", label: STRINGS.saturation, icon: "palette", type: "level", max: 3 },
    { key: "invert", label: STRINGS.invert, icon: "invert_colors", type: "toggle" },
    { key: "bigCursor", label: STRINGS.bigCursor, icon: "ads_click", type: "toggle" },
    { key: "hideImages", label: STRINGS.hideImages, icon: "hide_image", type: "toggle" },
    { key: "pauseAnimation", label: STRINGS.pauseAnimation, icon: "pause_circle", type: "toggle" },
    { key: "highlightLinks", label: STRINGS.highlightLinks, icon: "link", type: "toggle" },
    { key: "screenReader", label: STRINGS.screenReader, icon: "record_voice_over", type: "toggle" }
  ];

  /**
   * Returns an array of enabled features based on the config.features settings.
   * Developers can disable features by setting them to false in window.AllyKitConfig.
   */
  function getEnabledFeatures() {
    return features.filter(function (feature) {
      return config.features[feature.key] !== false;
    });
  }

  const bodyClasses = {
    highContrast: [
      "allykit-high-contrast-1",
      "allykit-high-contrast-2",
      "allykit-high-contrast-3",
      "allykit-high-contrast-4"
    ],
    textSpacing: ["allykit-text-spacing-1", "allykit-text-spacing-2", "allykit-text-spacing-3"],
    lineHeight: ["allykit-line-height-1", "allykit-line-height-2", "allykit-line-height-3"]
  };

  const toggleBodyClasses = {
    dyslexia: "allykit-dyslexia",
    adhd: "allykit-adhd",
    bigCursor: "allykit-big-cursor",
    hideImages: "allykit-hide-images",
    pauseAnimation: "allykit-pause-animation",
    highlightLinks: "allykit-highlight-links"
    // screenReader is handled imperatively (no body class needed)
  };

  let state = loadState();
  let root = null;
  let shadow = null;
  let panel = null;
  let fab = null;
  let liveRegion = null;
  let previousFocus = null;
  let mutationObserver = null;
  let mediaPausePending = false;
  // Map<key, { button, stateNode, steps }> â€” caches per-feature DOM refs to avoid re-querying.
  const buttonRefs = new Map();

  const icons = {
    accessibility_new:
      '<path d="M20.5 6c-2.61.7-5.67 1-8.5 1s-5.89-.3-8.5-1L3 8c1.86.5 4.18.9 6 1v13h2v-6h2v6h2V9c1.82-.1 4.14-.5 6-1l-.5-2zM12 2C13.1 2 14 2.9 14 4S13.1 6 12 6 10 5.1 10 4 10.9 2 12 2z"/>',
    close:
      '<path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>',
    restart_alt:
      '<path d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z"/>',
    format_size:
      '<path d="M9 4v3h5v12h3V7h5V4H9zm-6 8h3v7h3v-7h3V9H3v3z"/>',
    contrast:
      '<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18V4c4.41 0 8 3.59 8 8s-3.59 8-8 8z"/>',
    format_letter_spacing:
      '<path d="M6 14l3.1-8h2.1l3 8h-2.1l-.6-1.8H8.7L8.1 14H6zm3.3-3.6h1.6L10.1 8l-.8 2.4zM4 18h16v2H4v-2zM16 6h2v6h3v2h-5V6z"/>',
    format_line_spacing:
      '<path d="M6 7h2.5L5 3.5 1.5 7H4v10H1.5L5 20.5 8.5 17H6V7zm4-2v2h12V5H10zm0 14h12v-2H10v2zm0-6h12v-2H10v2z"/>',
    font_download:
      '<path d="M9.93 13.5h4.14L12 7.98 9.93 13.5zM20 2H4c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-4.05 16.5l-1.14-3H9.17l-1.12 3H5.96l5.11-13h1.86l5.11 13h-2.09z"/>',
    center_focus_strong:
      '<path d="M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm-7 7H3v4c0 1.1.9 2 2 2h4v-2H5v-4zM5 5h4V3H5c-1.1 0-2 .9-2 2v4h2V5zm14-2h-4v2h4v4h2V5c0-1.1-.9-2-2-2zm0 16h-4v2h4c1.1 0 2-.9 2-2v-4h-2v4z"/>',
    palette:
      '<path d="M12 2C6.49 2 2 6.49 2 12s4.49 10 10 10c.55 0 1-.45 1-1 0-.28-.11-.53-.29-.71-.18-.18-.29-.43-.29-.71 0-.55.45-1 1-1H16c3.31 0 6-2.69 6-6 0-4.96-4.49-9-10-9zm-5.5 9c-.83 0-1.5-.67-1.5-1.5S5.67 8 6.5 8 8 8.67 8 9.5 7.33 11 6.5 11zm3-4C8.67 7 8 6.33 8 5.5S8.67 4 9.5 4s1.5.67 1.5 1.5S10.33 7 9.5 7zm5 0c-.83 0-1.5-.67-1.5-1.5S13.67 4 14.5 4s1.5.67 1.5 1.5S15.33 7 14.5 7zm3 4c-.83 0-1.5-.67-1.5-1.5S16.67 8 17.5 8s1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/>',
    invert_colors:
      '<path d="M17.66 7.93L12 2.27 6.34 7.93c-3.12 3.12-3.12 8.19 0 11.31C7.9 20.8 9.95 21.58 12 21.58s4.1-.78 5.66-2.34c3.12-3.12 3.12-8.19 0-11.31zM12 19.59c-1.6 0-3.11-.62-4.24-1.76C6.62 16.69 6 15.19 6 13.59s.62-3.11 1.76-4.24L12 5.1v14.49z"/>',
    ads_click:
      '<path d="M21 3L3 10.53v.98l6.84 2.65L12.48 21h.98L21 3z"/>',
    hide_image:
      '<path d="M21 5c0-1.1-.9-2-2-2H5.83L21 18.17V5zM2.81 2.81L1.39 4.22 3 5.83V19c0 1.1.9 2 2 2h13.17l1.61 1.61 1.41-1.41L2.81 2.81zM6 17l3-4 2.25 3 .82-1.1 2.1 2.1H6z"/>',
    pause_circle:
      '<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z"/>',
    link:
      '<path d="M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z"/>',
    check:
      '<path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>',
    record_voice_over:
      '<path d="M18.39 12.56c.09-.18.14-.39.14-.6 0-.71-.52-1.29-1.21-1.37-.05-.01-.1-.01-.15-.01-.26 0-.51.07-.72.22L15.4 10a4 4 0 0 0-4.1-4h-.3a4 4 0 0 0-4 4v.45c-.64.15-1.12.73-1.12 1.42 0 .64.42 1.19 1 1.38V14c0 1.48.81 2.79 2 3.47V19l-2.38 1.19C5.31 20.87 4 22.66 4 24h16c0-1.34-1.31-3.13-2.62-3.81L15 19v-1.53c1.19-.68 2-1.99 2-3.47v-.6l-.26-.04c-.14-.02-.23-.05-.35-.3zM12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 12v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8V9h2V7h2v2h1.9c.6 0 1.1.49 1.1 1.1v3.51c-.46.12-.84.42-1.07.82L13.9 14.39z"/>'
  };

  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback, { once: true });
    } else {
      callback();
    }
  }

  // =============================================================
  // SCREEN READER  (uses Web Speech API / window.speechSynthesis)
  // =============================================================

  const screenReader = (function () {
    const isSupported = "speechSynthesis" in window;

    // Selector for elements that the screen reader should intercept clicks on
    // (anchors that would navigate the page).
    const INTERACTIVE_SELECTOR = "a[href], button, input, select, textarea, [role='button'], [role='link'], [tabindex]";

    /**
     * Extract the most meaningful text from a focused element.
     * Priority: aria-label > aria-labelledby text > label[for] text >
     *           alt / title / placeholder > value (inputs) > innerText.
     */
    function getElementText(el) {
      // 1. aria-label
      const ariaLabel = el.getAttribute("aria-label");
      if (ariaLabel && ariaLabel.trim()) return ariaLabel.trim();

      // 2. aria-labelledby
      const labelledBy = el.getAttribute("aria-labelledby");
      if (labelledBy) {
        const parts = labelledBy.split(/\s+/).map(function (id) {
          const ref = document.getElementById(id);
          return ref ? ref.textContent.trim() : "";
        }).filter(Boolean);
        if (parts.length) return parts.join(" ");
      }

      // 3. <label for="id"> associated label
      if (el.id) {
        const labelEl = document.querySelector('label[for="' + el.id + '"]');
        if (labelEl && labelEl.textContent.trim()) return labelEl.textContent.trim();
      }

      // 4. alt / title
      if (el.alt && el.alt.trim()) return el.alt.trim();
      if (el.title && el.title.trim()) return el.title.trim();

      // 5. placeholder
      if (el.placeholder && el.placeholder.trim()) return el.placeholder.trim();

      // 6. current value for inputs/selects
      const tag = el.tagName ? el.tagName.toUpperCase() : "";
      if ((tag === "INPUT" || tag === "TEXTAREA") && el.value && el.value.trim()) {
        return el.value.trim();
      }
      if (tag === "SELECT" && el.options && el.selectedIndex >= 0) {
        return el.options[el.selectedIndex].text.trim();
      }

      // 7. visible text content
      return el.innerText ? el.innerText.trim() : "";
    }

    /**
     * Speak a string. Cancels any in-progress speech first.
     * @param {string}   text
     * @param {function} [onEnd]  Optional callback fired when speech finishes.
     * @param {object}   [opts]   { lang, rate, pitch, volume }
     */
    function speak(text, onEnd, opts) {
      if (!isSupported || !text) {
        if (typeof onEnd === "function") onEnd();
        return;
      }
      try {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang   = (opts && opts.lang)   || document.documentElement.lang || "en-US";
        utterance.rate   = (opts && opts.rate)   != null ? opts.rate   : 1;
        utterance.pitch  = (opts && opts.pitch)  != null ? opts.pitch  : 1;
        utterance.volume = (opts && opts.volume) != null ? opts.volume : 1;
        if (typeof onEnd === "function") {
          utterance.onend = onEnd;
        }
        utterance.onerror = function (e) {
          // "interrupted" fires whenever cancel() is called — not a real error.
          if (e.error !== "interrupted") {
            console.warn("[AllyKit] Speech synthesis error:", e.error);
          }
          // Still fire the callback on error so navigation is never silently lost.
          if (typeof onEnd === "function") onEnd();
        };
        window.speechSynthesis.speak(utterance);
      } catch (err) {
        console.warn("[AllyKit] screenReader.speak error:", err);
        if (typeof onEnd === "function") onEnd();
      }
    }

    // ── Mouseover pre-announcement ────────────────────────────────────────────
    // Hovering over any interactive element reads it aloud *before* the user
    // clicks, so the click itself never races with speech on navigating links.

    var hoverTarget = null;  // last element announced via hover
    var hoverTimer  = null;  // debounce timer

    // NVDA-like behaviour: stay quiet until the user deliberately navigates
    // (Tab, click, or touch on page content). Prevents speech on load.
    var isArmed = false;
    var armListenersActive = false;

    function armFromUserGesture(event) {
      // Panel interactions should not start reading page content.
      if (root && event.target && root.contains(event.target)) return;
      isArmed = true;
      removeArmListeners();
    }

    function addArmListeners() {
      if (armListenersActive) return;
      armListenersActive = true;
      document.addEventListener("keydown",     armFromUserGesture, { passive: true });
      document.addEventListener("mousedown",   armFromUserGesture, { passive: true });
      document.addEventListener("touchstart",   armFromUserGesture, { passive: true });
    }

    function removeArmListeners() {
      if (!armListenersActive) return;
      armListenersActive = false;
      document.removeEventListener("keydown",     armFromUserGesture, { passive: true });
      document.removeEventListener("mousedown",   armFromUserGesture, { passive: true });
      document.removeEventListener("touchstart",   armFromUserGesture, { passive: true });
    }

    function handleMouseover(event) {
      if (!isArmed) return;
      // Walk up from the event target to find the nearest interactive ancestor.
      var el = event.target;
      while (el && el !== document.body) {
        if (el.matches && el.matches(INTERACTIVE_SELECTOR)) break;
        el = el.parentElement;
      }
      if (!el || el === document.body) return;
      if (el === hoverTarget) return; // already announced

      hoverTarget = el;
      clearTimeout(hoverTimer);
      hoverTimer = setTimeout(function () {
        var text = getElementText(el);
        if (text) speak(text, null);
      }, 150); // 150 ms debounce — ignores fast mouse movements
    }

    function handleMouseout(event) {
      if (event.target === hoverTarget) {
        clearTimeout(hoverTimer);
        hoverTarget = null;
      }
    }

    // ── Click interception for navigating links ───────────────────────────────
    // When a navigating <a href> is clicked, we prevent the immediate navigation,
    // read the link text, and then navigate once speech has finished.
    // Non-navigating links (_blank) are announced but not intercepted.

    function handleLinkClick(event) {
      // Clicks are always user-initiated — arm before reading/navigating.
      isArmed = true;
      removeArmListeners();

      var el = event.target;
      // Walk up to find the closest anchor element.
      while (el && el.tagName && el.tagName.toUpperCase() !== "A") {
        el = el.parentElement;
      }
      if (!el || !el.href) return; // not a navigating anchor

      // Skip widget-internal links to avoid interfering with the panel.
      if (root && root.contains(el)) return;

      // _blank links open a new tab — current page stays, so no interception needed.
      if (el.target === "_blank" || el.target === "_new") {
        speak(getElementText(el) || el.href, null);
        return;
      }

      // Same-page / same-tab navigation: intercept, speak, then navigate.
      event.preventDefault();
      event.stopPropagation();

      var href = el.href;
      var linkText = getElementText(el) || href;

      // Safety timeout: navigate even if speech never fires the onend event
      // (can happen if the browser misbehaves or synthesis is silently rejected).
      var navigated = false;
      var safetyTimer = setTimeout(function () {
        if (!navigated) { navigated = true; window.location.href = href; }
      }, 4000);

      speak(linkText, function () {
        clearTimeout(safetyTimer);
        if (!navigated) { navigated = true; window.location.href = href; }
      });
    }

    // ── Keyboard (Tab) navigation announcement ────────────────────────────────
    // focusin handles Tab-key navigation so keyboard-only users still get
    // announcements. If the element was already announced via mouseover, skip it.

    function handleFocus(event) {
      if (!isArmed) return;
      // Skip widget-internal focus events (e.g. the panel's own buttons).
      if (root && root.contains(event.target)) return;
      // Skip if already pre-announced by the hover handler.
      if (event.target === hoverTarget) return;
      var text = getElementText(event.target);
      if (text) speak(text, null);
    }

    // ── Enable / Disable ─────────────────────────────────────────────────────

    /**
     * @param {object} [options]
     * @param {boolean} [options.silent]  Skip the "Screen reader on" announcement
     *                                    (used when restoring a previous session).
     */
    function enable(options) {
      isArmed = false;
      addArmListeners();
      document.addEventListener("focusin",   handleFocus,     { passive: true });
      document.addEventListener("mouseover", handleMouseover, { passive: true });
      document.addEventListener("mouseout",  handleMouseout,  { passive: true });
      // capture:true so we intercept clicks before the link fires.
      document.addEventListener("click",     handleLinkClick, true);
      if (!(options && options.silent)) {
        speak(STRINGS.screenReaderOn, null);
      }
    }

    function disable() {
      removeArmListeners();
      isArmed = false;
      document.removeEventListener("focusin",   handleFocus,     { passive: true });
      document.removeEventListener("mouseover", handleMouseover, { passive: true });
      document.removeEventListener("mouseout",  handleMouseout,  { passive: true });
      document.removeEventListener("click",     handleLinkClick, true);
      clearTimeout(hoverTimer);
      hoverTarget = null;
      if (isSupported) {
        try {
          window.speechSynthesis.cancel();
          var utterance = new SpeechSynthesisUtterance(STRINGS.screenReaderOff);
          utterance.lang = document.documentElement.lang || "en-US";
          utterance.onerror = function (e) {
            if (e.error !== "interrupted") console.warn("[AllyKit] Speech error:", e.error);
          };
          window.speechSynthesis.speak(utterance);
        } catch (err) {
          console.warn("[AllyKit] screenReader.disable error:", err);
        }
      }
    }

    function toggle(isActive, options) {
      if (!isSupported) {
        console.warn("[AllyKit] SpeechSynthesis " + STRINGS.notSupportedBrowser);
        return;
      }
      if (isActive) { enable(options); } else { disable(); }
    }

    /** Called during destroy() — silent teardown, no speech. */
    function teardown() {
      removeArmListeners();
      isArmed = false;
      document.removeEventListener("focusin",   handleFocus,     { passive: true });
      document.removeEventListener("mouseover", handleMouseover, { passive: true });
      document.removeEventListener("mouseout",  handleMouseout,  { passive: true });
      document.removeEventListener("click",     handleLinkClick, true);
      clearTimeout(hoverTimer);
      hoverTarget = null;
      if (isSupported) {
        try { window.speechSynthesis.cancel(); } catch (err) { /* ignore */ }
      }
    }

    return { isSupported: isSupported, toggle: toggle, teardown: teardown };
  }());

  // =============================================================
  // WCAG 2.2 AUTO-FIXER  (client-side accessibility remediation)
  // =============================================================

  const autoFixer = (function () {
    const FIXED_ATTR = "data-allykit-fixed";
    const SKIP_LINK_CLASS = "allykit-skip-link";

    // Map of autocomplete values keyed by common input name/id patterns.
    const AUTOCOMPLETE_MAP = {
      email: "email", "e-mail": "email",
      name: "name", fullname: "name", "full-name": "name", "full_name": "name",
      fname: "given-name", firstname: "given-name", "first-name": "given-name", "first_name": "given-name", given: "given-name",
      lname: "family-name", lastname: "family-name", "last-name": "family-name", "last_name": "family-name", surname: "family-name",
      tel: "tel", phone: "tel", mobile: "tel", telephone: "tel",
      address: "street-address", street: "street-address", "address-line1": "address-line1",
      city: "address-level2", state: "address-level1", zip: "postal-code", zipcode: "postal-code", postal: "postal-code", postcode: "postal-code",
      country: "country-name",
      username: "username", user: "username",
      password: "current-password", passwd: "current-password", pass: "current-password",
      "new-password": "new-password", newpassword: "new-password", "new_password": "new-password",
      cc: "cc-number", cardnumber: "cc-number", "card-number": "cc-number", "cc-number": "cc-number",
      "cc-name": "cc-name", cardholder: "cc-name",
      "cc-exp": "cc-exp", expiry: "cc-exp", expiration: "cc-exp",
      cvc: "cc-csc", cvv: "cc-csc", "cc-csc": "cc-csc",
      org: "organization", organization: "organization", company: "organization",
      bday: "bday", birthday: "bday", dob: "bday", birthdate: "bday", "birth-date": "bday",
      message: "off", comment: "off", comments: "off",
      search: "off", query: "off"
    };

    // Elements fixed with added keyboard listeners need cleanup references.
    var keyboardHandlers = [];
    var fixedCount = 0;
    var warnings = [];

    /**
     * Check whether an element is inside the AllyKit widget root.
     */
    function isWidgetElement(el) {
      return root && root.contains(el);
    }

    /**
     * Mark an element as fixed by AllyKit with a specific fix type.
     * @param {Element} el
     * @param {string}  fixType  e.g. "alt", "aria-label", "skip-link"
     */
    function markFixed(el, fixType) {
      var existing = el.getAttribute(FIXED_ATTR);
      if (existing) {
        if (existing.indexOf(fixType) === -1) {
          el.setAttribute(FIXED_ATTR, existing + " " + fixType);
          fixedCount += 1;
        }
      } else {
        el.setAttribute(FIXED_ATTR, fixType);
        fixedCount += 1;
      }
    }

    /** Whether an input/select/textarea already has a native <label>. */
    function hasNativeLabel(input) {
      if (input.id) {
        var labels = document.getElementsByTagName("label");
        for (var i = 0; i < labels.length; i++) {
          if (labels[i].htmlFor === input.id) return true;
        }
      }
      var parentLabel = input.closest("label");
      return !!(parentLabel && parentLabel.textContent && parentLabel.textContent.trim());
    }

    /** Update id references after a duplicate id rename. */
    function retargetIdReferences(oldId, newId) {
      var labels = document.querySelectorAll('label[for="' + oldId + '"]');
      for (var i = 0; i < labels.length; i++) {
        labels[i].setAttribute("for", newId);
      }
      var attrNames = ["aria-labelledby", "aria-describedby", "aria-owns", "aria-controls"];
      var all = document.querySelectorAll("*");
      for (var j = 0; j < all.length; j++) {
        var node = all[j];
        for (var a = 0; a < attrNames.length; a++) {
          var attr = attrNames[a];
          var val = node.getAttribute(attr);
          if (!val) continue;
          var parts = val.split(/\s+/);
          var changed = false;
          for (var p = 0; p < parts.length; p++) {
            if (parts[p] === oldId) { parts[p] = newId; changed = true; }
          }
          if (changed) node.setAttribute(attr, parts.join(" "));
        }
      }
      var anchors = document.querySelectorAll('a[href="#' + oldId + '"]');
      for (var h = 0; h < anchors.length; h++) {
        anchors[h].setAttribute("href", "#" + newId);
      }
    }

    // ── Fix: Duplicate IDs (WCAG 4.1.1) ───────────────────────────────────
    function fixDuplicateIds() {
      var seen = {};
      var elements = document.querySelectorAll("[id]");
      for (var i = 0; i < elements.length; i++) {
        var el = elements[i];
        if (isWidgetElement(el)) continue;
        var id = el.id;
        if (!id) continue;
        if (seen[id]) {
          var suffix = seen[id];
          seen[id] = suffix + 1;
          var newId = id + "-allykit-" + suffix;
          retargetIdReferences(id, newId);
          el.id = newId;
          markFixed(el, "duplicate-id");
        } else {
          seen[id] = 1;
        }
      }
    }

    // ── Fix: Invalid / redundant ARIA (WCAG 4.1.2) ────────────────────────
    var REDUNDANT_SEMANTIC_ROLES = {
      HEADER: "banner",
      FOOTER: "contentinfo",
      MAIN: "main",
      NAV: "navigation",
      TABLE: "table",
      ARTICLE: "article",
      ASIDE: "complementary",
      FORM: "form"
    };

    // List of valid ARIA attributes (from WAI-ARIA 1.2)
    var VALID_ARIA_ATTRIBUTES = {
      "aria-activedescendant": true,
      "aria-atomic": true,
      "aria-autocomplete": true,
      "aria-busy": true,
      "aria-checked": true,
      "aria-colcount": true,
      "aria-colindex": true,
      "aria-colindextext": true,
      "aria-colspan": true,
      "aria-controls": true,
      "aria-current": true,
      "aria-describedby": true,
      "aria-description": true,
      "aria-details": true,
      "aria-disabled": true,
      "aria-dropeffect": true,
      "aria-errormessage": true,
      "aria-expanded": true,
      "aria-flowto": true,
      "aria-grabbed": true,
      "aria-haspopup": true,
      "aria-hidden": true,
      "aria-invalid": true,
      "aria-keyshortcuts": true,
      "aria-label": true,
      "aria-labelledby": true,
      "aria-level": true,
      "aria-live": true,
      "aria-modal": true,
      "aria-multiline": true,
      "aria-multiselectable": true,
      "aria-orientation": true,
      "aria-owns": true,
      "aria-placeholder": true,
      "aria-posinset": true,
      "aria-pressed": true,
      "aria-readonly": true,
      "aria-relevant": true,
      "aria-required": true,
      "aria-roledescription": true,
      "aria-rowcount": true,
      "aria-rowindex": true,
      "aria-rowindextext": true,
      "aria-rowspan": true,
      "aria-selected": true,
      "aria-setsize": true,
      "aria-sort": true,
      "aria-valuemax": true,
      "aria-valuemin": true,
      "aria-valuenow": true,
      "aria-valuetext": true
    };

    // Global ARIA attributes allowed on any element
    var GLOBAL_ARIA_ATTRIBUTES = {
      "aria-atomic": true,
      "aria-busy": true,
      "aria-controls": true,
      "aria-current": true,
      "aria-describedby": true,
      "aria-description": true,
      "aria-details": true,
      "aria-disabled": true,
      "aria-dropeffect": true,
      "aria-errormessage": true,
      "aria-flowto": true,
      "aria-grabbed": true,
      "aria-hidden": true,
      "aria-invalid": true,
      "aria-keyshortcuts": true,
      "aria-label": true,
      "aria-labelledby": true,
      "aria-live": true,
      "aria-relevant": true,
      "aria-roledescription": true
    };

    // Allowed ARIA attributes per role (only non-global ones)
    var ROLE_ARIA_ATTRIBUTES = {
      "button": {
        "aria-expanded": true,
        "aria-haspopup": true,
        "aria-pressed": true
      },
      "link": {},
      "listbox": {
        "aria-activedescendant": true,
        "aria-multiselectable": true,
        "aria-orientation": true,
        "aria-required": true
      },
      "img": {}
    };

    function fixInvalidAria(scope) {
      var rootScope = scope || document;
      var tags = Object.keys(REDUNDANT_SEMANTIC_ROLES);
      for (var t = 0; t < tags.length; t++) {
        var tag = tags[t].toLowerCase();
        var role = REDUNDANT_SEMANTIC_ROLES[tags[t]];
        var nodes = rootScope.querySelectorAll(tag + "[role='" + role + "']");
        for (var i = 0; i < nodes.length; i++) {
          var el = nodes[i];
          if (isWidgetElement(el)) continue;
          el.removeAttribute("role");
          markFixed(el, "redundant-role");
        }
      }

      // role="img" is not allowed on <img> — it already has an implicit role.
      var badImgRoles = rootScope.querySelectorAll("img[role]");
      for (var r = 0; r < badImgRoles.length; r++) {
        if (isWidgetElement(badImgRoles[r])) continue;
        badImgRoles[r].removeAttribute("role");
        markFixed(badImgRoles[r], "redundant-role");
      }

      // aria-required is redundant when the native required attribute is present.
      var requiredInputs = rootScope.querySelectorAll("input[required][aria-required], textarea[required][aria-required], select[required][aria-required]");
      for (var q = 0; q < requiredInputs.length; q++) {
        if (isWidgetElement(requiredInputs[q])) continue;
        requiredInputs[q].removeAttribute("aria-required");
        markFixed(requiredInputs[q], "redundant-aria");
      }

      // Required asterisk spans inside labels should be hidden, not labelled.
      var reqSpans = rootScope.querySelectorAll("label span[aria-label], label abbr[aria-label]");
      for (var s = 0; s < reqSpans.length; s++) {
        var span = reqSpans[s];
        if (isWidgetElement(span)) continue;
        if ((span.getAttribute("aria-label") || "").toLowerCase() === "required") {
          span.removeAttribute("aria-label");
          span.setAttribute("aria-hidden", "true");
          markFixed(span, "redundant-aria");
        }
      }

      // Remove invalid ARIA attributes
      var allElements = rootScope.querySelectorAll("*");
      for (var e = 0; e < allElements.length; e++) {
        var el = allElements[e];
        if (isWidgetElement(el)) continue;
        var attrs = el.attributes;
        var role = el.getAttribute("role");
        for (var a = attrs.length - 1; a >= 0; a--) {
          var attr = attrs[a];
          if (attr.name.startsWith("aria-")) {
            // First check if the attribute is even a valid ARIA attribute
            if (!VALID_ARIA_ATTRIBUTES[attr.name]) {
              el.removeAttribute(attr.name);
              markFixed(el, "invalid-aria");
              continue;
            }
            // If there's an explicit role, check if the attribute is allowed
            if (role) {
              var allowedForRole = GLOBAL_ARIA_ATTRIBUTES[attr.name] || 
                (ROLE_ARIA_ATTRIBUTES[role] && ROLE_ARIA_ATTRIBUTES[role][attr.name]);
              if (!allowedForRole) {
                el.removeAttribute(attr.name);
                markFixed(el, "invalid-aria");
              }
            }
          }
        }
      }
    }

    // ── Fix: Multiple / duplicate labels (WCAG 1.3.1, 3.3.2) ─────────────
    function fixLabelIssues(scope) {
      var rootScope = scope || document;

      // Remove aria-label when a native label already names the control.
      var labelled = rootScope.querySelectorAll("input[aria-label], textarea[aria-label], select[aria-label]");
      for (var i = 0; i < labelled.length; i++) {
        var control = labelled[i];
        if (isWidgetElement(control)) continue;
        if (hasNativeLabel(control)) {
          control.removeAttribute("aria-label");
          markFixed(control, "duplicate-label");
        }
      }

      // Only one label[for] per id — detach extras.
      var forMap = {};
      var labels = rootScope.querySelectorAll("label[for]");
      for (var j = 0; j < labels.length; j++) {
        var label = labels[j];
        if (isWidgetElement(label)) continue;
        var fid = label.getAttribute("for");
        if (!fid) continue;
        if (forMap[fid]) {
          label.removeAttribute("for");
          markFixed(label, "duplicate-label");
        } else {
          forMap[fid] = label;
        }
      }

      // label[for] must reference an existing id.
      for (var k = 0; k < labels.length; k++) {
        var lbl = labels[k];
        if (isWidgetElement(lbl)) continue;
        var targetId = lbl.getAttribute("for");
        if (!targetId || document.getElementById(targetId)) continue;
        lbl.removeAttribute("for");
        markFixed(lbl, "duplicate-label");
      }
    }

    // ── Fix: List structure (WCAG 1.3.1) ─────────────────────────────────
    function fixListStructure(scope) {
      var items = (scope || document).querySelectorAll("li");
      for (var i = 0; i < items.length; i++) {
        var li = items[i];
        if (isWidgetElement(li)) continue;
        var parent = li.parentElement;
        var parentTag = parent && parent.tagName ? parent.tagName.toUpperCase() : "";
        if (parentTag !== "UL" && parentTag !== "OL" && parentTag !== "MENU") {
          var list = document.createElement("ul");
          list.setAttribute(FIXED_ATTR, "list-wrap");
          li.parentNode.insertBefore(list, li);
          list.appendChild(li);
          markFixed(list, "list-wrap");
          continue;
        }
        if (!li.textContent || !li.textContent.trim()) {
          li.setAttribute("aria-hidden", "true");
          markFixed(li, "empty-list-item");
        }
      }
    }

    // ── Fix: Extra landmarks (WCAG 1.3.1) ─────────────────────────────────
    function fixExtraLandmarks() {
      // <footer> inside blockquote creates a spurious footer landmark.
      var nestedFooters = document.querySelectorAll("blockquote footer, article footer, aside footer, section footer, nav footer");
      for (var i = 0; i < nestedFooters.length; i++) {
        var footer = nestedFooters[i];
        if (isWidgetElement(footer)) continue;
        var cite = document.createElement("cite");
        cite.textContent = footer.textContent;
        if (footer.className) cite.className = footer.className;
        cite.setAttribute(FIXED_ATTR, "landmark-demotion");
        footer.parentNode.replaceChild(cite, footer);
        markFixed(cite, "landmark-demotion");
      }

      // Keep only the first header/footer landmark by adding role="presentation" to others
      var headers = document.querySelectorAll("header");
      for (var b = 1; b < headers.length; b++) {
        if (isWidgetElement(headers[b])) continue;
        headers[b].setAttribute("role", "presentation");
        markFixed(headers[b], "landmark-demotion");
      }
      var footers = document.querySelectorAll("footer");
      for (var f = 1; f < footers.length; f++) {
        if (isWidgetElement(footers[f])) continue;
        footers[f].setAttribute("role", "presentation");
        markFixed(footers[f], "landmark-demotion");
      }
    }

    // ── Fix: Missing alt on images (WCAG 1.1.1) ──────────────────────────
    function fixImages(scope) {
      var images = (scope || document).querySelectorAll("img:not([alt])");
      for (var i = 0; i < images.length; i++) {
        var img = images[i];
        if (isWidgetElement(img)) continue;
        if (img.getAttribute(FIXED_ATTR) && img.getAttribute(FIXED_ATTR).indexOf("alt") !== -1) continue;

        var src = img.getAttribute("src") || "";
        var filename = src.split("/").pop().split("?")[0].split(".")[0];
        filename = filename.replace(/[-_]+/g, " ").trim();

        if (filename && filename.length > 1 && filename.length < 80 && !/^\d+$/.test(filename)) {
          img.setAttribute("alt", filename);
        } else {
          img.setAttribute("alt", "");
          img.setAttribute("role", "presentation");
        }
        markFixed(img, "alt");
      }

      // Decorative images with empty alt should be explicitly presentational.
      var decorative = (scope || document).querySelectorAll('img[alt=""]:not([role])');
      for (var d = 0; d < decorative.length; d++) {
        if (isWidgetElement(decorative[d])) continue;
        decorative[d].setAttribute("role", "presentation");
        markFixed(decorative[d], "img-role");
      }
    }

    // ── Fix: Unlabelled form inputs (WCAG 1.3.1, 3.3.2) ─────────────────
    function fixFormInputs(scope) {
      var inputs = (scope || document).querySelectorAll(
        "input:not([type='hidden']):not([type='submit']):not([type='button']):not([type='reset']):not([type='image']), textarea, select"
      );
      for (var i = 0; i < inputs.length; i++) {
        var input = inputs[i];
        if (isWidgetElement(input)) continue;
        if (hasNativeLabel(input)) continue;
        if (input.getAttribute(FIXED_ATTR) && input.getAttribute(FIXED_ATTR).indexOf("aria-label") !== -1) continue;

        // Skip if already labelled.
        if (input.getAttribute("aria-label") || input.getAttribute("aria-labelledby")) continue;

        // Derive a label from placeholder > name > type.
        var derivedLabel = "";
        if (input.placeholder && input.placeholder.trim()) {
          derivedLabel = input.placeholder.trim();
        } else if (input.name) {
          derivedLabel = input.name.replace(/[-_\[\]]+/g, " ").trim();
        } else if (input.type && input.type !== "text") {
          derivedLabel = input.type;
        }
        // Look for nearby text (preceding sibling text node or span).
        if (!derivedLabel) {
          var prev = input.previousElementSibling;
          if (prev && prev.textContent && prev.textContent.trim().length < 60) {
            derivedLabel = prev.textContent.trim();
          }
        }
        if (derivedLabel) {
          input.setAttribute("aria-label", derivedLabel);
          markFixed(input, "aria-label");
        }
      }
    }

    // ── Fix: Autocomplete hints (WCAG 1.3.5) ────────────────────────────
    function fixAutocomplete(scope) {
      var inputs = (scope || document).querySelectorAll(
        "input:not([type='hidden']):not([type='submit']):not([type='button']):not([type='reset']):not([type='checkbox']):not([type='radio']):not([type='file']):not([type='image']):not([type='range']):not([type='color']), select"
      );
      for (var i = 0; i < inputs.length; i++) {
        var input = inputs[i];
        if (isWidgetElement(input)) continue;
        if (input.getAttribute("autocomplete")) continue;
        if (input.getAttribute(FIXED_ATTR) && input.getAttribute(FIXED_ATTR).indexOf("autocomplete") !== -1) continue;

        var identifier = (input.name || input.id || "").toLowerCase().replace(/[-_\s]+/g, "-");
        // Also check common prefixes/suffixes.
        var match = AUTOCOMPLETE_MAP[identifier];
        if (!match) {
          // Try partial matches.
          var keys = Object.keys(AUTOCOMPLETE_MAP);
          for (var k = 0; k < keys.length; k++) {
            if (identifier.indexOf(keys[k]) !== -1) {
              match = AUTOCOMPLETE_MAP[keys[k]];
              break;
            }
          }
        }
        // Also check input type for email/tel.
        if (!match && input.type === "email") match = "email";
        if (!match && input.type === "tel") match = "tel";
        if (!match && input.type === "url") match = "url";
        if (!match && input.type === "date") match = "bday";
        if (!match && input.type === "password") match = "current-password";

        // Infer from placeholder text (e.g. "Enter your email").
        if (!match && input.placeholder) {
          var ph = input.placeholder.toLowerCase();
          if (ph.indexOf("email") !== -1) match = "email";
          else if (ph.indexOf("phone") !== -1 || ph.indexOf("tel") !== -1) match = "tel";
          else if (ph.indexOf("name") !== -1) match = "name";
          else if (ph.indexOf("password") !== -1) match = "current-password";
        }

        if (match) {
          input.setAttribute("autocomplete", match);
          markFixed(input, "autocomplete");
        }
      }
    }

    // ── Fix: Icon-only buttons (WCAG 2.5.3, 4.1.2) ─────────────────────
    function fixIconButtons(scope) {
      var buttons = (scope || document).querySelectorAll("button, [role='button']");
      for (var i = 0; i < buttons.length; i++) {
        var btn = buttons[i];
        if (isWidgetElement(btn)) continue;
        if (btn.getAttribute(FIXED_ATTR) && btn.getAttribute(FIXED_ATTR).indexOf("aria-label") !== -1) continue;
        if (btn.getAttribute("aria-label") || btn.getAttribute("aria-labelledby")) continue;

        // Check if the button has visible text.
        var text = (btn.innerText || "").trim();
        if (text) continue;

        // No text — derive label from title, svg title, or child img alt.
        var label = "";
        if (btn.title && btn.title.trim()) {
          label = btn.title.trim();
        } else {
          var svgTitle = btn.querySelector("svg title");
          if (svgTitle && svgTitle.textContent) {
            label = svgTitle.textContent.trim();
          }
        }
        if (!label) {
          var childImg = btn.querySelector("img[alt]");
          if (childImg && childImg.alt) {
            label = childImg.alt.trim();
          }
        }
        if (!label) {
          // Last resort: use aria-describedby or class name.
          var cls = btn.className;
          if (typeof cls === "string" && cls) {
            // Extract meaningful class tokens.
            var tokens = cls.split(/[\s-_]+/).filter(function (t) {
              return t.length > 2 && !/^(btn|button|icon|svg|fa|bi|material)$/i.test(t);
            });
            if (tokens.length) label = tokens.join(" ");
          }
        }
        if (!label) label = "Button";

        btn.setAttribute("aria-label", label);
        markFixed(btn, "aria-label");
      }
    }

    // ── Fix: Links with no discernible text (WCAG 2.4.4) ────────────────
    function fixEmptyLinks(scope) {
      var links = (scope || document).querySelectorAll("a[href]");
      for (var i = 0; i < links.length; i++) {
        var link = links[i];
        if (isWidgetElement(link)) continue;
        if (link.getAttribute(FIXED_ATTR) && link.getAttribute(FIXED_ATTR).indexOf("aria-label") !== -1) continue;
        if (link.getAttribute("aria-label") || link.getAttribute("aria-labelledby")) continue;

        var text = (link.innerText || "").trim();
        if (text) continue;

        // Check for child images with alt.
        var childImg = link.querySelector("img[alt]");
        if (childImg && childImg.alt && childImg.alt.trim()) continue;

        // Check for title.
        if (link.title && link.title.trim()) {
          link.setAttribute("aria-label", link.title.trim());
        } else {
          // Derive from href.
          var href = link.getAttribute("href") || "";
          if (href && href !== "#" && href !== "javascript:void(0)") {
            var parts = href.replace(/^https?:\/\//, "").split("/");
            var meaningful = parts[parts.length - 1] || parts[0] || "Link";
            meaningful = meaningful.split("?")[0].split("#")[0].replace(/[-_]+/g, " ").trim();
            link.setAttribute("aria-label", meaningful || "Link");
          } else {
            link.setAttribute("aria-label", "Link");
          }
        }
        markFixed(link, "aria-label");
      }
    }

    // ── Fix: Empty headings (WCAG 2.4.6) ────────────────────────────────
    function fixEmptyHeadings(scope) {
      var headings = (scope || document).querySelectorAll("h1, h2, h3, h4, h5, h6");
      for (var i = 0; i < headings.length; i++) {
        var h = headings[i];
        if (isWidgetElement(h)) continue;
        if (h.getAttribute(FIXED_ATTR)) continue;
        var text = (h.innerText || "").trim();
        if (!text && !h.querySelector("img[alt], svg")) {
          h.setAttribute("aria-hidden", "true");
          markFixed(h, "empty-heading");
        }
      }
    }

    // ── Fix: Clickable div/span without keyboard access (WCAG 4.1.2, 2.1.1) ─
    function fixClickableElements(scope) {
      // We only query elements with explicit onclick attributes. 
      // Querying all elements (*) and checking computed styles is too slow for mutation observers.
      var candidates = (scope || document).querySelectorAll("[onclick]");
      for (var i = 0; i < candidates.length; i++) {
        var el = candidates[i];
        if (isWidgetElement(el)) continue;
        if (el.getAttribute(FIXED_ATTR) && el.getAttribute(FIXED_ATTR).indexOf("keyboard-a11y") !== -1) continue;

        var tag = el.tagName ? el.tagName.toUpperCase() : "";
        // Only fix non-interactive elements that have click handlers.
        if (tag === "A" || tag === "BUTTON" || tag === "INPUT" || tag === "SELECT" ||
            tag === "TEXTAREA" || tag === "SUMMARY" || tag === "DETAILS") continue;
        if (el.getAttribute("role") === "button" || el.getAttribute("role") === "link") continue;

        // Must not already be natively focusable.
        if (el.tabIndex >= 0 && el.getAttribute("tabindex") !== null) continue;

        el.setAttribute("role", "button");
        el.setAttribute("tabindex", "0");

        // Add keyboard handler for Enter and Space.
        var handler = function (event) {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            event.target.click();
          }
        };
        el.addEventListener("keydown", handler);
        keyboardHandlers.push({ element: el, handler: handler });

        // Add aria-label if the element has no accessible name.
        if (!el.getAttribute("aria-label") && !el.getAttribute("aria-labelledby")) {
          var labelText = (el.innerText || el.title || "").trim();
          if (labelText && labelText.length < 80) {
            el.setAttribute("aria-label", labelText);
          }
        }

        markFixed(el, "keyboard-a11y");
      }
    }

    // ── Fix: <a> without href acting as button (WCAG 4.1.2) ─────────────
    function fixAnchorButtons(scope) {
      var anchors = (scope || document).querySelectorAll("a:not([href])");
      for (var i = 0; i < anchors.length; i++) {
        var a = anchors[i];
        if (isWidgetElement(a)) continue;
        if (a.getAttribute(FIXED_ATTR)) continue;
        if (a.getAttribute("role")) continue;

        a.setAttribute("role", "button");
        if (!a.getAttribute("tabindex")) {
          a.setAttribute("tabindex", "0");
        }
        markFixed(a, "anchor-button");
      }
    }

    // ── Fix: Missing landmark roles (WCAG 1.3.1) ────────────────────────
    function fixLandmarks() {
      // Only fix if no <main> element or [role="main"] exists.
      if (document.querySelector("main, [role='main']")) return;

      // Heuristic: find the largest content container.
      var candidates = document.querySelectorAll(
        "#content, #main, #main-content, .content, .main, .main-content, article, [class*='content'], [class*='main']"
      );
      var best = null;
      var bestSize = 0;
      for (var i = 0; i < candidates.length; i++) {
        var el = candidates[i];
        if (isWidgetElement(el)) continue;
        if (el.getAttribute(FIXED_ATTR)) continue;
        var size = (el.innerText || "").length;
        if (size > bestSize) {
          bestSize = size;
          best = el;
        }
      }
      if (best && bestSize > 100) {
        best.setAttribute("role", "main");
        if (!best.id) best.id = "allykit-main-content";
        markFixed(best, "landmark");
      }
    }

    // ── Fix: Skip-link target focus (WCAG 2.4.1) ─────────────────────────
    function fixSkipTarget() {
      var target = document.querySelector(
        "main, [role='main'], #main-content, #content, #allykit-main-content"
      );
      if (!target || isWidgetElement(target)) return;
      if (!target.id) target.id = "allykit-main-content";
      if (!target.hasAttribute("tabindex")) {
        target.setAttribute("tabindex", "-1");
        markFixed(target, "skip-target");
      }
    }

    // ── Fix: Skip-to-content link (WCAG 2.4.1) ──────────────────────────
    function fixSkipLink() {
      fixSkipTarget();

      // Check if a skip link already exists.
      if (document.querySelector("." + SKIP_LINK_CLASS)) return;
      var existingSkip = document.querySelector(
        "a[href^='#'][class*='skip'], a[href^='#'][class*='screen-reader'], a[href^='#'].sr-only, a[href^='#'].visually-hidden, a.skip-link"
      );
      if (existingSkip) {
        // Ensure existing skip links are keyboard-visible on focus.
        if (!existingSkip.classList.contains(SKIP_LINK_CLASS)) {
          existingSkip.classList.add(SKIP_LINK_CLASS);
          markFixed(existingSkip, "skip-link");
        }
        return;
      }

      // Find the target.
      var target = document.querySelector(
        "main, [role='main'], #main-content, #content, #allykit-main-content"
      );
      if (!target) return;
      if (!target.id) target.id = "allykit-main-content";

      var skipLink = document.createElement("a");
      skipLink.href = "#" + target.id;
      skipLink.className = SKIP_LINK_CLASS;
      skipLink.textContent = STRINGS.skipToContent;
      skipLink.setAttribute(FIXED_ATTR, "skip-link");

      // Insert as first child of body.
      if (document.body.firstChild) {
        document.body.insertBefore(skipLink, document.body.firstChild);
      } else {
        document.body.appendChild(skipLink);
      }
      fixedCount += 1;
    }

    // ── Fix: Missing lang on <html> (WCAG 3.1.1) ────────────────────────
    function fixLang() {
      var html = document.documentElement;
      if (html.getAttribute("lang")) return;

      html.setAttribute("lang", config.autoFixLang || "en");
      html.setAttribute(FIXED_ATTR, "lang");
      fixedCount += 1;
    }

    // ── Fix: Non-focusable interactive elements (WCAG 2.1.1) ────────────
    function fixFocusability(scope) {
      // Elements with certain roles that must be keyboard-focusable.
      var roleElements = (scope || document).querySelectorAll(
        "[role='button']:not([tabindex]), [role='link']:not([tabindex]), [role='tab']:not([tabindex]), [role='menuitem']:not([tabindex])"
      );
      for (var i = 0; i < roleElements.length; i++) {
        var el = roleElements[i];
        if (isWidgetElement(el)) continue;
        if (el.getAttribute(FIXED_ATTR) && el.getAttribute(FIXED_ATTR).indexOf("focusable") !== -1) continue;

        var tag = el.tagName ? el.tagName.toUpperCase() : "";
        if (tag === "A" || tag === "BUTTON" || tag === "INPUT" || tag === "SELECT" || tag === "TEXTAREA") continue;

        el.setAttribute("tabindex", "0");
        markFixed(el, "focusable");
      }
    }

    /**
     * Pick #000 or #fff whichever meets WCAG AA against the background.
     */
    function pickContrastingText(bgHex, isLargeText) {
      var threshold = isLargeText ? 3 : 4.5;
      if (contrastRatio("000000", bgHex) >= threshold) return "#000000";
      if (contrastRatio("ffffff", bgHex) >= threshold) return "#ffffff";
      return contrastRatio("000000", bgHex) >= contrastRatio("ffffff", bgHex) ? "#000000" : "#ffffff";
    }

    // ── Fix: Low contrast text (WCAG 1.4.3 / 1.4.6) ─────────────────────
    function fixLowContrast(scope) {
      var elements = (scope || document).querySelectorAll(TEXT_SELECTOR);
      var limit = Math.min(elements.length, 500);
      for (var i = 0; i < limit; i++) {
        var el = elements[i];
        if (isWidgetElement(el)) continue;
        if (el.hasAttribute("data-allykit-contrast-fixed")) continue;
        if (!el.textContent || !el.textContent.trim()) continue;

        el.setAttribute("data-allykit-contrast-fixed", "true");

        try {
          var style = window.getComputedStyle(el);
          var bgHex = getEffectiveBackground(el);
          if (!bgHex) continue;

          var fontSize = parseFloat(style.fontSize);
          var isBold = parseInt(style.fontWeight, 10) >= 700 || style.fontWeight === "bold";
          var isLargeText = fontSize >= 24 || (fontSize >= 18.66 && isBold);
          var threshold = isLargeText ? 3 : 4.5;

          var fgHex = colorToHex(style.color);
          var ratio = fgHex ? contrastRatio(fgHex, bgHex) : 0;

          // Gradient / image backgrounds often return no reliable ratio.
          var bgImage = style.backgroundImage;
          var hasComplexBg = bgImage && bgImage !== "none";
          if (hasComplexBg && ratio < threshold) {
            el.style.setProperty("background-color", "#" + bgHex, "important");
            el.style.setProperty("padding", "2px 4px", "important");
            ratio = fgHex ? contrastRatio(fgHex, bgHex) : 0;
          }

          if (ratio >= threshold) continue;

          var better = pickContrastingText(bgHex, isLargeText);
          el.style.setProperty("color", better, "important");
          markFixed(el, "contrast");
        } catch (e) { /* getComputedStyle can fail in exotic contexts */ }
      }
    }

    // ── Warning: remaining contrast issues we cannot safely auto-fix ─────
    function checkContrast(scope) {
      // We only warn — we don't auto-fix contrast because it would break branding.
      var elements = (scope || document).querySelectorAll(TEXT_SELECTOR);
      var limit = Math.min(elements.length, 200);
      var warned = new Set();
      for (var i = 0; i < limit; i++) {
        var el = elements[i];
        if (isWidgetElement(el)) continue;
        if (el.hasAttribute("data-allykit-contrast-warned")) continue;
        if (!el.textContent || !el.textContent.trim()) continue;
        
        el.setAttribute("data-allykit-contrast-warned", "true");
        
        try {
          var style = window.getComputedStyle(el);
          var fgHex = colorToHex(style.color);
          var bgHex = getEffectiveBackground(el);
          if (!fgHex || !bgHex) continue;

          var ratio = contrastRatio(fgHex, bgHex);
          var fontSize = parseFloat(style.fontSize);
          var isBold = parseInt(style.fontWeight, 10) >= 700 || style.fontWeight === "bold";
          var isLargeText = fontSize >= 24 || (fontSize >= 18.66 && isBold);

          // WCAG AA thresholds.
          var threshold = isLargeText ? 3 : 4.5;
          if (ratio < threshold) {
            var selector = el.tagName.toLowerCase();
            if (el.id) selector += "#" + el.id;
            else if (el.className && typeof el.className === "string") selector += "." + el.className.split(" ")[0];
            if (!warned.has(selector)) {
              warned.add(selector);
              warnings.push(
                "Low contrast (" + ratio.toFixed(2) + ":1) on <" + selector + ">. " +
                "WCAG AA requires " + threshold + ":1" + (isLargeText ? " for large text" : "") + "."
              );
            }
          }
        } catch (e) { /* getComputedStyle can fail in exotic contexts */ }
      }
    }

    /**
     * Parse a CSS color string (rgb/rgba) to 6-char hex.
     */
    function colorToHex(color) {
      if (!color) return null;
      var match = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
      if (!match) return null;
      return (
        parseInt(match[1], 10).toString(16).padStart(2, "0") +
        parseInt(match[2], 10).toString(16).padStart(2, "0") +
        parseInt(match[3], 10).toString(16).padStart(2, "0")
      );
    }

    /**
     * Walk up the DOM to find the first opaque background colour.
     */
    function getEffectiveBackground(el) {
      var current = el;
      while (current && current !== document.documentElement) {
        try {
          var bg = window.getComputedStyle(current).backgroundColor;
          if (bg && bg !== "rgba(0, 0, 0, 0)" && bg !== "transparent") {
            return colorToHex(bg);
          }
        } catch (e) { break; }
        current = current.parentElement;
      }
      return "ffffff"; // Default to white.
    }

    /**
     * Calculate WCAG contrast ratio between two 6-char hex values.
     */
    function contrastRatio(hex1, hex2) {
      var rgb1 = hexToRgb(hex1);
      var rgb2 = hexToRgb(hex2);
      var l1 = luminance(rgb1.r, rgb1.g, rgb1.b);
      var l2 = luminance(rgb2.r, rgb2.g, rgb2.b);
      var lighter = Math.max(l1, l2);
      var darker = Math.min(l1, l2);
      return (lighter + 0.05) / (darker + 0.05);
    }

    // ── Public API ───────────────────────────────────────────────────────

    // ── Fix: Broken aria-labelledby / aria-describedby / aria-owns references ─────────
    function fixAriaReferences(scope) {
      var nodes = (scope || document).querySelectorAll("[aria-labelledby], [aria-describedby], [aria-owns], [aria-controls], [aria-flowto], [aria-activedescendant], [aria-errormessage]");
      for (var i = 0; i < nodes.length; i++) {
        var node = nodes[i];
        if (isWidgetElement(node)) continue;
        var attrNames = ["aria-labelledby", "aria-describedby", "aria-owns", "aria-controls", "aria-flowto", "aria-activedescendant", "aria-errormessage"];
        for (var a = 0; a < attrNames.length; a++) {
          var attr = attrNames[a];
          var val = node.getAttribute(attr);
          if (!val) continue;
          var parts = val.split(/\s+/).filter(Boolean);
          var valid = parts.filter(function (id) { return !!document.getElementById(id); });
          if (valid.length === parts.length) continue;
          if (valid.length) {
            node.setAttribute(attr, valid.join(" "));
          } else {
            node.removeAttribute(attr);
          }
          markFixed(node, "aria-ref");
        }
      }
    }

    // ── Fix: SVG images missing role="img" ─────────────────────────────────
    function fixSvgImages(scope) {
      var svgs = (scope || document).querySelectorAll("svg");
      for (var i = 0; i < svgs.length; i++) {
        var svg = svgs[i];
        if (isWidgetElement(svg)) continue;
        if (svg.getAttribute("role")) continue;
        // If SVG has aria-label, aria-labelledby, or a title child, it's an image
        if (
          svg.getAttribute("aria-label") || 
          svg.getAttribute("aria-labelledby") || 
          svg.querySelector("title")
        ) {
          svg.setAttribute("role", "img");
          markFixed(svg, "svg-role");
        }
      }
    }

    // ── Fix: External links without rel="noopener noreferrer" ────────────────
    function fixExternalLinks(scope) {
      var links = (scope || document).querySelectorAll("a[href]");
      for (var i = 0; i < links.length; i++) {
        var link = links[i];
        if (isWidgetElement(link)) continue;
        var href = link.getAttribute("href");
        if (!href) continue;
        if (href.startsWith("http://") || href.startsWith("https://")) {
          var rel = link.getAttribute("rel") || "";
          var relParts = rel.split(/\s+/).filter(Boolean);
          var hasNoopener = relParts.indexOf("noopener") !== -1;
          var hasNoreferrer = relParts.indexOf("noreferrer") !== -1;
          if (!hasNoopener) relParts.push("noopener");
          if (!hasNoreferrer) relParts.push("noreferrer");
          if (relParts.length > (rel ? rel.split(/\s+/).filter(Boolean).length : 0)) {
            link.setAttribute("rel", relParts.join(" "));
            markFixed(link, "external-link");
          }
        }
      }
    }

    /**
     * Scan and fix all detectable WCAG issues in the given scope (or full document).
     */
    function scanAndFix(scope) {
      if (config.autoFix === false) return;

      fixLang();
      if (!scope) {
        fixDuplicateIds();
        fixExtraLandmarks();
      }
      fixInvalidAria(scope);
      fixLabelIssues(scope);
      fixImages(scope);
      fixFormInputs(scope);
      fixAutocomplete(scope);
      fixIconButtons(scope);
      fixEmptyLinks(scope);
      fixEmptyHeadings(scope);
      fixClickableElements(scope);
      fixAnchorButtons(scope);
      fixFocusability(scope);
      fixListStructure(scope);
      fixAriaReferences(scope);
      fixSvgImages(scope);
      fixExternalLinks(scope);

      // Full-document-only fixes (don't re-run on scoped mutations).
      if (!scope) {
        fixLandmarks();
        fixSkipLink();
        fixLowContrast();
        checkContrast();
      }

      // Log warnings to console.
      if (warnings.length > 0) {
        console.groupCollapsed(
          "[AllyKit] WCAG contrast warnings (" + warnings.length + ")"
        );
        for (var w = 0; w < warnings.length; w++) {
          console.warn(warnings[w]);
        }
        console.groupEnd();
      }
    }

    /**
     * Revert all applied fixes — removes attributes, elements, and keyboard listeners.
     */
    function revert() {
      // Remove skip link.
      var skipLinks = document.querySelectorAll("." + SKIP_LINK_CLASS);
      for (var s = 0; s < skipLinks.length; s++) {
        skipLinks[s].remove();
      }

      // Remove lang fix.
      var html = document.documentElement;
      if (html.getAttribute(FIXED_ATTR) === "lang") {
        html.removeAttribute("lang");
        html.removeAttribute(FIXED_ATTR);
      }

      // Remove all data-allykit-fixed elements' added attributes.
      var fixedElements = document.querySelectorAll("[" + FIXED_ATTR + "]");
      for (var i = 0; i < fixedElements.length; i++) {
        var el = fixedElements[i];
        var fixes = (el.getAttribute(FIXED_ATTR) || "").split(" ");
        for (var f = 0; f < fixes.length; f++) {
          switch (fixes[f]) {
            case "alt":
              el.removeAttribute("alt");
              el.removeAttribute("role");
              break;
            case "img-role":
            case "svg-role":
              el.removeAttribute("role");
              break;
            case "aria-label":
              el.removeAttribute("aria-label");
              break;
            case "autocomplete":
              el.removeAttribute("autocomplete");
              break;
            case "empty-heading":
              el.removeAttribute("aria-hidden");
              break;
            case "empty-list-item":
              el.removeAttribute("aria-hidden");
              break;
            case "duplicate-id":
              break;
            case "duplicate-label":
              break;
            case "redundant-role":
            case "redundant-aria":
            case "invalid-aria":
              break;
            case "aria-ref":
              break;
            case "contrast":
              el.style.removeProperty("color");
              el.style.removeProperty("background-color");
              el.style.removeProperty("padding");
              break;
            case "landmark-demotion":
              if (el.getAttribute("role") === "presentation") {
                el.removeAttribute("role");
              }
              break;
            case "list-wrap":
              break;
            case "skip-target":
              el.removeAttribute("tabindex");
              break;
            case "skip-link":
              if (el.classList) el.classList.remove(SKIP_LINK_CLASS);
              break;
            case "keyboard-a11y":
              el.removeAttribute("role");
              el.removeAttribute("tabindex");
              el.removeAttribute("aria-label");
              break;
            case "anchor-button":
              el.removeAttribute("role");
              el.removeAttribute("tabindex");
              break;
            case "landmark":
              el.removeAttribute("role");
              if (el.id === "allykit-main-content") el.removeAttribute("id");
              break;
            case "focusable":
              el.removeAttribute("tabindex");
              break;
            case "external-link":
              var rel = el.getAttribute("rel") || "";
              var relParts = rel.split(/\s+/).filter(function(part) {
                return part !== "noopener" && part !== "noreferrer";
              });
              if (relParts.length > 0) {
                el.setAttribute("rel", relParts.join(" "));
              } else {
                el.removeAttribute("rel");
              }
              break;
          }
        }
        el.removeAttribute(FIXED_ATTR);
      }

      var contrastFixed = document.querySelectorAll("[data-allykit-contrast-fixed]");
      for (var c = 0; c < contrastFixed.length; c++) {
        contrastFixed[c].removeAttribute("data-allykit-contrast-fixed");
      }
      var contrastWarned = document.querySelectorAll("[data-allykit-contrast-warned]");
      for (var c = 0; c < contrastWarned.length; c++) {
        contrastWarned[c].removeAttribute("data-allykit-contrast-warned");
      }

      // Remove keyboard handlers.
      for (var k = 0; k < keyboardHandlers.length; k++) {
        var ref = keyboardHandlers[k];
        ref.element.removeEventListener("keydown", ref.handler);
      }
      keyboardHandlers = [];
      fixedCount = 0;
      warnings = [];
    }

    /**
     * Returns a summary of fixes applied.
     */
    function getReport() {
      return {
        fixed: fixedCount,
        warnings: warnings.slice()
      };
    }

    return {
      scanAndFix: scanAndFix,
      revert: revert,
      getReport: getReport
    };
  }());

  // State is a flat object of primitives, so a shallow clone is correct and cheaper than JSON round-trips.
  function cloneState(value) {
    return Object.assign({}, value);
  }

  function loadState() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return cloneState(defaultState);
      const parsed = JSON.parse(stored);
      // Migration: drop deprecated keys.
      delete parsed.dark;
      delete parsed.highlightColor;
      return Object.assign({}, defaultState, parsed);
    } catch (error) {
      return cloneState(defaultState);
    }
  }

  function saveState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (error) {
      // Storage can be unavailable in private or locked-down browser contexts.
    }
  }

  function icon(name) {
    return (
      '<svg class="allykit-icon" data-material-icon="' +
      name +
      '" aria-hidden="true" focusable="false" viewBox="0 0 24 24">' +
      (icons[name] || icons.accessibility_new) +
      "</svg>"
    );
  }

  function createElement(tag, className, attributes) {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (attributes) {
      for (const key in attributes) element.setAttribute(key, attributes[key]);
    }
    return element;
  }

  // Clears the JS-applied text zoom from every top-level page element.
  function clearZoom() {
    document.querySelectorAll(TOP_LEVEL_SELECTOR).forEach(function (el) {
      el.style.zoom = "";
    });
  }

  // System fallback used only when the host page's font can't be resolved.
  const FALLBACK_FONT = 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif';

  // Returns true when a font-family stack starts with a real, authored family rather than the
  // browser's UA default. Unstyled pages report "Times New Roman"/"serif" for body text, which
  // we want to look past so the widget doesn't inherit an accidental default.
  function isAuthoredFont(family) {
    if (!family) return false;
    const first = family.split(",")[0].trim().replace(/^["']|["']$/g, "").toLowerCase();
    return first !== "" && first !== "times new roman" && first !== "times" && first !== "serif";
  }

  // Resolves the host page's font so the widget adapts to the site's typography.
  // Sites set their font in many places (sometimes <body>/<html>, often a wrapper or the text
  // elements themselves), so body alone is unreliable â€” reading it on a page that styles a
  // wrapper instead yields the UA default ("Times New Roman"). Strategy:
  //   1. Use <body>/<html> if either declares an authored font.
  //   2. Otherwise sample real text elements and take the most common authored font; body text
  //      dominates the tally, which is what the widget's buttons and labels should match.
  //   3. Fall back to a clean system stack rather than the UA serif.
  // getComputedStyle returns the declared family list whether or not the web font has finished
  // downloading, so this is accurate as soon as the page's CSS has applied.
  function getPageFontFamily() {
    try {
      const body = document.body;
      const bodyFont = body && window.getComputedStyle(body).fontFamily;
      if (isAuthoredFont(bodyFont)) return bodyFont.trim();

      const htmlFont = window.getComputedStyle(document.documentElement).fontFamily;
      if (isAuthoredFont(htmlFont)) return htmlFont.trim();

      const counts = Object.create(null);
      let winner = null;
      let winnerCount = 0;
      const nodes = document.querySelectorAll(TEXT_SELECTOR);
      const limit = Math.min(nodes.length, 250);
      for (let i = 0; i < limit; i += 1) {
        const el = nodes[i];
        if (root && root.contains(el)) continue;
        if (!el.textContent || !el.textContent.trim()) continue;
        const family = window.getComputedStyle(el).fontFamily;
        if (!isAuthoredFont(family)) continue;
        const key = family.trim();
        counts[key] = (counts[key] || 0) + 1;
        if (counts[key] > winnerCount) {
          winnerCount = counts[key];
          winner = key;
        }
      }
      if (winner) return winner;
    } catch (error) {
      // getComputedStyle can throw in detached/exotic contexts; fall through to the default.
    }
    return FALLBACK_FONT;
  }

  // Applies the resolved page font to the widget host.
  // The page-level `#allykit-root { all: initial !important }` reset (needed to isolate the
  // host from page styles) also forces the host's font-family to the UA default â€” Times New Roman
  // in Chrome â€” which then leaks into the shadow tree because every node uses `font-family: inherit`.
  // That reset is `!important` with ID specificity, so a shadow `:host` rule can't override it.
  // An *inline* `!important` declaration is the highest-priority author rule and does win, so we set
  // the font directly on the host element here. The custom property is kept so the `:host` rule still
  // works on pages without the reset, and so the value stays updatable from one place.
  function applyHostFont() {
    if (!root) return;
    const font = getPageFontFamily();
    root.style.setProperty("--ak-host-font", font);
    root.style.setProperty("font-family", font, "important");
  }

  function injectPageStyles() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = getPageStyles();
    document.head.appendChild(style);
  }

  // â”€â”€ Data-driven high-contrast levels 1â€“3 (level 4 is a structurally different dark theme) â”€â”€
  const HC_LEVELS = [
    { bg: "#000000", fg: "#ffffff", border: "#ffffff", link: "#6db3f8", img: "contrast(1.2)", focus: "#ffff68", control: "2px solid #ffffff" },
    { bg: "#000000", fg: "#ffffff", border: "#ffffff", link: "#ffffff", linkThickness: "2px", img: "contrast(1.4) brightness(1.1)", focus: "#ffff68", control: "2px solid #ffffff" },
    { bg: "#000000", fg: "#ffff68", border: "#ffff68", link: "#80d8ff", linkThickness: "2px", img: "contrast(1.4) brightness(1.1)", focus: "#ff4081", control: "2px solid #ffff68" }
  ];

  function highContrastBlock(level, c) {
    const sel = "body.allykit-high-contrast-" + level;
    const notRoot = ":not(#" + ROOT_ID + ")";
    const thickness = c.linkThickness ? "text-decoration-thickness: " + c.linkThickness + " !important;\n        " : "";
    return `
      ${sel},
      ${sel} *:not(#${ROOT_ID}):not(#${MASK_ID}) {
        background-color: ${c.bg} !important;
        color: ${c.fg} !important;
        border-color: ${c.border} !important;
        text-shadow: none !important;
        box-shadow: none !important;
      }
      ${sel} a${notRoot} {
        color: ${c.link} !important;
        text-decoration: underline !important;
        ${thickness}text-underline-offset: 3px !important;
      }
      ${sel} img${notRoot}, ${sel} svg${notRoot} {
        filter: ${c.img} !important;
      }
      ${sel} *:focus-visible${notRoot} {
        outline: 3px solid ${c.focus} !important;
        outline-offset: 3px !important;
      }
      ${sel} button${notRoot}, ${sel} input${notRoot}, ${sel} select${notRoot}, ${sel} textarea${notRoot} {
        border: ${c.control} !important;
      }`;
  }

  // letter/word-spacing pairs and line-height multipliers, generated rather than hand-repeated.
  const TEXT_SPACING = [["0.08em", "0.16em"], ["0.12em", "0.24em"], ["0.16em", "0.32em"]];
  const LINE_HEIGHTS = ["1.5", "1.8", "2"];

  function getPageStyles() {
    const highContrast = HC_LEVELS.map(function (c, i) {
      return highContrastBlock(i + 1, c);
    }).join("\n");

    const spacing = TEXT_SPACING.map(function (pair, i) {
      return `body.allykit-text-spacing-${i + 1} :where(${TEXT_SELECTOR}) {
        letter-spacing: ${pair[0]} !important;
        word-spacing: ${pair[1]} !important;
      }`;
    }).join("\n      ");

    const lineHeight = LINE_HEIGHTS.map(function (value, i) {
      return `body.allykit-line-height-${i + 1} :where(${TEXT_SELECTOR}) { line-height: ${value} !important; }`;
    }).join("\n      ");

    return `
      @font-face {
        font-family: "Open-Dyslexic";
        font-style: normal;
        font-weight: 400;
        src: url("https://www.globalimebank.com/blog/wp-content/ally/open-dyslexic.woff") format("woff");
      }

      #${ROOT_ID} {
        all: initial !important;
        color-scheme: light !important;
        position: relative !important;
        z-index: 2147483000 !important;
      }

      /* Text zoom is applied via the JavaScript zoom property. */

      ${spacing}

      ${lineHeight}

      body.allykit-dyslexia :where(${TEXT_SELECTOR}) {
        font-family: "Open-Dyslexic", Arial, system-ui, sans-serif !important;
      }

      /* â”€â”€ High Contrast levels 1â€“3 (generated from HC_LEVELS) â”€â”€ */
      ${highContrast}

      /* â”€â”€ High Contrast Level 4: Dark Mode (WCAG AA compliant dark theme) â”€â”€ */
      body.allykit-high-contrast-4 {
        color-scheme: dark !important;
        background: #121212 !important;
        color: #e0e0e0 !important;
      }
      body.allykit-high-contrast-4 *:not(#${ROOT_ID}):not(#${MASK_ID}) {
        background-color: #1e1e1e !important;
        color: #e0e0e0 !important;
        border-color: #444444 !important;
      }
      body.allykit-high-contrast-4 a:not(#${ROOT_ID}) {
        color: #82b1ff !important;
        text-decoration: underline !important;
        text-underline-offset: 3px !important;
      }
      body.allykit-high-contrast-4 *:focus-visible:not(#${ROOT_ID}) {
        outline: 3px solid #ffdd57 !important;
        outline-offset: 3px !important;
      }
      body.allykit-high-contrast-4 button:not(#${ROOT_ID}),
      body.allykit-high-contrast-4 input:not(#${ROOT_ID}),
      body.allykit-high-contrast-4 select:not(#${ROOT_ID}),
      body.allykit-high-contrast-4 textarea:not(#${ROOT_ID}) {
        border: 1px solid #555555 !important;
      }
      body.allykit-high-contrast-4 img:not(#${ROOT_ID}) {
        opacity: 0.88 !important;
      }

      html.allykit-filter-active body > :not(#${ROOT_ID}):not(#${MASK_ID}) {
        filter: var(--allykit-page-filter) !important;
      }

      body.allykit-highlight-links a:not(#${ROOT_ID}) {
        background-color: #ffff68 !important;
        color: #111 !important;
        outline: 2px solid #111 !important;
        outline-offset: 2px !important;
        text-decoration: underline !important;
        text-decoration-thickness: 0.18em !important;
      }

      body.allykit-hide-images img:not(#${ROOT_ID}),
      body.allykit-hide-images picture:not(#${ROOT_ID}),
      body.allykit-hide-images video[poster]:not(#${ROOT_ID}) {
        visibility: hidden !important;
      }
      body.allykit-hide-images,
      body.allykit-hide-images *:not(#${ROOT_ID}):not(#${MASK_ID}) {
        background-image: none !important;
      }

      body.allykit-pause-animation,
      body.allykit-pause-animation::before,
      body.allykit-pause-animation::after,
      body.allykit-pause-animation *:not(#${ROOT_ID}),
      body.allykit-pause-animation *:not(#${ROOT_ID})::before,
      body.allykit-pause-animation *:not(#${ROOT_ID})::after {
        animation-delay: 0s !important;
        animation-duration: 0.001ms !important;
        animation-iteration-count: 1 !important;
        scroll-behavior: auto !important;
        transition-delay: 0s !important;
        transition-duration: 0.001ms !important;
      }

      body.allykit-big-cursor,
      body.allykit-big-cursor *:not(#${ROOT_ID}) {
        cursor: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='48' height='48' viewBox='0 0 48 48'%3E%3Cpath fill='%23fff' stroke='%23000' stroke-width='2.8' d='M8 4 38 27 24.5 30.5 31 44 24 47 17.8 33.7 8 43z'/%3E%3C/svg%3E") 4 4, auto !important;
      }

      .allykit-adhd-mask {
        --allykit-adhd-y: 50vh;
        display: none;
        position: fixed;
        inset: 0;
        z-index: 2147482000;
        pointer-events: none;
        mix-blend-mode: multiply;
        transition: background-position 0.05s;
        filter: saturate(0.5) !important;
        background:
          linear-gradient(
            to bottom,
            hsla(0, 0%, 0%, 0.7) 0%,
            rgba(0, 0, 0, 0.7) calc(var(--allykit-adhd-y) - 80px),
            transparent calc(var(--allykit-adhd-y) - 80px),
            transparent calc(var(--allykit-adhd-y) + 80px),
            rgba(0, 0, 0, 0.7) calc(var(--allykit-adhd-y) + 80px),
            rgba(0, 0, 0, 0.7) 100%
          );
      }
      body.allykit-adhd .allykit-adhd-mask {
        display: block;
      }
      .allykit-adhd-mask::before,
      .allykit-adhd-mask::after {
        content: "";
        position: absolute;
        left: 0;
        width: 100%;
        height: 6px;
        pointer-events: none;
      }
      .allykit-adhd-mask::before {
        top: calc(var(--allykit-adhd-y) - 80px);
        background-color: #6f339d;
      }
      .allykit-adhd-mask::after {
        top: calc(var(--allykit-adhd-y) + 80px);
        background-color: #11298b;
      }
      body.allykit-adhd {
        --allykit-page-focus-outline: #ffff68;
      }
      body.allykit-adhd *:not(#${ROOT_ID}):not(#${MASK_ID}) {
        transition: filter 0.5s ease;
      }
      body.allykit-adhd :focus-visible:not(#${ROOT_ID}) {
        outline: 3px solid var(--allykit-page-focus-outline) !important;
        outline-offset: 4px !important;
      }

      /* ── Skip-to-content link (injected by auto-fixer) ── */
      .allykit-skip-link {
        position: absolute;
        left: -9999px;
        top: auto;
        width: 1px;
        height: 1px;
        overflow: hidden;
        z-index: 2147483647;
        font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif;
      }
      .allykit-skip-link:focus {
        position: fixed;
        top: 10px;
        left: 10px;
        width: auto;
        height: auto;
        padding: 12px 24px;
        background: #000;
        color: #fff;
        font-size: 16px;
        font-weight: 700;
        z-index: 2147483647;
        border-radius: 6px;
        text-decoration: none;
        outline: 3px solid #ffff68;
        outline-offset: 2px;
      }
    `;
  }

  function getWidgetStyles() {
    const side = config.position === "left" ? "left" : "right";
    const oppositeSide = side === "left" ? "right" : "left";

    return `
      :host {
        all: initial;
        --ak-primary:              ${palette.primary};
        --ak-on-primary:           ${palette.onPrimary};
        --ak-primary-container:    ${palette.primaryContainer};
        --ak-on-primary-container: ${palette.onPrimaryContainer};
        --ak-secondary: #526070;
        --ak-tertiary: #695779;
        --ak-surface: #fbfcff;
        --ak-surface-container: #eef3f8;
        --ak-surface-container-high: #e7edf4;
        --ak-on-surface: #181c20;
        --ak-on-surface-variant: #404852;
        --ak-outline: #707984;
        --ak-outline-variant: #c0c8d2;
        --ak-shadow: rgba(0, 0, 0, 0.22);
        --ak-radius: 12px;
        --ak-focus:           ${palette.primary};
        color-scheme: light;
        /* Resolved from the host page at runtime via applyHostFont(); inherited by every child. */
        font-family: var(--ak-host-font, ${FALLBACK_FONT});
        /* Page-immune type anchor. The widget sizes its text in em, NOT rem: rem ignores the
           shadow boundary and resolves against the host page's <html> font-size, so any site that
           sets a small root size (e.g. html { font-size: 62.5% }) would shrink every label here.
           "medium" is the user's browser default â€” independent of the page â€” so em keeps the panel
           readable everywhere while still honoring the visitor's own font-size preference. */
        font-size: medium;
      }

      * {
        box-sizing: border-box;
        font-family: inherit;
      }

      .allykit-shell {
        position: fixed;
        z-index: 2147483001;
        bottom: ${config.buttonOffset};
        ${side}: ${config.buttonOffset};
        color: var(--ak-on-surface);
      }

      /* â”€â”€ FAB Button â”€â”€ */
      .allykit-fab {
        width: 58px;
        height: 58px;
        border: 0;
        border-radius: 16px;
        display: inline-flex;
        flex-direction: row;
        align-items: center;
        justify-content: flex-start;
        gap: 0;
        padding: 0 14px;
        overflow: hidden;
        white-space: nowrap;
        background: var(--ak-primary);
        color: var(--ak-on-primary);
        box-shadow: 0 4px 14px var(--ak-shadow);
        cursor: pointer;
        transition: width 200ms cubic-bezier(0.4, 0, 0.2, 1), transform 160ms ease, box-shadow 160ms ease, background-color 160ms ease;
      }

      .allykit-fab:hover,
      .allykit-fab:focus-visible {
        width: 190px;
        transform: translateY(-2px);
        box-shadow: 0 8px 22px var(--ak-shadow);
      }

      .allykit-fab__content {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        justify-content: center;
        opacity: 0;
        padding-left: 10px;
        transition: opacity 150ms ease;
      }

      .allykit-fab:hover .allykit-fab__content,
      .allykit-fab:focus-visible .allykit-fab__content {
        opacity: 1;
        transition-delay: 50ms;
      }

      .allykit-fab__label {
        font-size: 1.0em;
        font-weight: 700;
        line-height: 1.2;
      }

      .allykit-fab__shortcut {
        font-size: 0.65em;
        line-height: 1;
        font-weight: 600;
        letter-spacing: 0.02em;
        opacity: 0.85;
        color: var(--ak-on-primary);
        pointer-events: none;
        white-space: nowrap;
      }

      .allykit-fab:focus-visible,
      .allykit-icon-button:focus-visible,
      .allykit-tool:focus-visible {
        outline: 3px solid var(--ak-focus);
        outline-offset: 3px;
      }

      .allykit-fab .allykit-icon {
        width: 30px;
        height: 30px;
        display: block;
        flex-shrink: 0;
      }

      /* â”€â”€ Panel â”€â”€ */
      .allykit-panel {
        position: fixed;
        z-index: 2147483002;
        inset-block: 20px;
        ${side}: 20px;
        ${oppositeSide}: auto;
        width: min(${config.panelWidth}, calc(100vw - 32px));
        max-height: calc(100vh - 40px);
        display: grid;
        grid-template-rows: auto 1fr;
        background: var(--ak-surface);
        color: var(--ak-on-surface);
        border: 1px solid var(--ak-outline-variant);
        border-radius: 16px;
        box-shadow: 0 18px 46px rgba(0, 0, 0, 0.28);
        overflow: hidden;
        opacity: 0;
        visibility: hidden;
        transform: translateX(${side === "right" ? "18px" : "-18px"});
        transition: opacity 180ms ease, transform 180ms ease, visibility 180ms ease;
      }

      .allykit-panel[data-open="true"] {
        opacity: 1;
        visibility: visible;
        transform: translateX(0);
      }

      /* â”€â”€ Header â”€â”€ */
      .allykit-header {
        min-height: 64px;
        display: grid;
        grid-template-columns: auto minmax(0, 1fr) auto auto auto;
        gap: 10px;
        align-items: center;
        padding: 10px 14px;
        background: var(--ak-surface-container);
        border-bottom: 1px solid var(--ak-outline-variant);
      }

      .allykit-title-icon {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        background: var(--ak-primary);
        color: var(--ak-on-primary);
      }

      .allykit-title {
        margin: 0;
        font-size: 1.05em;
        line-height: 1.2;
        font-weight: 700;
        letter-spacing: 0;
      }

      .allykit-badge {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 4px;
        padding: 2px 10px;
        border-radius: 999px;
        background: var(--ak-primary-container);
        color: var(--ak-on-primary-container);
        font-size: 0.68em;
        font-weight: 700;
        line-height: 1.3;
        white-space: nowrap;
        opacity: 0;
        transform: scale(0.8);
        transition: opacity 300ms ease, transform 300ms ease;
      }

      .allykit-badge[data-visible="true"] {
        opacity: 1;
        transform: scale(1);
      }

      .allykit-badge .allykit-icon {
        width: 14px;
        height: 14px;
      }

      .allykit-icon-button {
        width: 42px;
        height: 42px;
        border: 0;
        border-radius: 50%;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        background: transparent;
        color: var(--ak-on-surface-variant);
        cursor: pointer;
      }

      .allykit-icon-button:hover {
        background: var(--ak-surface-container-high);
        color: var(--ak-on-surface);
      }

      .allykit-reset-button {
        width: auto;
        min-width: 88px;
        height: 38px;
        gap: 6px;
        padding: 0 12px;
        border-radius: 20px;
        background: var(--ak-primary-container);
        color: var(--ak-on-primary-container);
        font-weight: 700;
      }

      .allykit-icon {
        width: 22px;
        height: 22px;
        display: block;
        fill: currentColor;
        flex: 0 0 auto;
      }

      /* â”€â”€ Body & Grid â”€â”€ */
      .allykit-body {
        overflow: auto;
        padding: 16px;
        scrollbar-width: thin;
      }

      .allykit-grid {
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 10px;
      }

      /* â”€â”€ Feature Tool Cards â”€â”€ */
      .allykit-tool {
        min-height: 108px;
        border: 1px solid var(--ak-outline-variant);
        border-radius: var(--ak-radius);
        background: var(--ak-surface-container);
        color: var(--ak-on-surface);
        display: grid;
        grid-template-rows: auto 1fr auto;
        align-items: center;
        justify-items: center;
        gap: 6px;
        padding: 12px 10px;
        cursor: pointer;
        text-align: center;
        font: inherit;
        transition: background-color 150ms ease, border-color 150ms ease, box-shadow 150ms ease;
      }

      .allykit-tool:hover {
        background: color-mix(in srgb, var(--ak-primary) 6%, var(--ak-surface-container));
        border-color: var(--ak-primary);
      }

      .allykit-tool[data-active="true"] {
        background: var(--ak-primary-container);
        border-color: var(--ak-primary);
        box-shadow: inset 0 0 0 1px var(--ak-primary);
      }

      .allykit-tool__icon {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        background: color-mix(in srgb, var(--ak-primary) 12%, transparent);
        color: var(--ak-primary);
      }

      .allykit-tool[data-active="true"] .allykit-tool__icon {
        background: var(--ak-primary);
        color: var(--ak-on-primary);
      }

      .allykit-tool__label {
        min-height: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 0.84em;
        line-height: 1.25;
        font-weight: 650;
        letter-spacing: 0;
      }

      .allykit-tool__state {
        min-height: 18px;
        font-size: 0.72em;
        line-height: 1.2;
        color: var(--ak-on-surface-variant);
        font-weight: 600;
      }

      .allykit-tool[data-active="true"] .allykit-tool__state {
        color: var(--ak-on-primary-container);
      }

      .allykit-steps {
        min-height: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 4px;
      }

      .allykit-step {
        width: 18px;
        height: 6px;
        border-radius: 999px;
        background: var(--ak-outline-variant);
      }

      .allykit-step[data-active="true"] {
        background: var(--ak-primary);
      }

      .allykit-sr-only {
        position: absolute;
        width: 1px;
        height: 1px;
        padding: 0;
        margin: -1px;
        overflow: hidden;
        clip: rect(0, 0, 0, 0);
        white-space: nowrap;
        border: 0;
      }

      /* â”€â”€ Tablet breakpoint â”€â”€ */
      @media (max-width: 640px) {
        .allykit-panel {
          inset: 12px;
          width: calc(100vw - 24px);
          max-height: calc(100vh - 24px);
          border-radius: 14px;
        }

        .allykit-body {
          padding: 14px;
        }

        .allykit-grid {
          gap: 8px;
        }

        .allykit-tool {
          min-height: 100px;
          padding: 10px 8px;
        }
      }

      /* â”€â”€ Mobile breakpoint â”€â”€ */
      @media (max-width: 480px) {
        .allykit-panel {
          inset: 0;
          width: 100vw;
          max-height: 100vh;
          border-radius: 0;
          border: none;
        }

        .allykit-header {
          min-height: 56px;
          padding: 8px 12px;
          gap: 8px;
        }

        .allykit-title {
          font-size: 0.95em;
        }

        .allykit-body {
          padding: 12px;
        }

        .allykit-grid {
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 8px;
        }

        .allykit-tool {
          min-height: 96px;
          padding: 10px 6px;
          gap: 5px;
        }

        .allykit-tool__icon {
          width: 36px;
          height: 36px;
        }

        .allykit-tool__label {
          font-size: 0.78em;
          min-height: 28px;
        }

        .allykit-shell {
          bottom: 16px;
          ${side}: 16px;
        }

        .allykit-fab {
          width: 52px;
          height: 52px;
          padding: 0 13px;
          border-radius: 14px;
        }

        .allykit-fab:hover,
        .allykit-fab:focus-visible {
          width: 170px;
        }

        .allykit-fab .allykit-icon {
          width: 26px;
          height: 26px;
        }

        .allykit-fab__label {
          font-size: 0.8em;
        }

        .allykit-fab__shortcut {
          font-size: 0.6em;
        }
      }

      /* â”€â”€ Small mobile â”€â”€ */
      @media (max-width: 360px) {
        .allykit-grid {
          gap: 6px;
        }

        .allykit-tool {
          min-height: 88px;
          padding: 8px 4px;
        }

        .allykit-tool__label {
          font-size: 0.74em;
        }

        .allykit-body {
          padding: 10px;
        }
      }

      @media (prefers-reduced-motion: reduce) {
        .allykit-fab,
        .allykit-panel,
        .allykit-tool {
          transition: none;
        }
      }
    `;
  }

  function buildWidget() {
    root = createElement("div", "", { id: ROOT_ID });
    shadow = root.attachShadow({ mode: "open" });
    applyHostFont();

    const style = document.createElement("style");
    style.textContent = getWidgetStyles();

    const shell = createElement("div", "allykit-shell");
    fab = createElement("button", "allykit-fab", {
      type: "button",
      "aria-label": STRINGS.openMenu,
      "aria-haspopup": "dialog",
      "aria-expanded": "false",
      "aria-keyshortcuts": "Control+F2"
    });
    fab.innerHTML =
      icon("accessibility_new") +
      '<span class="allykit-fab__content">' +
      '<span class="allykit-fab__label">Accessibility Tool</span>' +
      '<span class="allykit-fab__shortcut" aria-hidden="true">Ctrl+F2</span>' +
      '</span>';
    fab.addEventListener("click", togglePanel);

    panel = createElement("section", "allykit-panel", {
      role: "dialog",
      "aria-modal": "true",
      "aria-labelledby": "allykit-title",
      "aria-hidden": "true",
      "data-open": "false"
    });

    const header = createElement("div", "allykit-header");
    const titleIcon = createElement("span", "allykit-title-icon", { "aria-hidden": "true" });
    titleIcon.innerHTML = icon("accessibility_new");

    const title = createElement("h2", "allykit-title", { id: "allykit-title" });
    title.textContent = STRINGS.menuTitle;

    // Auto-fix badge removed per request

    const reset = createElement("button", "allykit-icon-button allykit-reset-button", {
      type: "button",
      "aria-label": STRINGS.reset
    });
    reset.innerHTML = icon("restart_alt") + "<span>Reset</span>";
    reset.addEventListener("click", resetSettings);

    const close = createElement("button", "allykit-icon-button", {
      type: "button",
      "aria-label": STRINGS.closeMenu
    });
    close.innerHTML = icon("close");
    close.addEventListener("click", closePanel);

    header.append(titleIcon, title, reset, close);

    const body = createElement("div", "allykit-body");
    const grid = createElement("div", "allykit-grid");

    getEnabledFeatures().forEach(function (feature) {
      grid.appendChild(createFeatureButton(feature));
    });

    liveRegion = createElement("div", "allykit-sr-only", {
      "aria-live": "polite",
      "aria-atomic": "true"
    });

    body.append(grid, liveRegion);
    panel.append(header, body);
    shell.append(fab, panel);
    shadow.append(style, shell);
    document.body.appendChild(root);
  }

  function createFeatureButton(feature) {
    const button = createElement("button", "allykit-tool", {
      type: "button",
      "data-key": feature.key
    });

    const iconWrap = createElement("span", "allykit-tool__icon", { "aria-hidden": "true" });
    iconWrap.innerHTML = icon(feature.icon);

    const label = createElement("span", "allykit-tool__label");
    label.textContent = feature.label;

    const stateNode = createElement("span", "allykit-tool__state");

    button.append(iconWrap, label);

    let steps = null;
    if (feature.type === "level") {
      const stepsWrap = createElement("span", "allykit-steps", { "aria-hidden": "true" });
      for (let index = 0; index < feature.max; index += 1) {
        stepsWrap.appendChild(createElement("span", "allykit-step"));
      }
      button.append(stepsWrap);
      steps = stepsWrap.children;
    } else {
      // Static role only needs to be set once for toggles.
      button.setAttribute("role", "switch");
    }

    button.append(stateNode);
    button.addEventListener("click", function () {
      activateFeature(feature.key);
    });

    buttonRefs.set(feature.key, { button: button, stateNode: stateNode, steps: steps });
    return button;
  }

  function createAdhdMask() {
    if (document.getElementById(MASK_ID)) return;
    const mask = createElement("div", "allykit-adhd-mask", {
      id: MASK_ID,
      "aria-hidden": "true"
    });
    document.body.appendChild(mask);

    const updateMaskPosition = function (clientY) {
      mask.style.setProperty("--allykit-adhd-y", clientY + "px");
    };

    document.addEventListener("mousemove", function (event) {
      updateMaskPosition(event.clientY);
    }, { passive: true });

    document.addEventListener("touchmove", function (event) {
      if (event.touches && event.touches[0]) {
        updateMaskPosition(event.touches[0].clientY);
      }
    }, { passive: true });
  }

  function activateFeature(key) {
    const feature = features.find(function (item) {
      return item.key === key;
    });
    if (!feature) return;

    if (feature.type === "level") {
      state[key] = (Number(state[key]) + 1) % (feature.max + 1);
    } else {
      state[key] = !state[key];
    }

    applyState(true);

    // Screen reader toggle is handled imperatively; announce via speech synthesis.
    if (key === "screenReader") {
      screenReader.toggle(Boolean(state.screenReader));
    }

    announce(feature.label + " " + getReadableState(feature));
  }

  function applyTextZoom() {
    const zoomLevel = Number(state.textSize) || 0;
    if (zoomLevel > 0) {
      const zoomValue = (1 + zoomLevel * 0.1).toFixed(2);
      document.querySelectorAll(TOP_LEVEL_SELECTOR).forEach(function (el) {
        el.style.setProperty("zoom", zoomValue, "important");
      });
    } else {
      clearZoom();
    }
  }

  function applyState(shouldSave) {
    if (!document.body || !document.documentElement) return;

    Object.keys(bodyClasses).forEach(function (key) {
      const classList = document.body.classList;
      classList.remove.apply(classList, bodyClasses[key]);
      const value = Number(state[key]) || 0;
      if (value > 0) classList.add(bodyClasses[key][value - 1]);
    });

    applyTextZoom();

    Object.keys(toggleBodyClasses).forEach(function (key) {
      document.body.classList.toggle(toggleBodyClasses[key], Boolean(state[key]));
    });

    updateFilterClass();
    updateFeatureButtons();
    handleMediaState();

    if (shouldSave) saveState();
  }

  /**
   * Silently restore the screen-reader when the page loads and the user
   * previously had it enabled. Announcements stay muted until the user
   * navigates (Tab, click, or touch) — same pattern as NVDA on page load.
   */
  function restoreScreenReader() {
    if (state.screenReader && screenReader.isSupported) {
      screenReader.toggle(true, { silent: true });
    }
  }

  function updateFilterClass() {
    const filters = [];
    if (state.invert) filters.push("invert(1) hue-rotate(180deg)");
    if (state.saturation === 1) filters.push("saturate(0.45)");
    if (state.saturation === 2) filters.push("saturate(1.9)");
    if (state.saturation === 3) filters.push("grayscale(1) saturate(0)");

    const docStyle = document.documentElement.style;
    document.documentElement.classList.toggle("allykit-filter-active", filters.length > 0);
    if (filters.length > 0) {
      docStyle.setProperty("--allykit-page-filter", filters.join(" "));
    } else {
      docStyle.removeProperty("--allykit-page-filter");
    }
  }

  function updateFeatureButtons() {
    getEnabledFeatures().forEach(function (feature) {
      const refs = buttonRefs.get(feature.key);
      if (!refs) return;

      const isActive = feature.type === "level" ? Number(state[feature.key]) > 0 : Boolean(state[feature.key]);
      const readable = getReadableState(feature);
      const activeStr = String(isActive);

      refs.button.dataset.active = activeStr;
      refs.button.setAttribute("aria-label", feature.label + ". Current setting: " + readable + ".");

      if (feature.type === "toggle") {
        refs.button.setAttribute("aria-checked", activeStr);
      } else {
        refs.button.setAttribute("aria-pressed", activeStr);
        const level = Number(state[feature.key]);
        const steps = refs.steps;
        for (let i = 0; i < steps.length; i += 1) {
          steps[i].dataset.active = String(i < level);
        }
      }

      refs.stateNode.textContent = readable;
    });
  }

  function getReadableState(feature) {
    if (feature.type === "level") {
      const index = Number(state[feature.key]) || 0;
      return levelLabels[feature.key][index] || STRINGS.default;
    }
    return state[feature.key] ? STRINGS.on : STRINGS.off;
  }

  function handleMediaState() {
    if (state.pauseAnimation) {
      pauseMedia();
    } else {
      resumeMedia();
    }
  }

  function pauseMedia() {
    document.querySelectorAll("video, audio").forEach(function (media) {
      if (root && root.contains(media)) return;
      if (!media.paused) {
        media.setAttribute("data-allykit-was-playing", "true");
        media.pause();
      }
    });
  }

  function resumeMedia() {
    document.querySelectorAll('[data-allykit-was-playing="true"]').forEach(function (media) {
      media.removeAttribute("data-allykit-was-playing");
      if (typeof media.play === "function") {
        const playPromise = media.play();
        if (playPromise && typeof playPromise.catch === "function") {
          playPromise.catch(function () { });
        }
      }
    });
  }

  function resetSettings() {
    // Tear down screen reader before resetting state so the focusin listener
    // is removed even if the new defaultState has screenReader: false.
    if (state.screenReader) {
      screenReader.teardown();
    }
    state = cloneState(defaultState);
    saveState();
    clearZoom();
    applyState(false);
    announce(STRINGS.resetDone);
  }

  function openPanel() {
    if (!panel) return;
    previousFocus = document.activeElement;
    panel.dataset.open = "true";
    panel.setAttribute("aria-hidden", "false");
    fab.setAttribute("aria-expanded", "true");

    const firstTool = shadow.querySelector(".allykit-tool");
    window.setTimeout(function () {
      (firstTool || panel).focus();
    }, 0);
  }

  function closePanel() {
    if (!panel) return;
    panel.dataset.open = "false";
    panel.setAttribute("aria-hidden", "true");
    fab.setAttribute("aria-expanded", "false");

    if (previousFocus && typeof previousFocus.focus === "function") {
      previousFocus.focus();
    } else {
      fab.focus();
    }
  }

  function togglePanel() {
    if (panel && panel.dataset.open === "true") {
      closePanel();
    } else {
      openPanel();
    }
  }

  function handleKeydown(event) {
    if (event.ctrlKey && event.key === "F2") {
      event.preventDefault();
      togglePanel();
      return;
    }

    if (!panel || panel.dataset.open !== "true") return;

    if (event.key === "Escape") {
      event.preventDefault();
      closePanel();
      return;
    }

    if (event.key === "Tab") {
      trapFocus(event);
      return;
    }

    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      const activeElement = shadow.activeElement;
      if (!activeElement || !activeElement.matches("button")) return;

      const buttons = getFocusableControls();
      const currentIndex = buttons.indexOf(activeElement);
      if (currentIndex === -1) return;

      event.preventDefault();
      const nextIndex =
        event.key === "ArrowDown"
          ? (currentIndex + 1) % buttons.length
          : (currentIndex - 1 + buttons.length) % buttons.length;
      buttons[nextIndex].focus();
    }
  }

  function trapFocus(event) {
    const focusable = getFocusableControls();
    if (!focusable.length) return;

    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    const activeElement = shadow.activeElement;

    if (event.shiftKey && activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  function getFocusableControls() {
    return Array.from(
      shadow.querySelectorAll(
        'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      )
    );
  }

  function announce(message) {
    if (!liveRegion) return;
    liveRegion.textContent = "";
    window.setTimeout(function () {
      liveRegion.textContent = message;
    }, 30);
  }

  // Coalesce mutation bursts into a single media-pause pass per animation frame.
  function scheduleMediaPause() {
    if (mediaPausePending) return;
    mediaPausePending = true;
    window.requestAnimationFrame(function () {
      mediaPausePending = false;
      if (state.pauseAnimation) pauseMedia();
    });
  }

  // Coalesce auto-fixer re-scans into one pass per animation frame.
  var autoFixPending = false;
  function scheduleAutoFixScan(addedNodes) {
    if (autoFixPending || config.autoFix === false) return;
    autoFixPending = true;
    window.requestAnimationFrame(function () {
      autoFixPending = false;
      // Re-scan the full document for new nodes (scoped scan is fragile
      // for mutations that move elements between containers).
      autoFixer.scanAndFix();
      updateAutoFixBadge();
    });
  }

  function observePageChanges() {
    mutationObserver = new MutationObserver(function (mutations) {
      if (state.pauseAnimation) scheduleMediaPause();
      // Re-scan for a11y fixes when new nodes are added.
      if (config.autoFix !== false) {
        var hasNew = false;
        for (var m = 0; m < mutations.length; m++) {
          if (mutations[m].addedNodes && mutations[m].addedNodes.length) {
            hasNew = true;
            break;
          }
        }
        if (hasNew) scheduleAutoFixScan();
      }
    });

    mutationObserver.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  /**
   * Update the auto-fix badge in the panel header with the current fix count.
   */
  function updateAutoFixBadge() {
    if (!shadow) return;
    var badge = shadow.querySelector(".allykit-badge");
    if (!badge) return;
    var report = autoFixer.getReport();
    var textEl = badge.querySelector(".allykit-badge__text");
    if (report.fixed > 0) {
      if (textEl) textEl.textContent = report.fixed + " " + STRINGS.autoFixBadge;
      badge.setAttribute("data-visible", "true");
      badge.setAttribute("aria-label", report.fixed + " accessibility issues automatically fixed");
    } else {
      badge.setAttribute("data-visible", "false");
    }
  }

  function destroy() {
    document.removeEventListener("keydown", handleKeydown, true);
    if (mutationObserver) mutationObserver.disconnect();
    resumeMedia();
    clearZoom();
    // Silently tear down screen reader (stops speech + removes listener).
    screenReader.teardown();
    // Revert all auto-fixer changes.
    autoFixer.revert();

    const classList = document.body.classList;
    Object.keys(bodyClasses).forEach(function (key) {
      classList.remove.apply(classList, bodyClasses[key]);
    });
    Object.keys(toggleBodyClasses).forEach(function (key) {
      classList.remove(toggleBodyClasses[key]);
    });
    document.documentElement.classList.remove("allykit-filter-active");
    document.documentElement.style.removeProperty("--allykit-page-filter");

    const style = document.getElementById(STYLE_ID);
    if (style) style.remove();
    const mask = document.getElementById(MASK_ID);
    if (mask) mask.remove();
    if (root) root.remove();
    if (typeof window !== "undefined") {
      window.AllyKit = null;
    }
  }

  function init(userOptions) {
    // Allow programmatic init with options (npm / ES module usage).
    // When called from the UMD factory the config was already read from
    // window.AllyKitConfig; passing userOptions overrides that.
    if (userOptions && typeof userOptions === "object") {
      const merged = Object.assign({}, DEFAULT_CONFIG, userOptions);
      if (userOptions.features) {
        merged.features = Object.assign({}, DEFAULT_CONFIG.features, userOptions.features);
      }
      // Re-derive palette if accentColor was supplied programmatically.
      if (userOptions.accentColor) {
        Object.assign(palette, buildPalette(userOptions.accentColor));
      }
      Object.assign(config, merged);
    }

    if (!document.body) return null;
    injectPageStyles();
    buildWidget();
    createAdhdMask();
    applyState(false);
    observePageChanges();
    document.addEventListener("keydown", handleKeydown, true);

    // Run the WCAG 2.2 auto-fixer if enabled.
    if (config.autoFix !== false) {
      autoFixer.scanAndFix();
      // Update badge after a short delay to allow the panel to render.
      window.setTimeout(updateAutoFixBadge, 50);
    }

    // Restore screen reader listener silently if it was active in a previous session.
    restoreScreenReader();

    // Stylesheets and web fonts can apply after DOMContentLoaded; re-resolve once on full load
    // so the widget still matches the site if its font wasn't ready at build time.
    if (document.readyState !== "complete") {
      window.addEventListener("load", applyHostFont, { once: true });
    }

    const api = {
      version: VERSION,
      open: openPanel,
      close: closePanel,
      toggle: togglePanel,
      reset: resetSettings,
      destroy: destroy,
      getState: function () {
        return cloneState(state);
      }
    };

    // Expose on window for plain-script usage.
    if (typeof window !== "undefined") {
      window.AllyKit = api;
    }

    return api;
  }

  ready(function () { init(); });

  // ── Public factory returned to module consumers ───────────────────────────
  // When used via require() / import, the consumer gets this object.
  // Call .init(options) manually — auto-init does not fire in module context
  // until the returned init() is called, giving consumers control over timing.
  return {
    version: VERSION,
    /**
     * Initialise the widget. Safe to call multiple times — subsequent calls
     * are ignored if the widget is already mounted.
     *
     * @param {object} [options]  Same shape as window.AllyKitConfig.
     * @returns {object|null}  The AllyWidget API object, or null if the DOM
     *                         is not yet available.
     */
    init: init
  };
}));