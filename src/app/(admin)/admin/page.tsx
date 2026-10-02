"use client";

import { motion } from "framer-motion";
import { BarChart3, Users, FileText, FolderTree, Activity, Database, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

const stats = [
    { label: "Tổng câu hỏi", value: "342", icon: FileText, color: "text-indigo-400", bg: "bg-indigo-400/10" },
    { label: "Chủ đề", value: "7", icon: FolderTree, color: "text-cyan-400", bg: "bg-cyan-400/10" },
    { label: "Người dùng", value: "1,284", icon: Users, color: "text-emerald-400", bg: "bg-emerald-400/10" },
    { label: "Phiên hôm nay", value: "89", icon: Activity, color: "text-violet-400", bg: "bg-violet-400/10" },
];

const recentLogs = [
    { action: "Thêm câu hỏi", target: "Dao động cơ — Bài tập biên độ #234", user: "Admin", time: "5 phút trước" },
    { action: "Sửa chủ đề", target: "Dòng điện xoay chiều — Cập nhật mô tả", user: "Admin", time: "20 phút trước" },
    { action: "Xóa câu hỏi", target: "Sóng cơ — Câu hỏi trùng lặp #189", user: "Admin", time: "1 giờ trước" },
    { action: "Thêm người dùng", target: "student123@email.com — STUDENT", user: "System", time: "2 giờ trước" },
    { action: "Import câu hỏi", target: "20 câu từ file CSV — Hạt nhân", user: "Admin", time: "3 giờ trước" },
];

export default function AdminDashboard() {
    return (
        <div className="space-y-6 p-6 lg:p-8">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <h1 className="text-2xl font-bold text-white">Quản trị hệ thống</h1>
                <p className="text-white/50 text-sm mt-1">Tổng quan nền tảng F-Physics</p>
            </motion.div>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((s, i) => (
                    <motion.div key={s.label} className="glass-card p-5" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                        <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center mb-3", s.bg)}>
                            <s.icon className={cn("w-5 h-5", s.color)} />
                        </div>
                        <div className="text-2xl font-bold text-white">{s.value}</div>
                        <div className="text-sm text-white/40 mt-1">{s.label}</div>
                    </motion.div>
                ))}
            </div>

            {/* Recent Activity Log */}
            <motion.div className="glass-panel p-6" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                <h2 className="text-base font-semibold text-white flex items-center gap-2 mb-5">
                    <Activity className="w-4 h-4 text-indigo-400" />
                    Nhật ký hoạt động
                </h2>
                <div className="space-y-3">
                    {recentLogs.map((log, i) => (
                        <div key={i} className="flex items-center gap-4 p-3 rounded-xl bg-white/[0.02]">
                            <div className={cn("w-2 h-2 rounded-full shrink-0",
                                log.action.includes("Thêm") ? "bg-emerald-400" :
                                    log.action.includes("Sửa") ? "bg-amber-400" :
                                        log.action.includes("Xóa") ? "bg-red-400" : "bg-indigo-400"
                            )} />
                            <div className="flex-1 min-w-0">
                                <div className="text-sm text-white/70">
                                    <span className="font-medium text-white/90">{log.action}</span> — {log.target}
                                </div>
                                <div className="text-xs text-white/30 mt-0.5">{log.user} · {log.time}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </motion.div>
        </div>
    );
}
