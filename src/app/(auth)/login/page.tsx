"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Atom, Mail, Lock, Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";
import { useTranslation } from "@/lib/i18n";

export default function LoginPage() {
    const { login } = useAuth();
    const { t, locale } = useTranslation();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [errorCode, setErrorCode] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [rememberMe, setRememberMe] = useState(true);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setErrorCode("");
        setIsLoading(true);
        const result = await login(email, password, rememberMe);
        if (result.error) {
            setError(result.error);
            setErrorCode(result.code || "");
            setIsLoading(false);
        }
    };

    return (
        <main className="min-h-screen flex items-center justify-center px-6 relative">
            <div className="gradient-orb w-[400px] h-[400px] bg-indigo-500 top-[-100px] right-[-100px]" />
            <div className="gradient-orb w-[300px] h-[300px] bg-violet-500 bottom-[-50px] left-[-50px]" />

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
                    <h1 className="text-2xl font-bold text-white mb-2">{t("auth.login.title")}</h1>
                    <p className="text-white/50 text-sm">{t("auth.login.subtitle")}</p>
                </div>

                <div className="glass-panel p-8">
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {error && (
                            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                                <p className="text-red-400 text-sm">{error}</p>
                                {errorCode && (
                                    <p className="text-red-400/40 text-[10px] font-mono mt-1">Mã lỗi: {errorCode}</p>
                                )}
                            </div>
                        )}

                        <div>
                            <label htmlFor="auth-email" className="block text-sm font-medium text-white/70 mb-2">{t("auth.login.email")}</label>
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

                        <div>
                            <label htmlFor="auth-password" className="block text-sm font-medium text-white/70 mb-2">{t("auth.login.password")}</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                                <input
                                    id="auth-password" autoComplete="current-password" type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="glass-input pl-10 pr-10"
                                    placeholder="••••••••"
                                    required
                                />
                                <button
                                    type="button"
                                    aria-label={locale === "vi" ? (showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu") : (showPassword ? "Hide password" : "Show password")} onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                                >
                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>

                        <div className="flex items-center justify-between">
                            <label className="flex items-center gap-2 cursor-pointer group">
                                <div className="relative">
                                    <input
                                        type="checkbox"
                                        checked={rememberMe}
                                        onChange={(e) => setRememberMe(e.target.checked)}
                                        className="sr-only peer"
                                    />
                                    <div className="w-4 h-4 rounded border border-white/20 bg-white/5 peer-checked:bg-indigo-500 peer-checked:border-indigo-500 transition-all flex items-center justify-center">
                                        {rememberMe && (
                                            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                            </svg>
                                        )}
                                    </div>
                                </div>
                                <span className="text-xs text-white/50 group-hover:text-white/70 transition-colors">{t("auth.login.remember")}</span>
                            </label>
                            <Link href="/forgot-password" className="text-xs text-indigo-400 hover:text-indigo-300">
                                {t("auth.login.forgot")}
                            </Link>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="btn-primary w-full flex items-center justify-center gap-2 py-3"
                        >
                            {isLoading ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                t("auth.login.button")
                            )}
                        </button>
                    </form>
                </div>

                <p className="text-center text-sm text-white/40 mt-6">
                    {t("auth.login.noAccount")}{" "}
                    <Link href="/signup" className="text-indigo-400 hover:text-indigo-300 font-medium">
                        {t("auth.login.signupLink")}
                    </Link>
                </p>
            </motion.div>
        </main>
    );
}

