"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Search, ArrowUpRight, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTranslation } from "@/lib/i18n";
import { useChatStore } from "@/lib/store/chat";
import { useGradeStore } from "@/lib/store/grade";
import { getGradeCurriculum } from "@/lib/data/curriculum";

const normalize = (value: string) => value.toLocaleLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/đ/g, "d");

export function CommandPalette() {
    const { t, locale } = useTranslation();
    const vi = locale === "vi";
    const grade = useGradeStore((state) => state.grade);
    const createConversation = useChatStore((state) => state.createConversation);
    const router = useRouter();
    const dialog = useRef<HTMLDialogElement>(null);
    const trigger = useRef<HTMLButtonElement>(null);
    const input = useRef<HTMLInputElement>(null);
    const [query, setQuery] = useState("");
    const [selectedIndex, setSelectedIndex] = useState(0);
    const open = useCallback(() => {
        setQuery(""); setSelectedIndex(0);
        dialog.current?.showModal(); input.current?.focus();
    }, []);
    const close = () => { dialog.current?.close(); trigger.current?.focus(); };
    const navigate = (href: string) => { close(); router.push(href); };
    const commands = [
        { id: "dashboard", label: vi ? "Không gian học tập" : "Overview", href: "/dashboard" },
        { id: "tutor", label: t("sidebar.aiTutor"), href: "/tutor" },
        { id: "new-chat", label: t("sidebar.newChat"), href: "/tutor" },
        { id: "library", label: t("sidebar.library"), href: "/library" },
        { id: "practice", label: t("sidebar.practice"), href: "/practice" },
        { id: "profile", label: t("sidebar.profile"), href: "/profile" },
        ...getGradeCurriculum(grade).topics.map((topic) => ({
            id: topic.id, label: vi ? topic.title : topic.titleEn,
            href: `/tutor?grade=${grade}&topic=${topic.id}`,
        })),
    ];
    const execute = (command: { id: string; href: string }) => { if (command.id === "new-chat") createConversation(); navigate(command.href); };
    const filtered = commands.filter((command) => normalize(command.label).includes(normalize(query.trim())));
    useEffect(() => {
        const onKey = (event: KeyboardEvent) => {
            if (!(event.ctrlKey || event.metaKey)) return;
            if (event.key.toLowerCase() === "k") {
                event.preventDefault();
                if (dialog.current?.open) dialog.current.close(); else open();
            }
            if (event.key.toLowerCase() === "n" && !["INPUT", "TEXTAREA"].includes(document.activeElement?.tagName ?? "")) {
                event.preventDefault(); createConversation(); dialog.current?.close(); router.push("/tutor");
            }
        };
        document.addEventListener("keydown", onKey);
        return () => document.removeEventListener("keydown", onKey);
    }, [open, createConversation, router]);
    return <>
        <button ref={trigger} className="icon-button" aria-label={vi ? "Tìm kiếm nhanh (Ctrl+K)" : "Quick search (Ctrl+K)"} onClick={open}><Search size={18}/></button>
        <dialog ref={dialog} aria-labelledby="quick-search-title" className="m-auto w-[calc(100%_-_2rem)] max-w-lg rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-0 text-[var(--ink)] shadow-xl backdrop:bg-black/40" onClick={(event) => { if (event.target === event.currentTarget) close(); }}>
            <div className="p-4" onClick={(event) => event.stopPropagation()}>
                <div className="mb-3 flex items-center justify-between"><h2 id="quick-search-title" className="text-sm font-semibold">{vi ? `Tìm kiếm · Lớp ${grade}` : `Search · Grade ${grade}`}</h2><button className="icon-button" aria-label={vi ? "Đóng tìm kiếm" : "Close search"} onClick={close}><X size={18}/></button></div>
                <input ref={input} aria-label={t("common.search")} value={query} onChange={(event) => { setQuery(event.target.value); setSelectedIndex(0); }} placeholder={vi ? "Tìm trang hoặc chủ đề…" : "Find a page or topic…"} className="glass-input mb-3" onKeyDown={(event) => {
                    if (event.key === "ArrowDown") { event.preventDefault(); setSelectedIndex((index) => Math.min(index + 1, Math.max(0, filtered.length - 1))); }
                    if (event.key === "ArrowUp") { event.preventDefault(); setSelectedIndex((index) => Math.max(0, index - 1)); }
                    if (event.key === "Enter") { event.preventDefault(); if (filtered[selectedIndex]) execute(filtered[selectedIndex]); }
                }}/>
                <div className="max-h-[50dvh] overflow-y-auto">{filtered.length ? filtered.map((command, index) => <button key={command.id} onClick={() => execute(command)} className={`flex w-full items-center justify-between gap-3 rounded-lg p-3 text-left text-sm ${index === selectedIndex ? "bg-[var(--brand-soft)] text-[var(--brand)]" : "hover:bg-[var(--surface-subtle)]"}`}><span>{command.label}</span><ArrowUpRight size={15}/></button>) : <p className="py-6 text-center text-sm text-[var(--muted)]">{vi ? "Chưa tìm thấy kết quả." : "No results found."}</p>}</div>
            </div>
        </dialog>
    </>;
}

