"use client";

import { useState, useSyncExternalStore } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { User, LogOut, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import { useTranslation } from "@/lib/i18n";
import Link from "next/link";

function readAvatar() {
    try { return localStorage.getItem("f-physics-avatar"); } catch { return null; }
}

function subscribeAvatar(onChange: () => void) {
    window.addEventListener("storage", onChange);
    // The existing profile page writes localStorage directly in this tab.
    const interval = setInterval(onChange, 2000);
    return () => {
        window.removeEventListener("storage", onChange);
        clearInterval(interval);
    };
}

const serverAvatar = () => null;

export function UserAvatarDropdown() {
    const { t } = useTranslation();
    const { user, logout } = useAuth();
    const router = useRouter();
    const [isOpen, setIsOpen] = useState(false);
    const avatarUrl = useSyncExternalStore(subscribeAvatar, readAvatar, serverAvatar);

    const displayName = user?.name || "User";
    const initials = (() => {
        try {
            return displayName.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();
        } catch {
            return "U";
        }
    })();

    const handleLogout = async () => {
        setIsOpen(false);
        await logout();
        router.push("/login");
    };

    return (
        <div className="relative">
            <button
                aria-label={t("sidebar.profile")}
                aria-expanded={isOpen}
                onClick={() => setIsOpen(!isOpen)}
                className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500/30 to-violet-500/30 border border-white/10 flex items-center justify-center text-sm font-bold text-white shadow-lg backdrop-blur-md cursor-pointer hover:border-white/20 hover:from-indigo-500/40 hover:to-violet-500/40 transition-all overflow-hidden"
            >
                {avatarUrl ? (
                    <img src={avatarUrl} alt="" className="w-full h-full object-cover" />
                ) : (
                    initials
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
                            transition={{ duration: 0.12 }}
                            className="absolute right-0 top-full mt-2 w-56 rounded-2xl border border-white/10 bg-[#0f1024]/95 backdrop-blur-xl z-50 shadow-2xl overflow-hidden"
                        >
                            {/* User info header */}
                            <div className="px-4 py-3 border-b border-white/5 flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500/30 to-violet-500/30 border border-white/10 flex items-center justify-center text-xs font-bold text-white overflow-hidden shrink-0">
                                    {avatarUrl ? (
                                        <img src={avatarUrl} alt="" className="w-full h-full object-cover" />
                                    ) : (
                                        initials
                                    )}
                                </div>
                                <div className="min-w-0">
                                    <div className="text-sm font-semibold text-white truncate">{displayName}</div>
                                    <div className="text-xs text-white/30 truncate">
                                        {(user as Record<string, unknown>)?.email as string || ""}
                                    </div>
                                </div>
                            </div>

                            {/* Menu items */}
                            <div className="py-1">
                                <Link
                                    href="/profile"
                                    onClick={() => setIsOpen(false)}
                                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-white/60 hover:bg-white/5 hover:text-white transition-colors"
                                >
                                    <User className="w-4 h-4" />
                                    <span className="flex-1">{t("sidebar.profile")}</span>
                                    <ChevronRight className="w-3.5 h-3.5 text-white/20" />
                                </Link>
                            </div>

                            {/* Logout */}
                            <div className="border-t border-white/5 py-1">
                                <button
                                    onClick={handleLogout}
                                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-red-400/70 hover:bg-red-500/10 hover:text-red-400 transition-colors w-full"
                                >
                                    <LogOut className="w-4 h-4" />
                                    <span>{t("common.logout")}</span>
                                </button>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}
