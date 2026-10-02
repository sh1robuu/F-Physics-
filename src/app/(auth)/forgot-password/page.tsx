"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Atom, Mail, ArrowLeft, Send } from "lucide-react";
import { useTranslation } from "@/lib/i18n";

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [sent, setSent] = useState(false);
    const [error, setError] = useState("");
    const { t } = useTranslation();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");
        try {
            const res = await fetch("/api/auth/forget-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, redirectTo: "/reset-password" }),
            });
            if (res.ok) {
                setSent(true);
            } else {
                const data = await res.json().catch(() => ({}));
                setError(data.message || t("common.error"));
            }
        } catch {
            setError(t("common.error"));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <main className="min-h-screen flex items-center justify-center px-6 relative">
            <div className="gradient-orb w-[300px] h-[300px] bg-violet-500 top-[-50px] right-[-50px]" />

            <motion.div
                className="w-full max-w-md relative z-10"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <div className="text-center mb-8">
                    <Link href="/" className="inline-flex items-center gap-2 mb-6">
                        <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center">
                            <Atom className="w-6 h-6 text-indigo-400" />
                        </div>
                        <span className="text-xl font-bold text-white">F-Physics</span>
                    </Link>
                    <h1 className="text-2xl font-bold text-white mb-2">{t("auth.forgot.title")}</h1>
                    <p className="text-white/50 text-sm">{t("auth.forgot.subtitle")}</p>
                </div>

                <div className="glass-panel p-8">
                    {sent ? (
                        <div className="text-center py-4">
                            <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-4">
                                <Send className="w-7 h-7 text-emerald-400" />
                            </div>
                            <h3 className="text-lg font-semibold text-white mb-2">{t("auth.forgot.sent")}</h3>
                            <p className="text-sm text-white/50 mb-6">
                                {t("auth.forgot.sentDesc")} <strong className="text-white/70">{email}</strong>
                            </p>
                            <Link href="/login" className="btn-secondary inline-flex items-center gap-2">
                                <ArrowLeft className="w-4 h-4" /> {t("auth.forgot.back")}
                            </Link>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-5">
                            {error && (
                                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-sm text-red-300">
                                    {error}
                                </div>
                            )}
                            <div>
                                <label htmlFor="auth-email" className="block text-sm font-medium text-white/70 mb-2">Email</label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                                    <input
                                        id="auth-email" autoComplete="email" type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="glass-input pl-10"
                                        placeholder="student@example.com"
                                        required
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="btn-primary w-full flex items-center justify-center gap-2 py-3"
                            >
                                {isLoading ? (
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    t("auth.forgot.button")
                                )}
                            </button>

                            <p className="text-center">
                                <Link href="/login" className="text-sm text-white/40 hover:text-white/60 inline-flex items-center gap-1">
                                    <ArrowLeft className="w-3 h-3" /> {t("auth.forgot.back")}
                                </Link>
                            </p>
                        </form>
                    )}
                </div>
            </motion.div>
        </main>
    );
}

