"use client";

import Link from "next/link";
import { ArrowRight, BookOpen, Brain, ChevronRight, Target } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import { useTranslation } from "@/lib/i18n";
import { useGradeStore } from "@/lib/store/grade";
import { getGradeCurriculum } from "@/lib/data/curriculum";
import { StreakCard } from "@/components/StreakCard";

export default function DashboardPage() {
    const { user } = useAuth();
    const { locale } = useTranslation();
    const vi = locale === "vi";
    const grade = useGradeStore((s) => s.grade);
    const curriculum = getGradeCurriculum(grade);
    return <div className="dashboard-page">
        <div className="dashboard-intro"><div><div className="eyebrow">{vi ? "KHÔNG GIAN HỌC TẬP CỦA BẠN" : "YOUR LEARNING WORKSPACE"}</div><h1>{vi ? "Hôm nay, mình học gì" : "What will you explore today"}{user?.name ? `, ${user.name.split(" ").at(-1)}` : ""}?</h1><p>{vi ? "Một điều mới mỗi ngày. Một bước gần hơn với điều bạn muốn hiểu." : "Something new each day. One step closer to understanding."}</p></div><Link href="/profile" className="text-link">{vi ? "Hồ sơ học tập" : "Your profile"}<ArrowRight size={15}/></Link></div>
        <section className="dashboard-banner"><div><div className="eyebrow mb-3">{vi ? `VẬT LÝ ${grade} · GDPT 2018` : `GRADE ${grade} PHYSICS · 2018 CURRICULUM`}</div><h2>{vi ? curriculum.title : curriculum.titleEn}</h2><p>{vi ? curriculum.description : curriculum.descriptionEn}</p><Link href={`/library?grade=${grade}`} className="btn-primary">{vi ? "Khám phá lộ trình" : "Explore your curriculum"}<ArrowRight size={17}/></Link></div><svg className="banner-art" viewBox="0 0 160 160" fill="none" aria-hidden="true"><circle cx="80" cy="80" r="62" stroke="currentColor" strokeDasharray="3 6"/><ellipse cx="80" cy="80" rx="72" ry="28" transform="rotate(-35 80 80)" stroke="currentColor"/><ellipse cx="80" cy="80" rx="72" ry="28" transform="rotate(35 80 80)" stroke="currentColor"/><circle cx="80" cy="80" r="10" fill="currentColor"/><circle cx="134" cy="117" r="5" fill="currentColor"/></svg></section>
        <section><div className="dashboard-section-title"><h2>{vi ? "Bắt đầu từ một chủ đề" : "Start with a topic"}</h2><span className="text-[11px] text-[var(--muted)]">{curriculum.topics.length} {vi ? "chủ đề" : "topics"} · {vi ? "Lớp" : "Grade"} {grade}</span></div><div className="dashboard-topics">{curriculum.topics.map((topic,i) => <Link key={topic.id} href={`/tutor?grade=${grade}&topic=${topic.id}`} className="dashboard-topic"><span className="topic-index">{String(i+1).padStart(2,"0")}</span><div><h3>{vi ? topic.title : topic.titleEn}</h3><p>{vi ? topic.summary : topic.summaryEn}</p></div><ChevronRight size={17}/></Link>)}</div></section>
        <div className="dashboard-tools">{[
            {href:"/tutor",icon:Brain,title:vi?"Gỡ rối cùng gia sư AI":"Think it through with AI",desc:vi?"Một gợi ý đúng lúc, một cách hiểu mới.":"A timely hint. A fresh perspective."},
            {href:`/practice?grade=${grade}`,icon:Target,title:vi?"Thử sức với bài tập":"Put your knowledge to work",desc:vi?"Luyện theo chủ đề, xem lời giải sau mỗi lượt.":"Practice by topic and review each explanation."},
            {href:`/library?grade=${grade}`,icon:BookOpen,title:vi?"Mở thư viện kiến thức":"Open your knowledge library",desc:vi?"Công thức cần nhớ và tài liệu của riêng bạn.":"Essential formulas and your own resources."},
        ].map((tool) => <Link className="dashboard-tool" key={tool.href} href={tool.href}><tool.icon size={24}/><h3>{tool.title}</h3><p>{tool.desc}</p></Link>)}</div>
        <details className="mt-6 rounded-xl border border-[var(--line)] bg-[var(--surface)] p-5"><summary className="text-sm font-medium">{vi ? "Nhịp học của bạn" : "Your learning rhythm"}</summary><div className="mt-5"><StreakCard/></div></details>
    </div>;
}
