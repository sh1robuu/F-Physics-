"use client";

import { useLanguageStore } from "@/lib/store/language";
import vi, { type TranslationKey } from "./vi";
import en from "./en";

const translations = { vi, en } as const;

export function useTranslation() {
    const locale = useLanguageStore((s) => s.locale);

    function t(key: TranslationKey): string {
        return translations[locale]?.[key] ?? translations.vi[key] ?? key;
    }

    return { t, locale };
}

export type { TranslationKey };
