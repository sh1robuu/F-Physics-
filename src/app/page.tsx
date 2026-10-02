"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, BookOpen, Check, Compass, Menu, MessageCircle, Sparkles, Target, X } from "lucide-react";
import { Brand } from "@/components/Brand";
import { PhysicsSketch } from "@/components/PhysicsSketch";
import { SettingsToggles } from "@/components/SettingsToggles";
import { useTranslation } from "@/lib/i18n";
import { getGradeCurriculum, GRADES } from "@/lib/data/curriculum";
import { useGradeStore } from "@/lib/store/grade";

export default function LandingPage() {
    const { locale } = useTranslation();
    const vi = locale === "vi";
    const [menuOpen, setMenuOpen] = useState(false);
    const setGrade = useGradeStore((s) => s.setGrade);
    useEffect(() => {
        if (!menuOpen) return;
        const close = (e: KeyboardEvent) => { if (e.key === "Escape") setMenuOpen(false); };
        window.addEventListener("keydown", close);
        return () => window.removeEventListener("keydown", close);
    }, [menuOpen]);
    const links = [
        { href: "#curriculum", label: vi ? "Chương trình học" : "Curriculum" },
        { href: "#approach", label: vi ? "Cách học" : "How it works" },
        { href: "/library", label: vi ? "Thư viện" : "Library" },
    ];
    return <div className="landing-page">
        <a className="skip-link" href="#main-content">{vi ? "Đến nội dung chính" : "Skip to content"}</a>
        <header className="site-header"><div className="site-container site-header-inner">
            <Brand/>
            <nav className="desktop-nav" aria-label={vi ? "Điều hướng chính" : "Main navigation"}>{links.map((l) => <Link key={l.href} href={l.href}>{l.label}</Link>)}</nav>
            <div className="header-actions"><SettingsToggles compact/><Link href="/login" className="login-link">{vi ? "Đăng nhập" : "Log in"}</Link><Link href="/dashboard" className="btn-primary header-cta">{vi ? "Bắt đầu học" : "Start learning"}<ArrowUpRight size={16}/></Link><button className="icon-button mobile-menu-button" onClick={() => setMenuOpen(!menuOpen)} aria-expanded={menuOpen} aria-controls="mobile-navigation" aria-label={vi ? "Mở menu" : "Open menu"}>{menuOpen ? <X size={22}/> : <Menu size={22}/>}</button></div>
        </div>{menuOpen && <nav className="mobile-navigation" id="mobile-navigation" aria-label={vi ? "Menu trên điện thoại" : "Mobile navigation"}>{links.map((l) => <Link key={l.href} href={l.href} onClick={() => setMenuOpen(false)}>{l.label}<ArrowUpRight size={17}/></Link>)}<Link href="/login">{vi ? "Đăng nhập" : "Log in"}</Link><Link href="/dashboard">{vi ? "Bắt đầu học" : "Start learning"}</Link></nav>}</header>
        <main id="main-content">
            <section className="site-container hero-section">
                <div className="hero-copy">
                    <div className="eyebrow"><span className="eyebrow-line"/>{vi ? "VẬT LÝ THPT · CHƯƠNG TRÌNH GDPT 2018" : "HIGH SCHOOL PHYSICS · VIETNAM’S 2018 CURRICULUM"}</div>
                    <h1>{vi ? "Hiểu từ gốc." : "Start with why."}<br/><span>{vi ? "Học đi xa." : "Go further."}</span><span className="hero-asterisk" aria-hidden="true">✳</span></h1>
                    <p>{vi ? "Từ câu hỏi “tại sao?” đến khoảnh khắc “hiểu rồi!”. Khám phá Vật lý lớp 10, 11, 12 với lộ trình rõ ràng và một gia sư AI luôn sẵn sàng gợi mở." : "From your first “why?” to that “I get it!” moment. Explore grades 10, 11 and 12 with a clear learning path and an AI tutor that helps you think."}</p>
                    <div className="hero-actions"><a href="#curriculum" className="btn-primary">{vi ? "Tìm lộ trình của bạn" : "Find your learning path"}<ArrowRight size={18}/></a><Link href="/tutor" className="text-link"><MessageCircle size={18}/>{vi ? "Hỏi gia sư AI" : "Ask your AI tutor"}</Link></div>
                    <div className="hero-note"><span className="tiny-check"><Check size={12}/></span>{vi ? "Học theo lớp của bạn" : "Learn at your grade level"}<span className="note-separator"/>{vi ? "Hiểu bản chất, vững kiến thức" : "Build a deeper understanding"}</div>
                </div>
                <div className="hero-visual"><div className="visual-note"><span>01 / EXPLORE</span><span>{vi ? "Khoa học bắt đầu từ tò mò" : "Science starts with curiosity"}</span></div><PhysicsSketch/><div className="visual-footer"><span>F-PHYSICS LEARNING LAB</span><span>10 → 11 → 12</span></div></div>
            </section>
            <div className="manifesto-strip"><div className="site-container"><span><Compass size={20}/>{vi ? "Một lộ trình, ba năm THPT" : "One path through high school"}</span><span><BookOpen size={20}/>{vi ? "Kiến thức theo chủ đề" : "Knowledge, topic by topic"}</span><span><Sparkles size={20}/>{vi ? "Gợi mở tư duy cùng AI" : "Think it through with AI"}</span></div></div>
            <section className="site-container curriculum-section" id="curriculum">
                <div className="section-heading"><div><div className="eyebrow">01 — {vi ? "LỘ TRÌNH HỌC TẬP" : "YOUR LEARNING PATH"}</div><h2>{vi ? "Bạn đang ở chặng nào?" : "Where are you starting?"}</h2></div><p>{vi ? "Chọn lớp, tìm chủ đề và bắt đầu từ điều bạn muốn hiểu." : "Pick your grade, find a topic, and start with what you want to understand."}</p></div>
                <div className="grade-cards">{GRADES.map((grade, i) => {
                    const curriculum = getGradeCurriculum(grade);
                    const themes = vi ? ["Xây nền tảng", "Kết nối kiến thức", "Sẵn sàng bứt phá"] : ["Build your foundations", "Connect the concepts", "Take the next step"];
                    return <Link key={grade} href={`/library?grade=${grade}`} onClick={() => setGrade(grade)} className={`grade-card grade-${grade}`}>
                        <div className="grade-card-top"><span>{vi ? "VẬT LÝ" : "PHYSICS"}</span><ArrowUpRight size={23}/></div><div className="grade-number">{grade}<span>{vi ? "LỚP" : "GRADE"}</span></div><h3>{themes[i]}</h3><p>{vi ? curriculum.description : curriculum.descriptionEn}</p><div className="grade-card-bottom"><span>{curriculum.topics.length} {vi ? "chủ đề" : "topics"}</span><span>{vi ? "Khám phá lộ trình" : "Explore the path"}<ArrowRight size={16}/></span></div>
                    </Link>;
                })}</div>
                <div className="curriculum-footnote"><BookOpen size={15}/><p>{vi ? "Tổ chức theo mạch kiến thức của chương trình GDPT 2018. Chuyên đề học tập được tách riêng; thứ tự bài học có thể khác giữa các bộ sách." : "Organized by the 2018 curriculum’s subject themes. Specialist topics are listed separately; lesson order may vary between textbooks."}</p><Link href="/library">{vi ? "Xem chương trình" : "View curriculum"}<ArrowUpRight size={15}/></Link></div>
            </section>
            <section className="approach-section" id="approach"><div className="site-container approach-grid"><div><div className="eyebrow">02 — {vi ? "CÁCH HỌC CÙNG F-PHYSICS" : "THE F-PHYSICS APPROACH"}</div><h2>{vi ? "Không chỉ biết đáp án.\nCòn hiểu vì sao." : "Find the answer.\nUnderstand the why."}</h2><p className="approach-intro">{vi ? "Một không gian để hỏi, thử và tiến bộ. Bạn chọn tốc độ, F-Physics đồng hành từng bước." : "A space to ask, try, and improve. You set the pace. F-Physics helps with the next step."}</p><Link href="/dashboard" className="text-link">{vi ? "Vào không gian học tập" : "Open your workspace"}<ArrowRight size={18}/></Link></div><div className="approach-steps">{[
                    { icon: Compass, title: vi ? "Bắt đầu từ điều chưa hiểu" : "Start with a question", text: vi ? "Chọn chủ đề, xem kiến thức cốt lõi và các công thức cần nắm." : "Pick a topic and explore its core concepts and formulas." },
                    { icon: Sparkles, title: vi ? "Tự tìm lời giải, có người dẫn đường" : "Think for yourself, with a little help", text: vi ? "Chọn gợi ý, giải thích khái niệm hoặc hướng dẫn từng bước từ gia sư AI." : "Choose a hint, a concept explanation, or step-by-step guidance from your AI tutor." },
                    { icon: Target, title: vi ? "Luyện tập để kiến thức ở lại" : "Practice until it clicks", text: vi ? "Làm bài theo lớp và chủ đề. Xem đáp án, đọc giải thích, thử lại điều còn vướng." : "Practice by grade and topic. Review your answers and explanations, then try again." },
                ].map((step,i) => <div className="approach-step" key={i}><span className="step-index">0{i+1}</span><div><h3>{step.title}</h3><p>{step.text}</p></div><step.icon size={23}/></div>)}</div></div></section>
            <section className="site-container final-invitation"><span className="invitation-spark" aria-hidden="true">✳</span><div><h2>{vi ? "Câu hỏi hay tiếp theo\nđang chờ bạn." : "Your next good question\nis waiting."}</h2><p>{vi ? "Bắt đầu một chủ đề nhỏ. Mở ra một góc nhìn mới." : "Start with a small topic. Discover a new perspective."}</p></div><Link href="/dashboard" className="btn-primary">{vi ? "Bắt đầu khám phá" : "Start exploring"}<ArrowUpRight size={20}/></Link></section>
        </main>
        <footer className="site-footer site-container"><div><Brand/><p>{vi ? "Vật lý gần hơn. Tư duy xa hơn." : "Physics, closer. Thinking, further."}</p></div><div><Link href="/library">{vi ? "Thư viện" : "Library"}</Link><Link href="/tutor">{vi ? "Gia sư AI" : "AI tutor"}</Link><a href="mailto:quocnam03.31@gmail.com">{vi ? "Liên hệ" : "Contact"}</a></div><span>Made by GiCoffee Team <span className="brand-dot">↗</span></span></footer>
    </div>;
}
