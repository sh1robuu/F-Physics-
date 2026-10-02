"use client";

import { useState, useEffect, useReducer, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Timer, Play, Pause, RotateCcw, Coffee, Brain } from "lucide-react";
import { useTranslation } from "@/lib/i18n";

type PomodoroMode = "focus" | "shortBreak" | "longBreak";

const DURATIONS: Record<PomodoroMode, number> = {
    focus: 25 * 60,
    shortBreak: 5 * 60,
    longBreak: 15 * 60,
};

interface TimerState {
    mode: PomodoroMode;
    timeLeft: number;
    isRunning: boolean;
    sessions: number;
    completed: number;
}

type TimerAction = { type: "tick" | "toggle" | "reset" } | { type: "switch"; mode: PomodoroMode };

function timerReducer(state: TimerState, action: TimerAction): TimerState {
    if (action.type === "switch") {
        return { ...state, mode: action.mode, timeLeft: DURATIONS[action.mode], isRunning: false };
    }
    if (action.type === "toggle") return { ...state, isRunning: !state.isRunning };
    if (action.type === "reset") return { ...state, timeLeft: DURATIONS[state.mode], isRunning: false };
    if (!state.isRunning) return state;
    if (state.timeLeft > 1) return { ...state, timeLeft: state.timeLeft - 1 };

    const sessions = state.sessions + (state.mode === "focus" ? 1 : 0);
    const mode = state.mode === "focus" ? (sessions % 4 === 0 ? "longBreak" : "shortBreak") : "focus";
    return { mode, timeLeft: DURATIONS[mode], isRunning: false, sessions, completed: state.completed + 1 };
}

export function PomodoroTimer() {
    const { t } = useTranslation();
    const [{ mode, timeLeft, isRunning, sessions, completed }, dispatch] = useReducer(timerReducer, {
        mode: "focus", timeLeft: DURATIONS.focus, isRunning: false, sessions: 0, completed: 0,
    });
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        if (!isRunning) return;
        const interval = setInterval(() => dispatch({ type: "tick" }), 1000);
        return () => clearInterval(interval);
    }, [isRunning]);

    useEffect(() => {
        if (completed === 0) return;
        const audio = new Audio("/notification.mp3");
        audio.play().catch(() => { });
        return () => audio.pause();
    }, [completed]);

    const switchMode = useCallback((newMode: PomodoroMode) => {
        dispatch({ type: "switch", mode: newMode });
    }, []);

    const toggle = () => dispatch({ type: "toggle" });
    const reset = () => dispatch({ type: "reset" });

    const mins = Math.floor(timeLeft / 60);
    const secs = timeLeft % 60;
    const progress = ((DURATIONS[mode] - timeLeft) / DURATIONS[mode]) * 100;

    const modeConfig = {
        focus: { icon: Brain, color: "text-indigo-400", bg: "bg-indigo-400/10", ring: "stroke-indigo-400" },
        shortBreak: { icon: Coffee, color: "text-emerald-400", bg: "bg-emerald-400/10", ring: "stroke-emerald-400" },
        longBreak: { icon: Coffee, color: "text-violet-400", bg: "bg-violet-400/10", ring: "stroke-violet-400" },
    };
    const cfg = modeConfig[mode];

    return (
        <>
            {/* Floating toggle button */}
            <motion.button
                aria-label={t("pomodoro.title")}
                aria-expanded={isOpen}
                onClick={() => setIsOpen(!isOpen)}
                className="fixed bottom-6 right-6 z-50 w-12 h-12 rounded-full bg-indigo-500/20 border border-indigo-400/30 backdrop-blur-xl flex items-center justify-center shadow-2xl hover:bg-indigo-500/30 transition-all"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
            >
                <Timer className="w-5 h-5 text-indigo-400" />
                {isRunning && (
                    <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-emerald-400 animate-pulse" />
                )}
            </motion.button>

            {/* Pop-up Timer */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        className="fixed bottom-20 right-6 z-50 w-72 rounded-2xl border border-white/10 bg-[#0f1024]/95 backdrop-blur-xl p-5 shadow-2xl"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-semibold text-white">{t("pomodoro.title")}</h3>
                            <span className="text-xs text-white/30">{sessions} {t("pomodoro.sessions")}</span>
                        </div>

                        {/* Mode tabs */}
                        <div className="flex gap-1 mb-4 bg-white/5 rounded-lg p-0.5">
                            {(["focus", "shortBreak", "longBreak"] as PomodoroMode[]).map((m) => (
                                <button
                                    key={m}
                                    onClick={() => switchMode(m)}
                                    className={`flex-1 text-xs py-1.5 rounded-md transition-all ${mode === m ? "bg-white/10 text-white" : "text-white/40 hover:text-white/60"}`}
                                >
                                    {t(`pomodoro.${m === "focus" ? "focus" : m === "shortBreak" ? "shortBreak" : "longBreak"}` as const)}
                                </button>
                            ))}
                        </div>

                        {/* Timer display */}
                        <div className="relative flex items-center justify-center mb-4">
                            <svg className="w-36 h-36 -rotate-90" viewBox="0 0 120 120">
                                <circle cx="60" cy="60" r="52" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="6" />
                                <circle
                                    cx="60" cy="60" r="52" fill="none"
                                    className={cfg.ring}
                                    strokeWidth="6"
                                    strokeLinecap="round"
                                    strokeDasharray={`${2 * Math.PI * 52}`}
                                    strokeDashoffset={`${2 * Math.PI * 52 * (1 - progress / 100)}`}
                                    style={{ transition: "stroke-dashoffset 0.5s ease" }}
                                />
                            </svg>
                            <div className="absolute text-center">
                                <div className="text-3xl font-mono font-bold text-white">
                                    {String(mins).padStart(2, "0")}:{String(secs).padStart(2, "0")}
                                </div>
                                <div className={`text-xs ${cfg.color}`}>
                                    {t(`pomodoro.${mode === "focus" ? "focus" : mode === "shortBreak" ? "shortBreak" : "longBreak"}` as const)}
                                </div>
                            </div>
                        </div>

                        {/* Controls */}
                        <div className="flex items-center justify-center gap-3">
                            <button
                                aria-label={t("pomodoro.reset")}
                                onClick={reset}
                                className="w-9 h-9 rounded-full bg-white/5 flex items-center justify-center text-white/40 hover:text-white/70 hover:bg-white/10 transition-all"
                            >
                                <RotateCcw className="w-4 h-4" />
                            </button>
                            <button
                                aria-label={t(isRunning ? "pomodoro.pause" : "pomodoro.start")}
                                onClick={toggle}
                                className={`w-12 h-12 rounded-full ${cfg.bg} flex items-center justify-center ${cfg.color} hover:scale-105 transition-all`}
                            >
                                {isRunning ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
                            </button>
                            <div className="w-9" /> {/* spacer */}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
