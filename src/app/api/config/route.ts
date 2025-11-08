import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

// GET: retorna a config (db se existir; senão, defaults do .env)
export async function GET() {
  const { data, error } = await supabaseAdmin
    .from("app_config")
    .select("*")
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error("[config/GET]", error);
  }

  return NextResponse.json(
    data ?? {
      system_prompt: process.env.SYSTEM_PROMPT_DEFAULT ?? "",
      openrouter_model: process.env.OPENROUTER_MODEL ?? "openai/gpt-4o-mini",
      embeddings_model: process.env.EMBEDDINGS_MODEL ?? "openai/text-embedding-3-small",
    }
  );
}

// POST: upsert de uma única linha de config
export async function POST(req: NextRequest) {
  const body = await req.json();

  const payload = {
    system_prompt: String(body.system_prompt ?? ""),
    openrouter_model: String(body.openrouter_model ?? "openai/gpt-4o-mini"),
    embeddings_model: String(body.embeddings_model ?? "openai/text-embedding-3-small"),
    updated_at: new Date().toISOString(),
  };

  // estratégia simples: insere sempre; mantém só a mais recente para leitura
  const { data, error } = await supabaseAdmin.from("app_config").insert(payload).select().single();

  if (error) {
    console.error("[config/POST]", error);
    return NextResponse.json({ error }, { status: 500 });
  }

  return NextResponse.json({ saved: true, data });
}
