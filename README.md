# AllyKit

A lightweight, zero-dependency accessibility toolkit you drop into any webpage with a single `<script>` tag. It gives users a floating button that opens a panel of accessibility tools — text size, contrast modes, dyslexia font, screen reader, ADHD focus mode, and more — all persisted to `localStorage` so preferences carry across pages.

**Version 1.2.0**

---

## Table of Contents

- [Features](#features)
- [Installation](#installation)
- [Usage](#usage)
- [Configuration](#configuration)
  - [Layout options](#layout-options)
  - [Accent colour](#accent-colour)
  - [Feature toggles](#feature-toggles)
- [Feature reference](#feature-reference)
- [JavaScript API](#javascript-api)
- [Keyboard shortcuts](#keyboard-shortcuts)
- [How settings are stored](#how-settings-are-stored)
- [Browser support](#browser-support)
- [Contributing](#contributing)
- [License](#license)

---

## Features

| Feature | What it does |
|---|---|
| **Text size** | Scales page text to 110 %, 120 %, 130 %, or 140 % |
| **High contrast** | Four modes: Enhanced · Black/White · Black/Yellow · Dark Mode |
| **Text spacing** | Three levels of letter + word spacing (Loose → Widest) |
| **Line height** | Three levels: 1.5 × · 1.8 × · 2 × |
| **Dyslexia friendly** | Switches body text to [OpenDyslexic](https://opendyslexic.org/) font |
| **ADHD mode** | Adds a focus strip that follows the cursor to reduce distraction |
| **Saturation** | Low · High · Grayscale |
| **Invert colors** | CSS `invert + hue-rotate` over the whole page |
| **Big cursor** | Replaces the system cursor with an enlarged one |
| **Hide images** | Hides `<img>`, `<picture>`, and CSS background images |
| **Pause animations** | Collapses all CSS animations and transitions to 0 ms |
| **Highlight links** | Wraps every `<a>` in a bright yellow outline |
| **Screen reader** | Uses the Web Speech API to announce hovered, focused, and clicked elements, and reads link text before navigating |

All 13 features are **enabled by default**. Any subset can be disabled via config.

---

## Installation

### Plain HTML (no build step)

Use `ally-kit.js` for development (readable, with comments) or `ally-kit-min.js` for production (minified, smaller payload):

```html
<!-- Development — readable source -->
<script src="ally-kit.js"></script>
</body>
```

```html
<!-- Production — minified (~20 % smaller) -->
<script src="ally-kit-min.js"></script>
</body>
```

AllyKit self-initialises on `DOMContentLoaded` and attaches to `window.AllyKit`.

### npm

```bash
npm install @preepo/allykit
```

### CDN

Via GitHub (works as soon as the repo is public — no publish needed):

```html
<!-- Unminified -->
<script src="https://cdn.jsdelivr.net/gh/pritush/ally-kit@main/ally-kit.js"></script>

<!-- Minified -->
<script src="https://cdn.jsdelivr.net/gh/pritush/ally-kit@main/ally-kit-min.js"></script>
```

Via npm (works after `npm publish`):

```html
<!-- Unminified -->
<script src="https://cdn.jsdelivr.net/npm/@preepo/allykit/ally-kit.js"></script>

<!-- Minified -->
<script src="https://cdn.jsdelivr.net/npm/@preepo/allykit/ally-kit-min.js"></script>
```

---

## Usage

### Plain `<script>` tag

Configure with `window.AllyKitConfig` **before** the script tag:

```html
<script>
  window.AllyKitConfig = {
    accentColor: "#16a34a",
    features: { adhd: false }
  };
</script>
<script src="ally-kit.js"></script>
<!-- window.AllyKit is now available -->
```

### ES module (Vite, webpack, Rollup, etc.)

```js
import AllyKit from '@preepo/allykit';

// init() must be called manually in module context.
// Pass options directly — window.AllyKitConfig is not read.
const kit = AllyKit.init({
  accentColor: '#7c3aed',
  position: 'left',
  features: {
    adhd: false,
    hideImages: false
  }
});

// kit is the full API object
kit.open();
```

### CommonJS (Node-compatible bundlers)

```js
const AllyKit = require('@preepo/allykit');

const kit = AllyKit.init({
  accentColor: '#ea580c'
});
```

### React example

```jsx
import { useEffect, useRef } from 'react';
import AllyKit from '@preepo/allykit';

export function AccessibilityToolkit() {
  const kitRef = useRef(null);

  useEffect(() => {
    kitRef.current = AllyKit.init({
      accentColor: '#4f46e5',
      position: 'right',
      features: { adhd: false }
    });

    return () => {
      kitRef.current?.destroy();
    };
  }, []);

  return null; // AllyKit renders its own DOM
}
```

### Vue example

```js
import AllyKit from '@preepo/allykit';
import { onMounted, onUnmounted } from 'vue';

export function useAllyKit(options = {}) {
  let kit = null;

  onMounted(() => {
    kit = AllyKit.init(options);
  });

  onUnmounted(() => {
    kit?.destroy();
  });

  return { kit };
}
```

> **SSR note** — AllyKit renders real DOM into `document.body` via Shadow DOM. It requires a browser environment. With Next.js, Nuxt, or any SSR framework make sure `init()` is only called client-side (inside `useEffect`, `onMounted`, or a `"use client"` boundary).

---

## Configuration

### All options at a glance

```html
<script>
  window.AllyKitConfig = {
    position:     "right",    // "left" | "right"
    buttonOffset: "24px",     // distance from the screen edge
    panelWidth:   "560px",    // width of the settings panel
    accentColor:  "#4f46e5",  // any 3- or 6-digit CSS hex colour

    features: {
      textSize:       true,
      highContrast:   true,
      textSpacing:    true,
      lineHeight:     true,
      dyslexia:       true,
      adhd:           true,
      saturation:     true,
      invert:         true,
      bigCursor:      true,
      hideImages:     true,
      pauseAnimation: true,
      highlightLinks: true,
      screenReader:   true
    }
  };
</script>
<script src="ally-kit.js"></script>
```

You only need to list the values you want to **change** — everything omitted falls back to its default.

### Layout options

| Option | Type | Default | Description |
|---|---|---|---|
| `position` | `"left"` \| `"right"` | `"right"` | Which side of the screen the button and panel appear on |
| `buttonOffset` | CSS string | `"24px"` | Distance of the button from the screen edge |
| `panelWidth` | CSS string | `"560px"` | Width of the settings panel |

### Accent colour

| Option | Type | Default | Description |
|---|---|---|---|
| `accentColor` | 3- or 6-digit hex string | `"#4f46e5"` | Primary brand colour for the toolkit |

AllyKit derives a complete four-token palette from this single value at runtime:

| CSS custom property | Role | Derived from |
|---|---|---|
| `--ak-primary` | Button background, active borders, step indicators, header icon | `accentColor` directly |
| `--ak-on-primary` | Text/icons on primary surfaces | White or black — whichever achieves the higher WCAG contrast ratio against `accentColor` |
| `--ak-primary-container` | Active feature card background, Reset button chip | 82 % tint toward white |
| `--ak-on-primary-container` | Text inside primary-container surfaces | 70 % shade toward black |

The focus ring (`--ak-focus`) also tracks `--ak-primary`, so keyboard navigation stays on-brand.

**All neutral surfaces** (`--ak-surface`, `--ak-surface-container`, `--ak-on-surface`, etc.) are fixed greys and are not affected by `accentColor`.

Quick examples:

```js
accentColor: "#4f46e5"  // Indigo (default)
accentColor: "#16a34a"  // Brand green
accentColor: "#ea580c"  // Warm orange
accentColor: "#7c3aed"  // Deep violet
accentColor: "#3b82f6"  // Slate blue
accentColor: "#0891b2"  // Cyan
```

> If `accentColor` is missing, invalid, or not a hex value, AllyKit silently falls back to `"#4f46e5"`.

### Feature toggles

Set any feature key to `false` to hide it from the panel entirely. The feature's body class and CSS filter are never applied when disabled.

```html
<script>
  window.AllyKitConfig = {
    features: {
      invert:     false,
      saturation: false,
      hideImages: false
    }
  };
</script>
<script src="ally-kit.js"></script>
```

#### Common recipes

**Minimal set** — just the essentials:
```js
window.AllyKitConfig = {
  features: {
    textSize:       true,
    highContrast:   true,
    dyslexia:       true,
    pauseAnimation: true,
    screenReader:   true,
    textSpacing:    false,
    lineHeight:     false,
    adhd:           false,
    saturation:     false,
    invert:         false,
    bigCursor:      false,
    hideImages:     false,
    highlightLinks: false
  }
};
```

**E-commerce** — preserve product imagery and brand palette:
```js
window.AllyKitConfig = {
  features: {
    invert:     false,
    saturation: false,
    hideImages: false
  }
};
```

**Blog / docs** — reading-focused:
```js
window.AllyKitConfig = {
  features: {
    adhd:       false,
    bigCursor:  false,
    invert:     false,
    saturation: false,
    hideImages: false
  }
};
```

**Web app** — avoid obscuring UI chrome:
```js
window.AllyKitConfig = {
  features: {
    adhd:       false, // reading mask covers interactive elements
    hideImages: false  // icons are functional, not decorative
  }
};
```

---

## Feature reference

### Text size

Applies a CSS `zoom` multiplier to every direct child of `<body>` except the AllyKit root itself.

| Level | Value |
|---|---|
| 0 (default) | 100 % |
| 1 | 110 % |
| 2 | 120 % |
| 3 | 130 % |
| 4 | 140 % |

### High contrast

Adds a body class that overrides background, foreground, border, and link colours with `!important` rules. Level 4 (Dark Mode) is a WCAG AA–compliant dark theme.

| Level | Name | Background | Foreground |
|---|---|---|---|
| 1 | Enhanced | `#000` | `#fff` |
| 2 | Black / White | `#000` | `#fff` (thicker link underline) |
| 3 | Black / Yellow | `#000` | `#ffff68` |
| 4 | Dark Mode | `#121212` | `#e0e0e0` |

### Text spacing

Adds letter-spacing and word-spacing to all text elements (`p`, `h1–h6`, `li`, `a`, `button`, `td`, etc.).

| Level | Letter spacing | Word spacing |
|---|---|---|
| 1 (Loose) | 0.08 em | 0.16 em |
| 2 (Wider) | 0.12 em | 0.24 em |
| 3 (Widest) | 0.16 em | 0.32 em |

### Line height

| Level | Multiplier |
|---|---|
| 1 | 1.5 × |
| 2 | 1.8 × |
| 3 | 2 × |

### Dyslexia friendly

Switches the font stack of all text elements to **OpenDyslexic** (loaded from a `.woff` file). Falls back to Arial / system-ui if the font fails to load.

### ADHD mode

Injects a full-width focus strip element that follows the mouse pointer vertically, dimming everything above and below the current line of text. The strip is a separate DOM element (`#allykit-adhd-mask`) that sits outside the Shadow DOM so it can overlay the page.

### Saturation

Applies a CSS filter to all top-level body children.

| Level | Filter |
|---|---|
| 1 (Low) | `saturate(0.45)` |
| 2 (High) | `saturate(1.9)` |
| 3 (Grayscale) | `grayscale(1) saturate(0)` |

### Invert colors

Applies `invert(1) hue-rotate(180deg)` — the hue rotation cancels the colour shift while keeping the luminance inversion. Composes correctly when used together with Saturation.

### Pause animations

Sets `animation-duration: 0.001ms`, `animation-iteration-count: 1`, `transition-duration: 0s`, and `scroll-behavior: auto` on every element including `::before` / `::after` pseudo-elements. Also pauses any `<video>` and `<audio>` elements that were playing, and resumes them when the feature is turned off.

### Screen reader

Uses `window.speechSynthesis` (Web Speech API). When active:

- **Hover** — announces interactive elements (`a`, `button`, `input`, `select`, `textarea`, `[role=button]`, `[role=link]`, `[tabindex]`) after a 150 ms debounce.
- **Focus** (Tab key) — announces the newly focused element if it wasn't already announced by hover.
- **Link clicks** — for same-tab navigation, the click is intercepted, the link text is spoken, and navigation happens once speech ends (4 s safety timeout).
- `_blank` links are announced but not intercepted.

Text extraction priority: `aria-label` → `aria-labelledby` → `<label for>` → `alt` / `title` → `placeholder` → `value` → `innerText`.

The screen reader is silently restored on page load if it was active in a previous session.

> **Browser note** — `speechSynthesis` is not available in all environments. AllyKit logs a warning and skips speech silently if unsupported; the toggle button is still shown.

---

## JavaScript API

After initialisation, the API object is available as `window.AllyKit` (plain script) or as the return value of `AllyKit.init()` (module):

```js
// Open the settings panel
window.AllyKit.open();

// Close the settings panel
window.AllyKit.close();

// Toggle the settings panel open / closed
window.AllyKit.toggle();

// Reset all settings to defaults and clear localStorage
window.AllyKit.reset();

// Read the current state (returns a plain object copy — safe to mutate)
const state = window.AllyKit.getState();
// {
//   textSize: 0, highContrast: 0, textSpacing: 0, lineHeight: 0,
//   dyslexia: false, adhd: false, saturation: 0, invert: false,
//   bigCursor: false, hideImages: false, pauseAnimation: false,
//   highlightLinks: false, screenReader: false
// }

// Current version string
console.log(window.AllyKit.version); // "1.2.0"

// Fully remove AllyKit from the page and clean up all side-effects
window.AllyKit.destroy();
```

`destroy()` removes the AllyKit DOM root, disconnects the MutationObserver, removes all body classes and CSS filters, stops speech synthesis, and sets `window.AllyKit` to `null`. It does **not** clear `localStorage` — call `reset()` first if you want a clean slate.

---

## Keyboard shortcuts

| Key | Action |
|---|---|
| `Ctrl + F2` | Toggle the settings panel open / closed |
| `Escape` | Close the settings panel |
| `Tab` / `Shift+Tab` | Move focus through panel controls (focus is trapped inside the panel while open) |
| `↑` / `↓` | Move between feature buttons inside the panel |

---

## How settings are stored

User preferences are saved to `localStorage` under the key `allyKitSettings` as a flat JSON object:

```json
{
  "textSize": 2,
  "highContrast": 0,
  "textSpacing": 1,
  "lineHeight": 0,
  "dyslexia": false,
  "adhd": false,
  "saturation": 0,
  "invert": false,
  "bigCursor": false,
  "hideImages": false,
  "pauseAnimation": false,
  "highlightLinks": true,
  "screenReader": false
}
```

- Level features (`textSize`, `highContrast`, `textSpacing`, `lineHeight`, `saturation`) store an integer `0–N` where `0` is the default/off state.
- Toggle features store a boolean.
- If `localStorage` is unavailable (private browsing, storage quota exceeded, sandboxed iframe) AllyKit falls back gracefully — settings still work for the session, they just aren't persisted.

To clear saved settings programmatically:

```js
window.AllyKit.reset();
// — or —
localStorage.removeItem("allyKitSettings");
```

---

## Browser support

| Browser | Version |
|---|---|
| Chrome / Edge | 88 + |
| Firefox | 85 + |
| Safari | 14 + |
| Opera | 74 + |

AllyKit uses Shadow DOM, `MutationObserver`, `localStorage`, and optionally `SpeechSynthesis`. It has no polyfills and no runtime dependencies.

---

## Contributing

1. Fork the repo and create a feature branch.
2. Make your changes in `ally-kit.js` — the entire toolkit lives in one self-contained UMD file.
3. Regenerate `ally-kit-min.js` from the updated source (e.g. `npm run build` or your minifier of choice).
4. Test against `index.html` which exercises every feature.
5. Open a pull request with a clear description of what changed and why.

### Things to keep in mind

- AllyKit must remain a single, dependency-free file.
- All UI DOM lives inside a Shadow DOM root (`attachShadow({ mode: "open" })`). Page styles must not bleed in.
- Page-level effects (body classes, CSS filters, zoom) must be cleaned up by `destroy()`.
- New features should follow the existing `{ key, label, icon, type }` descriptor pattern and have a matching entry in `defaultState` and `DEFAULT_CONFIG.features`.
- CSS custom properties inside the shadow root use the `--ak-` prefix.
- DOM IDs and body classes use the `allykit-` prefix.

---

## License

MIT © Pritush M.
