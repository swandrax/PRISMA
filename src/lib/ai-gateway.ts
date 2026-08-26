/**
 * Neon AI Gateway Client
 * Uses OpenAI-compatible completion & chat APIs powered by Neon AI Gateway.
 */

const AI_GATEWAY_API_KEY = process.env.OPENAI_API_KEY || "";
const AI_GATEWAY_URL = process.env.AI_GATEWAY_URL || "https://api.openai.com/v1";

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface AIGatewayOptions {
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

/**
 * Call Neon AI Gateway for chat completions
 */
export async function askAIGateway(
  messages: ChatMessage[],
  options: AIGatewayOptions = {}
): Promise<{ text: string; error?: string }> {
  try {
    if (!AI_GATEWAY_API_KEY) {
      return { text: "", error: "OPENAI_API_KEY / AI Gateway API Key is not configured." };
    }

    const model = options.model || "gpt-4o-mini";
    const temperature = options.temperature ?? 0.7;
    const max_tokens = options.maxTokens ?? 1024;

    const response = await fetch(`${AI_GATEWAY_URL}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${AI_GATEWAY_API_KEY}`,
      },
      body: JSON.stringify({
        model,
        messages,
        temperature,
        max_tokens,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return { text: "", error: `AI Gateway returned ${response.status}: ${errorText}` };
    }

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content || "";
    return { text: reply };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "AI Gateway error";
    return { text: "", error: message };
  }
}
