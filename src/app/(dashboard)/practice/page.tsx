"use client";

import { Suspense, useCallback, useEffect, useEffectEvent, useMemo, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowLeft, ArrowRight, BookOpen, Check, CheckCircle2, ChevronDown, Clock3, Flag, History, Play, RotateCcw, Target, X } from "lucide-react";
import { MathRenderer } from "@/components/MathRenderer";
import { useLanguageStore } from "@/lib/store/language";
import { useGradeStore } from "@/lib/store/grade";
import { getGradeCurriculum, type Grade } from "@/lib/data/curriculum";
import { generateExam, getQuestionsForGrade, type Question } from "@/lib/data/questionBank";
import { getPracticeMinutes, isQuestionAnswered, scorePractice, scoreQuestion, type PracticeAnswers } from "@/lib/practice";
import { cn } from "@/lib/utils";

const panel = "rounded-2xl border border-[var(--line)] bg-[var(--surface)]";
const HISTORY_KEY = "f-physics-practice-history-v2";
const HISTORY_EVENT = "f-physics-practice-updated";
const emptyAnswers = (): PracticeAnswers => ({ mcq: {}, tf: {}, short: {} });
type View = "intro" | "exam" | "result";
type Attempt = { id: string; grade: Grade; chapter?: number; questions: Question[]; deadline: number; minutes: number };
type AttemptRecord = { id: string; grade: Grade; chapter?: number; score: number; answered: number; total: number; completedAt: string };

function subscribeHistory(callback: () => void) {
    window.addEventListener("storage", callback);
    window.addEventListener(HISTORY_EVENT, callback);
    return () => { window.removeEventListener("storage", callback); window.removeEventListener(HISTORY_EVENT, callback); };
}
function historySnapshot() { try { return localStorage.getItem(HISTORY_KEY) ?? ""; } catch { return ""; } }
function readHistory(raw: string): AttemptRecord[] {
    try { const value = JSON.parse(raw || "[]"); return Array.isArray(value) ? value.filter((item) => item && [10, 11, 12].includes(item.grade) && typeof item.score === "number" && typeof item.completedAt === "string") : []; } catch { return []; }
}
function formatTime(seconds: number) { return `${Math.floor(seconds / 60).toString().padStart(2, "0")}:${(seconds % 60).toString().padStart(2, "0")}`; }

export default function PracticePage() {
    return <Suspense fallback={<div className="p-8 text-[var(--muted)]">F-Physics…</div>}><PracticeContent /></Suspense>;
}

function PracticeContent() {
    const grade = useGradeStore((s) => s.grade);
    const locale = useLanguageStore((s) => s.locale);
    const en = locale === "en";
    const text = (vi: string, english: string) => en ? english : vi;
    const params = useSearchParams();
    const curriculum = getGradeCurriculum(grade);
    const bank = getQuestionsForGrade(grade);
    const [topicChoice, setTopicChoice] = useState<string | null>(null);
    const requestedTopic = topicChoice ?? params.get("topic") ?? "all";
    const topic = curriculum.topics.find((item) => item.id === requestedTopic);
    const chapter = topic ? bank.find((q) => q.topicId === topic.id)?.chapter : undefined;
    const source = chapter ? bank.filter((q) => q.chapter === chapter) : bank;
    const planned = (["mcq", "tf", "short"] as const).flatMap((type) => source.filter((q) => q.type === type).slice(0, type === "mcq" ? 18 : type === "tf" ? 4 : 6));
    const [view, setView] = useState<View>("intro");
    const [attempt, setAttempt] = useState<Attempt | null>(null);
    const [answers, setAnswers] = useState<PracticeAnswers>(emptyAnswers);
    const [index, setIndex] = useState(0);
    const [remaining, setRemaining] = useState(0);
    const [flagged, setFlagged] = useState<Set<string>>(new Set());
    const [confirmSubmit, setConfirmSubmit] = useState(false);
    const [storageError, setStorageError] = useState(false);
    const historyRaw = useSyncExternalStore(subscribeHistory, historySnapshot, () => "");
    const history = useMemo(() => readHistory(historyRaw), [historyRaw]);
    const questions = attempt?.questions ?? [];
    const current = questions[index];
    const result = scorePractice(questions, answers);
    const typeName = (type: Question["type"]) => type === "mcq" ? text("Nhiều lựa chọn", "Multiple choice") : type === "tf" ? text("Đúng / Sai", "True / False") : text("Trả lời ngắn", "Short answer");
    const attemptTopic = attempt?.chapter ? getGradeCurriculum(attempt.grade).topics.find((item) => questions[0]?.topicId === item.id) : undefined;

    const startExam = (selectedChapter?: number, selectedGrade: Grade = grade) => {
        const nextQuestions = generateExam(selectedChapter, selectedGrade);
        if (!nextQuestions.length) return;
        const minutes = getPracticeMinutes(nextQuestions);
        setAttempt({ id: crypto.randomUUID(), grade: selectedGrade, chapter: selectedChapter, questions: nextQuestions, minutes, deadline: Date.now() + minutes * 60_000 });
        setAnswers(emptyAnswers()); setFlagged(new Set()); setIndex(0); setRemaining(minutes * 60); setConfirmSubmit(false); setStorageError(false); setView("exam");
    };

    const submitExam = useCallback(() => {
        if (!attempt) return;
        const summary = scorePractice(attempt.questions, answers);
        const record: AttemptRecord = { id: attempt.id, grade: attempt.grade, chapter: attempt.chapter, score: summary.score, answered: summary.answered, total: attempt.questions.length, completedAt: new Date().toISOString() };
        try {
            const previous = readHistory(historySnapshot()).filter((item) => item.id !== record.id);
            localStorage.setItem(HISTORY_KEY, JSON.stringify([record, ...previous].slice(0, 30)));
            window.dispatchEvent(new Event(HISTORY_EVENT));
        } catch { setStorageError(true); }
        setConfirmSubmit(false); setView("result");
    }, [attempt, answers, setConfirmSubmit, setView, setStorageError]);

    const onDeadline = useEffectEvent(submitExam);
    useEffect(() => {
        if (view !== "exam" || !attempt) return;
        const tick = () => {
            const seconds = Math.max(0, Math.ceil((attempt.deadline - Date.now()) / 1000));
            setRemaining(seconds);
            if (seconds === 0) onDeadline();
        };
        const timer = window.setInterval(tick, 1000);
        const preventExit = (event: BeforeUnloadEvent) => { event.preventDefault(); };
        window.addEventListener("beforeunload", preventExit);
        return () => { window.clearInterval(timer); window.removeEventListener("beforeunload", preventExit); };
    }, [view, attempt]);

    if (view === "intro") return (
        <div className="mx-auto max-w-6xl space-y-7 p-5 md:p-8 lg:p-10">
            <header>
                <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--brand)]">{text("LUYỆN TẬP", "PRACTICE")} / {text("LỚP", "GRADE")} {grade}</p>
                <h1 className="text-3xl font-semibold tracking-tight text-[var(--ink)] md:text-4xl">{text("Hiểu sâu hơn qua từng câu hỏi.", "Build understanding, one question at a time.")}</h1>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--muted)]">{text("Chọn một chủ đề để củng cố kiến thức, hoặc thử sức với bài ôn tổng hợp. Xem lời giải sau khi hoàn thành.", "Focus on a topic or try a mixed practice set. Review the worked explanations when you finish.")}</p>
            </header>
            <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_310px]">
                <section className={cn(panel, "overflow-hidden")}>
                    <div className="border-b border-[var(--line)] p-6 md:p-7">
                        <div className="mb-5 flex items-center gap-3"><span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--brand-soft)] text-[var(--brand)]"><Target size={23} /></span><div><h2 className="font-semibold text-[var(--ink)]">{text("Bài luyện của bạn", "Your practice set")}</h2><p className="mt-1 text-xs text-[var(--muted)]">{text("Vật lý", "Physics")} {grade} · {text("Chương trình GDPT 2018", "2018 national curriculum")}</p></div></div>
                        <label htmlFor="practice-topic" className="mb-2 block text-sm font-medium text-[var(--ink)]">{text("Bạn muốn ôn phần nào?", "What would you like to practise?")}</label>
                        <div className="relative"><select id="practice-topic" value={topic?.id ?? "all"} onChange={(event) => setTopicChoice(event.target.value)} className="w-full appearance-none rounded-xl border border-[var(--line)] bg-[var(--surface-subtle)] p-3.5 pr-10 text-sm text-[var(--ink)]"><option value="all">{text("Ôn tổng hợp — tất cả chủ đề", "Mixed practice — all topics")}</option>{curriculum.topics.map((item) => <option key={item.id} value={item.id}>{en ? item.titleEn : item.title}</option>)}</select><ChevronDown size={16} className="pointer-events-none absolute right-3 top-4 text-[var(--muted)]" /></div>
                    </div>
                    <div className="p-6 md:p-7">
                        <div className="mb-6 grid grid-cols-3 gap-3">{[{ value: planned.length, label: text("câu hỏi", "questions") }, { value: getPracticeMinutes(planned), label: text("phút", "minutes") }, { value: 10, label: text("thang điểm", "point scale") }].map((stat) => <div key={stat.label} className="rounded-xl bg-[var(--surface-subtle)] px-3 py-4"><p className="text-3xl font-semibold tracking-tight text-[var(--ink)]">{stat.value}</p><p className="mt-1 text-xs text-[var(--muted)]">{stat.label}</p></div>)}</div>
                        <div className="space-y-3">{(["mcq", "tf", "short"] as const).map((type, part) => <div key={type} className="flex items-center gap-3 text-sm"><span className="flex h-7 w-7 items-center justify-center rounded-lg border border-[var(--line)] text-xs text-[var(--muted)]">0{part + 1}</span><span className="flex-1 text-[var(--ink)]">{typeName(type)}</span><span className="text-[var(--muted)]">{planned.filter((q) => q.type === type).length} {text("câu", "questions")}</span></div>)}</div>
                        <button onClick={() => startExam(chapter)} disabled={!planned.length} className="mt-7 flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--brand)] px-5 py-3.5 text-sm font-semibold text-[var(--on-brand)] transition-opacity hover:opacity-90 disabled:opacity-40"><Play size={17} />{text("Bắt đầu luyện tập", "Start practice")}</button>
                        <p className="mt-3 text-center text-xs leading-5 text-[var(--muted)]">{text("Câu hỏi không lặp lại trong cùng một bài luyện.", "Each question appears once per practice set.")}{en && " Exercises are in Vietnamese."}</p>
                    </div>
                </section>
                <aside className="space-y-5">
                    <section className={cn(panel, "p-5")}><div className="mb-3 flex items-center gap-2 text-[var(--brand)]"><BookOpen size={18} /><h2 className="text-sm font-semibold">{text("Hiểu trước, luyện sau", "Learn, then practise")}</h2></div><p className="text-sm leading-6 text-[var(--muted)]">{text("Ôn lại các ý chính và công thức trong thư viện. Bạn cũng có thể nhờ gia sư AI giải thích từng bước.", "Revisit key concepts and formulas in the library, or ask your AI tutor for a step-by-step explanation.")}</p><Link href={`/library?grade=${grade}`} className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-[var(--brand)]">{text("Mở thư viện", "Open library")}<ArrowRight size={15} /></Link></section>
                    <section className="rounded-2xl border border-[var(--line)] p-5"><h2 className="mb-2 text-sm font-semibold text-[var(--ink)]">{text("Cách tính điểm luyện tập", "Practice scoring")}</h2><p className="text-xs leading-6 text-[var(--muted)]">{text("Nhiều lựa chọn: 0,25đ/câu. Trả lời ngắn: 0,5đ/câu. Đúng/Sai: đúng 1/2/3/4 ý lần lượt được 0,1/0,25/0,5/1đ. Tổng điểm quy đổi về thang 10 theo số câu thực tế.", "Multiple choice: 0.25 each. Short answer: 0.5 each. True/False: 1/2/3/4 correct statements earn 0.1/0.25/0.5/1 points. The actual set is normalized to a 10-point scale.")}</p><p className="mt-3 text-xs leading-5 text-[var(--muted)]">{text("Bài ôn kiến thức, không phải đề thi chính thức.", "A learning exercise, not an official exam paper.")}</p></section>
                </aside>
            </div>
            <section><div className="mb-4 flex items-center gap-2"><History size={18} className="text-[var(--muted)]" /><h2 className="font-semibold text-[var(--ink)]">{text("Những lần luyện gần đây", "Recent practice")}</h2></div>{history.filter((item) => item.grade === grade).length ? <div className={cn(panel, "divide-y divide-[var(--line)]")}>{history.filter((item) => item.grade === grade).slice(0, 4).map((item) => <div key={item.id} className="flex items-center justify-between gap-4 px-5 py-4"><div><p className="text-sm font-medium text-[var(--ink)]">{item.chapter ? (en ? curriculum.topics[item.chapter - 1]?.titleEn : curriculum.topics[item.chapter - 1]?.title) ?? text("Luyện theo chủ đề", "Topic practice") : text("Ôn tổng hợp", "Mixed practice")}</p><p className="mt-1 text-xs text-[var(--muted)]">{new Date(item.completedAt).toLocaleDateString(en ? "en-GB" : "vi-VN")} · {item.answered}/{item.total} {text("câu đã trả lời", "answered")}</p></div><p className="text-xl font-semibold text-[var(--brand)]">{item.score.toFixed(1)}<span className="text-xs font-normal text-[var(--muted)]"> / 10</span></p></div>)}</div> : <div className={cn(panel, "p-6 text-sm leading-6 text-[var(--muted)]")}>{text("Bắt đầu bài luyện đầu tiên. Kết quả của bạn sẽ được lưu trên trình duyệt này.", "Start your first practice set. Results will be saved in this browser.")}</div>}</section>
        </div>
    );

    if (!attempt || !current) return null;
    if (view === "result") return (
        <div className="mx-auto max-w-4xl space-y-6 p-5 md:p-8 lg:p-10">
            <button onClick={() => setView("intro")} className="inline-flex items-center gap-2 text-sm text-[var(--muted)]"><ArrowLeft size={16} />{text("Chọn bài luyện", "Choose practice")}</button>
            <section className={cn(panel, "p-6 md:p-8")}><div className="flex flex-wrap items-center justify-between gap-6"><div><p className="mb-2 text-xs font-semibold uppercase tracking-widest text-[var(--brand)]">{text("ĐÃ HOÀN THÀNH", "COMPLETED")} · {text("LỚP", "GRADE")} {attempt.grade}</p><h1 className="text-3xl font-semibold tracking-tight text-[var(--ink)]">{text("Mỗi lần luyện, một bước tiến.", "One practice session further.")}</h1><p className="mt-3 text-sm text-[var(--muted)]">{result.answered}/{questions.length} {text("câu đã trả lời", "questions answered")} · {text("Đã dùng", "Time used")} {formatTime(attempt.minutes * 60 - remaining)}</p></div><div className="text-5xl font-semibold tracking-tight text-[var(--brand)]">{result.score.toFixed(1)}<span className="text-base font-normal text-[var(--muted)]"> / 10</span></div></div><div className="mt-6 h-2 overflow-hidden rounded-full bg-[var(--surface-subtle)]"><div className="h-full rounded-full bg-[var(--brand)]" style={{ width: `${result.score * 10}%` }} /></div><div className="mt-5 grid grid-cols-3 gap-3">{result.sections.map((section) => <div key={section.type}><p className="text-sm font-semibold text-[var(--ink)]">{section.rawScore.toFixed(2)} / {section.maxScore.toFixed(2)}</p><p className="mt-1 text-xs text-[var(--muted)]">{typeName(section.type)}</p></div>)}</div><p className="mt-4 text-xs text-[var(--muted)]">{text("Điểm từng phần là điểm gốc. Tổng điểm được quy đổi về thang 10.", "Section scores are raw points. The total is normalized to ten points.")}</p></section>
            {storageError && <p role="alert" className="text-sm text-amber-700 dark:text-amber-300">{text("Trình duyệt chưa lưu được lịch sử. Kết quả vẫn hiển thị bên dưới.", "This browser could not save the history. Your results are still shown below.")}</p>}
            <div className="flex flex-wrap gap-3"><button onClick={() => startExam(attempt.chapter, attempt.grade)} className="inline-flex items-center gap-2 rounded-xl bg-[var(--brand)] px-5 py-3 text-sm font-semibold text-[var(--on-brand)]"><RotateCcw size={16} />{text("Luyện lại", "Try again")}</button><Link href={`/tutor?grade=${attempt.grade}${attemptTopic ? `&topic=${encodeURIComponent(attemptTopic.id)}` : ""}`} className="inline-flex items-center gap-2 rounded-xl border border-[var(--line)] bg-[var(--surface)] px-5 py-3 text-sm font-medium text-[var(--ink)]">{text("Hỏi gia sư AI", "Ask your AI tutor")}<ArrowRight size={16} /></Link></div>
            <section><h2 className="mb-4 text-lg font-semibold text-[var(--ink)]">{text("Xem lại và hiểu cách giải", "Review your answers")}</h2><div className="space-y-3">{questions.map((question, questionIndex) => { const score = scoreQuestion(question, answers); return <details key={question.id} className={cn(panel, "group p-4 md:p-5")}><summary className="flex cursor-pointer list-none items-center gap-3"><span className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-full", score.correct ? "bg-[var(--brand-soft)] text-[var(--brand)]" : "bg-orange-500/10 text-orange-700 dark:text-orange-300")}>{score.correct ? <Check size={16} /> : <X size={16} />}</span><div className="min-w-0 flex-1"><p className="text-sm font-semibold text-[var(--ink)]">{text("Câu", "Question")} {questionIndex + 1} <span className="font-normal text-[var(--muted)]">· {typeName(question.type)}</span></p><p className="mt-1 text-xs text-[var(--muted)]">{question.type === "tf" ? `${score.correctStatements}/${question.statements.length} ${text("ý đúng", "correct statements")}` : `${text("Bạn trả lời", "Your answer")}: ${question.type === "mcq" ? answers.mcq[question.id] || "—" : answers.short[question.id] || "—"} · ${text("Đáp án", "Answer")}: ${question.correctAnswer}`}</p></div><span className="text-xs font-medium text-[var(--muted)]">{score.rawScore}{text("đ", " pt")}</span><ChevronDown size={16} className="text-[var(--muted)] transition-transform group-open:rotate-180" /></summary><div className="mt-4 space-y-4 border-t border-[var(--line)] pt-4"><MathRenderer content={question.text} className="text-sm leading-7 text-[var(--ink)]" />{question.type === "mcq" && <div className="grid gap-2 sm:grid-cols-2">{question.options.map((option) => <div key={option.key} className={cn("flex gap-2 rounded-lg px-3 py-2 text-sm", option.key === question.correctAnswer ? "bg-[var(--brand-soft)] text-[var(--brand)]" : "text-[var(--muted)]")}><span className="font-semibold">{option.key}.</span><MathRenderer content={option.text} /></div>)}</div>}{question.type === "tf" && <div className="space-y-3">{question.statements.map((statement) => <div key={statement.key} className="rounded-xl bg-[var(--surface-subtle)] p-3"><MathRenderer content={`${statement.key}) ${statement.text}`} className="text-sm text-[var(--ink)]" /><p className="mt-2 text-xs text-[var(--muted)]">{text("Bạn chọn", "Your choice")}: {typeof answers.tf[question.id]?.[statement.key] === "boolean" ? answers.tf[question.id][statement.key] ? text("Đúng", "True") : text("Sai", "False") : "—"} · {text("Đáp án", "Answer")}: {statement.correct ? text("Đúng", "True") : text("Sai", "False")}</p></div>)}</div>}<div className="rounded-xl bg-[var(--brand-soft)] p-4"><p className="mb-2 text-xs font-semibold text-[var(--brand)]">{text("GIẢI THÍCH", "EXPLANATION")}</p><MathRenderer content={question.explanation} className="text-sm leading-7 text-[var(--ink)]" /></div></div></details>; })}</div></section>
        </div>
    );

    return (
        <div className="mx-auto max-w-6xl space-y-5 p-5 md:p-8 lg:p-10">
            <header className="flex flex-wrap items-center justify-between gap-4"><div><p className="text-xs font-semibold uppercase tracking-widest text-[var(--brand)]">{text("ĐANG LUYỆN TẬP", "PRACTICE IN PROGRESS")} · {text("LỚP", "GRADE")} {attempt.grade}</p><h1 className="mt-2 text-2xl font-semibold tracking-tight text-[var(--ink)]">{attemptTopic ? en ? attemptTopic.titleEn : attemptTopic.title : text("Ôn tập tổng hợp", "Mixed practice")}</h1></div><div role="timer" aria-label={text("Thời gian còn lại", "Time remaining")} className={cn("flex items-center gap-2 rounded-xl border px-4 py-3 font-mono text-lg font-semibold", remaining < 60 ? "border-red-400/30 bg-red-500/10 text-red-600 dark:text-red-300" : "border-[var(--line)] bg-[var(--surface)] text-[var(--ink)]")}><Clock3 size={19} />{formatTime(remaining)}</div></header>
            {grade !== attempt.grade && <p className="rounded-xl bg-[var(--brand-soft)] px-4 py-3 text-sm text-[var(--brand)]">{text(`Bạn đang làm bài lớp ${attempt.grade}. Lựa chọn lớp ${grade} sẽ áp dụng cho bài luyện tiếp theo.`, `This is a grade ${attempt.grade} attempt. Grade ${grade} will apply to your next practice set.`)}</p>}
            <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_260px]">
                <section className={cn(panel, "p-5 md:p-7")}><div className="mb-6 flex flex-wrap items-center justify-between gap-3"><p className="text-xs font-semibold text-[var(--muted)]">{text("CÂU", "QUESTION")} {index + 1} / {questions.length} <span className="ml-2 rounded-md bg-[var(--surface-subtle)] px-2 py-1 font-normal">{typeName(current.type)}</span></p><button aria-pressed={flagged.has(current.id)} onClick={() => setFlagged((previous) => { const next = new Set(previous); if (next.has(current.id)) next.delete(current.id); else next.add(current.id); return next; })} className={cn("inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs", flagged.has(current.id) ? "bg-amber-500/10 text-amber-700 dark:text-amber-300" : "text-[var(--muted)] hover:bg-[var(--surface-subtle)]")}><Flag size={14} />{flagged.has(current.id) ? text("Đã đánh dấu", "Flagged") : text("Xem lại sau", "Flag for review")}</button></div>
                    <MathRenderer content={current.text} className="mb-7 text-base leading-8 text-[var(--ink)]" />
                    {current.type === "mcq" && <div className="space-y-3" role="group" aria-label={text("Các lựa chọn", "Answer options")}>{current.options.map((option) => { const selected = answers.mcq[current.id] === option.key; return <button key={option.key} aria-pressed={selected} onClick={() => setAnswers((previous) => ({ ...previous, mcq: { ...previous.mcq, [current.id]: option.key } }))} className={cn("flex w-full items-center gap-3 rounded-xl border p-4 text-left transition-colors", selected ? "border-[var(--brand)] bg-[var(--brand-soft)] text-[var(--ink)]" : "border-[var(--line)] text-[var(--ink)] hover:bg-[var(--surface-subtle)]")}><span className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-sm font-semibold", selected ? "bg-[var(--brand)] text-[var(--on-brand)]" : "bg-[var(--surface-subtle)] text-[var(--muted)]")}>{option.key}</span><MathRenderer content={option.text} className="text-sm leading-6" />{selected && <Check size={16} className="ml-auto shrink-0 text-[var(--brand)]" />}</button>; })}</div>}
                    {current.type === "tf" && <div className="space-y-3">{current.statements.map((statement) => <div key={statement.key} className="rounded-xl border border-[var(--line)] p-4"><div className="flex gap-2"><span className="text-sm font-semibold text-[var(--muted)]">{statement.key})</span><MathRenderer content={statement.text} className="text-sm leading-6 text-[var(--ink)]" /></div><div className="mt-3 flex gap-2">{[true, false].map((value) => <button key={String(value)} aria-label={`${statement.key}: ${value ? text("Đúng", "True") : text("Sai", "False")}`} aria-pressed={answers.tf[current.id]?.[statement.key] === value} onClick={() => setAnswers((previous) => ({ ...previous, tf: { ...previous.tf, [current.id]: { ...previous.tf[current.id], [statement.key]: value } } }))} className={cn("rounded-lg border px-4 py-2 text-xs font-medium", answers.tf[current.id]?.[statement.key] === value ? "border-[var(--brand)] bg-[var(--brand-soft)] text-[var(--brand)]" : "border-[var(--line)] text-[var(--muted)] hover:bg-[var(--surface-subtle)]")}>{value ? text("Đúng", "True") : text("Sai", "False")}</button>)}</div></div>)}</div>}
                    {current.type === "short" && <div className="rounded-xl bg-[var(--surface-subtle)] p-5"><label htmlFor="numeric-answer" className="mb-3 block text-sm font-medium text-[var(--ink)]">{text("Nhập kết quả bằng số", "Enter a numerical answer")}</label><input id="numeric-answer" type="text" inputMode="decimal" autoComplete="off" value={answers.short[current.id] ?? ""} onChange={(event) => setAnswers((previous) => ({ ...previous, short: { ...previous.short, [current.id]: event.target.value } }))} placeholder={text("Ví dụ: 3,14", "Example: 3.14")} className="w-full max-w-xs rounded-xl border border-[var(--line)] bg-[var(--surface)] px-4 py-3 font-mono text-xl text-[var(--ink)]" /><p className="mt-2 text-xs text-[var(--muted)]">{text("Dùng dấu phẩy hoặc dấu chấm cho phần thập phân.", "A comma or point can be used as the decimal separator.")}</p></div>}
                    <div className="mt-8 flex items-center justify-between border-t border-[var(--line)] pt-5"><button onClick={() => setIndex(index - 1)} disabled={index === 0} className="inline-flex items-center gap-2 rounded-lg px-2 py-2 text-sm text-[var(--muted)] disabled:opacity-30"><ArrowLeft size={16} />{text("Câu trước", "Previous")}</button>{index < questions.length - 1 ? <button onClick={() => setIndex(index + 1)} className="inline-flex items-center gap-2 rounded-xl bg-[var(--brand)] px-5 py-2.5 text-sm font-semibold text-[var(--on-brand)]">{text("Câu tiếp", "Next")}<ArrowRight size={16} /></button> : <button onClick={() => setConfirmSubmit(true)} className="inline-flex items-center gap-2 rounded-xl bg-[var(--brand)] px-5 py-2.5 text-sm font-semibold text-[var(--on-brand)]">{text("Hoàn thành", "Finish")}<CheckCircle2 size={16} /></button>}</div>
                </section>
                <aside className={cn(panel, "p-5 lg:sticky lg:top-5")}><div className="flex justify-between text-sm"><h2 className="font-semibold text-[var(--ink)]">{text("Tiến độ bài làm", "Your answers")}</h2><span className="text-[var(--muted)]">{result.answered}/{questions.length}</span></div><div className="my-4 h-1.5 overflow-hidden rounded-full bg-[var(--surface-subtle)]"><div className="h-full rounded-full bg-[var(--brand)]" style={{ width: `${result.answered / questions.length * 100}%` }} /></div><div className="space-y-4">{(["mcq", "tf", "short"] as const).map((type) => <div key={type}><p className="mb-2 text-xs text-[var(--muted)]">{typeName(type)}</p><div className="flex flex-wrap gap-2">{questions.map((question, questionIndex) => question.type === type && <button key={question.id} aria-label={`${text("Câu", "Question")} ${questionIndex + 1}${flagged.has(question.id) ? `, ${text("đã đánh dấu", "flagged")}` : ""}`} aria-current={questionIndex === index ? "step" : undefined} onClick={() => setIndex(questionIndex)} className={cn("relative flex h-9 w-9 items-center justify-center rounded-lg border text-xs font-medium", questionIndex === index ? "border-[var(--brand)] bg-[var(--brand)] text-[var(--on-brand)]" : isQuestionAnswered(question, answers) ? "border-[var(--line)] bg-[var(--brand-soft)] text-[var(--brand)]" : "border-[var(--line)] text-[var(--muted)] hover:bg-[var(--surface-subtle)]")}>{questionIndex + 1}{flagged.has(question.id) && <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full border-2 border-[var(--surface)] bg-amber-500" />}</button>)}</div></div>)}</div><p className="mt-5 flex items-center gap-1.5 text-xs text-[var(--muted)]"><span className="h-2 w-2 rounded-full bg-amber-500" />{flagged.size} {text("câu cần xem lại", "flagged for review")}</p><button onClick={() => setConfirmSubmit(true)} className="mt-5 w-full rounded-xl border border-[var(--line)] px-4 py-3 text-sm font-semibold text-[var(--ink)] hover:bg-[var(--surface-subtle)]">{text("Nộp bài", "Submit answers")}</button>{confirmSubmit && <div role="alert" className="mt-3 rounded-xl bg-[var(--surface-subtle)] p-3"><p className="text-xs leading-5 text-[var(--ink)]">{text(`Đã trả lời ${result.answered}/${questions.length} câu; đánh dấu ${flagged.size} câu. Nộp bài để xem kết quả?`, `${result.answered}/${questions.length} answered; ${flagged.size} flagged. Submit to see your results?`)}</p><button onClick={submitExam} className="mt-3 w-full rounded-lg bg-[var(--brand)] py-2 text-xs font-semibold text-[var(--on-brand)]">{text("Xác nhận nộp bài", "Confirm submission")}</button><button onClick={() => setConfirmSubmit(false)} className="mt-2 w-full py-1 text-xs text-[var(--muted)]">{text("Tiếp tục làm bài", "Keep practising")}</button></div>}</aside>
            </div>
        </div>
    );
}
