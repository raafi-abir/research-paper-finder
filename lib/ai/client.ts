// lib/ai/client.ts
import { AIProvider } from "./types";
import { MockAIProvider } from "./providers/mockProvider";
import { GeminiAIProvider } from "./providers/geminiProvider";
import { OpenAIProvider } from "./providers/openaiProvider";

let defaultProvider: AIProvider | null = null;

/**
 * Get or initialize the configured AI provider.
 * Selection priority:
 * 1. AI_PROVIDER env var ("mock" | "gemini" | "openai")
 * 2. If AI_API_KEY / GEMINI_API_KEY exists -> GeminiAIProvider
 * 3. Default fallback -> MockAIProvider
 */
export function getAIProvider(): AIProvider {
  if (defaultProvider) return defaultProvider;

  const providerType = (process.env.AI_PROVIDER || "").toLowerCase().trim();

  if (providerType === "gemini") {
    defaultProvider = new GeminiAIProvider();
  } else if (providerType === "openai") {
    defaultProvider = new OpenAIProvider();
  } else if (providerType === "mock") {
    defaultProvider = new MockAIProvider();
  } else {
    // Auto-detect based on presence of API keys
    if (process.env.GEMINI_API_KEY || (process.env.AI_API_KEY && process.env.AI_API_KEY.startsWith("AIza"))) {
      defaultProvider = new GeminiAIProvider();
    } else if (process.env.OPENAI_API_KEY || (process.env.AI_API_KEY && process.env.AI_API_KEY.startsWith("sk-"))) {
      defaultProvider = new OpenAIProvider();
    } else {
      defaultProvider = new MockAIProvider();
    }
  }

  return defaultProvider;
}

export function setAIProvider(provider: AIProvider) {
  defaultProvider = provider;
}
