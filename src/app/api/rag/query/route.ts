// src/app/api/rag/query/route.ts
import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin as supabase } from "@/lib/supabase";
import { openai, EMBEDDINGS_MODEL, CHAT_MODEL } from "@/lib/openia";
export const runtime = "nodejs";
export async function POST(req: NextRequest) {
  try {
    const { query, documentId, k = 5 } = await req.json();
    if (!query || typeof query !== "string") {
      return NextResponse.json({ ok: false, error: "query required" }, { status: 400 });
    }

    // 1) embed da pergunta
    const emb = await openai.embeddings.create({
      model: EMBEDDINGS_MODEL,
      input: query,
    });
    const v = emb.data[0].embedding as unknown as number[];

    // 2) busca vetorial (pgvector RPC)
    const { data, error } = await supabase.rpc("match_chunks", {
      query_embedding: v,
      match_count: k,
      filter_document_id: documentId || null,
    });
    if (error) throw error;

    // 3) contexto + chamada ao modelo
    const context = (data as any[])
      .map((r) => r.content)
      .join("\n---\n")
      .slice(0, 12000);

    const system =
      "Você é um assistente em pt-BR. Responda estritamente com base no CONTEXTO; se a informação não estiver no contexto, informe claramente que não foi encontrada nas fontes.";
    const user = `PERGUNTA: ${query}\n\nCONTEXTO:\n${context}`;

    const chat = await openai.chat.completions.create({
      model: CHAT_MODEL,
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
      temperature: 0.2,
    });

    return NextResponse.json({
      ok: true,
      answer: chat.choices[0]?.message?.content ?? "",
      references: (data as any[]).map((d) => ({
        document_id: d.document_id,
        chunk_index: d.chunk_index,
      })),
    });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message }, { status: 400 });
  }
}
