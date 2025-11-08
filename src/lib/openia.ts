import OpenAI from "openai";
import "server-only";

export const openai = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY!,
  baseURL: "https://openrouter.ai/api/v1",
});

export const EMBEDDINGS_MODEL =
  process.env.EMBEDDINGS_MODEL || "openai/text-embedding-3-small";

export const CHAT_MODEL =
  process.env.OPENROUTER_MODEL || "openai/gpt-4o-mini";
