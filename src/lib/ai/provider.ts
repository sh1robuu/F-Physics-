// AI Provider - Ollama Cloud API with API key support

export interface AIProviderConfig {
    baseUrl: string;
    apiKey: string;
    model: string;
}

export interface AIMessage {
    role: "system" | "user" | "assistant";
    content: string;
    images?: string[]; // base64-encoded image data for multimodal models
}

const defaultConfig: AIProviderConfig = {
    baseUrl: process.env.OLLAMA_BASE_URL || "https://ollama.com/api",
    apiKey: process.env.OLLAMA_API_KEY || "",
    model: process.env.OLLAMA_MODEL || "gemini-3-flash-preview:cloud",
};

export async function generateCompletion(
    messages: AIMessage[],
    config: AIProviderConfig = defaultConfig
): Promise<string> {
    const headers: Record<string, string> = {
        "Content-Type": "application/json",
    };
    if (config.apiKey) {
        headers["Authorization"] = `Bearer ${config.apiKey}`;
    }

    // baseUrl is already https://ollama.com/api, so append /chat directly
    const url = `${config.baseUrl.replace(/\/+$/, "")}/chat`;

    const response = await fetch(url, {
        method: "POST",
        headers,
        body: JSON.stringify({
            model: config.model,
            messages: messages.map((m) => {
                const msg: Record<string, unknown> = { role: m.role, content: m.content };
                if (m.images && m.images.length > 0) {
                    msg.images = m.images;
                }
                return msg;
            }),
            stream: false,
            options: {
                temperature: 0.7,
                top_p: 0.9,
                num_predict: 2048,
            },
        }),
    });

    if (!response.ok) {
        const errorText = await response.text();
        console.error("Ollama API error:", response.status, errorText);
        throw new Error(`AI API error: ${response.status} - ${errorText.slice(0, 200)}`);
    }

    const data = await response.json();
    return data.message?.content || "Không thể tạo phản hồi.";
}

export async function checkOllamaHealth(
    config: AIProviderConfig = defaultConfig
): Promise<boolean> {
    try {
        const headers: Record<string, string> = {};
        if (config.apiKey) {
            headers["Authorization"] = `Bearer ${config.apiKey}`;
        }
        const url = `${config.baseUrl.replace(/\/+$/, "").replace(/\/api$/, "")}/api/tags`;
        const response = await fetch(url, { headers });
        return response.ok;
    } catch {
        return false;
    }
}
