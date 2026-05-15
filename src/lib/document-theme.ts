import { useEffect, useRef } from "react";

export type DocTheme = "classic" | "editorial" | "modern" | "minimal";
export type DocDensity = "compact" | "normal" | "relaxed";
export type DocSize = "s" | "m" | "l";
export type DocPage = "light" | "dark";

export interface DocumentStyle {
  theme: DocTheme;
  density: DocDensity;
  size: DocSize;
  page: DocPage;
}

export const DOC_STYLE_KEY = "tracka_doc_style";

export const DEFAULT_DOC_STYLE: DocumentStyle = {
  theme: "classic",
  density: "normal",
  size: "m",
  page: "light",
};

export const DOC_THEMES_META: { id: DocTheme; fontPreview: string }[] = [
  { id: "classic",   fontPreview: "'Satoshi', sans-serif" },
  { id: "editorial", fontPreview: "'Lora', 'Georgia', serif" },
  { id: "modern",    fontPreview: "'Satoshi', sans-serif" },
  { id: "minimal",   fontPreview: "'Satoshi', sans-serif" },
];

export const DOC_SIZES_META: { id: DocSize }[] = [
  { id: "s" },
  { id: "m" },
  { id: "l" },
];

export const DOC_DENSITIES_META: { id: DocDensity }[] = [
  { id: "compact" },
  { id: "normal" },
  { id: "relaxed" },
];

export const DOC_PAGE_META: { id: DocPage }[] = [
  { id: "light" },
  { id: "dark" },
];

/** Returns the page mode that matches the current app colour scheme. */
export function systemPageMode(): DocPage {
  return typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

export function loadDocStyle(): DocumentStyle {
  try {
    const raw = localStorage.getItem(DOC_STYLE_KEY);
    const stored = raw ? (JSON.parse(raw) as Partial<DocumentStyle>) : {};
    return { ...DEFAULT_DOC_STYLE, ...stored };
  } catch {
    return DEFAULT_DOC_STYLE;
  }
}

export function saveDocStyle(style: DocumentStyle): void {
  localStorage.setItem(DOC_STYLE_KEY, JSON.stringify(style));
}

/**
 * Watches html.dark class. Calls onSync(page) whenever the app theme flips.
 * Stable subscription — safe to call in page components.
 */
export function useDocPageSync(onSync: (page: DocPage) => void) {
  const cbRef = useRef(onSync);
  cbRef.current = onSync;

  useEffect(() => {
    const el = document.documentElement;
    let prevDark = el.classList.contains("dark");

    const observer = new MutationObserver(() => {
      const nowDark = el.classList.contains("dark");
      if (nowDark !== prevDark) {
        prevDark = nowDark;
        cbRef.current(nowDark ? "dark" : "light");
      }
    });

    observer.observe(el, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);
}
