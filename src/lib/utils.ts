import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat("vi-VN", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(date));
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.slice(0, length) + "...";
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function difficultyColor(difficulty: string): string {
  switch (difficulty) {
    case "EASY":
      return "text-emerald-400";
    case "MEDIUM":
      return "text-amber-400";
    case "HARD":
      return "text-orange-400";
    case "EXPERT":
      return "text-red-400";
    default:
      return "text-slate-400";
  }
}

export function difficultyBg(difficulty: string): string {
  switch (difficulty) {
    case "EASY":
      return "bg-emerald-400/10 border-emerald-400/20";
    case "MEDIUM":
      return "bg-amber-400/10 border-amber-400/20";
    case "HARD":
      return "bg-orange-400/10 border-orange-400/20";
    case "EXPERT":
      return "bg-red-400/10 border-red-400/20";
    default:
      return "bg-slate-400/10 border-slate-400/20";
  }
}
