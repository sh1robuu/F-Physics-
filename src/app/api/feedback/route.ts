import { NextResponse } from "next/server";
import { auth } from "@/lib/auth-server";
import { headers } from "next/headers";
import { prisma } from "@/lib/db";

export async function POST(request: Request) {
    try {
        const session = await auth.api.getSession({
            headers: await headers(),
        });
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const { grade, category, message, ratingOverall, ratingUI, ratingContent, ratingAI, ratingUX } = body;
        const feedbackGrade = grade == null ? "other" : String(grade);
        if (!["10", "11", "12", "other"].includes(feedbackGrade)) {
            return NextResponse.json({ error: "Invalid grade" }, { status: 400 });
        }

        if (!message || typeof message !== "string" || message.trim().length < 5) {
            return NextResponse.json(
                { error: "Message must be at least 5 characters" },
                { status: 400 }
            );
        }

        const clamp = (v: number) => Math.min(5, Math.max(0, Number(v) || 0));

        const feedback = await prisma.feedback.create({
            data: {
                userId: session.user.id,
                grade: feedbackGrade,
                category: category || "general",
                message: message.trim(),
                ratingOverall: Math.max(1, clamp(ratingOverall)),
                ratingUI: clamp(ratingUI),
                ratingContent: clamp(ratingContent),
                ratingAI: clamp(ratingAI),
                ratingUX: clamp(ratingUX),
            },
        });

        return NextResponse.json({ success: true, feedback });
    } catch (error) {
        console.error("[Feedback API]", error);
        return NextResponse.json(
            { error: "Failed to submit feedback" },
            { status: 500 }
        );
    }
}

export async function GET(request: Request) {
    try {
        const session = await auth.api.getSession({
            headers: await headers(),
        });
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const url = new URL(request.url);
        const isAdmin = url.searchParams.get("admin") === "true";

        // Admin can see all feedback
        if (isAdmin) {
            const user = await prisma.user.findUnique({
                where: { id: session.user.id },
                select: { role: true },
            });
            if (user?.role !== "ADMIN") {
                return NextResponse.json({ error: "Forbidden" }, { status: 403 });
            }

            const feedbacks = await prisma.feedback.findMany({
                orderBy: { createdAt: "desc" },
                take: 100,
                include: {
                    user: { select: { name: true, email: true } },
                },
            });

            // Aggregate stats
            type FeedbackRow = { ratingOverall: number; ratingUI: number; ratingContent: number; ratingAI: number; ratingUX: number; grade: string; category: string };
            const all: FeedbackRow[] = await prisma.feedback.findMany({ select: { ratingOverall: true, ratingUI: true, ratingContent: true, ratingAI: true, ratingUX: true, grade: true, category: true } });
            const totalCount = all.length;
            const avg = (arr: number[]) => arr.length ? +(arr.reduce((a: number, b: number) => a + b, 0) / arr.length).toFixed(1) : 0;
            const nonZero = (arr: number[]) => arr.filter((v: number) => v > 0);

            const stats = {
                total: totalCount,
                avgOverall: avg(all.map((f: FeedbackRow) => f.ratingOverall)),
                avgUI: avg(nonZero(all.map((f: FeedbackRow) => f.ratingUI))),
                avgContent: avg(nonZero(all.map((f: FeedbackRow) => f.ratingContent))),
                avgAI: avg(nonZero(all.map((f: FeedbackRow) => f.ratingAI))),
                avgUX: avg(nonZero(all.map((f: FeedbackRow) => f.ratingUX))),
                byGrade: Object.entries(
                    all.reduce((acc: Record<string, number>, f: FeedbackRow) => { acc[f.grade] = (acc[f.grade] || 0) + 1; return acc; }, {} as Record<string, number>)
                ).map(([grade, count]) => ({ grade, count })),
                byCategory: Object.entries(
                    all.reduce((acc: Record<string, number>, f: FeedbackRow) => { acc[f.category] = (acc[f.category] || 0) + 1; return acc; }, {} as Record<string, number>)
                ).map(([category, count]) => ({ category, count })),
                ratingDistribution: [1, 2, 3, 4, 5].map((r: number) => ({
                    rating: r,
                    count: all.filter((f: FeedbackRow) => f.ratingOverall === r).length,
                })),
            };

            return NextResponse.json({ feedbacks, stats });
        }

        // Regular users see own feedback
        const feedbacks = await prisma.feedback.findMany({
            where: { userId: session.user.id },
            orderBy: { createdAt: "desc" },
            take: 20,
        });

        return NextResponse.json({ feedbacks });
    } catch (error) {
        console.error("[Feedback API]", error);
        return NextResponse.json(
            { error: "Failed to fetch feedback" },
            { status: 500 }
        );
    }
}
