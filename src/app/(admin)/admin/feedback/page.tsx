"use client";

import { motion } from "framer-motion";
import {
    MessageSquareHeart,
    Star,
    Users,
    BarChart3,
    TrendingUp,
    ChevronDown,
    GraduationCap,
    Clock,
    Filter,
} from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
} from "recharts";

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
    user: { name: string | null; email: string };
}

interface Stats {
    total: number;
    avgOverall: number;
    avgUI: number;
    avgContent: number;
    avgAI: number;
    avgUX: number;
    byGrade: { grade: string; count: number }[];
    byCategory: { category: string; count: number }[];
    ratingDistribution: { rating: number; count: number }[];
}

const GRADE_LABELS: Record<string, string> = { "10": "Lớp 10", "11": "Lớp 11", "12": "Lớp 12", other: "Khác" };
const CAT_LABELS: Record<string, string> = {
    general: "💬 Chung", feature: "✨ Tính năng", bug: "🐛 Lỗi", ui: "🎨 Giao diện", content: "📚 Nội dung",
};
const CHART_COLORS = ["#818cf8", "#34d399", "#f59e0b", "#f472b6", "#22d3ee"];

function StatCard({ label, value, sub, icon: Icon, color }: { label: string; value: string; sub?: string; icon: React.ElementType; color: string }) {
    return (
        <div className="glass-card p-5">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${color}/10`}>
                <Icon className={`w-5 h-5 ${color}`} />
            </div>
            <div className="text-2xl font-bold text-white">{value}</div>
            <div className="text-sm text-white/40 mt-1">{label}</div>
            {sub && <div className="text-xs text-white/25 mt-0.5">{sub}</div>}
        </div>
    );
}

export default function AdminFeedbackPage() {
    const [feedbacks, setFeedbacks] = useState<FeedbackItem[]>([]);
    const [stats, setStats] = useState<Stats | null>(null);
    const [loading, setLoading] = useState(true);
    const [filterGrade, setFilterGrade] = useState<string>("all");
    const [filterCat, setFilterCat] = useState<string>("all");

    const fetchData = useCallback(async () => {
        try {
            const res = await fetch("/api/feedback?admin=true", { credentials: "include" });
            if (res.ok) {
                const data = await res.json();
                setFeedbacks(data.feedbacks || []);
                setStats(data.stats || null);
            }
        } catch { /* ignore */ }
        finally { setLoading(false); }
    }, []);

    useEffect(() => { fetchData(); }, [fetchData]);

    const filtered = feedbacks.filter((fb) => {
        if (filterGrade !== "all" && fb.grade !== filterGrade) return false;
        if (filterCat !== "all" && fb.category !== filterCat) return false;
        return true;
    });

    const formatDate = (iso: string) =>
        new Date(iso).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="w-8 h-8 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    const aspectData = [
        { name: "Tổng thể", value: stats?.avgOverall || 0, fill: "#818cf8" },
        { name: "Giao diện", value: stats?.avgUI || 0, fill: "#f472b6" },
        { name: "Nội dung", value: stats?.avgContent || 0, fill: "#34d399" },
        { name: "AI Tutor", value: stats?.avgAI || 0, fill: "#6366f1" },
        { name: "Trải nghiệm", value: stats?.avgUX || 0, fill: "#f59e0b" },
    ];

    return (
        <div className="space-y-6 p-6 lg:p-8">
            {/* Header */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500/20 to-rose-500/20 border border-pink-500/20 flex items-center justify-center">
                        <MessageSquareHeart className="w-5 h-5 text-pink-400" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-white">Phân tích phản hồi</h1>
                        <p className="text-sm text-white/40">Tổng hợp và phân tích ý kiến người dùng</p>
                    </div>
                </div>
            </motion.div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard label="Tổng phản hồi" value={stats?.total?.toString() || "0"} icon={MessageSquareHeart} color="text-pink-400" />
                <StatCard label="Đánh giá TB" value={`${stats?.avgOverall || 0}/5`} sub="Tổng thể" icon={Star} color="text-amber-400" />
                <StatCard label="AI Tutor" value={`${stats?.avgAI || 0}/5`} sub="Trung bình" icon={TrendingUp} color="text-indigo-400" />
                <StatCard label="Giao diện" value={`${stats?.avgUI || 0}/5`} sub="Trung bình" icon={BarChart3} color="text-emerald-400" />
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Rating Distribution Bar Chart */}
                <motion.div className="glass-panel p-5" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                    <h3 className="text-sm font-semibold text-white/70 mb-4 flex items-center gap-2">
                        <BarChart3 className="w-4 h-4 text-indigo-400" />
                        Phân bố đánh giá (Overall)
                    </h3>
                    <ResponsiveContainer width="100%" height={220}>
                        <BarChart data={stats?.ratingDistribution || []} barCategoryGap="20%">
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                            <XAxis dataKey="rating" tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 12 }} tickFormatter={(v) => `${v}⭐`} />
                            <YAxis tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 12 }} allowDecimals={false} />
                            <Tooltip
                                contentStyle={{ background: "#0f1024", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", fontSize: 12 }}
                                formatter={(v: number) => [`${v} phản hồi`, "Số lượng"]}
                                labelFormatter={(l) => `${l} sao`}
                            />
                            <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                                {(stats?.ratingDistribution || []).map((_, i) => (
                                    <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </motion.div>

                {/* Aspect Averages Bar Chart */}
                <motion.div className="glass-panel p-5" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
                    <h3 className="text-sm font-semibold text-white/70 mb-4 flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-emerald-400" />
                        Đánh giá trung bình theo tiêu chí
                    </h3>
                    <ResponsiveContainer width="100%" height={220}>
                        <BarChart data={aspectData} barCategoryGap="15%" layout="vertical">
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                            <XAxis type="number" domain={[0, 5]} tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 12 }} />
                            <YAxis type="category" dataKey="name" tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 12 }} width={80} />
                            <Tooltip
                                contentStyle={{ background: "#0f1024", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", fontSize: 12 }}
                                formatter={(v: number) => [`${v}/5`, "TB"]}
                            />
                            <Bar dataKey="value" radius={[0, 6, 6, 0]}>
                                {aspectData.map((entry, i) => (
                                    <Cell key={i} fill={entry.fill} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </motion.div>

                {/* Grade Pie Chart */}
                <motion.div className="glass-panel p-5" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                    <h3 className="text-sm font-semibold text-white/70 mb-4 flex items-center gap-2">
                        <GraduationCap className="w-4 h-4 text-cyan-400" />
                        Phân bố theo khối lớp
                    </h3>
                    <div className="flex items-center gap-6">
                        <ResponsiveContainer width="50%" height={180}>
                            <PieChart>
                                <Pie
                                    data={stats?.byGrade || []}
                                    dataKey="count"
                                    nameKey="grade"
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={70}
                                    innerRadius={40}
                                    paddingAngle={3}
                                >
                                    {(stats?.byGrade || []).map((_, i) => (
                                        <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{ background: "#0f1024", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", fontSize: 12 }}
                                    formatter={(v: number, _: string, entry: { payload?: { grade?: string } }) => [`${v} phản hồi`, GRADE_LABELS[entry.payload?.grade || ""] || entry.payload?.grade]}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="space-y-2">
                            {(stats?.byGrade || []).map((g, i) => (
                                <div key={g.grade} className="flex items-center gap-2 text-sm">
                                    <div className="w-3 h-3 rounded-full" style={{ background: CHART_COLORS[i % CHART_COLORS.length] }} />
                                    <span className="text-white/50">{GRADE_LABELS[g.grade] || g.grade}</span>
                                    <span className="text-white/30">({g.count})</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </motion.div>

                {/* Category Distribution */}
                <motion.div className="glass-panel p-5" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
                    <h3 className="text-sm font-semibold text-white/70 mb-4 flex items-center gap-2">
                        <Filter className="w-4 h-4 text-amber-400" />
                        Phân bố theo danh mục
                    </h3>
                    <div className="space-y-3">
                        {(stats?.byCategory || []).map((c) => {
                            const pct = stats?.total ? Math.round((c.count / stats.total) * 100) : 0;
                            return (
                                <div key={c.category}>
                                    <div className="flex justify-between text-sm mb-1">
                                        <span className="text-white/60">{CAT_LABELS[c.category] || c.category}</span>
                                        <span className="text-white/30">{c.count} ({pct}%)</span>
                                    </div>
                                    <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                                        <motion.div
                                            className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500"
                                            initial={{ width: 0 }}
                                            animate={{ width: `${pct}%` }}
                                            transition={{ delay: 0.3, duration: 0.5 }}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </motion.div>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-3">
                <select
                    value={filterGrade}
                    onChange={(e) => setFilterGrade(e.target.value)}
                    className="glass-input text-sm px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white/60"
                >
                    <option value="all">Tất cả lớp</option>
                    {Object.entries(GRADE_LABELS).map(([k, v]) => (
                        <option key={k} value={k}>{v}</option>
                    ))}
                </select>
                <select
                    value={filterCat}
                    onChange={(e) => setFilterCat(e.target.value)}
                    className="glass-input text-sm px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white/60"
                >
                    <option value="all">Tất cả danh mục</option>
                    {Object.entries(CAT_LABELS).map(([k, v]) => (
                        <option key={k} value={k}>{v}</option>
                    ))}
                </select>
                <span className="text-xs text-white/30 ml-auto">{filtered.length} phản hồi</span>
            </div>

            {/* Feedback List */}
            <div className="space-y-3">
                {filtered.length === 0 ? (
                    <div className="glass-panel p-8 text-center">
                        <MessageSquareHeart className="w-8 h-8 text-white/10 mx-auto mb-3" />
                        <p className="text-white/30 text-sm">Chưa có phản hồi nào</p>
                    </div>
                ) : (
                    filtered.map((fb) => (
                        <motion.div
                            key={fb.id}
                            className="glass-panel p-4"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                        >
                            <div className="flex items-start justify-between mb-2">
                                <div className="flex items-center gap-2 flex-wrap">
                                    <div className="flex items-center gap-0.5">
                                        {[1, 2, 3, 4, 5].map((s) => (
                                            <Star key={s} className={`w-3.5 h-3.5 ${s <= fb.ratingOverall ? "text-amber-400 fill-amber-400" : "text-white/10"}`} />
                                        ))}
                                    </div>
                                    <span className="text-xs text-white/30 px-2 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/20">
                                        {GRADE_LABELS[fb.grade] || fb.grade}
                                    </span>
                                    <span className="text-xs text-white/30 px-2 py-0.5 rounded bg-white/5">
                                        {CAT_LABELS[fb.category] || fb.category}
                                    </span>
                                </div>
                                <div className="text-right">
                                    <div className="text-xs text-white/40">{fb.user?.name || "Ẩn danh"}</div>
                                    <div className="text-xs text-white/20">{formatDate(fb.createdAt)}</div>
                                </div>
                            </div>

                            {/* Aspect ratings inline */}
                            {(fb.ratingUI > 0 || fb.ratingContent > 0 || fb.ratingAI > 0 || fb.ratingUX > 0) && (
                                <div className="flex gap-3 mb-2 text-xs text-white/30">
                                    {fb.ratingUI > 0 && <span>🎨 UI: {fb.ratingUI}/5</span>}
                                    {fb.ratingContent > 0 && <span>📚 Nội dung: {fb.ratingContent}/5</span>}
                                    {fb.ratingAI > 0 && <span>🧠 AI: {fb.ratingAI}/5</span>}
                                    {fb.ratingUX > 0 && <span>📱 UX: {fb.ratingUX}/5</span>}
                                </div>
                            )}

                            <p className="text-sm text-white/60 leading-relaxed">{fb.message}</p>
                        </motion.div>
                    ))
                )}
            </div>
        </div>
    );
}
