"use client";

import { useTranslation } from "@/lib/i18n";
import { BarChart3 } from "lucide-react";
import { motion } from "framer-motion";
import {
    ResponsiveContainer,
    AreaChart,
    Area,
    XAxis,
    YAxis,
    Tooltip,
    RadarChart,
    PolarGrid,
    PolarAngleAxis,
    Radar,
} from "recharts";

interface ProgressChartsProps {
    weeklyData?: { day: string; accuracy: number; questions: number }[];
    topicData?: { topic: string; score: number }[];
}

// Generate demo data if none provided
function getWeeklyDemo(): { day: string; accuracy: number; questions: number }[] {
    const days = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];
    return days.map((day) => ({
        day,
        accuracy: Math.floor(Math.random() * 40 + 50),
        questions: Math.floor(Math.random() * 15 + 3),
    }));
}

function getTopicDemo(): { topic: string; score: number }[] {
    return [
        { topic: "Dao động", score: 75 },
        { topic: "Sóng", score: 60 },
        { topic: "Điện xoay chiều", score: 45 },
        { topic: "Dao động điện từ", score: 80 },
        { topic: "Sóng ánh sáng", score: 65 },
        { topic: "Lượng tử ánh sáng", score: 50 },
        { topic: "Hạt nhân", score: 70 },
    ];
}

export function ProgressCharts({ weeklyData, topicData }: ProgressChartsProps) {
    const { t } = useTranslation();
    const weekly = weeklyData || getWeeklyDemo();
    const topics = topicData || getTopicDemo();

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Accuracy Over Time */}
            <motion.div
                className="glass-panel p-5"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
            >
                <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-indigo-400" />
                    {t("profile.accuracy")} — 7 {t("streak.days")}
                </h3>
                <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={weekly}>
                            <defs>
                                <linearGradient id="gradientAccuracy" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#818cf8" stopOpacity={0.3} />
                                    <stop offset="100%" stopColor="#818cf8" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <XAxis
                                dataKey="day"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 11 }}
                            />
                            <YAxis
                                domain={[0, 100]}
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: "rgba(255,255,255,0.2)", fontSize: 11 }}
                                width={30}
                            />
                            <Tooltip
                                contentStyle={{
                                    background: "rgba(15,16,36,0.95)",
                                    border: "1px solid rgba(255,255,255,0.1)",
                                    borderRadius: "8px",
                                    fontSize: 12,
                                    color: "white",
                                }}
                                formatter={(value: number) => [`${value}%`, t("profile.accuracy")]}
                            />
                            <Area
                                type="monotone"
                                dataKey="accuracy"
                                stroke="#818cf8"
                                strokeWidth={2}
                                fill="url(#gradientAccuracy)"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </motion.div>

            {/* Topic Radar */}
            <motion.div
                className="glass-panel p-5"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
            >
                <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-violet-400" />
                    {t("profile.activityTitle")}
                </h3>
                <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                        <RadarChart data={topics} outerRadius="70%">
                            <PolarGrid stroke="rgba(255,255,255,0.05)" />
                            <PolarAngleAxis
                                dataKey="topic"
                                tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 10 }}
                            />
                            <Radar
                                dataKey="score"
                                stroke="#a78bfa"
                                strokeWidth={2}
                                fill="#a78bfa"
                                fillOpacity={0.15}
                            />
                        </RadarChart>
                    </ResponsiveContainer>
                </div>
            </motion.div>
        </div>
    );
}
