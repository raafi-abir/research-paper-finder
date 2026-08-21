// lib/ai/providers/geminiProvider.ts
import { z } from "zod";
import { AIProvider } from "../types";

export class GeminiAIProvider implements AIProvider {
  name = "gemini";
  private apiKey: string;
  private model: string;

  constructor(apiKey?: string, model?: string) {
    this.apiKey = apiKey || process.env.AI_API_KEY || process.env.GEMINI_API_KEY || "";
    this.model = model || process.env.AI_MODEL || "gemini-1.5-flash";
    if (!this.apiKey) {
      console.warn("GeminiAIProvider initialized without AI_API_KEY / GEMINI_API_KEY. Will fallback to mock if invoked without key.");
    }
  }

  async generateStructured<T>(
    prompt: string,
    schema: z.ZodType<T>,
    systemPrompt?: string
  ): Promise<T> {
    if (!this.apiKey) {
      throw new Error("AI_API_KEY or GEMINI_API_KEY is not configured on the server.");
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent?key=${this.apiKey}`;

    const payload = {
      systemInstruction: systemPrompt
        ? {
            parts: [{ text: systemPrompt }],
          }
        : undefined,
      contents: [
        {
          role: "user",
          parts: [
            {
              text: `${prompt}\n\nIMPORTANT: Return ONLY a valid JSON object matching the required schema. Do not wrap in markdown or backticks.`,
            },
          ],
        },
      ],
      generationConfig: {
        responseMimeType: "application/json",
        temperature: 0.1,
      },
    };

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errText = await response.text().catch(() => "");
      throw new Error(`Gemini API error (${response.status}): ${errText.slice(0, 200)}`);
    }

    const data = await response.json();
    const candidateText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!candidateText) {
      throw new Error("Gemini returned an empty response.");
    }

    const parsedJson = JSON.parse(candidateText);
    return schema.parse(parsedJson);
  }
}
