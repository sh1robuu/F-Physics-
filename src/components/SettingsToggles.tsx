"use client";

import { Sun, Moon, Settings, Languages } from "lucide-react";
import { useThemeStore } from "@/lib/store/theme";
import { useLanguageStore } from "@/lib/store/language";
import Link from "next/link";

export function SettingsToggles({ compact = false }: { compact?: boolean }) {
    const { theme, toggleTheme } = useThemeStore();
    const { locale, setLocale } = useLanguageStore();
    const vi = locale === "vi";
    const themeLabel = theme === "dark" ? (vi ? "Chuyển sang giao diện sáng" : "Switch to light theme") : (vi ? "Chuyển sang giao diện tối" : "Switch to dark theme");
    if (compact) return <div className="settings-compact">
        <button type="button" onClick={toggleTheme} aria-label={themeLabel} title={themeLabel}>{theme === "dark" ? <Sun size={16}/> : <Moon size={16}/>}</button>
        <button type="button" onClick={() => setLocale(vi ? "en" : "vi")} aria-label={vi ? "Switch to English" : "Chuyển sang tiếng Việt"}>{vi ? "EN" : "VI"}</button>
    </div>;
    return <div className="settings-rows">
        <button type="button" onClick={toggleTheme} aria-label={themeLabel}>{theme === "dark" ? <Moon size={16}/> : <Sun size={16}/>}<span>{vi ? "Giao diện" : "Appearance"}</span><span className="settings-value">{theme === "dark" ? (vi ? "Tối" : "Dark") : (vi ? "Sáng" : "Light")}</span></button>
        <button type="button" onClick={() => setLocale(vi ? "en" : "vi")}><Languages size={16}/><span>{vi ? "Ngôn ngữ" : "Language"}</span><span className="settings-value">{vi ? "Tiếng Việt" : "English"}</span></button>
        <Link href="/settings"><Settings size={16}/>{vi ? "Cài đặt" : "Settings"}</Link>
    </div>;
}
