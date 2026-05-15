const THEME_KEY = "tracka_theme";
type Theme = "light" | "auto" | "dark";

function resolveTheme(theme: Theme): "light" | "dark" {
  if (theme === "auto") {
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }
  return theme;
}

export function applyTheme(theme: Theme) {
  document.documentElement.classList.toggle("dark", resolveTheme(theme) === "dark");
}

export function initTheme() {
  try {
    const stored = (localStorage.getItem(THEME_KEY) as Theme) || "auto";
    applyTheme(stored);
    window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", () => {
      const current = (localStorage.getItem(THEME_KEY) as Theme) || "auto";
      if (current === "auto") applyTheme("auto");
    });
  } catch {
    // localStorage unavailable — default to light
  }
}
