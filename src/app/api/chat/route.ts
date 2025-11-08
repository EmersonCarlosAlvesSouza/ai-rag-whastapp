import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

type Msg = { role: "system" | "user" | "assistant"; content: string };

async function getWebConversationId() {
  // pega (ou cria) uma conversa padrão do canal "web"
  const { data: existing, error: e1 } = await supabaseAdmin
    .from("conversations")
    .select("*")
    .eq("channel", "web")
    .limit(1)
    .maybeSingle();
  if (e1) console.error("[chat] get conv", e1);
  if (existing) return existing.id;

  const { data: created, error: e2 } = await supabaseAdmin
    .from("conversations")
    .insert({ channel: "web", title: "Chat Local" })
    .select()
    .single();
  if (e2) throw e2;
  return created.id;
}

async function saveMessage(conversation_id: string, role: "system" | "user" | "assistant", content: string) {
  const { error } = await supabaseAdmin.from("messages").insert({ conversation_id, role, content });
  if (error) console.error("[chat] save message", error);
}

async function callOpenRouter(messages: Msg[], model: string, apiKey: string) {
  const r = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "https://your-app.vercel.app",
      "X-Title": "RAG WhatsApp",
    },
    body: JSON.stringify({ model, messages, stream: false }),
  });
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}

export async function POST(req: NextRequest) {
  if (!process.env.OPENROUTER_API_KEY) {
    return NextResponse.json({ error: "Missing OPENROUTER_API_KEY" }, { status: 500 });
  }

  const { message, model: mOverride, systemPrompt: spOverride } = await req.json();
  const model = mOverride || process.env.OPENROUTER_MODEL || "openai/gpt-4o-mini";
  const systemPrompt = spOverride || process.env.SYSTEM_PROMPT_DEFAULT || "Você é um assistente útil em pt-BR.";

  // conversa + mensagem do usuário
  const conversationId = await getWebConversationId();
  await saveMessage(conversationId, "user", String(message ?? ""));

  // chamada à IA
  const messages: Msg[] = [
    { role: "system", content: systemPrompt },
    { role: "user", content: String(message ?? "") },
  ];
  const completion = await callOpenRouter(messages, model, process.env.OPENROUTER_API_KEY!);
  const answer = completion?.choices?.[0]?.message?.content ?? "Não consegui responder agora.";

  // salva resposta
  await saveMessage(conversationId, "assistant", answer);

  return NextResponse.json({ answer, modelUsed: model, conversationId });
}
