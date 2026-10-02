import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface ChatMessage {
    id: string;
    role: "user" | "assistant";
    content: string;
    mode?: string;
    confidence?: number;
    isGrounded?: boolean;
    timestamp: Date;
}

export interface Conversation {
    id: string;
    title: string;
    messages: ChatMessage[];
    model: string;
    createdAt: Date;
    updatedAt: Date;
}

interface ChatStore {
    conversations: Conversation[];
    activeConversationId: string | null;

    // Actions
    createConversation: (model?: string) => string;
    setActiveConversation: (id: string | null) => void;
    addMessage: (conversationId: string, message: ChatMessage) => void;
    deleteConversation: (id: string) => void;
    getActiveConversation: () => Conversation | undefined;
    updateTitle: (id: string, title: string) => void;
}

export const useChatStore = create<ChatStore>()(
    persist(
        (set, get) => ({
            conversations: [],
            activeConversationId: null,

            createConversation: (model = "gemini-3-flash-preview:cloud") => {
                const id = Date.now().toString();
                const conversation: Conversation = {
                    id,
                    title: "Cuộc trò chuyện mới",
                    messages: [],
                    model,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                };
                set((state) => ({
                    conversations: [conversation, ...state.conversations],
                    activeConversationId: id,
                }));
                return id;
            },

            setActiveConversation: (id) => {
                set({ activeConversationId: id });
            },

            addMessage: (conversationId, message) => {
                set((state) => ({
                    conversations: state.conversations.map((conv) => {
                        if (conv.id !== conversationId) return conv;
                        const messages = [...conv.messages, message];
                        // Auto-set title from first user message
                        const title =
                            conv.title === "Cuộc trò chuyện mới" && message.role === "user"
                                ? message.content.slice(0, 40) + (message.content.length > 40 ? "..." : "")
                                : conv.title;
                        return { ...conv, messages, title, updatedAt: new Date() };
                    }),
                }));
            },

            deleteConversation: (id) => {
                set((state) => ({
                    conversations: state.conversations.filter((c) => c.id !== id),
                    activeConversationId:
                        state.activeConversationId === id ? null : state.activeConversationId,
                }));
            },

            getActiveConversation: () => {
                const state = get();
                return state.conversations.find((c) => c.id === state.activeConversationId);
            },

            updateTitle: (id, title) => {
                set((state) => ({
                    conversations: state.conversations.map((c) =>
                        c.id === id ? { ...c, title } : c
                    ),
                }));
            },
        }),
        {
            name: "f-physics-chat",
        }
    )
);
