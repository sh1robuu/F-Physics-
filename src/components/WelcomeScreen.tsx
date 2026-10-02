"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Atom, Sparkles } from "lucide-react";
import { useEffect, useState, useCallback } from "react";
import { useTranslation } from "@/lib/i18n";

interface WelcomeScreenProps {
    userName: string;
    onComplete: () => void;
}

export function WelcomeScreen({ userName, onComplete }: WelcomeScreenProps) {
    const { t } = useTranslation();
    const [visible, setVisible] = useState(true);

    const dismiss = useCallback(() => {
        setVisible(false);
    }, []);

    useEffect(() => {
        const timer = setTimeout(dismiss, 3000);
        return () => clearTimeout(timer);
    }, [dismiss]);

    return (
        <AnimatePresence onExitComplete={onComplete}>
            {visible && (
                <motion.div
                    key="welcome-overlay"
                    className="fixed inset-0 z-[9999] flex items-center justify-center cursor-pointer"
                    onClick={dismiss}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0, scale: 1.05 }}
                    transition={{ duration: 0.6, ease: "easeInOut" }}
                >
                    {/* Background */}
                    <div className="absolute inset-0 bg-[#0a0b1a]" />

                    {/* Ambient orbs */}
                    <motion.div
                        className="absolute w-[600px] h-[600px] rounded-full bg-indigo-600/20 blur-[120px]"
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 1.2, ease: "easeOut" }}
                    />
                    <motion.div
                        className="absolute w-[400px] h-[400px] rounded-full bg-violet-500/15 blur-[100px] translate-x-32 -translate-y-20"
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 0.8 }}
                        transition={{ duration: 1.4, delay: 0.2, ease: "easeOut" }}
                    />

                    {/* Content */}
                    <div className="relative z-10 text-center px-6">
                        {/* Logo pulse */}
                        <motion.div
                            className="w-20 h-20 rounded-2xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center mx-auto mb-8"
                            initial={{ scale: 0, rotate: -180 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{ type: "spring", duration: 0.8, bounce: 0.4 }}
                        >
                            <Atom className="w-10 h-10 text-indigo-400" />
                        </motion.div>

                        {/* Greeting */}
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3, duration: 0.6 }}
                        >
                            <p className="text-white/50 text-sm uppercase tracking-widest mb-3">
                                F-Physics
                            </p>
                            <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">
                                {t("welcome.greeting")}{" "}
                                <span className="bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">
                                    {userName || t("welcome.defaultName")}
                                </span>
                            </h1>
                            <motion.p
                                className="text-white/40 text-lg"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.8, duration: 0.5 }}
                            >
                                {t("welcome.subtitle")}
                            </motion.p>
                        </motion.div>

                        {/* Sparkle hint */}
                        <motion.div
                            className="flex items-center justify-center gap-1 mt-8"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 1.2 }}
                        >
                            <Sparkles className="w-4 h-4 text-indigo-400/60 animate-pulse" />
                            <span className="text-xs text-white/20">{t("welcome.tapToContinue")}</span>
                            <Sparkles className="w-4 h-4 text-violet-400/60 animate-pulse" />
                        </motion.div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
