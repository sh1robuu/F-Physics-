"use client";

import { motion } from "framer-motion";
import {
    User,
    BarChart3,
    Target,
    Clock,
    CheckCircle2,
    Brain,
    Sparkles,
    Pencil,
    Save,
    X,
    Camera,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useTranslation } from "@/lib/i18n";
import { useAuth } from "@/components/AuthProvider";
import { useState, useEffect, useCallback, useRef } from "react";
import { ProgressCharts } from "@/components/ProgressCharts";

interface ProfileStats {
    totalQuestions: number;
    accuracy: number | null;
    sessions: number;
    studyHours: number;
    correctAnswers: number;
    totalExamAttempts: number;
}

interface ProfileData {
    id: string;
    name: string | null;
    email: string;
    avatar: string | null;
    role: string;
    preferredMode: string;
    gamification: boolean;
    createdAt: string;
}

export default function ProfilePage() {
    const { t } = useTranslation();
    const { user: authUser } = useAuth();
    const [profile, setProfile] = useState<ProfileData | null>(null);
    const [stats, setStats] = useState<ProfileStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(false);
    const [editName, setEditName] = useState("");
    const [saving, setSaving] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Load avatar from localStorage on mount
    useEffect(() => {
        const saved = localStorage.getItem("f-physics-avatar");
        if (saved) setAvatarUrl(saved);
    }, []);

    const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (file.size > 2 * 1024 * 1024) {
            alert("File too large. Max 2MB.");
            return;
        }
        const reader = new FileReader();
        reader.onload = (ev) => {
            const dataUrl = ev.target?.result as string;
            setAvatarUrl(dataUrl);
            localStorage.setItem("f-physics-avatar", dataUrl);
        };
        reader.readAsDataURL(file);
    };

    const fetchProfile = useCallback(async () => {
        try {
            const res = await fetch("/api/profile", {
                credentials: "include",
            });
            if (res.ok) {
                const data = await res.json();
                setProfile(data.user);
                setStats(data.stats);
            } else {
                // Fallback: use auth context data
                if (authUser) {
                    setProfile({
                        id: (authUser as Record<string, unknown>).id as string || "",
                        name: authUser.name || null,
                        email: (authUser as Record<string, unknown>).email as string || "",
                        avatar: null,
                        role: ((authUser as Record<string, unknown>).role as string) || "STUDENT",
                        preferredMode: "AUTO",
                        gamification: true,
                        createdAt: new Date().toISOString(),
                    });
                }
            }
        } catch (err) {
            console.error("[Profile]", err);
        } finally {
            setLoading(false);
        }
    }, [authUser]);

    useEffect(() => {
        fetchProfile();
    }, [fetchProfile]);

    const handleSave = async () => {
        setSaving(true);
        try {
            const res = await fetch("/api/profile", {
                method: "PUT",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: editName }),
            });
            if (res.ok) {
                const data = await res.json();
                setProfile(data.user);
                setEditing(false);
                setSaveSuccess(true);
                setTimeout(() => setSaveSuccess(false), 2000);
            }
        } catch (err) {
            console.error("[Profile Save]", err);
        } finally {
            setSaving(false);
        }
    };

    const startEdit = () => {
        setEditName(profile?.name || "");
        setEditing(true);
    };

    const displayName = profile?.name || authUser?.name || "—";
    const initials = displayName
        .split(" ")
        .map((w) => w[0])
        .slice(0, 2)
        .join("")
        .toUpperCase();

    const statCards = [
        {
            label: t("profile.totalQuestions"),
            value: stats?.totalQuestions?.toString() || "0",
            icon: Target,
            color: "text-indigo-400",
            bg: "bg-indigo-400/10",
        },
        {
            label: t("profile.accuracy"),
            value: stats?.accuracy != null ? `${stats.accuracy}%` : "—",
            icon: CheckCircle2,
            color: "text-emerald-400",
            bg: "bg-emerald-400/10",
        },
        {
            label: t("profile.sessions"),
            value: stats?.sessions?.toString() || "0",
            icon: Brain,
            color: "text-cyan-400",
            bg: "bg-cyan-400/10",
        },
        {
            label: t("profile.studyTime"),
            value: stats?.studyHours ? `${stats.studyHours}h` : "0h",
            icon: Clock,
            color: "text-violet-400",
            bg: "bg-violet-400/10",
        },
    ];

    const hasActivity = stats && stats.totalQuestions > 0;

    if (loading) {
        return (
            <div className="max-w-4xl mx-auto p-6 lg:p-8">
                <div className="glass-panel p-10 text-center">
                    <div className="w-10 h-10 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin mx-auto" />
                    <p className="text-white/40 text-sm mt-4">{t("common.loading")}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6 p-6 lg:p-8">
            {/* Profile Card */}
            <motion.div
                className="glass-panel p-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <div className="flex items-start gap-5">
                    {/* Avatar */}
                    <div className="relative group">
                        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500/30 to-violet-500/30 border border-white/10 flex items-center justify-center text-2xl font-bold text-white overflow-hidden">
                            {avatarUrl ? (
                                <img src={avatarUrl} alt="" className="w-full h-full object-cover" />
                            ) : profile?.avatar ? (
                                <img src={profile.avatar} alt="" className="w-full h-full object-cover" />
                            ) : (
                                initials || <User className="w-8 h-8 text-white/50" />
                            )}
                        </div>
                        {/* Camera overlay */}
                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="absolute inset-0 rounded-2xl bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
                        >
                            <Camera className="w-5 h-5 text-white" />
                        </button>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleAvatarUpload}
                        />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                        {editing ? (
                            <div className="flex items-center gap-2 mb-1">
                                <input
                                    type="text"
                                    value={editName}
                                    onChange={(e) => setEditName(e.target.value)}
                                    className="glass-input px-3 py-1.5 text-lg font-bold w-full max-w-xs"
                                    autoFocus
                                    onKeyDown={(e) => e.key === "Enter" && handleSave()}
                                />
                                <button
                                    onClick={handleSave}
                                    disabled={saving}
                                    className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 transition-colors"
                                >
                                    <Save className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => setEditing(false)}
                                    className="p-1.5 rounded-lg bg-white/5 text-white/40 hover:bg-white/10 transition-colors"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2 mb-1">
                                <h1 className="text-xl font-bold text-white truncate">{displayName}</h1>
                                <button
                                    onClick={startEdit}
                                    className="p-1 rounded-lg text-white/30 hover:text-white/60 hover:bg-white/5 transition-all"
                                >
                                    <Pencil className="w-3.5 h-3.5" />
                                </button>
                                {saveSuccess && (
                                    <motion.span
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0 }}
                                        className="text-xs text-emerald-400"
                                    >
                                        ✓ {t("common.save")}
                                    </motion.span>
                                )}
                            </div>
                        )}
                        <p className="text-sm text-white/40">{profile?.email}</p>
                        <div className="flex items-center gap-3 mt-2">
                            <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/20">
                                {profile?.role || "STUDENT"}
                            </span>
                            <span className="text-xs text-white/20">
                                {t("profile.joined")} {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString() : "—"}
                            </span>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {statCards.map((s, i) => (
                    <motion.div
                        key={s.label}
                        className="glass-card p-4"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 + i * 0.05 }}
                    >
                        <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center mb-3", s.bg)}>
                            <s.icon className={cn("w-4 h-4", s.color)} />
                        </div>
                        <div className="text-xl font-bold text-white">{s.value}</div>
                        <div className="text-xs text-white/40">{s.label}</div>
                    </motion.div>
                ))}
            </div>

            {/* Activity or Empty State */}
            {hasActivity ? (
                <>
                    <motion.div
                        className="glass-panel p-6"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                    >
                        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                            <BarChart3 className="w-5 h-5 text-indigo-400" />
                            {t("profile.activityTitle")}
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="glass-card p-4">
                                <div className="text-sm text-white/50 mb-2">{t("profile.examBreakdown")}</div>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-2xl font-bold text-emerald-400">{stats?.correctAnswers || 0}</span>
                                    <span className="text-white/30 text-sm">/ {stats?.totalExamAttempts || 0} {t("profile.questionsCorrect")}</span>
                                </div>
                                {stats && stats.totalExamAttempts > 0 && (
                                    <div className="mt-3 h-2 rounded-full bg-white/5 overflow-hidden">
                                        <div
                                            className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-cyan-500 transition-all duration-1000"
                                            style={{ width: `${stats.accuracy || 0}%` }}
                                        />
                                    </div>
                                )}
                            </div>
                            <div className="glass-card p-4">
                                <div className="text-sm text-white/50 mb-2">{t("profile.totalSubmissions")}</div>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-2xl font-bold text-indigo-400">{stats?.totalQuestions || 0}</span>
                                    <span className="text-white/30 text-sm">{t("profile.questionsAsked")}</span>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Progress Charts */}
                    <ProgressCharts />
                </>
            ) : (
                <motion.div
                    className="glass-panel p-10 text-center"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                >
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-violet-500/20 border border-white/10 flex items-center justify-center mx-auto mb-4">
                        <BarChart3 className="w-8 h-8 text-indigo-400" />
                    </div>
                    <h2 className="text-lg font-semibold text-white mb-2">{t("profile.emptyTitle")}</h2>
                    <p className="text-sm text-white/50 max-w-md mx-auto mb-6">
                        {t("profile.emptyDesc")}
                    </p>
                    <Link
                        href="/tutor"
                        className="btn-primary inline-flex items-center gap-2 px-6 py-3"
                    >
                        <Sparkles className="w-4 h-4" />
                        {t("profile.startButton")}
                    </Link>
                </motion.div>
            )}
        </div>
    );
}
