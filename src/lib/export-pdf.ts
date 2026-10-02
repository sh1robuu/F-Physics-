"use client";

import jsPDF from "jspdf";

interface ExportOptions {
    title: string;
    content: string;
    score?: number;
    totalQuestions?: number;
    date?: string;
}

export async function exportToPdf({ title, content, score, totalQuestions, date }: ExportOptions) {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    // Header
    doc.setFillColor(99, 102, 241); // indigo
    doc.rect(0, 0, pageWidth, 35, "F");

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.text("F-Physics", 15, 18);
    doc.setFontSize(10);
    doc.text(date || new Date().toLocaleDateString("vi-VN"), 15, 27);

    // Title
    doc.setTextColor(30, 30, 60);
    doc.setFontSize(16);
    doc.text(title, 15, 50);

    // Score box if provided
    let yOffset = 60;
    if (score !== undefined && totalQuestions !== undefined) {
        doc.setFillColor(243, 244, 250);
        doc.roundedRect(15, yOffset, pageWidth - 30, 20, 3, 3, "F");
        doc.setFontSize(12);
        doc.setTextColor(99, 102, 241);
        doc.text(`Score: ${score}/${totalQuestions} (${Math.round((score / totalQuestions) * 100)}%)`, 20, yOffset + 13);
        yOffset += 30;
    }

    // Content
    doc.setTextColor(50, 50, 50);
    doc.setFontSize(11);
    const lines = doc.splitTextToSize(content, pageWidth - 30);
    let currentY = yOffset;

    for (const line of lines) {
        if (currentY > doc.internal.pageSize.getHeight() - 20) {
            doc.addPage();
            currentY = 20;
        }
        doc.text(line, 15, currentY);
        currentY += 6;
    }

    // Footer on each page
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.text(`F-Physics — Page ${i}/${pageCount}`, pageWidth / 2, doc.internal.pageSize.getHeight() - 10, { align: "center" });
    }

    doc.save(`${title.replace(/[^a-zA-Z0-9\u00C0-\u024F]/g, "_")}.pdf`);
}

// Quick export for exam results
export async function exportExamResults(
    questions: { text: string; answer: string; correct: string; isCorrect: boolean; explanation?: string }[],
    score: number,
    title: string = "Kết quả thi thử"
) {
    const content = questions
        .map((q, i) => {
            const status = q.isCorrect ? "✓" : "✗";
            let text = `${i + 1}. ${q.text}\n   ${status} Đáp án: ${q.answer}${q.isCorrect ? "" : ` (Đúng: ${q.correct})`}`;
            if (q.explanation) text += `\n   Giải thích: ${q.explanation}`;
            return text;
        })
        .join("\n\n");

    await exportToPdf({
        title,
        content,
        score,
        totalQuestions: questions.length,
    });
}
