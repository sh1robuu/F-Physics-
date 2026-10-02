"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FolderTree, Plus, Edit, Trash2, ChevronRight, ChevronDown, X } from "lucide-react";
import { useGradeStore } from "@/lib/store/grade";
import { getGradeCurriculum } from "@/lib/data/curriculum";
import { GradeSelector } from "@/components/GradeSelector";

export default function AdminTopicsPage() {
    const [expandedTopics, setExpandedTopics] = useState<Set<string>>(new Set(["1"]));
    const [showForm, setShowForm] = useState(false);
    const { grade } = useGradeStore();
    const topics = getGradeCurriculum(grade).topics.map((topic, index) => ({
        id: topic.id, name: topic.title, chapter: index + 1,
        subtopics: topic.lessons.map((lesson, lessonIndex) => ({ id: `${topic.id}-${lessonIndex}`, name: lesson, concepts: [] as string[] })),
    }));

    const toggleTopic = (id: string) => {
        setExpandedTopics((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                        <FolderTree className="w-5 h-5 text-indigo-400" />
                        Phân loại chủ đề
                    </h1>
                    <p className="text-white/50 text-sm mt-1">Vật lí {grade} · Mạch nội dung GDPT 2018, không phải thứ tự chương của một bộ sách</p>
                </div>
                <button onClick={() => setShowForm(true)} className="btn-primary flex items-center gap-2">
                    <Plus className="w-4 h-4" /> Thêm chủ đề
                </button>
            </div>

            <GradeSelector />
            {/* Add Modal */}
            <AnimatePresence>
                {showForm && (
                    <motion.div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        <motion.div className="floating-panel p-8 w-full max-w-lg" initial={{ scale: 0.95 }} animate={{ scale: 1 }}>
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-lg font-semibold text-white">Thêm chủ đề</h2>
                                <button onClick={() => setShowForm(false)} className="text-white/40 hover:text-white/70"><X className="w-5 h-5" /></button>
                            </div>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm text-white/60 mb-1.5">Tên chủ đề</label>
                                    <input className="glass-input" placeholder="Tên chủ đề" />
                                </div>
                                <div>
                                    <label className="block text-sm text-white/60 mb-1.5">Tên tiếng Việt</label>
                                    <input className="glass-input" placeholder="Tên tiếng Việt" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm text-white/60 mb-1.5">Chương</label>
                                        <input className="glass-input" type="number" placeholder="1" />
                                    </div>
                                    <div>
                                        <label className="block text-sm text-white/60 mb-1.5">Slug</label>
                                        <input className="glass-input" placeholder="dao-dong-co" />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm text-white/60 mb-1.5">Mô tả</label>
                                    <textarea className="glass-input min-h-[60px]" placeholder="Mô tả chủ đề..." />
                                </div>
                            </div>
                            <div className="flex gap-3 mt-6">
                                <button onClick={() => setShowForm(false)} className="btn-secondary flex-1">Hủy</button>
                                <button className="btn-primary flex-1">Lưu</button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Topic Tree */}
            <div className="glass-panel p-4 space-y-1">
                {topics.map((topic) => {
                    const isExpanded = expandedTopics.has(topic.id);
                    return (
                        <div key={topic.id}>
                            <button
                                onClick={() => toggleTopic(topic.id)}
                                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/[0.03] transition-colors"
                            >
                                {isExpanded ? <ChevronDown className="w-4 h-4 text-white/30" /> : <ChevronRight className="w-4 h-4 text-white/30" />}
                                <span className="text-xs font-mono text-indigo-400/60">{String(topic.chapter).padStart(2, "0")}</span>
                                <span className="text-sm font-medium text-white/80 flex-1 text-left">{topic.name}</span>
                                <span className="text-xs text-white/30">{topic.subtopics.length} chủ đề con</span>
                                <div className="flex items-center gap-1 ml-2">
                                    <button className="p-1 rounded hover:bg-white/5 text-white/20 hover:text-white/60"><Edit className="w-3.5 h-3.5" /></button>
                                    <button className="p-1 rounded hover:bg-red-400/10 text-white/20 hover:text-red-400"><Trash2 className="w-3.5 h-3.5" /></button>
                                </div>
                            </button>
                            <AnimatePresence>
                                {isExpanded && (
                                    <motion.div
                                        className="ml-10 space-y-1 mb-2"
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: "auto", opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                    >
                                        {topic.subtopics.map((sub) => (
                                            <div key={sub.id} className="flex items-center gap-3 px-4 py-2 rounded-lg text-sm text-white/50 hover:bg-white/[0.02] transition-colors">
                                                <div className="w-1.5 h-1.5 rounded-full bg-white/10" />
                                                <span className="flex-1">{sub.name}</span>
                                                <div className="flex gap-1 flex-wrap">
                                                    {sub.concepts.slice(0, 2).map((c) => (
                                                        <span key={c} className="text-[10px] px-1.5 py-0.5 rounded bg-white/[0.04] text-white/30">{c}</span>
                                                    ))}
                                                    {sub.concepts.length > 2 && (
                                                        <span className="text-[10px] text-white/20">+{sub.concepts.length - 2}</span>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
