import { create } from "zustand";
import type { QuestionItem } from "@/types";

interface PracticeState {
    questions: QuestionItem[];
    currentIndex: number;
    answers: Record<string, string>;
    results: Record<string, boolean>;
    isActive: boolean;
    isReviewing: boolean;
    startTime: Date | null;
    timeLimit: number | null;
    selectedTopic: string | null;
    selectedDifficulty: string | null;

    setQuestions: (questions: QuestionItem[]) => void;
    setCurrentIndex: (index: number) => void;
    setAnswer: (questionId: string, answer: string) => void;
    setResult: (questionId: string, isCorrect: boolean) => void;
    startPractice: (timeLimit?: number) => void;
    endPractice: () => void;
    startReview: () => void;
    setSelectedTopic: (topic: string | null) => void;
    setSelectedDifficulty: (difficulty: string | null) => void;
    reset: () => void;
}

export const usePracticeStore = create<PracticeState>((set) => ({
    questions: [],
    currentIndex: 0,
    answers: {},
    results: {},
    isActive: false,
    isReviewing: false,
    startTime: null,
    timeLimit: null,
    selectedTopic: null,
    selectedDifficulty: null,

    setQuestions: (questions) => set({ questions }),
    setCurrentIndex: (index) => set({ currentIndex: index }),
    setAnswer: (questionId, answer) =>
        set((state) => ({ answers: { ...state.answers, [questionId]: answer } })),
    setResult: (questionId, isCorrect) =>
        set((state) => ({ results: { ...state.results, [questionId]: isCorrect } })),
    startPractice: (timeLimit) =>
        set({ isActive: true, startTime: new Date(), timeLimit: timeLimit ?? null }),
    endPractice: () => set({ isActive: false }),
    startReview: () => set({ isReviewing: true, isActive: false }),
    setSelectedTopic: (topic) => set({ selectedTopic: topic }),
    setSelectedDifficulty: (difficulty) => set({ selectedDifficulty: difficulty }),
    reset: () =>
        set({
            questions: [],
            currentIndex: 0,
            answers: {},
            results: {},
            isActive: false,
            isReviewing: false,
            startTime: null,
            timeLimit: null,
        }),
}));
