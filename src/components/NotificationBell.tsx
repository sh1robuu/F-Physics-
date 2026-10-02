"use client";

import { useState, useEffect, useCallback, useMemo, useSyncExternalStore } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, X, BookOpen, Flame, AlertTriangle, Trash2 } from "lucide-react";
import { useTranslation } from "@/lib/i18n";

interface Notification {
    id: string;
    type: "study" | "streak" | "achievement" | "general";
    message: string;
    time: string;
    read: boolean;
}

const ICONS = {
    study: BookOpen,
    streak: Flame,
    achievement: AlertTriangle,
    general: Bell,
};

const COLORS = {
    study: "text-indigo-400 bg-indigo-400/10",
    streak: "text-orange-400 bg-orange-400/10",
    achievement: "text-emerald-400 bg-emerald-400/10",
    general: "text-white/40 bg-white/5",
};

const NOTIFICATION_KEY = "f-physics-notifications";
const NOTIFICATION_EVENT = "f-physics-notifications-change";
let memoryNotifications: string | null = null;

function readNotifications() {
    if (memoryNotifications !== null) return memoryNotifications;
    try { return localStorage.getItem(NOTIFICATION_KEY); } catch { return null; }
}

function parseNotifications(saved: string | null): Notification[] {
    try {
        const value: unknown = saved ? JSON.parse(saved) : [];
        if (!Array.isArray(value)) return [];
        return value.filter((item): item is Notification => {
            if (!item || typeof item !== "object") return false;
            const n = item as Partial<Notification>;
            return typeof n.id === "string" && typeof n.message === "string" &&
                typeof n.time === "string" && Number.isFinite(Date.parse(n.time)) &&
                typeof n.read === "boolean" && typeof n.type === "string" && n.type in ICONS;
        }).slice(0, 20);
    } catch { return []; }
}

function saveNotifications(notifications: Notification[]) {
    const saved = JSON.stringify(notifications);
    try {
        localStorage.setItem(NOTIFICATION_KEY, saved);
        memoryNotifications = null;
    } catch { memoryNotifications = saved; }
    window.dispatchEvent(new Event(NOTIFICATION_EVENT));
}

function subscribeNotifications(onChange: () => void) {
    window.addEventListener("storage", onChange);
    window.addEventListener(NOTIFICATION_EVENT, onChange);
    return () => {
        window.removeEventListener("storage", onChange);
        window.removeEventListener(NOTIFICATION_EVENT, onChange);
    };
}

const serverNotifications = () => null;

export function NotificationBell() {
    const { t, locale } = useTranslation();
    const [isOpen, setIsOpen] = useState(false);
    const [displayTime, setDisplayTime] = useState<number | null>(null);
    const saved = useSyncExternalStore(subscribeNotifications, readNotifications, serverNotifications);
    const notifications = useMemo(() => parseNotifications(saved), [saved]);
    const studyReminder = t("notification.studyReminder");
    const streakWarning = t("notification.streakWarning");

    useEffect(() => {
        // Generate smart reminders based on user activity
        let streakData: string | null = null;
        let lastNotifDate: string | null = null;
        try {
            streakData = localStorage.getItem("f-physics-streak");
            lastNotifDate = localStorage.getItem("f-physics-last-notif-date");
        } catch { /* Use the current session when browser storage is unavailable. */ }
        const today = new Date().toDateString();

        if (lastNotifDate !== today) {
            const newNotifs: Notification[] = [];

            if (streakData) {
                let streak: { lastActiveDate?: string; streak?: number } = {};
                try { streak = JSON.parse(streakData) ?? {}; } catch { /* Ignore an invalid saved record. */ }
                const lastActive = streak.lastActiveDate ? new Date(streak.lastActiveDate).toDateString() : null;
                if (lastActive && lastActive !== today) {
                    newNotifs.push({
                        id: `streak-${Date.now()}`,
                        type: "streak",
                        message: (streak.streak ?? 0) > 3 ? streakWarning : studyReminder,
                        time: new Date().toISOString(),
                        read: false,
                    });
                }
            } else {
                newNotifs.push({
                    id: `welcome-${Date.now()}`,
                    type: "study",
                    message: studyReminder,
                    time: new Date().toISOString(),
                    read: false,
                });
            }

            if (newNotifs.length > 0) {
                // Read the current snapshot so reminders never replace saved history.
                const merged = [...newNotifs, ...parseNotifications(readNotifications())].slice(0, 20);
                saveNotifications(merged);
                try { localStorage.setItem("f-physics-last-notif-date", today); } catch { }
            }
        }
    }, [studyReminder, streakWarning]);

    const unreadCount = notifications.filter((n) => !n.read).length;

    const markAllRead = useCallback(() => {
        saveNotifications(parseNotifications(readNotifications()).map((n) => ({ ...n, read: true })));
    }, []);

    const clearAll = useCallback(() => {
        saveNotifications([]);
    }, []);

    const formatTime = (iso: string) => {
        const diff = Math.max(0, (displayTime ?? Date.parse(iso)) - Date.parse(iso));
        const mins = Math.floor(diff / 60000);
        if (mins < 1) return locale === "vi" ? "vừa xong" : "just now";
        if (mins < 60) return `${mins}m`;
        const hours = Math.floor(mins / 60);
        if (hours < 24) return `${hours}h`;
        return `${Math.floor(hours / 24)}d`;
    };

    return (
        <div className="relative">
            <button
                aria-label={t("notification.title")}
                aria-expanded={isOpen}
                onClick={() => { setDisplayTime(Date.now()); setIsOpen(!isOpen); if (!isOpen) markAllRead(); }}
                className="relative p-2 rounded-lg text-white/40 hover:text-white/70 hover:bg-white/5 transition-all"
            >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-red-500 text-[10px] text-white flex items-center justify-center font-bold">
                        {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                )}
            </button>

            <AnimatePresence>
                {isOpen && (
                    <>
                        <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
                        <motion.div
                            initial={{ opacity: 0, y: -10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -10, scale: 0.95 }}
                            className="absolute right-0 top-full mt-2 w-80 rounded-2xl border border-white/10 bg-[#0f1024]/95 backdrop-blur-xl z-50 shadow-2xl overflow-hidden"
                        >
                            <div className="flex items-center justify-between p-3 border-b border-white/5">
                                <h3 className="text-sm font-semibold text-white">{t("notification.title")}</h3>
                                <div className="flex items-center gap-1">
                                    {notifications.length > 0 && (
                                        <button aria-label={t("notification.clearAll")} onClick={clearAll} className="p-1 rounded text-white/30 hover:text-red-400 transition-colors">
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                    )}
                                    <button aria-label={locale === "vi" ? "Đóng thông báo" : "Close notifications"} onClick={() => setIsOpen(false)} className="p-1 rounded text-white/30 hover:text-white/60 transition-colors">
                                        <X className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            </div>
                            <div className="max-h-64 overflow-y-auto">
                                {notifications.length === 0 ? (
                                    <div className="p-6 text-center text-white/30 text-sm">
                                        {t("notification.empty")}
                                    </div>
                                ) : (
                                    notifications.map((n) => {
                                        const Icon = ICONS[n.type];
                                        const colorClass = COLORS[n.type];
                                        return (
                                            <div
                                                key={n.id}
                                                className={`flex items-start gap-3 p-3 border-b border-white/5 transition-colors ${!n.read ? "bg-white/[0.02]" : ""}`}
                                            >
                                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${colorClass}`}>
                                                    <Icon className="w-4 h-4" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm text-white/70 leading-snug">{n.message}</p>
                                                    <span className="text-xs text-white/20">{formatTime(n.time)}</span>
                                                </div>
                                                {!n.read && <div className="w-2 h-2 rounded-full bg-indigo-400 mt-1.5 shrink-0" />}
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}
