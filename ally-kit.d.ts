/**
 * AllyKit - Lightweight accessibility toolkit for web applications
 * @packageDocumentation
 */

/**
 * Configuration options for AllyKit
 */
export interface AllyKitConfig {
  /**
   * Position of the accessibility button
   * @default "right"
   */
  position?: 'left' | 'right';

  /**
   * Distance of the button from the screen edge
   * @default "24px"
   */
  buttonOffset?: string;

  /**
   * Width of the accessibility settings panel
   * @default "560px"
   */
  panelWidth?: string;

  /**
   * Primary accent color for the widget (3 or 6-digit hex)
   * @default "#4f46e5"
   * @example "#4f46e5" | "#f60"
   */
  accentColor?: string;

  /**
   * Enable WCAG 2.2 auto-fixer to automatically fix common accessibility issues
   * @default true
   */
  autoFix?: boolean;

  /**
   * Default language attribute to apply to <html> if missing
   * @default "en"
   */
  autoFixLang?: string;

  /**
   * Feature toggles - set any to false to disable that feature
   */
  features?: {
    /** Text size adjustment (100% - 140%) */
    textSize?: boolean;
    /** High contrast modes (4 levels including dark mode) */
    highContrast?: boolean;
    /** Text and letter spacing adjustment */
    textSpacing?: boolean;
    /** Line height adjustment (1x - 2x) */
    lineHeight?: boolean;
    /** OpenDyslexic font for dyslexia-friendly reading */
    dyslexia?: boolean;
    /** ADHD focus mode with reading mask */
    adhd?: boolean;
    /** Color saturation control (low, high, grayscale) */
    saturation?: boolean;
    /** Invert colors */
    invert?: boolean;
    /** Enlarged cursor */
    bigCursor?: boolean;
    /** Hide all images */
    hideImages?: boolean;
    /** Pause all animations and transitions */
    pauseAnimation?: boolean;
    /** Highlight all links with yellow outline */
    highlightLinks?: boolean;
    /** Built-in screen reader using Web Speech API */
    screenReader?: boolean;
  };
}

/**
 * Current state of all accessibility features
 */
export interface AllyKitState {
  /** Text size level (0 = default, 1-4 = 110%-140%) */
  textSize: number;
  /** High contrast mode (0 = off, 1-4 = different modes) */
  highContrast: number;
  /** Text spacing level (0 = off, 1-3 = loose to widest) */
  textSpacing: number;
  /** Line height level (0 = default, 1-3 = 1.5x to 2x) */
  lineHeight: number;
  /** Dyslexia-friendly font enabled */
  dyslexia: boolean;
  /** ADHD focus mode enabled */
  adhd: boolean;
  /** Color saturation mode (0 = off, 1-3 = low/high/grayscale) */
  saturation: number;
  /** Color inversion enabled */
  invert: boolean;
  /** Big cursor enabled */
  bigCursor: boolean;
  /** Hide images enabled */
  hideImages: boolean;
  /** Pause animations enabled */
  pauseAnimation: boolean;
  /** Highlight links enabled */
  highlightLinks: boolean;
  /** Screen reader enabled */
  screenReader: boolean;
}

/**
 * Main AllyKit API
 */
export interface AllyKitAPI {
  /**
   * Current version of AllyKit
   * @readonly
   */
  version: string;

  /**
   * Open the accessibility settings panel
   */
  open(): void;

  /**
   * Close the accessibility settings panel
   */
  close(): void;

  /**
   * Toggle the accessibility settings panel open/closed
   */
  toggle(): void;

  /**
   * Reset all accessibility settings to defaults and clear localStorage
   */
  reset(): void;

  /**
   * Get the current state of all features
   * @returns A copy of the current state (safe to mutate)
   */
  getState(): AllyKitState;

  /**
   * Completely remove AllyKit from the page and clean up all side-effects
   * Note: Does not clear localStorage - call reset() first if needed
   */
  destroy(): void;

  /**
   * Initialize AllyKit with custom configuration (ES module/CommonJS only)
   * @param config - Configuration options
   * @returns The AllyKit API instance
   */
  init(config?: AllyKitConfig): AllyKitAPI;
}

/**
 * Global window extensions
 */
declare global {
  interface Window {
    /**
     * AllyKit API instance (available after script loads)
     */
    AllyKit?: AllyKitAPI;

    /**
     * Configuration for AllyKit (must be set before script loads)
     */
    AllyKitConfig?: AllyKitConfig;
  }
}

/**
 * Default export for ES modules
 */
declare const AllyKit: AllyKitAPI;
export default AllyKit;
