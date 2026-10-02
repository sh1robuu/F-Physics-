import { NextRequest, NextResponse } from "next/server";
import { processQuestion } from "@/lib/ai/engine";
import type { TutoringMode } from "@/types";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { question, mode, history, topicContext, imageDescription, imageBase64, model, aiPrefs, grade } = body;

        if (!question || typeof question !== "string") {
            return NextResponse.json(
                { error: "Vui lòng nhập câu hỏi" },
                { status: 400 }
            );
        }

        const selectedGrade = Number(grade ?? aiPrefs?.grade ?? 12);
        if (![10, 11, 12].includes(selectedGrade)) {
            return NextResponse.json({ error: "Vui lòng chọn lớp 10, 11 hoặc 12." }, { status: 400 });
        }

        const result = await processQuestion({
            question,
            mode: (mode as TutoringMode) || "AUTO",
            conversationHistory: history,
            topicContext,
            imageDescription,
            imageBase64,
            modelOverride: model,
            aiPrefs: { ...aiPrefs, grade: String(selectedGrade) },
        });

        return NextResponse.json(result);
    } catch (error) {
        console.error("Tutoring API error:", error);
        return NextResponse.json(
            { error: "Lỗi hệ thống. Vui lòng thử lại." },
            { status: 500 }
        );
    }
}
