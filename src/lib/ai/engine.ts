// Tutoring engine - orchestrates AI tutoring with progressive modes

import { generateCompletion, type AIMessage } from "./provider";
import { getSystemPrompt, type AIPreferences } from "./prompts";
import type { TutoringMode } from "@/types";

export interface TutoringRequest {
    question: string;
    mode: TutoringMode;
    conversationHistory?: { role: "user" | "assistant"; content: string }[];
    topicContext?: string;
    imageDescription?: string;
    imageBase64?: string[]; // base64-encoded image data (without data:image/... prefix)
    modelOverride?: string;
    aiPrefs?: AIPreferences;
}

export interface DiagnosisData {
    topic?: string;
    concept?: string;
    breakdown?: string;
}

export interface TutoringResponse {
    content: string;
    mode: TutoringMode;
    isGrounded: boolean;
    suggestedNextMode?: TutoringMode;
    detectedTopic?: string;
    detectedSubtopic?: string;
    diagnosis?: DiagnosisData;
}

const MODE_PROGRESSION: TutoringMode[] = ["HINT", "CONCEPT", "GUIDED", "FULL_SOLUTION"];

export function getNextMode(currentMode: TutoringMode): TutoringMode | null {
    if (currentMode === "AUTO") return "GUIDED";
    const currentIndex = MODE_PROGRESSION.indexOf(currentMode);
    if (currentIndex < 0 || currentIndex >= MODE_PROGRESSION.length - 1) return null;
    return MODE_PROGRESSION[currentIndex + 1];
}

export async function processQuestion(
    request: TutoringRequest
): Promise<TutoringResponse> {
    const { question, mode, conversationHistory, topicContext, imageDescription, imageBase64, modelOverride, aiPrefs } = request;

    const effectiveMode = mode;
    const systemPrompt = getSystemPrompt(effectiveMode, aiPrefs);

    const messages: AIMessage[] = [
        { role: "system", content: systemPrompt },
    ];

    if (topicContext) {
        messages.push({
            role: "system",
            content: `Ngữ cảnh chủ đề: ${topicContext}`,
        });
    }

    if (conversationHistory) {
        for (const msg of conversationHistory) {
            messages.push({ role: msg.role, content: msg.content });
        }
    }

    let userContent = question;
    if (imageBase64 && imageBase64.length > 0) {
        userContent += `\n\n[Học sinh đã gửi ${imageBase64.length} hình ảnh. Hãy phân tích kĩ hình ảnh để hiểu đề bài và bài giải của học sinh.]`;
    } else if (imageDescription) {
        userContent += `\n\n[Mô tả hình ảnh/tài liệu: ${imageDescription}]`;
    }

    const userMessage: AIMessage = { role: "user", content: userContent };
    if (imageBase64 && imageBase64.length > 0) {
        userMessage.images = imageBase64;
    }
    messages.push(userMessage);

    const config = modelOverride
        ? { baseUrl: process.env.OLLAMA_BASE_URL || "https://ollama.com/api", apiKey: process.env.OLLAMA_API_KEY || "", model: modelOverride }
        : undefined;
    const rawContent = await generateCompletion(messages, config);

    const suggestedNextMode = getNextMode(effectiveMode);
    const diagnosis = parseDiagnosis(rawContent);

    return {
        content: rawContent,
        mode: effectiveMode,
        // No retrieval or source verification is performed by this provider.
        isGrounded: false,
        suggestedNextMode: suggestedNextMode ?? undefined,
        detectedTopic: diagnosis?.topic || extractTopic(question),
        detectedSubtopic: undefined,
        diagnosis,
    };
}

function parseDiagnosis(content: string): DiagnosisData | undefined {
    // Look for the 📊 **Chẩn đoán:** block in the AI response
    const diagnosisMatch = content.match(/📊\s*\*\*Chẩn đoán[:\s]*\*\*/i);
    if (!diagnosisMatch) return undefined;

    const startIdx = diagnosisMatch.index! + diagnosisMatch[0].length;
    // Extract lines after the diagnosis header until next section (starting with emoji or ═══)
    const remaining = content.slice(startIdx);
    const endMatch = remaining.match(/\n(?:📋|📐|📝|🔢|✅|💡|🔹|═══|\n\n)/m);
    const block = endMatch ? remaining.slice(0, endMatch.index!) : remaining.slice(0, 500);

    const topicMatch = block.match(/[-•]\s*Chủ đề\s*[:：]\s*(.+)/i);
    const conceptMatch = block.match(/[-•]\s*Khái niệm(?:\s+kiểm tra)?\s*[:：]\s*(.+)/i);
    const breakdownMatch = block.match(/[-•]\s*Điểm vướng mắc\s*[:：]\s*(.+)/i);

    const topic = topicMatch?.[1]?.trim();
    const concept = conceptMatch?.[1]?.trim();
    const breakdown = breakdownMatch?.[1]?.trim();

    if (!topic && !concept && !breakdown) return undefined;

    return { topic, concept, breakdown };
}

function extractTopic(question: string): string | undefined {
    const topicKeywords: Record<string, string[]> = {
        "Vật lí nhiệt": ["nhiệt dung", "nóng chảy", "hoá hơi", "hóa hơi", "nội năng", "nhiệt động"],
        "Khí lí tưởng": ["khí lí tưởng", "khí lý tưởng", "boyle", "charles", "đẳng nhiệt", "đẳng áp"],
        "Từ trường và cảm ứng điện từ": ["từ trường", "từ thông", "cảm ứng điện từ", "faraday", "lenz", "lực từ"],
        "Điện trường": ["điện tích", "điện trường", "coulomb", "điện thế", "tụ điện"],
        "Dòng điện và mạch điện": ["dòng điện không đổi", "định luật ohm", "suất điện động", "điện trở"],
        "Động học": ["gia tốc", "vận tốc", "rơi tự do", "chuyển động ném", "độ dịch chuyển"],
        "Động lực học": ["newton", "ma sát", "moment", "cân bằng lực"],
        "Công, năng lượng và công suất": ["động năng", "thế năng", "cơ năng", "hiệu suất"],
        "Động lượng": ["động lượng", "va chạm"],
        "Chuyển động tròn": ["hướng tâm", "chuyển động tròn"],
        "Biến dạng và áp suất": ["biến dạng", "định luật hooke", "khối lượng riêng", "áp suất chất lỏng"],
        "Dao động cơ": ["dao động", "con lắc", "lò xo", "chu kỳ", "tần số", "biên độ"],
        "Sóng cơ": ["sóng", "giao thoa", "nhiễu xạ", "sóng dừng", "bước sóng"],
        "Dòng điện xoay chiều": ["xoay chiều", "rlc", "trở kháng"],
        "Dao động và sóng điện từ": ["điện từ", "mạch LC", "sóng điện từ"],
        "Sóng ánh sáng": ["ánh sáng", "quang phổ", "tán sắc", "giao thoa ánh sáng"],
        "Lượng tử ánh sáng": ["photon", "quang điện", "lượng tử", "hiệu ứng quang điện"],
        "Vật lý hạt nhân": ["hạt nhân", "phóng xạ", "phân rã", "phản ứng hạt nhân", "năng lượng liên kết"],
    };

    const lowerQ = question.toLowerCase();
    for (const [topic, keywords] of Object.entries(topicKeywords)) {
        if (keywords.some((kw) => lowerQ.includes(kw))) {
            return topic;
        }
    }
    return undefined;
}
