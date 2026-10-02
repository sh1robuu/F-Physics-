"use client";

import Link from "next/link";
import { ArrowUpRight, BookOpen, Sparkles } from "lucide-react";
import { useTranslation } from "@/lib/i18n";
import { SettingsToggles } from "@/components/SettingsToggles";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
    const { locale } = useTranslation();
    const vi = locale === "vi";
    return <div className="auth-shell"><aside className="auth-aside"><div className="auth-aside-top"><span>F-PHYSICS / LEARNING LAB</span><Sparkles size={22}/></div><div><div className="auth-orbit" aria-hidden="true"><svg viewBox="0 0 280 200" fill="none"><ellipse cx="140" cy="100" rx="108" ry="40" transform="rotate(-30 140 100)" stroke="#f58220"/><ellipse cx="140" cy="100" rx="108" ry="40" transform="rotate(30 140 100)" stroke="#4db848"/><circle cx="140" cy="100" r="12" fill="#f58220"/><circle cx="232" cy="57" r="7" fill="#4db848"/></svg></div><h2>{vi ? "Mỗi câu hỏi\nlà một khởi đầu." : "Every question\nis a beginning."}</h2><p>{vi ? "Từ nền tảng lớp 10 đến những khám phá lớp 12. Một không gian để bạn hiểu sâu và tự tin tiến bước." : "From grade 10 foundations to grade 12 discoveries. A space to understand more and move forward with confidence."}</p><div className="auth-grades"><span>{vi ? "LỚP" : "GRADES"}</span>10<span>—</span>11<span>—</span>12</div></div><Link href="/library"><BookOpen size={17}/>{vi ? "Khám phá chương trình học" : "Explore the curriculum"}<ArrowUpRight size={16}/></Link></aside><div className="auth-content"><div className="auth-tools"><SettingsToggles compact/></div>{children}</div></div>;
}
