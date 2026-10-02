import type { Question } from "@/lib/data/questionBank";

export interface PracticeAnswers {
    mcq: Record<string, string>;
    tf: Record<string, Record<string, boolean>>;
    short: Record<string, string>;
}

/** Accept either Vietnamese decimal commas or decimal points, never partial input. */
export function parseNumericAnswer(value: string): number {
    const normalized = value.trim().replace(",", ".");
    if (!normalized || !/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?$/i.test(normalized)) return NaN;
    const number = Number(normalized);
    return Number.isFinite(number) ? number : NaN;
}

export function isQuestionAnswered(question: Question, answers: PracticeAnswers): boolean {
    if (question.type === "mcq") return Boolean(answers.mcq[question.id]);
    if (question.type === "tf") return question.statements.every((s) => typeof answers.tf[question.id]?.[s.key] === "boolean");
    return Boolean(answers.short[question.id]?.trim());
}

export function scoreQuestion(question: Question, answers: PracticeAnswers) {
    if (question.type === "mcq") {
        const correct = answers.mcq[question.id] === question.correctAnswer;
        return { correct, rawScore: correct ? 0.25 : 0, maxScore: 0.25, correctStatements: 0 };
    }
    if (question.type === "tf") {
        const correctStatements = question.statements.filter((s) => answers.tf[question.id]?.[s.key] === s.correct).length;
        const weights = [0, 0.1, 0.25, 0.5, 1];
        return { correct: correctStatements === question.statements.length, rawScore: weights[correctStatements] ?? 0, maxScore: 1, correctStatements };
    }
    const value = parseNumericAnswer(answers.short[question.id] ?? "");
    const correct = Number.isFinite(value) && Math.abs(value - question.correctAnswer) <= question.tolerance + Number.EPSILON * Math.max(1, Math.abs(question.correctAnswer));
    return { correct, rawScore: correct ? 0.5 : 0, maxScore: 0.5, correctStatements: 0 };
}

/** Normalize the actual practice set to ten points, including short topic sets. */
export function scorePractice(questions: Question[], answers: PracticeAnswers) {
    const sections = (["mcq", "tf", "short"] as const).map((type) => {
        const items = questions.filter((q) => q.type === type);
        const scores = items.map((q) => scoreQuestion(q, answers));
        return { type, count: items.length, rawScore: scores.reduce((sum, score) => sum + score.rawScore, 0), maxScore: scores.reduce((sum, score) => sum + score.maxScore, 0) };
    });
    const rawScore = sections.reduce((sum, section) => sum + section.rawScore, 0);
    const maxScore = sections.reduce((sum, section) => sum + section.maxScore, 0);
    return { sections, rawScore, maxScore, score: maxScore ? rawScore / maxScore * 10 : 0, answered: questions.filter((q) => isQuestionAnswered(q, answers)).length };
}

export function getPracticeMinutes(questions: Question[]) {
    const answerCount = questions.reduce((sum, question) => sum + (question.type === "tf" ? question.statements.length : 1), 0);
    return Math.max(5, Math.ceil(answerCount * 1.25));
}
