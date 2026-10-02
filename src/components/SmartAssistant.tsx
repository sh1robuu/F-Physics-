"use client";

import { useState } from "react";
import Link from "next/link";
import { BookOpen, Lightbulb, Sparkles, ChevronRight, ArrowUpRight, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { MathRenderer } from "@/components/MathRenderer";
import { useWeaknessStore } from "@/lib/store/weakness-store";
import { useGradeStore } from "@/lib/store/grade";
import { getGradeCurriculum } from "@/lib/data/curriculum";
import { useTranslation } from "@/lib/i18n";

export function SmartAssistant() {
    const [activeTab, setActiveTab] = useState<"formulas" | "insights">("formulas");
    const [expandedTopic, setExpandedTopic] = useState<string | null>(null);
    const { weaknesses, resolveWeakness } = useWeaknessStore();
    const { grade } = useGradeStore();
    const { locale } = useTranslation();
    const isEn = locale === "en";
    const curriculum = getGradeCurriculum(grade);

    return (
        <aside className="flex h-full flex-col overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--surface)]">
            <div className="p-4 border-b border-[var(--line)]">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-[var(--brand-soft)] flex items-center justify-center">
                        <BookOpen className="w-4 h-4 text-[var(--brand)]" />
                    </div>
                    <div>
                        <h3 className="text-sm font-semibold text-[var(--ink)]">{isEn ? "Study notebook" : "Sổ tay học tập"}</h3>
                        <p className="text-[11px] text-[var(--muted)] mt-0.5">{isEn ? `Physics ${grade} · GDPT 2018` : `Vật lí ${grade} · GDPT 2018`}</p>
                    </div>
                </div>
            </div>

            <div className="flex p-2 gap-1 border-b border-[var(--line)]">
                {([
                    { id: "formulas", icon: BookOpen, label: isEn ? "Formulas" : "Công thức" },
                    { id: "insights", icon: Lightbulb, label: isEn ? "My notes" : "Cần ôn lại" },
                ] as const).map((tab) => (
                    <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={cn("flex-1 flex items-center justify-center gap-2 py-2 text-xs font-medium rounded-lg transition-colors", activeTab === tab.id ? "bg-[var(--brand-soft)] text-[var(--brand)]" : "text-[var(--muted)] hover:bg-[var(--surface-subtle)]")}>
                        <tab.icon className="w-3.5 h-3.5" /> {tab.label}
                    </button>
                ))}
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar">
                {activeTab === "formulas" ? (
                    <>
                        <p className="px-1 mb-3 text-[10px] leading-relaxed text-[var(--muted)]">{isEn ? "Core topics. Check the conditions for each formula before using it." : "Mạch kiến thức cốt lõi. Chú ý điều kiện áp dụng khi dùng công thức."}</p>
                        {curriculum.topics.map((topic) => {
                            const isExpanded = expandedTopic === topic.id;
                            return (
                                <div key={topic.id} className="rounded-xl border border-[var(--line)] overflow-hidden">
                                    <button onClick={() => setExpandedTopic(isExpanded ? null : topic.id)} aria-expanded={isExpanded} className="w-full flex items-center gap-2 px-3 py-3 text-left hover:bg-[var(--surface-subtle)] transition-colors">
                                        <ChevronRight className={cn("w-3 h-3 transition-transform text-[var(--muted)] shrink-0", isExpanded && "rotate-90")} />
                                        <span className="text-xs font-medium text-[var(--ink)] flex-1">{isEn ? topic.titleEn : topic.title}</span>
                                        <span className="text-[10px] text-[var(--muted)]">{topic.formulas.length}</span>
                                    </button>
                                    {isExpanded && (
                                        <div className="px-3 pb-3 space-y-2">
                                            <p className="text-[11px] text-[var(--muted)] leading-relaxed">{isEn ? topic.summaryEn : topic.summary}</p>
                                            {topic.formulas.map((formula, index) => (
                                                <div key={index} className="p-2.5 rounded-lg bg-[var(--surface-subtle)] overflow-x-auto">
                                                    <MathRenderer content={formula} className="text-xs text-[var(--ink)]" />
                                                </div>
                                            ))}
                                            <Link href={`/tutor?grade=${grade}&topic=${topic.id}`} className="inline-flex items-center gap-1 text-[11px] font-medium text-[var(--brand)] hover:underline">
                                                {isEn ? "Explore with AI" : "Hiểu cùng gia sư AI"} <ArrowUpRight className="w-3 h-3" />
                                            </Link>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                        <div className="rounded-xl bg-[var(--surface-subtle)] p-3 mt-4">
                            <h4 className="text-[11px] font-semibold text-[var(--ink)] mb-2">{isEn ? "Optional specialist topics" : "Chuyên đề học tập lựa chọn"}</h4>
                            <ul className="space-y-1.5 text-[10px] leading-relaxed text-[var(--muted)]">
                                {(isEn ? curriculum.specialistTopicsEn : curriculum.specialistTopics).map((topic) => <li key={topic}>• {topic}</li>)}
                            </ul>
                        </div>
                    </>
                ) : weaknesses.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-10 text-center">
                        <Sparkles className="w-7 h-7 text-[var(--brand)] mb-4" />
                        <h4 className="text-sm font-semibold text-[var(--ink)] mb-2">{isEn ? "A fresh page for your progress" : "Bắt đầu ghi lại tiến bộ"}</h4>
                        <p className="text-xs text-[var(--muted)] leading-relaxed">{isEn ? "Questions you find difficult will appear here as you learn with your AI tutor." : "Những điểm cần ôn tập sẽ xuất hiện ở đây khi bạn trao đổi với gia sư AI."}</p>
                    </div>
                ) : (
                    <>
                        <p className="px-1 mb-3 text-[10px] text-[var(--muted)]">{isEn ? `Study notes across all grades (${weaknesses.length})` : `Ghi nhận học tập ở tất cả các lớp (${weaknesses.length})`}</p>
                        {weaknesses.map((weakness) => (
                            <div key={weakness.id} className={cn("p-3 rounded-xl border border-[var(--line)]", weakness.resolved ? "bg-[var(--surface-subtle)] opacity-60" : "bg-[var(--surface)]")}>
                                <div className="flex items-start justify-between gap-2 mb-1.5">
                                    <span className="text-[10px] font-medium text-[var(--brand)]">{weakness.topic}</span>
                                    <span className="text-[10px] text-[var(--muted)]">×{weakness.occurrences}</span>
                                </div>
                                <div className="text-xs text-[var(--ink)] mb-1">{weakness.concept}</div>
                                <div className="text-[11px] text-[var(--muted)] leading-relaxed">{weakness.breakdown}</div>
                                {!weakness.resolved && <button onClick={() => resolveWeakness(weakness.id)} className="mt-2 inline-flex items-center gap-1 text-[10px] font-medium text-[var(--brand)] hover:underline"><Check className="w-3 h-3" /> {isEn ? "I've understood this" : "Mình đã nắm vững"}</button>}
                            </div>
                        ))}
                    </>
                )}
            </div>
        </aside>
    );
}