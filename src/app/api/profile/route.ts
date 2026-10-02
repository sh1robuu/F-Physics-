import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth-server";
import { prisma } from "@/lib/db";

// GET /api/profile — fetch user profile + learning stats
export async function GET(req: NextRequest) {
    try {
        const session = await auth.api.getSession({
            headers: req.headers,
        });

        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const userId = session.user.id;

        // Fetch stats in parallel
        const [user, submissionCount, examAttempts, sessionCount] = await Promise.all([
            prisma.user.findUnique({
                where: { id: userId },
                select: {
                    id: true,
                    name: true,
                    email: true,
                    avatar: true,
                    role: true,
                    preferredMode: true,
                    gamification: true,
                    createdAt: true,
                },
            }),
            prisma.problemSubmission.count({
                where: { userId },
            }),
            prisma.examAttempt.findMany({
                where: { userId },
                select: { isCorrect: true, timeSpent: true },
            }),
            prisma.session.count({
                where: { userId },
            }),
        ]);

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        // Calculate stats
        const totalQuestions = submissionCount + examAttempts.length;
        const correctAnswers = examAttempts.filter((a) => a.isCorrect).length;
        const accuracy = examAttempts.length > 0
            ? Math.round((correctAnswers / examAttempts.length) * 100)
            : null;
        const totalTimeSpent = examAttempts.reduce((sum, a) => sum + (a.timeSpent || 0), 0);
        const studyHours = Math.round((totalTimeSpent / 3600) * 10) / 10;

        return NextResponse.json({
            user,
            stats: {
                totalQuestions,
                accuracy,
                sessions: sessionCount,
                studyHours,
                correctAnswers,
                totalExamAttempts: examAttempts.length,
            },
        });
    } catch (error) {
        console.error("[PROFILE_GET]", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

// PUT /api/profile — update user profile
export async function PUT(req: NextRequest) {
    try {
        const session = await auth.api.getSession({
            headers: req.headers,
        });

        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { name, avatar, preferredMode, gamification } = body;

        // Validate
        if (name !== undefined && (typeof name !== "string" || name.trim().length === 0)) {
            return NextResponse.json({ error: "Name cannot be empty" }, { status: 400 });
        }

        const updateData: Record<string, unknown> = {};
        if (name !== undefined) updateData.name = name.trim();
        if (avatar !== undefined) updateData.avatar = avatar;
        if (preferredMode !== undefined) updateData.preferredMode = preferredMode;
        if (gamification !== undefined) updateData.gamification = gamification;

        const updatedUser = await prisma.user.update({
            where: { id: session.user.id },
            data: updateData,
            select: {
                id: true,
                name: true,
                email: true,
                avatar: true,
                role: true,
                preferredMode: true,
                gamification: true,
            },
        });

        return NextResponse.json({ user: updatedUser });
    } catch (error) {
        console.error("[PROFILE_PUT]", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
