"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Users, Search, Edit, Trash2, Shield, User, GraduationCap } from "lucide-react";
import { cn } from "@/lib/utils";

const mockUsers: { id: string; name: string; email: string; role: string; sessions: number; questions: number; joined: string }[] = [];

function RoleBadge({ role }: { role: string }) {
    const config = {
        STUDENT: { label: "Học sinh", icon: GraduationCap, color: "text-indigo-400", bg: "bg-indigo-400/10 border-indigo-400/20" },
        TEACHER: { label: "Giáo viên", icon: User, color: "text-emerald-400", bg: "bg-emerald-400/10 border-emerald-400/20" },
        ADMIN: { label: "Admin", icon: Shield, color: "text-amber-400", bg: "bg-amber-400/10 border-amber-400/20" },
    }[role] || { label: role, icon: User, color: "text-white/40", bg: "bg-white/5 border-white/10" };

    return (
        <span className={cn("inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full border", config.bg, config.color)}>
            <config.icon className="w-3 h-3" />
            {config.label}
        </span>
    );
}

export default function AdminUsersPage() {
    const [search, setSearch] = useState("");

    const filtered = mockUsers.filter((u) =>
        u.name.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                    <Users className="w-5 h-5 text-indigo-400" />
                    Quản lý người dùng
                </h1>
                <p className="text-white/50 text-sm mt-1">{mockUsers.length} người dùng</p>
            </div>

            <div className="relative max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <input value={search} onChange={(e) => setSearch(e.target.value)} className="glass-input pl-10" placeholder="Tìm người dùng..." />
            </div>

            <div className="glass-panel overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-white/5">
                                <th className="text-left text-xs font-medium text-white/40 uppercase tracking-wider px-5 py-3">Tên</th>
                                <th className="text-left text-xs font-medium text-white/40 uppercase tracking-wider px-5 py-3">Email</th>
                                <th className="text-left text-xs font-medium text-white/40 uppercase tracking-wider px-5 py-3">Vai trò</th>
                                <th className="text-left text-xs font-medium text-white/40 uppercase tracking-wider px-5 py-3">Phiên học</th>
                                <th className="text-left text-xs font-medium text-white/40 uppercase tracking-wider px-5 py-3">Câu hỏi</th>
                                <th className="text-left text-xs font-medium text-white/40 uppercase tracking-wider px-5 py-3">Ngày tham gia</th>
                                <th className="text-right text-xs font-medium text-white/40 uppercase tracking-wider px-5 py-3">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map((u) => (
                                <tr key={u.id} className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors">
                                    <td className="px-5 py-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-xs font-bold text-indigo-300">
                                                {u.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                                            </div>
                                            <span className="text-sm font-medium text-white/80">{u.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-5 py-3 text-sm text-white/40">{u.email}</td>
                                    <td className="px-5 py-3"><RoleBadge role={u.role} /></td>
                                    <td className="px-5 py-3 text-sm text-white/40">{u.sessions}</td>
                                    <td className="px-5 py-3 text-sm text-white/40">{u.questions}</td>
                                    <td className="px-5 py-3 text-sm text-white/30">{u.joined}</td>
                                    <td className="px-5 py-3 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button className="p-1.5 rounded-lg hover:bg-white/5 text-white/30 hover:text-white/70"><Edit className="w-3.5 h-3.5" /></button>
                                            <button className="p-1.5 rounded-lg hover:bg-red-400/10 text-white/30 hover:text-red-400"><Trash2 className="w-3.5 h-3.5" /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
