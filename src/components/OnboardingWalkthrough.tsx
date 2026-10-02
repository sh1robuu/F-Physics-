"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Brain,
    Target,
    Library,
    Sparkles,
    ArrowRight,
    ArrowLeft,
    CheckCircle2,
    Atom,
    Rocket,
} from "lucide-react";
import { useTranslation } from "@/lib/i18n";
import { GradeSelector } from "@/components/GradeSelector";

interface OnboardingWalkthroughProps {
    onComplete: () => void;
}

export function OnboardingWalkthrough({ onComplete }: OnboardingWalkthroughProps) {
    const { t } = useTranslation();
    const [step, setStep] = useState(0);

    const steps = [
        {
            icon: Atom,
            color: "from-indigo-500 to-violet-500",
            iconColor: "text-indigo-400",
            bgColor: "bg-indigo-500/10",
            title: t("onboarding.step1.title"),
            desc: t("onboarding.step1.desc"),
            features: [
                t("onboarding.step1.f1"),
                t("onboarding.step1.f2"),
                t("onboarding.step1.f3"),
            ],
        },
        {
            icon: Brain,
            color: "from-cyan-500 to-indigo-500",
            iconColor: "text-cyan-400",
            bgColor: "bg-cyan-500/10",
            title: t("onboarding.step2.title"),
            desc: t("onboarding.step2.desc"),
            features: [
                t("onboarding.step2.f1"),
                t("onboarding.step2.f2"),
                t("onboarding.step2.f3"),
            ],
        },
        {
            icon: Target,
            color: "from-emerald-500 to-cyan-500",
            iconColor: "text-emerald-400",
            bgColor: "bg-emerald-500/10",
            title: t("onboarding.step3.title"),
            desc: t("onboarding.step3.desc"),
            features: [
                t("onboarding.step3.f1"),
                t("onboarding.step3.f2"),
                t("onboarding.step3.f3"),
            ],
        },
        {
            icon: Library,
            color: "from-violet-500 to-pink-500",
            iconColor: "text-violet-400",
            bgColor: "bg-violet-500/10",
            title: t("onboarding.step4.title"),
            desc: t("onboarding.step4.desc"),
            features: [
                t("onboarding.step4.f1"),
                t("onboarding.step4.f2"),
                t("onboarding.step4.f3"),
            ],
        },
        {
            icon: Rocket,
            color: "from-amber-500 to-orange-500",
            iconColor: "text-amber-400",
            bgColor: "bg-amber-500/10",
            title: t("onboarding.step5.title"),
            desc: t("onboarding.step5.desc"),
            features: [
                t("onboarding.step5.f1"),
                t("onboarding.step5.f2"),
                t("onboarding.step5.f3"),
            ],
        },
    ];

    const currentStep = steps[step];
    const isLast = step === steps.length - 1;

    const handleFinish = () => {
        try { localStorage.setItem("f-physics-onboarding-done", "true"); } catch { /* The walkthrough can finish without browser storage. */ }
        onComplete();
    };

    return (
        <motion.div
            className="fixed inset-0 z-[9998] flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
        >
            {/* Backdrop */}
            <div className="absolute inset-0 bg-[#0a0b1a]/95 backdrop-blur-xl" />

            {/* Content card */}
            <motion.div
                className="relative z-10 w-full max-w-lg mx-4"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", duration: 0.6 }}
            >
                <div className="glass-panel p-8 md:p-10 relative overflow-hidden">
                    {/* Gradient accent bar */}
                    <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${currentStep.color}`} />

                    {/* Progress dots */}
                    <div className="flex items-center justify-center gap-2 mb-8">
                        {steps.map((_, i) => (
                            <button
                                key={i}
                                onClick={() => setStep(i)}
                                className={`transition-all duration-300 rounded-full ${i === step
                                        ? `w-8 h-2 bg-gradient-to-r ${currentStep.color}`
                                        : i < step
                                            ? "w-2 h-2 bg-white/30"
                                            : "w-2 h-2 bg-white/10"
                                    }`}
                            />
                        ))}
                    </div>

                    {/* Step content */}
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={step}
                            initial={{ x: 40, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: -40, opacity: 0 }}
                            transition={{ duration: 0.25 }}
                            className="text-center"
                        >
                            {/* Icon */}
                            <div className={`w-16 h-16 rounded-2xl ${currentStep.bgColor} border border-white/10 flex items-center justify-center mx-auto mb-6`}>
                                <currentStep.icon className={`w-8 h-8 ${currentStep.iconColor}`} />
                            </div>

                            {/* Title */}
                            <h2 className="text-2xl font-bold text-white mb-3">
                                {currentStep.title}
                            </h2>

                            {/* Description */}
                            <p className="text-white/50 text-sm mb-6 leading-relaxed">
                                {currentStep.desc}
                            </p>

                            {(step === 0 || isLast) && <div className="mb-6 flex justify-center"><GradeSelector /></div>}

                            {/* Feature list */}
                            <div className="space-y-2.5 text-left max-w-xs mx-auto">
                                {currentStep.features.map((feat, i) => (
                                    <motion.div
                                        key={i}
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.15 + i * 0.1 }}
                                        className="flex items-start gap-2.5"
                                    >
                                        <CheckCircle2 className={`w-4 h-4 mt-0.5 shrink-0 ${currentStep.iconColor}`} />
                                        <span className="text-sm text-white/70">{feat}</span>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>
                    </AnimatePresence>

                    {/* Navigation */}
                    <div className="flex items-center justify-between mt-8 pt-6 border-t border-white/5">
                        {step > 0 ? (
                            <button
                                onClick={() => setStep(step - 1)}
                                className="flex items-center gap-1.5 text-sm text-white/40 hover:text-white/70 transition-colors"
                            >
                                <ArrowLeft className="w-4 h-4" />
                                {t("onboarding.back")}
                            </button>
                        ) : (
                            <button
                                onClick={handleFinish}
                                className="text-sm text-white/30 hover:text-white/50 transition-colors"
                            >
                                {t("onboarding.skip")}
                            </button>
                        )}

                        {isLast ? (
                            <button
                                onClick={handleFinish}
                                className="btn-primary flex items-center gap-2 px-6 py-2.5"
                            >
                                <Sparkles className="w-4 h-4" />
                                {t("onboarding.start")}
                            </button>
                        ) : (
                            <button
                                onClick={() => setStep(step + 1)}
                                className="btn-primary flex items-center gap-2 px-6 py-2.5"
                            >
                                {t("onboarding.next")}
                                <ArrowRight className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
}
