"use client";

import { Suspense, useState, useRef, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { useSearchParams } from "next/navigation";
import {
    Send,
    Lightbulb,
    BookOpen,
    Target,
    GraduationCap,
    Sparkles,
    Upload,
    ImageIcon,
    ChevronRight,
    Zap,
    X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { MathRenderer } from "@/components/MathRenderer";
import { useChatStore } from "@/lib/store/chat";
import { useWeaknessStore } from "@/lib/store/weakness-store";
import { useGradeStore } from "@/lib/store/grade";
import { getGradeCurriculum } from "@/lib/data/curriculum";
import { useTranslation } from "@/lib/i18n";
import type { TutoringMode } from "@/types";

interface Attachment {
    name: string;
    type: string;
    size: number;
    dataUrl: string;
}

interface DiagnosisData {
    topic?: string;
    concept?: string;
    breakdown?: string;
}

interface Message {
    id: string;
    role: "user" | "assistant";
    content: string;
    mode?: TutoringMode;
    confidence?: number;
    isGrounded?: boolean;
    timestamp: Date;
    attachments?: Attachment[];
    diagnosis?: DiagnosisData;
    suggestedNextMode?: TutoringMode;
}

const modes: { key: TutoringMode; label: string; labelVi: string; icon: typeof Lightbulb; color: string; bg: string; desc: string }[] = [
    {
        key: "AUTO",
        label: "Auto",
        labelVi: "Tự động",
        icon: Sparkles,
        color: "text-indigo-400",
        bg: "bg-indigo-400/10 border-indigo-400/20",
        desc: "AI chọn mức hỗ trợ phù hợp",
    },
    {
        key: "HINT",
        label: "Hint",
        labelVi: "Gợi ý",
        icon: Lightbulb,
        color: "text-amber-400",
        bg: "bg-amber-400/10 border-amber-400/20",
        desc: "Chỉ đưa ra gợi ý chiến lược",
    },
    {
        key: "CONCEPT",
        label: "Concept",
        labelVi: "Khái niệm",
        icon: BookOpen,
        color: "text-cyan-400",
        bg: "bg-cyan-400/10 border-cyan-400/20",
        desc: "Giải thích nguyên lý và công thức liên quan",
    },
    {
        key: "GUIDED",
        label: "Guided",
        labelVi: "Hướng dẫn",
        icon: Target,
        color: "text-emerald-400",
        bg: "bg-emerald-400/10 border-emerald-400/20",
        desc: "Hướng dẫn từng bước, yêu cầu tham gia",
    },
    {
        key: "FULL_SOLUTION",
        label: "Full",
        labelVi: "Giải đầy đủ",
        icon: GraduationCap,
        color: "text-violet-400",
        bg: "bg-violet-400/10 border-violet-400/20",
        desc: "Lời giải hoàn chỉnh theo format bài thi",
    },
];

export default function TutorPage() {
    return <Suspense fallback={<div className="p-6 text-[var(--muted)]">Đang mở gia sư AI…</div>}><TutorWorkspace /></Suspense>;
}

function TutorWorkspace() {
    const { grade, setGrade } = useGradeStore();
    const { locale } = useTranslation();
    const isEn = locale === "en";
    const curriculum = getGradeCurriculum(grade);
    const searchParams = useSearchParams();
    const linkKey = searchParams.toString();
    const queryGrade = Number(searchParams.get("grade"));
    const linkedGrade = queryGrade === 10 || queryGrade === 11 || queryGrade === 12 ? queryGrade : null;
    const linkedTopic = linkedGrade ? getGradeCurriculum(linkedGrade).topics.find((topic) => topic.id === searchParams.get("topic")) : undefined;
    const linkedPrompt = linkedTopic ? (isEn ? linkedTopic.promptEn : linkedTopic.prompt) : "";
    const { activeConversationId, createConversation, addMessage, getActiveConversation } = useChatStore();
    const { recordWeakness } = useWeaknessStore();
    const activeConv = getActiveConversation();

    const messages = useMemo<Message[]>(() => activeConv?.messages.map((message) => ({ ...message, mode: message.mode as TutoringMode | undefined, timestamp: new Date(message.timestamp) })) || [], [activeConv?.messages]);
    const [input, setInput] = useState(linkedPrompt);
    const [previousLink, setPreviousLink] = useState(linkKey);
    const [preparedDraft, setPreparedDraft] = useState({ text: linkedPrompt, grade: linkedGrade || grade });
    const [currentMode, setCurrentMode] = useState<TutoringMode>("AUTO");
    const [currentModel, setCurrentModel] = useState(activeConv?.model || "gemini-3-flash-preview:cloud");
    const [isLoading, setIsLoading] = useState(false);
    const [attachments, setAttachments] = useState<Attachment[]>([]);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const imageInputRef = useRef<HTMLInputElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // A new curriculum link prepares a draft without sending or replacing chat history.
    if (previousLink !== linkKey) {
        setPreviousLink(linkKey);
        if (linkedPrompt) {
            setInput(linkedPrompt);
            setPreparedDraft({ text: linkedPrompt, grade: linkedGrade || grade });
        } else if (input === preparedDraft.text) {
            setInput("");
            setPreparedDraft({ text: "", grade });
        }
    } else if (!linkedGrade && preparedDraft.grade !== grade) {
        if (input === preparedDraft.text) setInput("");
        setPreparedDraft({ text: "", grade });
    }

    useEffect(() => {
        if (linkedGrade) setGrade(linkedGrade);
        if (linkedTopic) textareaRef.current?.focus();
    }, [linkKey, linkedGrade, linkedTopic, setGrade]);

    const handleFileSelect = (files: FileList | null) => {
        if (!files) return;
        Array.from(files).slice(0, 3).forEach((file) => {
            if (file.size > 10 * 1024 * 1024) return; // 10MB limit
            const reader = new FileReader();
            reader.onload = () => {
                setAttachments((prev) => [...prev, {
                    name: file.name,
                    type: file.type,
                    size: file.size,
                    dataUrl: reader.result as string,
                }]);
            };
            reader.readAsDataURL(file);
        });
    };

    const handlePaste = (e: React.ClipboardEvent) => {
        const items = e.clipboardData?.items;
        if (!items) return;
        const imageItems = Array.from(items).filter((item) => item.type.startsWith("image/"));
        if (imageItems.length === 0) return; // no images — let normal text paste happen
        e.preventDefault(); // prevent pasting image as text
        imageItems.slice(0, 3).forEach((item) => {
            const file = item.getAsFile();
            if (!file || file.size > 10 * 1024 * 1024) return;
            const reader = new FileReader();
            reader.onload = () => {
                setAttachments((prev) => [...prev, {
                    name: `pasted-image-${Date.now()}.png`,
                    type: file.type,
                    size: file.size,
                    dataUrl: reader.result as string,
                }]);
            };
            reader.readAsDataURL(file);
        });
    };

    const removeAttachment = (idx: number) => {
        setAttachments((prev) => prev.filter((_, i) => i !== idx));
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSubmit = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if ((!input.trim() && attachments.length === 0) || isLoading) return;

        // Auto-create conversation if none active
        let convId = activeConversationId;
        if (!convId) {
            convId = createConversation(currentModel);
        }

        const msgContent = input.trim() + (attachments.length > 0 ? `\n\n📎 ${attachments.map((a) => a.name).join(", ")}` : "");
        const userMsg: Message = {
            id: Date.now().toString(),
            role: "user",
            content: msgContent,
            timestamp: new Date(),
            attachments: attachments.length > 0 ? [...attachments] : undefined,
        };
        addMessage(convId, userMsg);
        setAttachments([]);
        setInput("");
        setIsLoading(true);

        // Resize textarea back
        if (textareaRef.current) textareaRef.current.style.height = "auto";

        try {
            // Read AI personalization prefs
            let aiPrefs = undefined;
            try {
                const stored = localStorage.getItem("f-physics-ai-prefs");
                if (stored) aiPrefs = JSON.parse(stored);
            } catch { /* ignore */ }

            const res = await fetch("/api/tutoring", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    question: userMsg.content,
                    mode: currentMode,
                    model: currentModel,
                    history: messages.map((m) => ({ role: m.role, content: m.content })),
                    grade,
                    aiPrefs: { ...aiPrefs, grade: String(grade) },
                    // Extract base64 image data from attachments (strip data URL prefix)
                    imageBase64: userMsg.attachments
                        ?.filter((a) => a.type.startsWith("image/"))
                        .map((a) => a.dataUrl.replace(/^data:image\/[^;]+;base64,/, "")) || undefined,
                }),
            });

            const data = await res.json();

            if (!res.ok || data.error) {
                // Server error — show clean error without badges
                const errorMsg: Message = {
                    id: (Date.now() + 1).toString(),
                    role: "assistant",
                    content: `⚠️ ${data.error || "Lỗi hệ thống. Vui lòng thử lại."}`,
                    timestamp: new Date(),
                };
                addMessage(convId, errorMsg);
            } else {
                // Valid AI response
                const aiMsg: Message = {
                    id: (Date.now() + 1).toString(),
                    role: "assistant",
                    content: data.content,
                    mode: data.mode || currentMode,
                    confidence: data.confidence,
                    isGrounded: data.isGrounded,
                    timestamp: new Date(),
                    diagnosis: data.diagnosis,
                    suggestedNextMode: data.suggestedNextMode,
                };
                addMessage(convId, aiMsg);

                // Record weakness in learner memory
                if (data.diagnosis?.topic && data.diagnosis?.concept && data.diagnosis?.breakdown) {
                    recordWeakness(
                        data.diagnosis.topic,
                        data.diagnosis.concept,
                        data.diagnosis.breakdown
                    );
                }
            }
        } catch {
            const errorMsg: Message = {
                id: (Date.now() + 1).toString(),
                role: "assistant",
                content: "⚠️ Không thể kết nối tới server. Vui lòng kiểm tra mạng.",
                timestamp: new Date(),
            };
            addMessage(convId, errorMsg);
        }

        setIsLoading(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSubmit();
        }
    };

    const handleTextareaInput = () => {
        if (textareaRef.current) {
            textareaRef.current.style.height = "auto";
            textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 150) + "px";
        }
    };

    const currentModeInfo = modes.find((m) => m.key === currentMode)!;

    return (
        <div className="w-full h-full min-h-0 flex flex-col relative z-10 p-4 lg:p-6">
            <div className="flex items-center justify-between gap-3 mb-5 shrink-0">
                <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--brand)]">F-Physics / {isEn ? "Your study companion" : "Bạn đồng hành học tập"}</p>
                    <h1 className="mt-1 text-xl font-semibold tracking-tight text-[var(--ink)]">{isEn ? `Physics ${grade} · AI Tutor` : `Vật lí ${grade} · Gia sư AI`}</h1>
                </div>
                <span className="rounded-full border border-[var(--line)] bg-[var(--surface)] px-3 py-1.5 text-[10px] font-medium text-[var(--muted)]">GDPT 2018</span>
            </div>
            {/* Mode Selector */}
            <div className="flex gap-2 mb-4 overflow-x-auto pb-2 shrink-0">
                {modes.map((mode) => (
                    <button
                        key={mode.key}
                        onClick={() => setCurrentMode(mode.key)}
                        className={cn(
                            "flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all border",
                            currentMode === mode.key
                                ? `${mode.bg} ${mode.color}`
                                : "bg-white/[0.02] border-white/5 text-white/40 hover:text-white/60 hover:bg-white/[0.04]"
                        )}
                    >
                        <mode.icon className="w-4 h-4" />
                        {isEn ? mode.label : mode.labelVi}
                    </button>
                ))}
            </div>

            {/* Model Selector */}
            <div className="flex items-center gap-2 mb-4 shrink-0">
                <span className="text-xs text-white/30 mr-1">Model:</span>
                {[
                    { id: "gemini-3-flash-preview:cloud", label: "Gemini Flash" },
                    { id: "gpt-oss:120b", label: "GPT-OSS 120B" },
                ].map((m) => (
                    <button
                        key={m.id}
                        onClick={() => setCurrentModel(m.id)}
                        className={cn(
                            "px-3 py-1.5 rounded-lg text-xs font-medium transition-all border",
                            currentModel === m.id
                                ? "bg-indigo-500/15 text-indigo-300 border-indigo-500/20"
                                : "text-white/40 border-white/5 hover:text-white/60 hover:bg-white/[0.04]"
                        )}
                    >
                        {m.label}
                    </button>
                ))}
            </div>

            {/* Mode Description */}
            <div className={cn("mb-4 px-4 py-2.5 rounded-xl border text-sm flex items-center gap-2 shrink-0", currentModeInfo.bg)}>
                <currentModeInfo.icon className={cn("w-4 h-4", currentModeInfo.color)} />
                <span className={currentModeInfo.color}>{currentModeInfo.desc}</span>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto rounded-3xl glass-panel p-4 lg:p-6 space-y-6 mb-4 custom-scrollbar">
                {messages.length === 0 ? (
                    <div className="min-h-full flex flex-col items-center justify-center text-center px-2 py-6">
                        <div className="w-16 h-16 rounded-2xl bg-[var(--brand-soft)] border border-[var(--line)] flex items-center justify-center mb-5">
                            <Sparkles className="w-8 h-8 text-[var(--brand)]" />
                        </div>
                        <h2 className="text-2xl font-semibold tracking-tight text-[var(--ink)] mb-3">{isEn ? "What are you curious about today?" : "Hôm nay, bạn muốn hiểu điều gì?"}</h2>
                        <p className="text-sm text-[var(--muted)] max-w-lg leading-relaxed">
                            {isEn ? `Ask a Physics ${grade} question, upload a problem, or start with a topic below. Choose how much help you need.` : `Đặt câu hỏi Vật lí ${grade}, gửi ảnh bài tập hoặc chọn một chủ đề bên dưới. Bạn quyết định mức hỗ trợ mình cần.`}
                        </p>
                        <div className="mt-6 grid w-full max-w-2xl grid-cols-1 sm:grid-cols-2 gap-3 text-left">
                            {curriculum.topics.slice(0, 4).map((topic) => (
                                <button
                                    key={topic.id}
                                    onClick={() => { const text = isEn ? topic.promptEn : topic.prompt; setInput(text); setPreparedDraft({ text, grade }); textareaRef.current?.focus(); }}
                                    className="group flex items-start gap-3 text-left px-4 py-3.5 rounded-2xl bg-[var(--surface)] border border-[var(--line)] hover:border-[var(--brand)] hover:bg-[var(--brand-soft)] transition-all"
                                >
                                    <BookOpen className="mt-0.5 h-4 w-4 shrink-0 text-[var(--brand)]" />
                                    <span className="min-w-0"><span className="block text-sm font-medium text-[var(--ink)]">{isEn ? topic.titleEn : topic.title}</span><span className="mt-1 block text-xs leading-relaxed text-[var(--muted)]">{isEn ? topic.summaryEn : topic.summary}</span></span>
                                </button>
                            ))}
                        </div>
                    </div>
                ) : (
                    <>
                        {messages.map((msg) => (
                            <motion.div
                                key={msg.id}
                                initial={{ opacity: 0, y: 10, scale: 0.98 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                className={cn(
                                    "flex",
                                    msg.role === "user" ? "justify-end" : "justify-start"
                                )}
                            >
                                <div
                                    className={cn(
                                        "max-w-[85%] lg:max-w-[75%] rounded-3xl px-5 py-4 shadow-lg backdrop-blur-md",
                                        msg.role === "user"
                                            ? "bg-gradient-to-br from-indigo-500/20 to-violet-500/20 border border-indigo-400/30 text-white rounded-tr-sm"
                                            : "bg-white/[0.04] border border-white/10 text-white/90 rounded-tl-sm floating-panel"
                                    )}
                                >
                                    {msg.role === "assistant" && msg.mode && (
                                        <div className="flex items-center gap-2 mb-3">
                                            {(() => {
                                                const m = modes.find((md) => md.key === msg.mode);
                                                if (!m) return null;
                                                return (
                                                    <span className={cn("text-[11px] font-bold tracking-wide uppercase px-2.5 py-1 rounded-full border", m.bg, m.color)}>
                                                        {m.labelVi}
                                                    </span>
                                                );
                                            })()}
                                        </div>
                                    )}
                                    {/* Attachment images */}
                                    {msg.attachments && msg.attachments.length > 0 && (
                                        <div className="flex gap-2 mb-3 flex-wrap">
                                            {msg.attachments.map((att, idx) =>
                                                att.type.startsWith("image/") ? (
                                                    <img key={idx} src={att.dataUrl} alt={att.name} className="max-w-[200px] max-h-[150px] rounded-xl border border-white/10 object-cover" />
                                                ) : (
                                                    <div key={idx} className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/[0.05] border border-white/10 text-xs text-white/60">
                                                        <Upload className="w-3.5 h-3.5" />
                                                        {att.name}
                                                    </div>
                                                )
                                            )}
                                        </div>
                                    )}
                                    <MathRenderer content={msg.content} className="text-sm md:text-base leading-relaxed tracking-wide" />
                                    {/* Diagnosis block display */}
                                    {msg.role === "assistant" && msg.diagnosis && (
                                        <div className="mt-3 p-3 rounded-xl bg-gradient-to-r from-amber-500/5 to-orange-500/5 border border-amber-500/15">
                                            <div className="text-[11px] font-bold text-amber-400/80 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                                                <Zap className="w-3 h-3" />
                                                Chẩn đoán học tập
                                            </div>
                                            {msg.diagnosis.topic && (
                                                <div className="text-xs text-white/60 mb-1">
                                                    <span className="text-white/30">Chủ đề:</span> {msg.diagnosis.topic}
                                                </div>
                                            )}
                                            {msg.diagnosis.concept && (
                                                <div className="text-xs text-white/60 mb-1">
                                                    <span className="text-white/30">Khái niệm:</span> {msg.diagnosis.concept}
                                                </div>
                                            )}
                                            {msg.diagnosis.breakdown && (
                                                <div className="text-xs text-amber-300/70">
                                                    <span className="text-white/30">Điểm vướng:</span> {msg.diagnosis.breakdown}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                    {/* Progressive recovery escalation button */}
                                    {msg.role === "assistant" && msg.suggestedNextMode && msg.mode !== "FULL_SOLUTION" && (
                                        <button
                                            onClick={() => {
                                                const nextMode = msg.suggestedNextMode!;
                                                setCurrentMode(nextMode);
                                                const modeLabel = modes.find((m) => m.key === nextMode)?.labelVi || nextMode;
                                                const escalationMsg = `Tôi cần thêm hỗ trợ. Hãy chuyển sang chế độ ${modeLabel}.`;
                                                setInput(escalationMsg);
                                                // Auto-submit after a short delay
                                                setTimeout(() => {
                                                    const form = document.querySelector('form');
                                                    form?.requestSubmit();
                                                }, 100);
                                            }}
                                            className="mt-3 flex items-center gap-2 px-3.5 py-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-medium hover:bg-indigo-500/20 hover:border-indigo-500/30 transition-all group"
                                        >
                                            <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                                            Cần thêm hỗ trợ? → {modes.find((m) => m.key === msg.suggestedNextMode)?.labelVi}
                                        </button>
                                    )}
                                    <div className="text-[10px] text-white/30 mt-3 font-mono">
                                        {msg.timestamp.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                        {isLoading && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="flex justify-start"
                            >
                                <div className="floating-panel rounded-3xl rounded-tl-sm px-6 py-4 flex items-center gap-3">
                                    <span className="text-sm font-medium text-white/50 mr-2">AI đang suy nghĩ</span>
                                    <div className="flex gap-1.5">
                                        <div className="w-2 h-2 rounded-full bg-indigo-400/80 animate-bounce" style={{ animationDelay: "0ms" }} />
                                        <div className="w-2 h-2 rounded-full bg-indigo-400/80 animate-bounce" style={{ animationDelay: "150ms" }} />
                                        <div className="w-2 h-2 rounded-full bg-indigo-400/80 animate-bounce" style={{ animationDelay: "300ms" }} />
                                    </div>
                                </div>
                            </motion.div>
                        )}
                        <div ref={messagesEndRef} className="h-2" />
                    </>
                )}
            </div>

            {/* Input */}
            <div className="floating-panel p-3 shrink-0 rounded-3xl mt-auto">
                {/* Attachment preview strip */}
                {attachments.length > 0 && (
                    <div className="flex gap-2 px-2 pb-2 overflow-x-auto">
                        {attachments.map((att, idx) => (
                            <div key={idx} className="relative group shrink-0">
                                {att.type.startsWith("image/") ? (
                                    <img src={att.dataUrl} alt={att.name} className="w-16 h-16 rounded-xl object-cover border border-white/10" />
                                ) : (
                                    <div className="w-16 h-16 rounded-xl bg-white/[0.05] border border-white/10 flex flex-col items-center justify-center p-1">
                                        <Upload className="w-4 h-4 text-white/40 mb-0.5" />
                                        <span className="text-[8px] text-white/40 text-center truncate w-full">{att.name.split(".").pop()?.toUpperCase()}</span>
                                    </div>
                                )}
                                <button
                                    aria-label={`${isEn ? "Remove" : "Gỡ"} ${att.name}`} onClick={() => removeAttachment(idx)}
                                    className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-red-500/80 text-white flex items-center justify-center opacity-100 md:opacity-0 md:group-hover:opacity-100 focus:opacity-100 transition-opacity"
                                >
                                    <X className="w-3 h-3" />
                                </button>
                                <span className="text-[8px] text-white/30 block text-center mt-0.5 truncate w-16">{att.name}</span>
                            </div>
                        ))}
                    </div>
                )}
                <form onSubmit={handleSubmit} className="tutor-composer flex items-end gap-3 relative z-20">
                    {/* Hidden file inputs */}
                    <input
                        ref={imageInputRef}
                        type="file"
                        accept="image/*"
                        multiple
                        className="hidden"
                        onChange={(e) => { handleFileSelect(e.target.files); e.target.value = ""; }}
                    />
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept=".pdf,.doc,.docx,.txt,.csv,.xlsx"
                        multiple
                        className="hidden"
                        onChange={(e) => { handleFileSelect(e.target.files); e.target.value = ""; }}
                    />
                    <div className="flex gap-2">
                        <button type="button" onClick={() => imageInputRef.current?.click()} className="p-3 rounded-2xl bg-white/[0.03] border border-white/5 text-white/40 hover:text-white/80 hover:bg-white/[0.08] transition-all" title="Upload ảnh">
                            <ImageIcon className="w-5 h-5" />
                        </button>
                        <button type="button" onClick={() => fileInputRef.current?.click()} className="p-3 rounded-2xl bg-white/[0.03] border border-white/5 text-white/40 hover:text-white/80 hover:bg-white/[0.08] transition-all" title="Upload tài liệu">
                            <Upload className="w-5 h-5" />
                        </button>
                    </div>
                    <textarea
                        ref={textareaRef}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onInput={handleTextareaInput}
                        onKeyDown={handleKeyDown}
                        onPaste={handlePaste}
                        placeholder={isEn ? `Ask a Physics ${grade} question or paste an image…` : `Hỏi Vật lí ${grade} hoặc dán ảnh bài tập…`}
                        aria-label={isEn ? "Your physics question" : "Câu hỏi Vật lý của bạn"} className="flex-1 glass-input resize-none py-3.5 px-4 rounded-2xl min-h-[52px] max-h-[150px] text-base"
                        rows={1}
                    />
                    <button
                        type="submit"
                        aria-label={locale === "vi" ? "Gửi câu hỏi" : "Send question"}
                        disabled={(!input.trim() && attachments.length === 0) || isLoading}
                        className={cn(
                            "p-3 rounded-2xl transition-all shadow-lg",
                            (input.trim() || attachments.length > 0) && !isLoading
                                ? "bg-[var(--brand)] text-[var(--on-brand)] hover:bg-[var(--brand-hover)] border border-transparent"
                                : "bg-white/[0.05] border border-white/5 text-white/20"
                        )}
                    >
                        <Send className="w-5 h-5" />
                    </button>
                </form>
            </div>
        </div>
    );
}

