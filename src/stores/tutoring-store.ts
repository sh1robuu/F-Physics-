import { create } from "zustand";
import type { TutoringMessage, TutoringMode } from "@/types";

interface TutoringState {
    messages: TutoringMessage[];
    currentMode: TutoringMode;
    isLoading: boolean;
    sessionId: string | null;
    currentTopic: string | null;
    currentSubtopic: string | null;

    setMode: (mode: TutoringMode) => void;
    addMessage: (message: TutoringMessage) => void;
    setLoading: (loading: boolean) => void;
    setSession: (sessionId: string) => void;
    setTopic: (topic: string | null) => void;
    setSubtopic: (subtopic: string | null) => void;
    clearSession: () => void;
}

export const useTutoringStore = create<TutoringState>((set) => ({
    messages: [],
    currentMode: "AUTO",
    isLoading: false,
    sessionId: null,
    currentTopic: null,
    currentSubtopic: null,

    setMode: (mode) => set({ currentMode: mode }),
    addMessage: (message) =>
        set((state) => ({ messages: [...state.messages, message] })),
    setLoading: (loading) => set({ isLoading: loading }),
    setSession: (sessionId) => set({ sessionId }),
    setTopic: (topic) => set({ currentTopic: topic }),
    setSubtopic: (subtopic) => set({ currentSubtopic: subtopic }),
    clearSession: () =>
        set({
            messages: [],
            sessionId: null,
            currentTopic: null,
            currentSubtopic: null,
            currentMode: "AUTO",
        }),
}));
