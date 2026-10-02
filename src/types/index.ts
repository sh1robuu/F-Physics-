import type { Grade } from "@/lib/data/curriculum";

// ==================== Tutoring Types ====================

export type TutoringMode = "HINT" | "CONCEPT" | "GUIDED" | "FULL_SOLUTION" | "AUTO";

export interface TutoringMessage {
    id: string;
    role: "user" | "assistant";
    content: string;
    mode?: TutoringMode;
    confidence?: number;
    isGrounded?: boolean;
    timestamp: Date;
    metadata?: {
        topic?: string;
        subtopic?: string;
        concept?: string;
        formulas?: string[];
        stepNumber?: number;
    };
}

export interface TutoringSession {
    id: string;
    messages: TutoringMessage[];
    currentMode: TutoringMode;
    topic?: string;
    subtopic?: string;
    status: "active" | "completed";
    createdAt: Date;
}

// ==================== Topics ====================

export interface TopicItem {
    id: string;
    name: string;
    nameVi?: string;
    slug: string;
    description?: string;
    chapter?: number;
    grade?: Grade;
    order: number;
    children?: TopicItem[];
    subtopics?: SubtopicItem[];
}

export interface SubtopicItem {
    id: string;
    name: string;
    nameVi?: string;
    slug: string;
    topicId: string;
    concepts?: ConceptItem[];
}

export interface ConceptItem {
    id: string;
    name: string;
    nameVi?: string;
    description?: string;
    formulas: string[];
}

// ==================== Exam Bank ====================

export interface QuestionItem {
    id: string;
    topicId: string;
    grade?: Grade;
    questionText: string;
    questionImage?: string;
    options?: { key: string; text: string }[];
    correctAnswer: string;
    explanation?: string;
    difficulty: "EASY" | "MEDIUM" | "HARD" | "EXPERT";
    type: "MULTIPLE_CHOICE" | "SHORT_ANSWER" | "CALCULATION" | "TRUE_FALSE";
    source?: string;
    tags: string[];
    topic?: TopicItem;
}

export interface PracticeSession {
    id: string;
    questions: QuestionItem[];
    currentIndex: number;
    answers: Record<string, string>;
    results: Record<string, boolean>;
    startTime: Date;
    timeLimit?: number;
    status: "in_progress" | "completed" | "reviewing";
}

export interface MockTestConfig {
    grade: Grade;
    topicId?: string;
    difficulty?: "EASY" | "MEDIUM" | "HARD" | "EXPERT";
    questionCount: number;
    timeLimit?: number;
    useWeaknesses: boolean;
}

// ==================== Library ====================

export interface ResourceItemType {
    id: string;
    title: string;
    description?: string;
    fileUrl?: string;
    fileType?: string;
    fileSize?: number;
    topicId?: string;
    category?: string;
    tags: string[];
    createdAt: Date;
    updatedAt: Date;
    topic?: TopicItem;
}

// ==================== Learner Memory ====================

export interface WeaknessItem {
    id: string;
    topicId: string;
    category?: string;
    severity: number;
    occurrences: number;
    details?: string;
    lastSeen: Date;
    resolved: boolean;
    topic?: TopicItem;
}

export interface RecommendationItem {
    id: string;
    type: string;
    title: string;
    description: string;
    priority: number;
    dismissed: boolean;
    actionUrl?: string;
    createdAt: Date;
}

// ==================== Dashboard ====================

export interface DashboardStats {
    totalSessions: number;
    questionsAnswered: number;
    correctRate: number;
    weakTopics: number;
    studyStreak: number;
    totalResources: number;
}

export interface ActivityItem {
    id: string;
    type: "tutoring" | "practice" | "upload" | "achievement";
    title: string;
    description: string;
    timestamp: Date;
    metadata?: Record<string, unknown>;
}

// ==================== User ====================

export interface UserProfile {
    id: string;
    name?: string;
    email: string;
    role: "STUDENT" | "TEACHER" | "ADMIN";
    avatar?: string;
    gamification: boolean;
    preferredMode: TutoringMode;
    createdAt: Date;
}

// ==================== Navigation ====================

export interface NavItem {
    title: string;
    href: string;
    icon: string;
    badge?: string | number;
    children?: NavItem[];
}
