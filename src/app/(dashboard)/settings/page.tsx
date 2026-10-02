"use client";

import { motion } from "framer-motion";
import {
    Settings,
    User,
    Sparkles,
    Bell,
    Sun,
    Moon,
    ChevronDown,
    Save,
    CheckCircle2,
} from "lucide-react";
import { useState, useSyncExternalStore } from "react";
import { useThemeStore } from "@/lib/store/theme";
import { useLanguageStore } from "@/lib/store/language";
import { useGradeStore } from "@/lib/store/grade";
import { GradeSelector } from "@/components/GradeSelector";

const TABS = [
    { id: "general", icon: Settings, label: "Chung" },
    { id: "personalization", icon: Sparkles, label: "Cá nhân hóa AI" },
    { id: "notifications", icon: Bell, label: "Thông báo" },
    { id: "account", icon: User, label: "Tài khoản" },
];

const STYLE_OPTIONS = [
    { value: "balanced", label: "Cân bằng", desc: "Trả lời vừa chi tiết vừa ngắn gọn" },
    { value: "concise", label: "Ngắn gọn", desc: "Trả lời súc tích, đi thẳng vào vấn đề" },
    { value: "detailed", label: "Chi tiết", desc: "Giải thích kỹ lưỡng, đầy đủ từng bước" },
];

const CHARACTERISTIC_OPTIONS = ["Default", "Low", "Medium", "High"];

interface AIPreferences {
    style: string;
    warm: string;
    enthusiastic: string;
    headersLists: string;
    emoji: string;
    customInstructions: string;
    nickname: string;
}

const DEFAULT_PREFS: AIPreferences = {
    style: "balanced",
    warm: "Default",
    enthusiastic: "Default",
    headersLists: "Default",
    emoji: "Default",
    customInstructions: "",
    nickname: "",
};

function subscribeToPreferences(onChange: () => void) {
    window.addEventListener("storage", onChange);
    window.addEventListener("f-physics-ai-prefs-changed", onChange);
    return () => {
        window.removeEventListener("storage", onChange);
        window.removeEventListener("f-physics-ai-prefs-changed", onChange);
    };
}

function getPreferencesSnapshot() {
    try { return localStorage.getItem("f-physics-ai-prefs"); } catch { return null; }
}

function parsePreferences(snapshot: string | null): AIPreferences {
    try { return { ...DEFAULT_PREFS, ...JSON.parse(snapshot || "{}") }; } catch { return DEFAULT_PREFS; }
}

function SelectDropdown({ value, options, onChange }: { value: string; options: string[]; onChange: (v: string) => void }) {
    return (
        <div className="relative">
            <select
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="appearance-none bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white/70 pr-8 cursor-pointer hover:bg-white/10 transition-colors focus:outline-none focus:border-indigo-500/40"
            >
                {options.map((opt) => (
                    <option key={opt} value={opt} className="bg-[#0f1024] text-white">{opt}</option>
                ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-white/30 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
    );
}

function SettingRow({ label, desc, children }: { label: string; desc?: string; children: React.ReactNode }) {
    return (
        <div className="flex items-center justify-between py-3">
            <div>
                <div className="text-sm text-white/80">{label}</div>
                {desc && <div className="text-xs text-white/30 mt-0.5">{desc}</div>}
            </div>
            {children}
        </div>
    );
}

export default function SettingsPage() {
    const [activeTab, setActiveTab] = useState("general");
    const { theme, toggleTheme } = useThemeStore();
    const { locale, setLocale } = useLanguageStore();
    const { grade } = useGradeStore();
    const storedPrefs = useSyncExternalStore(subscribeToPreferences, getPreferencesSnapshot, () => null);
    const prefs = parsePreferences(storedPrefs);
    const [saved, setSaved] = useState(false);

    const updatePref = <K extends keyof AIPreferences>(key: K, value: AIPreferences[K]) => {
        const next = { ...prefs, [key]: value, grade: String(grade) };
        localStorage.setItem("f-physics-ai-prefs", JSON.stringify(next));
        window.dispatchEvent(new Event("f-physics-ai-prefs-changed"));
    };

    const handleSave = () => {
        localStorage.setItem("f-physics-ai-prefs", JSON.stringify({ ...prefs, grade: String(grade) }));
        window.dispatchEvent(new Event("f-physics-ai-prefs-changed"));
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    };

    return (
        <div className="max-w-4xl mx-auto p-6 lg:p-8">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-white/10 to-white/5 border border-white/10 flex items-center justify-center">
                        <Settings className="w-5 h-5 text-white/60" />
                    </div>
                    <h1 className="text-2xl font-bold text-white">Cài đặt</h1>
                </div>
            </motion.div>

            <div className="flex flex-col sm:flex-row gap-6">
                {/* Sidebar tabs */}
                <motion.nav
                    className="sm:w-48 shrink-0 flex sm:block gap-1 overflow-x-auto space-y-0.5"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.05 }}
                >
                    {TABS.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm transition-all ${activeTab === tab.id
                                    ? "bg-white/10 text-white font-medium"
                                    : "text-white/40 hover:text-white/70 hover:bg-white/5"
                                }`}
                        >
                            <tab.icon className="w-4 h-4" />
                            {tab.label}
                        </button>
                    ))}
                </motion.nav>

                {/* Content */}
                <motion.div
                    className="flex-1 min-w-0"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    key={activeTab}
                >
                    {/* ─── GENERAL ─── */}
                    {activeTab === "general" && (
                        <div className="space-y-6">
                            <div>
                                <h2 className="text-lg font-semibold text-white mb-1">Chung</h2>
                                <p className="text-sm text-white/30">Cài đặt giao diện và ngôn ngữ</p>
                            </div>

                            <div className="glass-panel p-5 divide-y divide-white/5">
                                <SettingRow label="Chế độ giao diện" desc="Chuyển đổi giữa giao diện sáng và tối">
                                    <button
                                        onClick={toggleTheme}
                                        className="flex rounded-full bg-white/10 p-0.5"
                                    >
                                        <span className={`px-3 py-1.5 rounded-full transition-all duration-200 flex items-center gap-1.5 text-xs font-medium ${theme === "light" ? "bg-amber-500/30 text-amber-300" : "text-white/30"
                                            }`}><Sun className="w-3.5 h-3.5" /> Sáng</span>
                                        <span className={`px-3 py-1.5 rounded-full transition-all duration-200 flex items-center gap-1.5 text-xs font-medium ${theme === "dark" ? "bg-indigo-500/30 text-indigo-300" : "text-white/30"
                                            }`}><Moon className="w-3.5 h-3.5" /> Tối</span>
                                    </button>
                                </SettingRow>

                                <SettingRow label="Ngôn ngữ" desc="Ngôn ngữ hiển thị giao diện">
                                    <button
                                        onClick={() => setLocale(locale === "vi" ? "en" : "vi")}
                                        className="flex rounded-full bg-white/10 p-0.5 text-xs font-semibold"
                                    >
                                        <span className={`px-3 py-1.5 rounded-full transition-all duration-200 ${locale === "vi" ? "bg-indigo-500/30 text-indigo-300" : "text-white/30"
                                            }`}>VN</span>
                                        <span className={`px-3 py-1.5 rounded-full transition-all duration-200 ${locale === "en" ? "bg-indigo-500/30 text-indigo-300" : "text-white/30"
                                            }`}>EN</span>
                                    </button>
                                </SettingRow>
                            </div>
                        </div>
                    )}

                    {/* ─── PERSONALIZATION ─── */}
                    {activeTab === "personalization" && (
                        <div className="space-y-6">
                            <div>
                                <h2 className="text-lg font-semibold text-white mb-1">Cá nhân hóa AI</h2>
                                <p className="text-sm text-white/30">Tuỳ chỉnh phong cách và giọng điệu của F-Physics AI</p>
                            </div>

                            {/* Base style */}
                            <div className="glass-panel p-5">
                                <div className="mb-4">
                                    <div className="text-sm font-medium text-white/80">Phong cách trả lời</div>
                                    <div className="text-xs text-white/30 mt-0.5">Điều chỉnh cách AI trả lời bạn. Không ảnh hưởng chất lượng kiến thức.</div>
                                </div>
                                <div className="grid grid-cols-3 gap-2">
                                    {STYLE_OPTIONS.map((opt) => (
                                        <button
                                            key={opt.value}
                                            onClick={() => updatePref("style", opt.value)}
                                            className={`p-3 rounded-xl text-left transition-all ${prefs.style === opt.value
                                                    ? "bg-indigo-500/15 border border-indigo-500/30 ring-1 ring-indigo-500/20"
                                                    : "bg-white/[0.02] border border-white/5 hover:bg-white/[0.05]"
                                                }`}
                                        >
                                            <div className={`text-sm font-medium ${prefs.style === opt.value ? "text-indigo-300" : "text-white/60"}`}>{opt.label}</div>
                                            <div className="text-[11px] text-white/25 mt-1">{opt.desc}</div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Characteristics */}
                            <div className="glass-panel p-5 divide-y divide-white/5">
                                <div className="pb-3">
                                    <div className="text-sm font-medium text-white/80">Đặc điểm</div>
                                    <div className="text-xs text-white/30 mt-0.5">Tuỳ chỉnh thêm bên cạnh phong cách cơ bản</div>
                                </div>

                                <SettingRow label="Thân thiện" desc="Mức độ ấm áp, gần gũi">
                                    <SelectDropdown value={prefs.warm} options={CHARACTERISTIC_OPTIONS} onChange={(v) => updatePref("warm", v)} />
                                </SettingRow>
                                <SettingRow label="Nhiệt tình" desc="Mức độ hào hứng, khích lệ">
                                    <SelectDropdown value={prefs.enthusiastic} options={CHARACTERISTIC_OPTIONS} onChange={(v) => updatePref("enthusiastic", v)} />
                                </SettingRow>
                                <SettingRow label="Tiêu đề & Danh sách" desc="Mức độ dùng heading và bullet">
                                    <SelectDropdown value={prefs.headersLists} options={CHARACTERISTIC_OPTIONS} onChange={(v) => updatePref("headersLists", v)} />
                                </SettingRow>
                                <SettingRow label="Emoji" desc="Mức độ sử dụng emoji">
                                    <SelectDropdown value={prefs.emoji} options={["Default", "Less", "More", "None"]} onChange={(v) => updatePref("emoji", v)} />
                                </SettingRow>
                            </div>

                            {/* Custom Instructions */}
                            <div className="glass-panel p-5">
                                <div className="mb-3">
                                    <div className="text-sm font-medium text-white/80">Hướng dẫn tuỳ chỉnh</div>
                                    <div className="text-xs text-white/30 mt-0.5">Yêu cầu bổ sung về hành vi, phong cách, hay sở thích</div>
                                </div>
                                <textarea
                                    value={prefs.customInstructions}
                                    onChange={(e) => updatePref("customInstructions", e.target.value)}
                                    placeholder="Ví dụ: Luôn giải thích bằng ví dụ đời thường, không dùng từ ngữ phức tạp..."
                                    rows={3}
                                    className="w-full glass-input resize-none text-sm leading-relaxed"
                                />
                            </div>

                            {/* About you */}
                            <div className="glass-panel p-5 divide-y divide-white/5">
                                <div className="pb-3">
                                    <div className="text-sm font-medium text-white/80">Về bạn</div>
                                    <div className="text-xs text-white/30 mt-0.5">Giúp AI hiểu bạn hơn để trả lời phù hợp</div>
                                </div>
                                <SettingRow label="Biệt danh">
                                    <input
                                        type="text"
                                        value={prefs.nickname}
                                        onChange={(e) => updatePref("nickname", e.target.value)}
                                        placeholder="Tên hoặc biệt danh"
                                        className="glass-input px-3 py-1.5 text-sm w-40 text-right"
                                    />
                                </SettingRow>
                                <SettingRow label="Lớp học" desc="Áp dụng cho gia sư, thư viện và luyện tập">
                                    <GradeSelector compact />
                                </SettingRow>
                            </div>

                            {/* Save button */}
                            <div className="flex justify-end">
                                <button
                                    onClick={handleSave}
                                    className="btn-primary px-5 py-2.5 text-sm flex items-center gap-2"
                                >
                                    {saved ? <CheckCircle2 className="w-4 h-4" /> : <Save className="w-4 h-4" />}
                                    {saved ? "Đã lưu!" : "Lưu thay đổi"}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* ─── NOTIFICATIONS ─── */}
                    {activeTab === "notifications" && (
                        <div className="space-y-6">
                            <div>
                                <h2 className="text-lg font-semibold text-white mb-1">Thông báo</h2>
                                <p className="text-sm text-white/30">Quản lý nhắc nhở học tập</p>
                            </div>
                            <div className="glass-panel p-5 divide-y divide-white/5">
                                <SettingRow label="Nhắc nhở học tập" desc="Gửi thông báo nhắc ôn bài hàng ngày">
                                    <ToggleSwitch defaultOn />
                                </SettingRow>
                                <SettingRow label="Streak nhắc nhở" desc="Thông báo khi sắp mất streak">
                                    <ToggleSwitch defaultOn />
                                </SettingRow>
                                <SettingRow label="Bài tập mới" desc="Thông báo khi có bài tập mới">
                                    <ToggleSwitch />
                                </SettingRow>
                            </div>
                        </div>
                    )}

                    {/* ─── ACCOUNT ─── */}
                    {activeTab === "account" && (
                        <div className="space-y-6">
                            <div>
                                <h2 className="text-lg font-semibold text-white mb-1">Tài khoản</h2>
                                <p className="text-sm text-white/30">Quản lý thông tin cá nhân</p>
                            </div>
                            <div className="glass-panel p-5 divide-y divide-white/5">
                                <SettingRow label="Hồ sơ học tập" desc="Xem và chỉnh sửa thông tin cá nhân">
                                    <a href="/profile" className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors">
                                        Xem hồ sơ →
                                    </a>
                                </SettingRow>
                                <SettingRow label="Đổi mật khẩu" desc="Cập nhật mật khẩu đăng nhập">
                                    <a href="/forgot-password" className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors">
                                        Đổi mật khẩu →
                                    </a>
                                </SettingRow>
                            </div>
                        </div>
                    )}
                </motion.div>
            </div>
        </div>
    );
}

function ToggleSwitch({ defaultOn = false }: { defaultOn?: boolean }) {
    const [on, setOn] = useState(defaultOn);
    return (
        <button
            onClick={() => setOn(!on)}
            className={`relative w-10 h-[22px] rounded-full transition-colors ${on ? "bg-indigo-500/40" : "bg-white/10"}`}
        >
            <div className={`absolute top-[3px] w-4 h-4 rounded-full transition-all duration-200 ${on ? "left-[21px] bg-indigo-400" : "left-[3px] bg-white/40"
                }`} />
        </button>
    );
}
