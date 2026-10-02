"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { BookOpen, Brain, ChevronRight, LayoutDashboard, LogOut, Menu, MessageSquare, Plus, Settings, Sparkles, Target, Trash2, User, X } from "lucide-react";
import { Brand } from "@/components/Brand";
import { GradeSelector } from "@/components/GradeSelector";
import { SettingsToggles } from "@/components/SettingsToggles";
import { SmartAssistant } from "@/components/SmartAssistant";
import { WelcomeScreen } from "@/components/WelcomeScreen";
import { OnboardingWalkthrough } from "@/components/OnboardingWalkthrough";
import { NotificationBell } from "@/components/NotificationBell";
import { PomodoroTimer } from "@/components/PomodoroTimer";
import { CommandPalette } from "@/components/CommandPalette";
import { UserAvatarDropdown } from "@/components/UserAvatarDropdown";
import { useAuth } from "@/components/AuthProvider";
import { useChatStore } from "@/lib/store/chat";
import { parseGrade, useGradeStore } from "@/lib/store/grade";
import { useTranslation } from "@/lib/i18n";

function GradeRouteSync() {
    const params = useSearchParams();
    const requestedGrade = parseGrade(params.get("grade"));
    useEffect(() => { if (requestedGrade) useGradeStore.getState().setGrade(requestedGrade); }, [requestedGrade]);
    return null;
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();
    const { user, logout } = useAuth();
    const { t, locale } = useTranslation();
    const vi = locale === "vi";
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const notebook = useRef<HTMLDialogElement>(null);
    const [showWelcome, setShowWelcome] = useState(false);
    const [showOnboarding, setShowOnboarding] = useState(false);
    const menuButton = useRef<HTMLButtonElement>(null);
    const sidebar = useRef<HTMLElement>(null);
    const { conversations, activeConversationId, createConversation, setActiveConversation, deleteConversation } = useChatStore();
    const navItems = [
        { title: vi ? "Không gian học tập" : "Overview", href: "/dashboard", icon: LayoutDashboard },
        { title: t("sidebar.library"), href: "/library", icon: BookOpen },
        { title: t("sidebar.aiTutor"), href: "/tutor", icon: Brain },
        { title: t("sidebar.practice"), href: "/practice", icon: Target },
        { title: t("sidebar.profile"), href: "/profile", icon: User },
        { title: t("sidebar.feedback"), href: "/feedback", icon: MessageSquare },
    ];
    const currentPage = navItems.find((item) => item.href === pathname)?.title || (vi ? "Cài đặt" : "Settings");
    useEffect(() => {
        let timeout: ReturnType<typeof setTimeout> | undefined;
        try {
            if (sessionStorage.getItem("f-physics-just-logged-in")) {
                sessionStorage.removeItem("f-physics-just-logged-in");
                timeout = setTimeout(() => setShowWelcome(true), 0);
            } else if (user && !localStorage.getItem("f-physics-onboarding-done")) {
                sessionStorage.removeItem("f-physics-just-signed-up");
                timeout = setTimeout(() => setShowOnboarding(true), 0);
            }
        } catch { /* Browser storage is optional. */ }
        return () => clearTimeout(timeout);
    }, [user]);
    useEffect(() => {
        if (!sidebarOpen) return;
        const first = sidebar.current?.querySelector<HTMLElement>("a,button");
        first?.focus();
        const handleKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") { setSidebarOpen(false); menuButton.current?.focus(); }
            if (e.key === "Tab") {
                const items = sidebar.current?.querySelectorAll<HTMLElement>('a[href],button:not([disabled])');
                if (!items?.length) return;
                const end = items[items.length-1];
                if (e.shiftKey && document.activeElement === items[0]) { e.preventDefault(); end.focus(); }
                else if (!e.shiftKey && document.activeElement === end) { e.preventDefault(); items[0].focus(); }
            }
        };
        document.addEventListener("keydown", handleKey);
        return () => document.removeEventListener("keydown", handleKey);
    }, [sidebarOpen]);
    return <div className="workspace">
        <Suspense><GradeRouteSync/></Suspense>
        <a className="skip-link" href="#workspace-main">{vi ? "Đến nội dung học tập" : "Skip to learning content"}</a>
        {showWelcome && <WelcomeScreen userName={user?.name || ""} onComplete={() => setShowWelcome(false)}/>}
        {showOnboarding && !showWelcome && <OnboardingWalkthrough onComplete={() => setShowOnboarding(false)}/>}
        {sidebarOpen && <button className="sidebar-backdrop" aria-label={vi ? "Đóng điều hướng" : "Close navigation"} onClick={() => { setSidebarOpen(false); menuButton.current?.focus(); }}/>}
        <aside ref={sidebar} id="workspace-navigation" className={`workspace-sidebar ${sidebarOpen ? "is-open" : ""}`} aria-label={vi ? "Điều hướng học tập" : "Learning navigation"}>
            <div className="sidebar-brand"><Brand/><button className="icon-button mobile-sidebar-close" onClick={() => { setSidebarOpen(false); menuButton.current?.focus(); }} aria-label={vi ? "Đóng menu" : "Close menu"}><X size={20}/></button></div>
            <p className="sidebar-label">{vi ? "HỌC TẬP" : "LEARN & EXPLORE"}</p>
            <nav className="workspace-nav">{navItems.map((item) => <Link key={item.href} href={item.href} aria-current={pathname === item.href ? "page" : undefined} onClick={() => setSidebarOpen(false)}><item.icon/>{item.title}{pathname === item.href && <span className="nav-indicator"/>}</Link>)}</nav>
            <div className="sidebar-history"><div className="history-heading"><p className="sidebar-label">{vi ? "TRÒ CHUYỆN GẦN ĐÂY" : "RECENT CONVERSATIONS"}</p><button className="icon-button" aria-label={t("sidebar.newChat")} onClick={() => { createConversation(); router.push("/tutor"); setSidebarOpen(false); }}><Plus size={16}/></button></div>
                {conversations.length === 0 ? <p className="text-[11px] leading-relaxed text-[var(--muted)] px-3 mt-3">{vi ? "Những câu hỏi hay bắt đầu từ đây." : "Good questions start here."}</p> : conversations.map((conversation) => <div key={conversation.id} className={`history-item ${activeConversationId === conversation.id ? "is-active" : ""}`}><button className="history-open" onClick={() => { setActiveConversation(conversation.id); router.push("/tutor"); setSidebarOpen(false); }}><MessageSquare size={13}/><span>{conversation.title}</span></button><button className="icon-button history-delete" onClick={() => deleteConversation(conversation.id)} aria-label={`${vi ? "Xóa trò chuyện" : "Delete conversation"}: ${conversation.title}`}><Trash2 size={12}/></button></div>)}
            </div>
            <div className="sidebar-footer"><SettingsToggles/>{(user as Record<string,unknown>)?.role === "ADMIN" && <Link href="/admin"><Settings size={16}/>{t("common.admin")}</Link>}{user ? <button onClick={() => logout()}><LogOut size={16}/>{t("common.logout")}</button> : <Link href="/login"><User size={16}/>{t("common.login")}</Link>}</div>
        </aside>
        <div className="workspace-body">
            <header className="workspace-header"><button ref={menuButton} className="icon-button workspace-menu" aria-expanded={sidebarOpen} aria-controls="workspace-navigation" aria-label={vi ? "Mở menu học tập" : "Open learning menu"} onClick={() => setSidebarOpen(true)}><Menu size={22}/></button><div className="workspace-breadcrumb"><span>F-Physics</span><ChevronRight size={13}/><span className="text-[var(--ink)]">{currentPage}</span></div><div className="workspace-header-actions"><CommandPalette/><GradeSelector/><button className="icon-button" onClick={() => notebook.current?.showModal()} aria-label={vi ? "Mở sổ tay học tập" : "Open learning notebook"}><Sparkles size={18}/></button>{user ? <><NotificationBell/><UserAvatarDropdown/></> : <Link className="workspace-login" href="/login">{t("common.login")}</Link>}</div></header>
            <div className="workspace-content"><main className="workspace-main" id="workspace-main">{children}</main>{pathname === "/tutor" && <aside className="workspace-context" aria-label={vi ? "Sổ tay học tập" : "Learning notebook"}><SmartAssistant/></aside>}</div>
        </div>
        <dialog ref={notebook} aria-labelledby="notebook-title" className="fixed inset-y-0 right-0 left-auto m-0 ml-auto h-dvh max-h-dvh w-full max-w-sm border-l border-[var(--line)] bg-[var(--surface)] p-4 text-[var(--ink)] backdrop:bg-black/35" onClick={(event) => { if (event.target === event.currentTarget) notebook.current?.close(); }}><div className="flex h-full flex-col" onClick={(event) => event.stopPropagation()}><div className="mb-4 flex items-center justify-between"><h2 id="notebook-title" className="font-medium">{vi ? "Sổ tay học tập" : "Learning notebook"}</h2><button className="icon-button" onClick={() => notebook.current?.close()} aria-label={vi ? "Đóng sổ tay" : "Close notebook"}><X size={20}/></button></div><div className="flex-1 overflow-auto"><SmartAssistant/></div></div></dialog>

        <PomodoroTimer/>
    </div>;
}


