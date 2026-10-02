"use client";

import { useEffect } from "react";
import { initializeTheme } from "@/lib/store/theme";
import { initializeLanguage } from "@/lib/store/language";
import { initializeGrade } from "@/lib/store/grade";

export function AppInitializer() {
    useEffect(() => {
        initializeTheme();
        initializeLanguage();
        initializeGrade();
    }, []);
    return null;
}
