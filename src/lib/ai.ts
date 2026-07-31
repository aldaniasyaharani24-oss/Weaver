import { createGroq } from "@ai-sdk/groq";

const apiKey = process.env.GROQ_API_KEY;

export const groq = createGroq({
  apiKey: apiKey ?? "missing",
});

// Model Groq yang tersedia secara gratis dan cepat
// llama-3.3-70b-versatile — pintar, cocok untuk summary & analisis
// llama-3.1-8b-instant    — lebih cepat, cocok untuk generate task
export const AI_MODEL = "llama-3.3-70b-versatile";
export const AI_MODEL_FAST = "llama-3.1-8b-instant";

/** Cek apakah API key sudah dikonfigurasi */
export function isAIConfigured(): boolean {
  return !!apiKey && apiKey !== "your_groq_api_key_here" && apiKey.startsWith("gsk_");
}
