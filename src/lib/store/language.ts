"use client";

import { create } from "zustand";

type Locale = "vi" | "en";

interface LanguageState {
    locale: Locale;
    setLocale: (locale: Locale) => void;
}

export const useLanguageStore = create<LanguageState>((set) => ({
    locale: "vi",
    setLocale: (locale) => {
        localStorage.setItem("f-physics-lang", locale);
        document.documentElement.setAttribute("lang", locale);
        set({ locale });
    },
}));

export function initializeLanguage() {
    if (typeof window === "undefined") return;
    const stored = localStorage.getItem("f-physics-lang") as Locale | null;
    const locale = stored || "vi";
    document.documentElement.setAttribute("lang", locale);
    useLanguageStore.setState({ locale });
}
