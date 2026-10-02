"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
    MessageSquareHeart,
    Star,
    Send,
    CheckCircle2,
    Clock,
    Sparkles,
    GraduationCap,
    Palette,
    BookOpen,
    Brain,
    Smartphone,
    AlertTriangle,
} from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { useTranslation, type TranslationKey } from "@/lib/i18n";
import { useGradeStore } from "@/lib/store/grade";

interface FeedbackItem {
    id: string;
    grade: string;
    category: string;
    message: string;
    ratingOverall: number;
    ratingUI: number;
    ratingContent: number;
    ratingAI: number;
    ratingUX: number;
    createdAt: string;
}

const CATEGORIES = [
    { value: "general", icon: MessageSquareHeart, color: "text-violet-400", bg: "bg-violet-500/15" },
    { value: "feature", icon: Sparkles, color: "text-cyan-400", bg: "bg-cyan-500/15" },
    { value: "bug", icon: AlertTriangle, color: "text-red-400", bg: "bg-red-500/15" },
    { value: "ui", icon: Palette, color: "text-pink-400", bg: "bg-pink-500/15" },
    { value: "content", icon: BookOpen, color: "text-emerald-400", bg: "bg-emerald-500/15" },
];

const GRADES = ["10", "11", "12", "other"];

const ASPECTS = [
    { key: "ratingUI", icon: Palette, color: "text-pink-400" },
    { key: "ratingContent", icon: BookOpen, color: "text-emerald-400" },
    { key: "ratingAI", icon: Brain, color: "text-indigo-400" },
    { key: "ratingUX", icon: Smartphone, color: "text-amber-400" },
];

function StarRating({ value, onChange, size = "md" }: { value: number; onChange: (v: number) => void; size?: "sm" | "md" }) {
    const [hover, setHover] = useState(0);
    const sz = size === "sm" ? "w-5 h-5" : "w-7 h-7";
    return (
        <div className="flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map((s) => (
                <button
                    key={s}
                    type="button"
                    onClick={() => onChange(s)}
                    onMouseEnter={() => setHover(s)}
                    onMouseLeave={() => setHover(0)}
                    className="p-0.5 transition-transform hover:scale-110"
                >
                    <Star className={`${sz} transition-colors ${s <= (hover || value) ? "text-amber-400 fill-amber-400" : "text-white/15"}`} />
                </button>
            ))}
        </div>
    );
}

export default function FeedbackPage() {
    const { t } = useTranslation();
    const currentGrade = useGradeStore((state) => state.grade);
    const [gradeOverride, setGrade] = useState<string | null>(null);
    const grade = gradeOverride ?? String(currentGrade);
    const [category, setCategory] = useState("general");
    const [message, setMessage] = useState("");
    const [ratingOverall, setRatingOverall] = useState(0);
    const [ratingUI, setRatingUI] = useState(0);
    const [ratingContent, setRatingContent] = useState(0);
    const [ratingAI, setRatingAI] = useState(0);
    const [ratingUX, setRatingUX] = useState(0);
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [history, setHistory] = useState<FeedbackItem[]>([]);
    const [loadingHistory, setLoadingHistory] = useState(true);

    const aspectSetters: Record<string, (v: number) => void> = {
        ratingUI: setRatingUI,
        ratingContent: setRatingContent,
        ratingAI: setRatingAI,
        ratingUX: setRatingUX,
    };

    const aspectValues: Record<string, number> = {
        ratingUI,
        ratingContent,
        ratingAI,
        ratingUX,
    };

    const fetchHistory = useCallback(async () => {
        try {
            const res = await fetch("/api/feedback", { credentials: "include" });
            if (res.ok) {
                const data = await res.json();
                setHistory(data.feedbacks || []);
            }
        } catch { /* ignore */ }
        finally { setLoadingHistory(false); }
    }, []);

    useEffect(() => { fetchHistory(); }, [fetchHistory]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!message.trim() || ratingOverall === 0) return;
        setSubmitting(true);
        try {
            const res = await fetch("/api/feedback", {
                method: "POST",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    grade, category, message: message.trim(),
                    ratingOverall, ratingUI, ratingContent, ratingAI, ratingUX,
                }),
            });
            if (res.ok) {
                setSubmitted(true);
                setRatingOverall(0); setRatingUI(0); setRatingContent(0);
                setRatingAI(0); setRatingUX(0);
                setMessage(""); setCategory("general"); setGrade(null);
                fetchHistory();
                setTimeout(() => setSubmitted(false), 3000);
            }
        } catch { /* ignore */ }
        finally { setSubmitting(false); }
    };

    const formatDate = (iso: string) =>
        new Date(iso).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });

    return (
        <div className="max-w-3xl mx-auto space-y-6 p-6 lg:p-8">
            {/* Header */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500/20 to-rose-500/20 border border-pink-500/20 flex items-center justify-center">
                        <MessageSquareHeart className="w-5 h-5 text-pink-400" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-white">{t("feedback.title")}</h1>
                        <p className="text-sm text-white/40">{t("feedback.subtitle")}</p>
                    </div>
                </div>
            </motion.div>

            {/* Form */}
            <motion.form
                onSubmit={handleSubmit}
                className="glass-panel p-6 space-y-5"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
            >
                {/* Grade selector */}
                <div>
                    <label className="text-sm font-medium text-white/60 mb-2 flex items-center gap-2">
                        <GraduationCap className="w-4 h-4" />
                        {t("feedback.gradeLabel")}
                    </label>
                    <div className="flex gap-2">
                        {GRADES.map((g) => (
                            <button
                                key={g}
                                type="button"
                                onClick={() => setGrade(g)}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${grade === g
                                    ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30"
                                    : "bg-white/5 text-white/40 border border-white/5 hover:bg-white/10"
                                    }`}
                            >
                                {t(`feedback.grade.${g}` as TranslationKey)}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Overall rating */}
                <div>
                    <label className="text-sm font-medium text-white/60 mb-2 block">
                        {t("feedback.ratingLabel")}
                    </label>
                    <div className="flex items-center gap-2">
                        <StarRating value={ratingOverall} onChange={setRatingOverall} size="md" />
                        {ratingOverall > 0 && <span className="text-sm text-white/40">{ratingOverall}/5</span>}
                    </div>
                </div>

                {/* Aspect ratings */}
                <div>
                    <label className="text-sm font-medium text-white/60 mb-3 block">
                        {t("feedback.aspectLabel")}
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {ASPECTS.map((asp) => (
                            <div
                                key={asp.key}
                                className="flex items-center gap-3 bg-white/[0.02] rounded-xl px-3 py-2.5 border border-white/5"
                            >
                                <asp.icon className={`w-4 h-4 ${asp.color} shrink-0`} />
                                <span className="text-xs text-white/50 flex-1">
                                    {t(`feedback.aspect.${asp.key}` as TranslationKey)}
                                </span>
                                <StarRating value={aspectValues[asp.key]} onChange={aspectSetters[asp.key]} size="sm" />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Category */}
                <div>
                    <label className="text-sm font-medium text-white/60 mb-2 block">
                        {t("feedback.categoryLabel")}
                    </label>
                    <div className="flex flex-wrap gap-2">
                        {CATEGORIES.map((cat) => (
                            <button
                                key={cat.value}
                                type="button"
                                onClick={() => setCategory(cat.value)}
                                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${category === cat.value
                                    ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30"
                                    : "bg-white/5 text-white/40 border border-white/5 hover:bg-white/10"
                                    }`}
                            >
                                <cat.icon className={`w-3.5 h-3.5 ${category === cat.value ? "text-indigo-300" : cat.color}`} />
                                {t(`feedback.cat.${cat.value}` as TranslationKey)}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Message */}
                <div>
                    <label className="text-sm font-medium text-white/60 mb-2 block">
                        {t("feedback.messageLabel")}
                    </label>
                    <textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder={t("feedback.messagePlaceholder")}
                        rows={4}
                        className="w-full glass-input resize-none text-sm leading-relaxed"
                    />
                </div>

                {/* Submit */}
                <div className="flex items-center justify-between">
                    <p className="text-xs text-white/20">{t("feedback.anonymous")}</p>
                    <button
                        type="submit"
                        disabled={submitting || !message.trim() || ratingOverall === 0}
                        className="btn-primary px-5 py-2.5 text-sm flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                        {submitting ? (
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                            <Send className="w-4 h-4" />
                        )}
                        {t("feedback.submit")}
                    </button>
                </div>
            </motion.form>

            {/* Success toast */}
            <AnimatePresence>
                {submitted && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                        className="fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 backdrop-blur-xl shadow-2xl"
                    >
                        <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                        <span className="text-sm font-medium text-emerald-300">{t("feedback.successMessage")}</span>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* History */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                <h2 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-white/40" />
                    {t("feedback.history")}
                </h2>
                {loadingHistory ? (
                    <div className="glass-panel p-6 text-center">
                        <div className="w-6 h-6 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin mx-auto" />
                    </div>
                ) : history.length === 0 ? (
                    <div className="glass-panel p-8 text-center">
                        <Sparkles className="w-8 h-8 text-white/10 mx-auto mb-3" />
                        <p className="text-white/30 text-sm">{t("feedback.noHistory")}</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {history.map((fb) => (
                            <div key={fb.id} className="glass-panel p-4">
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                        <div className="flex items-center gap-0.5">
                                            {[1, 2, 3, 4, 5].map((s) => (
                                                <Star key={s} className={`w-3.5 h-3.5 ${s <= fb.ratingOverall ? "text-amber-400 fill-amber-400" : "text-white/10"}`} />
                                            ))}
                                        </div>
                                        <span className="text-xs text-white/30 px-2 py-0.5 rounded bg-white/5">
                                            {t(`feedback.grade.${fb.grade}` as TranslationKey)}
                                        </span>
                                        <span className="text-xs text-white/30 px-2 py-0.5 rounded bg-white/5 flex items-center gap-1">
                                            {(() => {
                                                const found = CATEGORIES.find((c) => c.value === fb.category);
                                                if (found) {
                                                    const Icon = found.icon;
                                                    return <Icon className={`w-3 h-3 ${found.color}`} />;
                                                }
                                                return null;
                                            })()}
                                            {t(`feedback.cat.${fb.category}` as TranslationKey)}
                                        </span>
                                    </div>
                                    <span className="text-xs text-white/20">{formatDate(fb.createdAt)}</span>
                                </div>
                                <p className="text-sm text-white/60 leading-relaxed">{fb.message}</p>
                            </div>
                        ))}
                    </div>
                )}
            </motion.div>
        </div>
    );
}
