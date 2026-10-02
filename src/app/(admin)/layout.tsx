"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
    Settings,
    Users,
    FileText,
    FolderTree,
    BarChart3,
    Plus,
    Search,
    Edit,
    Trash2,
    Eye,
    ChevronRight,
    BookOpen,
    Target,
    Database,
    Activity,
    Atom,
    MessageSquareHeart,
} from "lucide-react";
import { cn } from "@/lib/utils";

const adminNav = [
    { title: "Tổng quan", href: "/admin", icon: BarChart3 },
    { title: "Ngân hàng câu hỏi", href: "/admin/questions", icon: FileText },
    { title: "Chủ đề / Phân loại", href: "/admin/topics", icon: FolderTree },
    { title: "Người dùng", href: "/admin/users", icon: Users },
    { title: "Phản hồi", href: "/admin/feedback", icon: MessageSquareHeart },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen">
            {/* Admin Header */}
            <header className="sticky top-0 z-30 bg-[#0a0b1a]/90 backdrop-blur-xl border-b border-white/5 px-6 py-4">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/" className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center">
                                <Atom className="w-4 h-4 text-indigo-400" />
                            </div>
                            <span className="text-lg font-bold text-white">F-Physics</span>
                        </Link>
                        <span className="text-xs px-2 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 font-medium">
                            Admin
                        </span>
                    </div>
                    <Link href="/dashboard" className="text-sm text-white/40 hover:text-white/70 flex items-center gap-1">
                        Về Dashboard <ChevronRight className="w-3 h-3" />
                    </Link>
                </div>
            </header>

            <div className="max-w-7xl mx-auto px-6 py-6">
                {/* Admin Nav Tabs */}
                <nav className="flex gap-2 mb-6 overflow-x-auto pb-2">
                    {adminNav.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap text-white/50 hover:text-white/80 hover:bg-white/[0.04] transition-all"
                        >
                            <item.icon className="w-4 h-4" />
                            {item.title}
                        </Link>
                    ))}
                </nav>

                {children}
            </div>
        </div>
    );
}
