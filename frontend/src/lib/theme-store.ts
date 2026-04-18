import { useSyncExternalStore } from "react";

export type Theme = "light" | "dark";

const THEME_KEY = "quickresolve-theme";

const listeners = new Set<() => void>();

function getSystemTheme(): Theme {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function readStoredTheme(): Theme {
  if (typeof window === "undefined") return "light";
  const saved = window.localStorage.getItem(THEME_KEY);
  if (saved === "dark" || saved === "light") return saved;
  return getSystemTheme();
}

let state: Theme = readStoredTheme();

function emit() {
  listeners.forEach((listener) => listener());
}

function applyTheme(theme: Theme) {
  if (typeof document === "undefined") return;
  document.documentElement.classList.toggle("dark", theme === "dark");
}

export const themeStore = {
  getState: () => state,
  subscribe: (listener: () => void) => {
    listeners.add(listener);
    applyTheme(state);
    return () => listeners.delete(listener);
  },
  hydrate: () => {
    state = readStoredTheme();
    applyTheme(state);
    emit();
  },
  setTheme: (theme: Theme) => {
    state = theme;
    if (typeof window !== "undefined") {
      window.localStorage.setItem(THEME_KEY, theme);
    }
    applyTheme(theme);
    emit();
  },
  toggle: () => {
    themeStore.setTheme(state === "dark" ? "light" : "dark");
  },
};

export function useTheme() {
  return useSyncExternalStore(themeStore.subscribe, themeStore.getState, themeStore.getState);
}
