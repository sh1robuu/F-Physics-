import Link from "next/link";

export function Brand({ href = "/", compact = false }: { href?: string; compact?: boolean }) {
    return <Link href={href} className="brand" aria-label="F-Physics — Trang chủ">
        <span className="brand-symbol" aria-hidden="true">
            <svg viewBox="0 0 32 32" fill="none"><ellipse cx="16" cy="16" rx="13" ry="6" transform="rotate(-45 16 16)" stroke="currentColor" strokeWidth="1.6"/><ellipse cx="16" cy="16" rx="13" ry="6" transform="rotate(45 16 16)" stroke="currentColor" strokeWidth="1.6"/><circle cx="16" cy="16" r="3" fill="currentColor"/></svg>
        </span>
        {!compact && <span>F-Physics<span className="brand-dot">.</span></span>}
    </Link>;
}
