"use client";

import { useEffect, useState } from "react";
import { Pause, Play, MoveUpRight } from "lucide-react";
import { useTranslation } from "@/lib/i18n";

/** An ideal harmonic oscillator: x = A cos(πt), with T = 2 s. */
export function PhysicsSketch() {
    const { locale } = useTranslation();
    const vi = locale === "vi";
    const [amplitude, setAmplitude] = useState(4);
    const [playing, setPlaying] = useState(false);
    const [phase, setPhase] = useState(0);
    useEffect(() => {
        if (!playing) return;
        let frame: number;
        let last = 0;
        const tick = (now: number) => {
            if (last) setPhase((value) => (value + Math.min((now - last) / 1000, 0.1) * Math.PI) % (2 * Math.PI));
            last = now;
            frame = requestAnimationFrame(tick);
        };
        frame = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(frame);
    }, [playing]);
    const x = amplitude * Math.cos(phase);
    // Round SVG coordinates so server/browser floating-point implementations hydrate identically.
    const points = Array.from({ length: 121 }, (_, i) => `${(48 + i * 3.4).toFixed(3)},${(171 - amplitude * 15 * Math.cos(i / 120 * 2 * Math.PI)).toFixed(3)}`).join(" ");
    return <div className="physics-sketch">
        <div className="sketch-heading"><span><span className="live-dot" />{vi ? "MỘT CHÚT VẬT LÝ, MỖI NGÀY" : "A LITTLE PHYSICS, EVERY DAY"}</span><MoveUpRight size={18} /></div>
        <div className="sketch-title">{vi ? "Mọi chuyển động đều" : "Every movement has"}<br/>{vi ? "có một câu chuyện." : "a story to tell."}</div>
        <svg className="wave-diagram" viewBox="0 0 500 285" role="img" aria-label={vi ? "Đồ thị li độ theo thời gian của dao động điều hòa" : "Displacement versus time for harmonic motion"}>
            <defs><pattern id="wave-grid" width="34" height="34" patternUnits="userSpaceOnUse"><path d="M 34 0 L 0 0 0 34" fill="none" stroke="#ffffff" strokeOpacity="0.07"/></pattern><linearGradient id="wave-color"><stop stopColor="#f58220"/><stop offset="1" stopColor="#1a3c8f"/></linearGradient></defs>
            <rect x="30" y="65" width="445" height="200" fill="url(#wave-grid)"/>
            <path d="M 48 70 V 250 M 40 171 H 470" stroke="#fff" strokeOpacity=".3" fill="none"/>
            <path d="M45 76 48 70 51 76 M464 168 470 171 464 174" stroke="#fff" strokeOpacity=".4" fill="none"/>
            <text x="46" y="53" fill="#8da8cc" fontSize="12">x (cm)</text><text x="442" y="199" fill="#8da8cc" fontSize="12">t (s)</text>
            <text x="29" y="177" fill="#8da8cc" fontSize="12">0</text><text x="246" y="191" fill="#8da8cc" fontSize="11">1</text><text x="448" y="191" fill="#8da8cc" fontSize="11">2</text>
            <polyline points={points} fill="none" stroke="url(#wave-color)" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round"/>
            <line x1={48 + phase / (2*Math.PI)*408} x2={48 + phase / (2*Math.PI)*408} y1="171" y2={171-x*15} stroke="#f58220" strokeDasharray="4 4" strokeOpacity=".6"/>
            <circle cx={48 + phase / (2*Math.PI)*408} cy={171-x*15} r="15" fill="#f58220" fillOpacity=".1"/>
            <circle cx={48 + phase / (2*Math.PI)*408} cy={171-x*15} r="5" fill="#f58220" stroke="#0e1f48" strokeWidth="2"/>
            <text x="296" y="74" fill="#dce4f0" fontSize="22" fontFamily="Georgia, serif" fontStyle="italic">x = A cos(ωt)</text>
        </svg>
        <div className="sketch-controls">
            <div><label htmlFor="amplitude">{vi ? "Biên độ" : "Amplitude"} <b>{amplitude} cm</b></label><input id="amplitude" type="range" min="1" max="5" step="1" value={amplitude} onChange={(e) => setAmplitude(Number(e.target.value))}/></div>
            <button type="button" onClick={() => setPlaying(!playing)} aria-label={playing ? (vi ? "Tạm dừng mô phỏng" : "Pause simulation") : (vi ? "Chạy mô phỏng" : "Play simulation")}>{playing ? <Pause size={18}/> : <Play size={18}/>}</button>
        </div>
        <div className="sketch-caption"><span>{vi ? "Mô hình dao động điều hòa" : "An ideal harmonic oscillator"}</span><span>T = 2 s <span className="caption-dot">·</span> ω = π rad/s</span></div>
    </div>;
}
