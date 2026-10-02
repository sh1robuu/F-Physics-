"use client";

import { create } from "zustand";
import type { Grade } from "@/lib/data/curriculum";

export function parseGrade(value: unknown): Grade | null {
    return value === 10 || value === "10" ? 10 : value === 11 || value === "11" ? 11 : value === 12 || value === "12" ? 12 : null;
}

interface GradeState {
    grade: Grade;
    setGrade: (grade: Grade) => void;
}

export const useGradeStore = create<GradeState>((set) => ({
    grade: 12,
    setGrade: (grade) => {
        if (!parseGrade(grade)) return;
        set({ grade });
        try { localStorage.setItem("f-physics-grade", String(grade)); } catch { /* Storage is optional. */ }
    },
}));

export function initializeGrade() {
    if (typeof window === "undefined") return;
    let grade: Grade = 12;
    try {
        const preferences = JSON.parse(localStorage.getItem("f-physics-ai-prefs") || "{}");
        grade = parseGrade(localStorage.getItem("f-physics-grade")) || parseGrade(preferences?.grade) || 12;
    } catch { /* Keep the existing students' grade 12 default. */ }
    grade = parseGrade(new URLSearchParams(window.location.search).get("grade")) || grade;
    useGradeStore.getState().setGrade(grade);
}
