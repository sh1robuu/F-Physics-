"use client";

import { create } from "zustand";

type Theme = "dark" | "light";

interface ThemeState {
    theme: Theme;
    setTheme: (theme: Theme) => void;
    toggleTheme: () => void;
}

export const useThemeStore = create<ThemeState>((set) => ({
    theme: "light",
    setTheme: (theme) => {
        document.documentElement.setAttribute("data-theme", theme);
        try { localStorage.setItem("f-physics-theme", theme); } catch { /* Storage is optional. */ }
        set({ theme });
    },
    toggleTheme: () => {
        set((state) => {
            const next = state.theme === "dark" ? "light" : "dark";
            document.documentElement.setAttribute("data-theme", next);
            try { localStorage.setItem("f-physics-theme", next); } catch { /* Storage is optional. */ }
            return { theme: next };
        });
    },
}));

// Initialize theme from localStorage on client
export function initializeTheme() {
    if (typeof window === "undefined") return;
    let stored: string | null = null;
    try { stored = localStorage.getItem("f-physics-theme"); } catch { /* Storage is optional. */ }
    const theme: Theme = stored === "dark" ? "dark" : "light";
    document.documentElement.setAttribute("data-theme", theme);
    useThemeStore.setState({ theme });
}
