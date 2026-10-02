"use client";

import { useGradeStore } from "@/lib/store/grade";
import { useTranslation } from "@/lib/i18n";
import type { Grade } from "@/lib/data/curriculum";

export function GradeSelector({ compact = false }: { compact?: boolean }) {
    const { grade, setGrade } = useGradeStore();
    const { locale } = useTranslation();
    return (
        <div className={`grade-selector ${compact ? "is-compact" : ""}`} role="group" aria-label={locale === "vi" ? "Chọn lớp học" : "Choose your grade"}>
            {([10, 11, 12] as Grade[]).map((value) => (
                <button key={value} type="button" aria-pressed={grade === value} onClick={() => {
                    setGrade(value);
                    const url = new URL(window.location.href);
                    // A manual class switch must not retain a topic from another grade.
                    if (url.searchParams.has("grade") || url.searchParams.has("topic")) {
                        url.searchParams.set("grade", String(value));
                        url.searchParams.delete("topic");
                        window.history.replaceState(null, "", url);
                    }
                }}>
                    {!compact && (locale === "vi" ? "Lớp " : "Grade ")}{value}
                </button>
            ))}
        </div>
    );
}
