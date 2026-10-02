"use client";

import { useMemo, useRef, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, BookOpen, Check, ChevronDown, Download, Eye, FileText, FolderOpen, Grid2X2, List, Plus, Search, Trash2, Upload, X } from "lucide-react";
import { MathRenderer } from "@/components/MathRenderer";
import { useLanguageStore } from "@/lib/store/language";
import { useGradeStore } from "@/lib/store/grade";
import { CURRICULUM_SOURCES, getGradeCurriculum, type Grade } from "@/lib/data/curriculum";
import { cn } from "@/lib/utils";

interface Resource {
    id: string;
    title: string;
    description?: string;
    fileType: string;
    fileSize: number;
    category: string;
    tags: string[];
    createdAt: string;
    dataUrl?: string;
    grade?: Grade;
}
type UploadFile = { name: string; size: number; dataUrl: string };
const STORAGE_KEY = "f-physics-library";
const STORAGE_EVENT = "f-physics-library-updated";
const categories = ["Đề thi", "Tóm tắt", "Bài tập", "Ghi chú", "Sơ đồ"];
const englishCategories: Record<string, string> = { "Đề thi": "Exam papers", "Tóm tắt": "Summaries", "Bài tập": "Exercises", "Ghi chú": "Notes", "Sơ đồ": "Diagrams" };
const panel = "rounded-2xl border border-[var(--line)] bg-[var(--surface)]";
const inputStyle = "w-full rounded-xl border border-[var(--line)] bg-[var(--surface)] px-3.5 py-3 text-sm text-[var(--ink)] placeholder:text-[var(--muted)]";

function subscribeResources(callback: () => void) {
    window.addEventListener("storage", callback); window.addEventListener(STORAGE_EVENT, callback);
    return () => { window.removeEventListener("storage", callback); window.removeEventListener(STORAGE_EVENT, callback); };
}
function resourceSnapshot() { try { return localStorage.getItem(STORAGE_KEY) ?? ""; } catch { return ""; } }
function parseResources(raw: string): Resource[] {
    try {
        const value = JSON.parse(raw || "[]");
        if (!Array.isArray(value)) return [];
        return value.filter((item) => item && typeof item.id === "string" && typeof item.title === "string" && typeof item.fileType === "string").map((item) => ({ ...item, tags: Array.isArray(item.tags) ? item.tags.filter((tag: unknown) => typeof tag === "string") : [], fileSize: Number(item.fileSize) || 0 }));
    } catch { return []; }
}
function saveResources(resources: Resource[]) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(resources));
    window.dispatchEvent(new Event(STORAGE_EVENT));
}
function formatSize(bytes: number) { return bytes < 1024 ? `${bytes} B` : bytes < 1048576 ? `${(bytes / 1024).toFixed(1)} KB` : `${(bytes / 1048576).toFixed(1)} MB`; }
function normalize(value: string) { return value.toLocaleLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/đ/g, "d"); }
function previewText(resource: Resource) {
    try {
        const payload = resource.dataUrl?.split(",")[1] ?? "";
        const bytes = Uint8Array.from(atob(payload), (character) => character.charCodeAt(0));
        return new TextDecoder().decode(bytes).slice(0, 200_000);
    } catch { return ""; }
}

export default function LibraryPage() {
    const grade = useGradeStore((state) => state.grade);
    const en = useLanguageStore((state) => state.locale) === "en";
    const text = (vi: string, english: string) => en ? english : vi;
    const curriculum = getGradeCurriculum(grade);
    const [tab, setTab] = useState<"curriculum" | "resources">("curriculum");
    const [search, setSearch] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("all");
    const [resourceGrade, setResourceGrade] = useState("all");
    const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
    const [notice, setNotice] = useState("");
    const [error, setError] = useState("");
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [preview, setPreview] = useState<Resource | null>(null);
    const uploadDialog = useRef<HTMLDialogElement>(null);
    const previewDialog = useRef<HTMLDialogElement>(null);
    const fileInput = useRef<HTMLInputElement>(null);
    const readerRef = useRef<FileReader | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [reading, setReading] = useState(false);
    const [uploadFile, setUploadFile] = useState<UploadFile | null>(null);
    const [uploadTitle, setUploadTitle] = useState("");
    const [uploadCategory, setUploadCategory] = useState("Ghi chú");
    const [uploadGrade, setUploadGrade] = useState<string>(String(grade));
    const [uploadTags, setUploadTags] = useState("");
    const [uploadError, setUploadError] = useState("");
    const raw = useSyncExternalStore(subscribeResources, resourceSnapshot, () => "");
    const resources = useMemo(() => parseResources(raw), [raw]);
    const query = normalize(search.trim());
    const topics = curriculum.topics.filter((topic) => normalize([topic.title, topic.titleEn, topic.summary, topic.summaryEn, ...topic.lessons, ...topic.lessonsEn].join(" ")).includes(query));
    const filtered = resources.filter((resource) => (selectedCategory === "all" || resource.category === selectedCategory) && (resourceGrade === "all" || String(resource.grade ?? "unassigned") === resourceGrade) && normalize([resource.title, ...resource.tags].join(" ")).includes(query));
    const categoryLabel = (category: string) => en ? englishCategories[category] ?? category : category;

    const openUpload = () => {
        readerRef.current?.abort(); setReading(false); setUploadFile(null); setUploadTitle(""); setUploadTags(""); setUploadCategory("Ghi chú"); setUploadGrade(String(grade)); setUploadError("");
        uploadDialog.current?.showModal();
    };
    const chooseFile = (files: FileList | null) => {
        if (!files?.length) return;
        const file = files[0];
        const extension = file.name.split(".").pop()?.toLowerCase() ?? "";
        readerRef.current?.abort(); setUploadError(""); setUploadFile(null); setReading(false);
        if (!["pdf", "doc", "docx", "txt", "png", "jpg", "jpeg", "xlsx", "csv"].includes(extension)) { setUploadError(text("Định dạng này chưa được hỗ trợ.", "This file format is not supported.")); return; }
        if (file.size > 10 * 1024 * 1024) { setUploadError(text("Tệp quá lớn. Hãy chọn tệp tối đa 10 MB.", "Choose a file smaller than 10 MB.")); return; }
        setReading(true);
        const reader = new FileReader(); readerRef.current = reader;
        reader.onload = () => { setUploadFile({ name: file.name, size: file.size, dataUrl: String(reader.result) }); setUploadTitle((previous) => previous || file.name.replace(/\.[^.]+$/, "")); setReading(false); };
        reader.onerror = () => { setReading(false); setUploadError(text("Không đọc được tệp. Hãy thử chọn lại.", "The file could not be read. Please select it again.")); };
        reader.readAsDataURL(file);
    };
    const submitUpload = () => {
        if (!uploadFile || !uploadTitle.trim()) return;
        const resource: Resource = { id: crypto.randomUUID(), title: uploadTitle.trim(), fileType: uploadFile.name.split(".").pop()?.toLowerCase() ?? "file", fileSize: uploadFile.size, category: uploadCategory, tags: [...new Set(uploadTags.split(",").map((tag) => tag.trim()).filter(Boolean))], createdAt: new Date().toISOString(), dataUrl: uploadFile.dataUrl, ...(uploadGrade !== "all" ? { grade: Number(uploadGrade) as Grade } : {}) };
        try {
            saveResources([resource, ...parseResources(resourceSnapshot())]);
            uploadDialog.current?.close(); setTab("resources"); setSearch(""); setSelectedCategory("all"); setResourceGrade("all"); setError(""); setNotice(text("Đã lưu tài liệu trên trình duyệt này.", "Resource saved in this browser."));
        } catch { setUploadError(text("Không lưu được tệp: bộ nhớ trình duyệt có thể đã đầy hoặc bị tắt. Thử tệp nhỏ hơn hoặc tải xuống và xóa bớt tài liệu cũ.", "Could not save: browser storage may be full or disabled. Try a smaller file or download and remove older resources.")); }
    };
    const removeResource = (id: string) => {
        try { saveResources(parseResources(resourceSnapshot()).filter((resource) => resource.id !== id)); setDeleteId(null); setError(""); setNotice(text("Đã xóa tài liệu.", "Resource removed.")); }
        catch { setError(text("Không thể cập nhật bộ nhớ trình duyệt. Tài liệu chưa bị xóa.", "Browser storage could not be updated. The resource was not removed.")); }
    };
    const download = (resource: Resource) => {
        if (!resource.dataUrl) return;
        const anchor = document.createElement("a"); anchor.href = resource.dataUrl; anchor.download = `${resource.title}.${resource.fileType}`; anchor.click();
    };
    const showPreview = (resource: Resource) => { setPreview(resource); previewDialog.current?.showModal(); };

    return (
        <div className="mx-auto max-w-7xl space-y-7 p-5 md:p-8 lg:p-10">
            <header className="flex flex-wrap items-start justify-between gap-5"><div><p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--brand)]">{text("THƯ VIỆN", "LIBRARY")} / {text("LỚP", "GRADE")} {grade}</p><h1 className="text-3xl font-semibold tracking-tight text-[var(--ink)] md:text-4xl">{text("Một nơi cho mọi điều cần học.", "Your space for everything physics.")}</h1><p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--muted)]">{text("Khám phá kiến thức theo chủ đề và giữ những tài liệu hữu ích ở ngay bên cạnh.", "Explore the curriculum by topic and keep your useful resources close at hand.")}</p></div><button onClick={openUpload} className="inline-flex items-center gap-2 rounded-xl border border-[var(--line)] bg-[var(--surface)] px-4 py-3 text-sm font-semibold text-[var(--ink)] hover:bg-[var(--surface-subtle)]"><Plus size={17} />{text("Thêm tài liệu", "Add resource")}</button></header>
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[var(--line)]"><div className="flex gap-5" role="tablist" aria-label={text("Nội dung thư viện", "Library content")}>{([{ id: "curriculum", label: text("Chương trình học", "Curriculum") }, { id: "resources", label: `${text("Tài liệu của tôi", "My resources")} (${resources.length})` }] as const).map((item) => <button key={item.id} role="tab" id={`${item.id}-tab`} aria-controls={`${item.id}-panel`} aria-selected={tab === item.id} onClick={() => { setTab(item.id); setSearch(""); }} className={cn("border-b-2 pb-4 text-sm font-semibold transition-colors", tab === item.id ? "border-[var(--brand)] text-[var(--brand)]" : "border-transparent text-[var(--muted)] hover:text-[var(--ink)]")}>{item.label}</button>)}</div><p className="mb-4 text-xs text-[var(--muted)]">{tab === "curriculum" ? text("Chương trình GDPT 2018", "2018 national curriculum") : text("Lưu riêng trên trình duyệt này", "Stored in this browser")}</p></div>
            <div className="flex flex-wrap gap-3"><div className="relative min-w-0 flex-1 md:max-w-md"><Search size={17} className="pointer-events-none absolute left-3.5 top-3.5 text-[var(--muted)]" /><input aria-label={text("Tìm kiếm trong thư viện", "Search library")} value={search} onChange={(event) => setSearch(event.target.value)} className={cn(inputStyle, "pl-10")} placeholder={tab === "curriculum" ? text("Tìm chủ đề, bài học…", "Search topics and lessons…") : text("Tìm tên tài liệu hoặc thẻ…", "Search titles or tags…")} /></div>{tab === "resources" && <><select aria-label={text("Lọc theo lớp", "Filter by grade")} value={resourceGrade} onChange={(event) => setResourceGrade(event.target.value)} className={cn(inputStyle, "w-auto")}><option value="all">{text("Tất cả các lớp", "All grades")}</option>{[10, 11, 12].map((value) => <option key={value} value={value}>{text("Lớp", "Grade")} {value}</option>)}<option value="unassigned">{text("Chưa phân lớp", "Unassigned")}</option></select><div className="ml-auto flex gap-1 rounded-xl border border-[var(--line)] bg-[var(--surface)] p-1">{(["grid", "list"] as const).map((mode) => <button key={mode} onClick={() => setViewMode(mode)} aria-pressed={viewMode === mode} aria-label={mode === "grid" ? text("Hiển thị dạng lưới", "Grid view") : text("Hiển thị danh sách", "List view")} className={cn("rounded-lg p-2", viewMode === mode ? "bg-[var(--brand-soft)] text-[var(--brand)]" : "text-[var(--muted)]")}>{mode === "grid" ? <Grid2X2 size={17} /> : <List size={17} />}</button>)}</div></>}</div>

            {tab === "curriculum" ? <section role="tabpanel" id="curriculum-panel" aria-labelledby="curriculum-tab" className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_270px]">
                <div className="space-y-4"><div className="mb-5"><h2 className="text-xl font-semibold tracking-tight text-[var(--ink)]">{en ? curriculum.titleEn : curriculum.title}</h2><p className="mt-2 text-sm leading-6 text-[var(--muted)]">{en ? curriculum.descriptionEn : curriculum.description}</p></div>{topics.length === 0 ? <div className={cn(panel, "p-8 text-center text-sm text-[var(--muted)]")}>{text("Không tìm thấy chủ đề phù hợp. Thử từ khóa khác.", "No matching topics. Try a different search.")}</div> : topics.map((topic) => <article key={topic.id} className={cn(panel, "p-5 md:p-6")}><div className="flex gap-4"><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--brand-soft)] text-sm font-semibold tabular-nums text-[var(--brand)]">{String(curriculum.topics.indexOf(topic) + 1).padStart(2, "0")}</span><div className="min-w-0 flex-1"><h3 className="text-lg font-semibold tracking-tight text-[var(--ink)]">{en ? topic.titleEn : topic.title}</h3><p className="mt-2 text-sm leading-6 text-[var(--muted)]">{en ? topic.summaryEn : topic.summary}</p></div></div><details className="group mt-5 rounded-xl bg-[var(--surface-subtle)]"><summary className="flex cursor-pointer list-none items-center justify-between gap-3 p-4 text-sm font-medium text-[var(--ink)]"><span>{topic.lessons.length} {text("nội dung trọng tâm", "learning areas")} · {text("Công thức cần nhớ", "Key formulas")}</span><ChevronDown size={16} className="shrink-0 text-[var(--muted)] transition-transform group-open:rotate-180" /></summary><div className="space-y-5 px-4 pb-5"><ul className="grid gap-2 sm:grid-cols-2">{(en ? topic.lessonsEn : topic.lessons).map((lesson) => <li key={lesson} className="flex items-start gap-2 text-sm leading-6 text-[var(--ink)]"><span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--brand)]" />{lesson}</li>)}</ul><div className="space-y-2 border-t border-[var(--line)] pt-4">{topic.formulas.map((formula) => <MathRenderer key={formula} content={formula} className="overflow-x-auto text-sm leading-7 text-[var(--ink)]" />)}</div></div></details><div className="mt-5 flex flex-wrap gap-3"><Link href={`/tutor?grade=${grade}&topic=${encodeURIComponent(topic.id)}`} className="inline-flex items-center gap-2 rounded-lg bg-[var(--brand)] px-4 py-2.5 text-xs font-semibold text-[var(--on-brand)]">{text("Học cùng gia sư AI", "Learn with AI tutor")}<ArrowRight size={14} /></Link><Link href={`/practice?grade=${grade}&topic=${encodeURIComponent(topic.id)}`} className="inline-flex items-center gap-2 rounded-lg border border-[var(--line)] px-4 py-2.5 text-xs font-semibold text-[var(--ink)] hover:bg-[var(--surface-subtle)]">{text("Luyện chủ đề này", "Practise this topic")}</Link></div></article>)}</div>
                <aside className="space-y-5 xl:sticky xl:top-5"><div className={cn(panel, "p-5")}><BookOpen size={22} className="mb-4 text-[var(--brand)]" /><p className="text-xs font-semibold uppercase tracking-widest text-[var(--muted)]">{text("LỘ TRÌNH LỚP", "GRADE")} {grade}</p><p className="mt-2 text-3xl font-semibold tracking-tight text-[var(--ink)]">{curriculum.topics.length} <span className="text-base font-normal text-[var(--muted)]">{text("chủ đề", "topics")}</span></p><p className="mt-3 text-xs leading-6 text-[var(--muted)]">{text("Nội dung được nhóm theo mạch kiến thức của chương trình, không theo thứ tự chương của một bộ sách cụ thể.", "Topics follow curriculum learning strands. Textbooks may arrange their chapters differently.")}</p></div><section className="rounded-2xl border border-[var(--line)] p-5"><h2 className="text-sm font-semibold text-[var(--ink)]">{text("Chuyên đề học tập", "Specialist topics")}</h2><p className="mt-2 text-xs leading-5 text-[var(--muted)]">{text("Các hướng học sâu hơn trong chương trình.", "Areas for further study in the curriculum.")}</p><ul className="mt-4 space-y-3">{(en ? curriculum.specialistTopicsEn : curriculum.specialistTopics).map((item) => <li key={item} className="flex gap-2 text-xs leading-5 text-[var(--ink)]"><span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-[var(--brand)]" />{item}</li>)}</ul></section><div className="px-1"><p className="mb-2 text-xs font-semibold text-[var(--muted)]">{text("Nguồn chương trình", "Curriculum references")}</p>{CURRICULUM_SOURCES.map((source) => <a key={source.url} href={source.url} target="_blank" rel="noopener noreferrer" className="mb-2 block text-xs leading-5 text-[var(--brand)] underline decoration-[var(--line)] underline-offset-4 hover:decoration-current">{source.title}</a>)}</div></aside>
            </section> : <section role="tabpanel" id="resources-panel" aria-labelledby="resources-tab" className="space-y-5">
                <div className="flex flex-wrap gap-2">{["all", ...categories].map((category) => <button key={category} aria-pressed={selectedCategory === category} onClick={() => setSelectedCategory(category)} className={cn("rounded-lg border px-3 py-2 text-xs font-medium", selectedCategory === category ? "border-[var(--brand)] bg-[var(--brand-soft)] text-[var(--brand)]" : "border-[var(--line)] text-[var(--muted)] hover:bg-[var(--surface)]")}>{category === "all" ? text("Tất cả", "All resources") : categoryLabel(category)}</button>)}</div>
                {notice && <p role="status" className="flex items-center gap-2 text-sm text-[var(--brand)]"><Check size={16} />{notice}</p>}{error && <p role="alert" className="text-sm text-red-600 dark:text-red-300">{error}</p>}
                {!filtered.length ? <div className={cn(panel, "px-6 py-14 text-center")}><FolderOpen size={38} className="mx-auto mb-4 text-[var(--muted)]" /><h2 className="text-lg font-semibold text-[var(--ink)]">{resources.length ? text("Chưa có tài liệu phù hợp", "No matching resources") : text("Góc học tập riêng của bạn", "Your own learning collection")}</h2><p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[var(--muted)]">{resources.length ? text("Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm.", "Try changing the filters or your search terms.") : text("Lưu đề luyện, ghi chú và sơ đồ của bạn. Tài liệu được giữ trên trình duyệt đang dùng.", "Add practice papers, notes and diagrams. Files stay in the browser you use to upload them.")}</p>{!resources.length && <button onClick={openUpload} className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[var(--brand)] px-5 py-3 text-sm font-semibold text-[var(--on-brand)]"><Plus size={16} />{text("Thêm tài liệu đầu tiên", "Add your first resource")}</button>}</div> : <div className={viewMode === "grid" ? "grid gap-4 sm:grid-cols-2 xl:grid-cols-3" : "space-y-3"}>{filtered.map((resource) => <article key={resource.id} className={cn(panel, "p-5", viewMode === "list" && "flex flex-wrap items-center gap-4")}><div className={cn("flex min-w-0 gap-3", viewMode === "grid" ? "mb-5" : "flex-1")}><span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[var(--surface-subtle)] text-[var(--brand)]"><FileText size={21} /></span><div className="min-w-0"><button onClick={() => showPreview(resource)} className="block max-w-full truncate text-left text-sm font-semibold text-[var(--ink)] hover:text-[var(--brand)]" title={resource.title}>{resource.title}</button><p className="mt-1 text-xs text-[var(--muted)]">{categoryLabel(resource.category)} · {resource.fileType.toUpperCase()} · {formatSize(resource.fileSize)}</p></div></div><div className={cn("flex flex-wrap gap-1.5", viewMode === "grid" && "mb-4")}><span className="rounded-md bg-[var(--brand-soft)] px-2 py-1 text-[10px] font-medium text-[var(--brand)]">{resource.grade ? `${text("Lớp", "Grade")} ${resource.grade}` : text("Chưa phân lớp", "Unassigned")}</span>{resource.tags.slice(0, 3).map((tag) => <span key={tag} className="rounded-md bg-[var(--surface-subtle)] px-2 py-1 text-[10px] text-[var(--muted)]">{tag}</span>)}</div><div className={cn("flex items-center justify-between gap-3", viewMode === "grid" && "border-t border-[var(--line)] pt-3")}><span className="text-[11px] text-[var(--muted)]">{new Date(resource.createdAt).toLocaleDateString(en ? "en-GB" : "vi-VN")}</span><div className="flex gap-1"><button aria-label={`${text("Xem", "Preview")} ${resource.title}`} onClick={() => showPreview(resource)} className="rounded-lg p-2 text-[var(--muted)] hover:bg-[var(--brand-soft)] hover:text-[var(--brand)]"><Eye size={16} /></button><button aria-label={`${text("Tải xuống", "Download")} ${resource.title}`} disabled={!resource.dataUrl} onClick={() => download(resource)} className="rounded-lg p-2 text-[var(--muted)] hover:bg-[var(--brand-soft)] hover:text-[var(--brand)] disabled:opacity-30"><Download size={16} /></button><button aria-label={`${text("Xóa", "Remove")} ${resource.title}`} onClick={() => setDeleteId(deleteId === resource.id ? null : resource.id)} className="rounded-lg p-2 text-[var(--muted)] hover:bg-red-500/10 hover:text-red-600"><Trash2 size={16} /></button></div></div>{deleteId === resource.id && <div className="mt-3 w-full rounded-xl bg-red-500/5 p-3"><p className="text-xs text-[var(--ink)]">{text("Xóa tài liệu khỏi trình duyệt này?", "Remove this resource from the browser?")}</p><div className="mt-2 flex gap-4"><button onClick={() => removeResource(resource.id)} className="text-xs font-semibold text-red-600 dark:text-red-300">{text("Xóa tài liệu", "Remove resource")}</button><button onClick={() => setDeleteId(null)} className="text-xs text-[var(--muted)]">{text("Hủy", "Cancel")}</button></div></div>}</article>)}</div>}
            </section>}

            <dialog ref={uploadDialog} aria-labelledby="upload-title" className="m-auto max-h-[90dvh] w-[calc(100%-2rem)] max-w-lg overflow-y-auto rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-0 text-[var(--ink)] shadow-2xl backdrop:bg-black/40"><form onSubmit={(event) => { event.preventDefault(); submitUpload(); }} className="p-6"><div className="mb-5 flex items-center justify-between"><h2 id="upload-title" className="text-xl font-semibold">{text("Thêm tài liệu", "Add resource")}</h2><button type="button" aria-label={text("Đóng", "Close")} onClick={() => uploadDialog.current?.close()} className="rounded-lg p-2 text-[var(--muted)] hover:bg-[var(--surface-subtle)]"><X size={19} /></button></div><input ref={fileInput} type="file" accept=".pdf,.doc,.docx,.txt,.png,.jpg,.jpeg,.xlsx,.csv" className="hidden" onChange={(event) => { chooseFile(event.target.files); event.target.value = ""; }} /><button type="button" onClick={() => fileInput.current?.click()} onDragOver={(event) => { event.preventDefault(); setIsDragging(true); }} onDragLeave={() => setIsDragging(false)} onDrop={(event) => { event.preventDefault(); setIsDragging(false); chooseFile(event.dataTransfer.files); }} className={cn("w-full rounded-xl border-2 border-dashed p-6 text-center", isDragging ? "border-[var(--brand)] bg-[var(--brand-soft)]" : "border-[var(--line)] bg-[var(--surface-subtle)]")}><Upload size={26} className="mx-auto mb-3 text-[var(--brand)]" /><p className="break-words text-sm font-medium">{reading ? text("Đang đọc tệp…", "Reading file…") : uploadFile?.name ?? text("Kéo thả hoặc chọn tệp", "Drop a file or browse")}</p><p className="mt-2 text-xs text-[var(--muted)]">{uploadFile ? `${formatSize(uploadFile.size)} · ${text("Bấm để đổi tệp", "Click to change")}` : "PDF, DOCX, TXT, PNG, JPG, XLSX, CSV · ≤ 10 MB"}</p></button><p className="mt-2 text-xs leading-5 text-[var(--muted)]">{text("Dung lượng lưu thực tế phụ thuộc bộ nhớ trống của trình duyệt.", "Available space depends on your browser storage.")}</p><div className="mt-5 space-y-4"><label className="block text-sm font-medium">{text("Tên tài liệu", "Resource title")}<input required maxLength={180} value={uploadTitle} onChange={(event) => setUploadTitle(event.target.value)} className={cn(inputStyle, "mt-2")} placeholder={text("Ví dụ: Ghi chú về động lượng", "e.g. Momentum notes")} /></label><div className="grid grid-cols-2 gap-3"><label className="block text-sm font-medium">{text("Thể loại", "Category")}<select value={uploadCategory} onChange={(event) => setUploadCategory(event.target.value)} className={cn(inputStyle, "mt-2")}>{categories.map((category) => <option key={category} value={category}>{categoryLabel(category)}</option>)}</select></label><label className="block text-sm font-medium">{text("Lớp", "Grade")}<select value={uploadGrade} onChange={(event) => setUploadGrade(event.target.value)} className={cn(inputStyle, "mt-2")}><option value="all">{text("Chưa phân lớp", "Unassigned")}</option>{[10, 11, 12].map((value) => <option key={value} value={value}>{text("Lớp", "Grade")} {value}</option>)}</select></label></div><label className="block text-sm font-medium">{text("Thẻ (tùy chọn)", "Tags (optional)")}<input value={uploadTags} onChange={(event) => setUploadTags(event.target.value)} className={cn(inputStyle, "mt-2")} placeholder={text("Phân cách bằng dấu phẩy", "Separate with commas")} /></label></div>{uploadError && <p role="alert" className="mt-4 text-sm leading-6 text-red-600 dark:text-red-300">{uploadError}</p>}<div className="mt-6 flex gap-3"><button type="button" onClick={() => uploadDialog.current?.close()} className="flex-1 rounded-xl border border-[var(--line)] px-4 py-3 text-sm font-medium">{text("Hủy", "Cancel")}</button><button type="submit" disabled={!uploadFile || !uploadTitle.trim() || reading} className="flex-1 rounded-xl bg-[var(--brand)] px-4 py-3 text-sm font-semibold text-[var(--on-brand)] disabled:opacity-40">{text("Lưu tài liệu", "Save resource")}</button></div></form></dialog>
            <dialog ref={previewDialog} aria-labelledby="preview-title" className="m-auto max-h-[92dvh] w-[calc(100%-2rem)] max-w-4xl overflow-y-auto rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-0 text-[var(--ink)] shadow-2xl backdrop:bg-black/40"><div className="flex items-center justify-between gap-3 border-b border-[var(--line)] p-5"><h2 id="preview-title" className="min-w-0 truncate font-semibold">{preview?.title}</h2><div className="flex gap-2">{preview?.dataUrl && <button aria-label={text("Tải xuống tài liệu", "Download resource")} onClick={() => download(preview)} className="rounded-lg p-2 text-[var(--brand)]"><Download size={19} /></button>}<button aria-label={text("Đóng bản xem trước", "Close preview")} onClick={() => previewDialog.current?.close()} className="rounded-lg p-2 text-[var(--muted)]"><X size={19} /></button></div></div><div className="min-h-48 p-5">{preview?.dataUrl && ["png", "jpg", "jpeg"].includes(preview.fileType) && /^data:image\/(png|jpeg);base64,/.test(preview.dataUrl) ? <Image src={preview.dataUrl} alt={preview.title} unoptimized width={1200} height={900} className="mx-auto h-auto max-h-[70dvh] w-auto max-w-full object-contain" /> : preview?.dataUrl && preview.fileType === "pdf" && preview.dataUrl.startsWith("data:application/pdf;") ? <iframe title={preview.title} src={preview.dataUrl} sandbox="" className="h-[65dvh] w-full rounded-lg border border-[var(--line)]" /> : preview?.dataUrl && ["txt", "csv"].includes(preview.fileType) ? <pre className="max-h-[65dvh] overflow-auto whitespace-pre-wrap break-words rounded-xl bg-[var(--surface-subtle)] p-4 text-sm leading-6">{previewText(preview)}</pre> : <div className="py-12 text-center"><FileText size={34} className="mx-auto mb-4 text-[var(--muted)]" /><p className="text-sm text-[var(--muted)]">{text("Tải xuống để mở tài liệu này bằng ứng dụng phù hợp.", "Download this resource to open it in a compatible application.")}</p>{preview?.dataUrl && <button onClick={() => download(preview)} className="mt-5 rounded-xl bg-[var(--brand)] px-5 py-3 text-sm font-semibold text-[var(--on-brand)]">{text("Tải xuống", "Download")}</button>}</div>}</div></dialog>
        </div>
    );
}
