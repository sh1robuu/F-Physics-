"use client";

import { motion } from "framer-motion";
import { Flame, Trophy, Zap } from "lucide-react";
import { useTranslation } from "@/lib/i18n";
import { useEffect, useMemo, useSyncExternalStore } from "react";

interface StreakData {
    streak: number;
    xp: number;
    todayCheckedIn: boolean;
    lastActiveDate: string | null;
}

const STREAK_KEY = "f-physics-streak";
const STREAK_EVENT = "f-physics-streak-change";
const EMPTY_STREAK: StreakData = { streak: 0, xp: 0, todayCheckedIn: false, lastActiveDate: null };
const SERVER_STREAK = JSON.stringify(EMPTY_STREAK);
let memoryStreak: string | null = null;

function readStreak(): string {
    let saved = memoryStreak;
    if (saved === null) {
        try { saved = localStorage.getItem(STREAK_KEY); } catch { }
    }
    try {
        const parsed = saved ? JSON.parse(saved) as Partial<StreakData> | null : null;
        if (!parsed || typeof parsed !== "object") return SERVER_STREAK;
        const xp = typeof parsed.xp === "number" && Number.isFinite(parsed.xp) ? Math.max(0, parsed.xp) : 0;
        const streak = typeof parsed.streak === "number" && Number.isFinite(parsed.streak) ? Math.max(0, Math.floor(parsed.streak)) : 0;
        const lastActiveDate = typeof parsed.lastActiveDate === "string" && Number.isFinite(Date.parse(parsed.lastActiveDate)) ? parsed.lastActiveDate : null;
        const lastActive = lastActiveDate ? new Date(lastActiveDate).toDateString() : null;
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        const todayCheckedIn = lastActive === today.toDateString();
        return JSON.stringify({
            streak: todayCheckedIn || lastActive === yesterday.toDateString() ? streak : 0,
            xp,
            todayCheckedIn,
            lastActiveDate,
        } satisfies StreakData);
    } catch { return SERVER_STREAK; }
}

function subscribeStreak(onChange: () => void) {
    window.addEventListener("storage", onChange);
    window.addEventListener(STREAK_EVENT, onChange);
    // Refresh the calendar day if the page stays open overnight.
    const interval = setInterval(onChange, 60_000);
    return () => {
        window.removeEventListener("storage", onChange);
        window.removeEventListener(STREAK_EVENT, onChange);
        clearInterval(interval);
    };
}

const serverStreak = () => SERVER_STREAK;

function checkIn() {
    // Read at the time of the event, so a second tab cannot reuse a stale render.
    const data = JSON.parse(readStreak()) as StreakData;
    if (data.todayCheckedIn) return;
    const newData: StreakData = {
        streak: data.streak + 1,
        xp: data.xp + 10 + data.streak * 2,
        todayCheckedIn: true,
        lastActiveDate: new Date().toISOString(),
    };
    const saved = JSON.stringify(newData);
    try {
        localStorage.setItem(STREAK_KEY, saved);
        memoryStreak = null;
    } catch { memoryStreak = saved; }
    window.dispatchEvent(new Event(STREAK_EVENT));
}

function getLevel(xp: number) {
    if (xp >= 5000) return { level: 5, badge: "streak.badge.legend" as const, color: "text-amber-400", bg: "bg-amber-400/10", next: Infinity };
    if (xp >= 2000) return { level: 4, badge: "streak.badge.master" as const, color: "text-violet-400", bg: "bg-violet-400/10", next: 5000 };
    if (xp >= 800) return { level: 3, badge: "streak.badge.scholar" as const, color: "text-cyan-400", bg: "bg-cyan-400/10", next: 2000 };
    if (xp >= 200) return { level: 2, badge: "streak.badge.learner" as const, color: "text-emerald-400", bg: "bg-emerald-400/10", next: 800 };
    return { level: 1, badge: "streak.badge.newcomer" as const, color: "text-indigo-400", bg: "bg-indigo-400/10", next: 200 };
}

export function StreakCard() {
    const { t } = useTranslation();
    const saved = useSyncExternalStore(subscribeStreak, readStreak, serverStreak);
    const data = useMemo(() => JSON.parse(saved) as StreakData, [saved]);

    // Auto check-in when ANY page activity happens
    useEffect(() => {
        if (!data.todayCheckedIn) {
            const timeout = setTimeout(checkIn, 2000); // auto check-in after 2s on page
            return () => clearTimeout(timeout);
        }
    }, [data.todayCheckedIn]);

    const level = getLevel(data.xp);
    const xpProgress = level.next === Infinity ? 100 : Math.min(100, Math.round((data.xp / level.next) * 100));

    return (
        <motion.div
            className="glass-card p-4"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
        >
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-xl bg-orange-400/10 flex items-center justify-center">
                        <Flame className="w-5 h-5 text-orange-400" />
                    </div>
                    <div>
                        <div className="text-xl font-bold text-white">{data.streak}</div>
                        <div className="text-xs text-white/40">{t("streak.days")}</div>
                    </div>
                </div>
                <div className="text-right">
                    <div className="flex items-center gap-1 text-sm">
                        <Zap className="w-3.5 h-3.5 text-yellow-400" />
                        <span className="text-white/70 font-medium">{data.xp} XP</span>
                    </div>
                    <div className={`text-xs ${level.color}`}>
                        <Trophy className="w-3 h-3 inline mr-0.5" />
                        {t(level.badge)}
                    </div>
                </div>
            </div>
            {/* XP Progress Bar */}
            <div className="h-1.5 rounded-full bg-white/5 overflow-hidden mb-2">
                <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500"
                    initial={{ width: 0 }}
                    animate={{ width: `${xpProgress}%` }}
                    transition={{ duration: 1, delay: 0.3 }}
                />
            </div>
            <div className="text-xs text-center">
                {data.todayCheckedIn ? (
                    <span className="text-emerald-400">{t("streak.todayDone")}</span>
                ) : (
                    <span className="text-orange-300/70">{t("streak.todayPending")}</span>
                )}
            </div>
        </motion.div>
    );
}
