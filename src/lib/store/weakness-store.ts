import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface WeaknessEntry {
    id: string;
    topic: string;
    concept: string;
    breakdown: string;
    occurrences: number;
    severity: number; // 1-5, increases with occurrences
    lastSeen: string; // ISO date string
    resolved: boolean;
}

interface WeaknessStore {
    weaknesses: WeaknessEntry[];

    recordWeakness: (topic: string, concept: string, breakdown: string) => void;
    resolveWeakness: (id: string) => void;
    getTopWeaknesses: (count?: number) => WeaknessEntry[];
    getWeaknessesByTopic: (topic: string) => WeaknessEntry[];
    clearAll: () => void;
}

function generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

export const useWeaknessStore = create<WeaknessStore>()(
    persist(
        (set, get) => ({
            weaknesses: [],

            recordWeakness: (topic: string, concept: string, breakdown: string) => {
                set((state) => {
                    // Check if a similar weakness already exists (same topic + concept)
                    const existing = state.weaknesses.find(
                        (w) =>
                            w.topic.toLowerCase() === topic.toLowerCase() &&
                            w.concept.toLowerCase() === concept.toLowerCase() &&
                            !w.resolved
                    );

                    if (existing) {
                        // Increase occurrences and severity
                        return {
                            weaknesses: state.weaknesses.map((w) =>
                                w.id === existing.id
                                    ? {
                                        ...w,
                                        occurrences: w.occurrences + 1,
                                        severity: Math.min(5, Math.ceil((w.occurrences + 1) / 2)),
                                        breakdown: breakdown || w.breakdown,
                                        lastSeen: new Date().toISOString(),
                                    }
                                    : w
                            ),
                        };
                    }

                    // Create new weakness entry
                    const newEntry: WeaknessEntry = {
                        id: generateId(),
                        topic,
                        concept,
                        breakdown,
                        occurrences: 1,
                        severity: 1,
                        lastSeen: new Date().toISOString(),
                        resolved: false,
                    };

                    return {
                        weaknesses: [newEntry, ...state.weaknesses],
                    };
                });
            },

            resolveWeakness: (id: string) => {
                set((state) => ({
                    weaknesses: state.weaknesses.map((w) =>
                        w.id === id ? { ...w, resolved: true } : w
                    ),
                }));
            },

            getTopWeaknesses: (count = 10) => {
                return get()
                    .weaknesses.filter((w) => !w.resolved)
                    .sort((a, b) => b.severity - a.severity || b.occurrences - a.occurrences)
                    .slice(0, count);
            },

            getWeaknessesByTopic: (topic: string) => {
                return get().weaknesses.filter(
                    (w) => w.topic.toLowerCase().includes(topic.toLowerCase()) && !w.resolved
                );
            },

            clearAll: () => set({ weaknesses: [] }),
        }),
        {
            name: "f-physics-weaknesses",
        }
    )
);
