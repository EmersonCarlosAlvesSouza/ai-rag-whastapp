import { NextRequest, NextResponse } from "next/server";
import pdfParse from "pdf-parse";
import matter from "gray-matter";
import { supabaseAdmin as supabase } from "@/lib/supabase";
import { openai, EMBEDDINGS_MODEL } from "@/lib/openia";
import { chunkText } from "@/lib/chunk";
export const runtime = "nodejs";

async function fileToText(file: File): Promise<string> {
  const buf = Buffer.from(await file.arrayBuffer());
  const name = file.name.toLowerCase();
  const mime = file.type || "";

  if (mime.includes("pdf") || name.endsWith(".pdf")) {
    const parsed = await pdfParse(buf);
    return parsed.text;
  }
  if (name.endsWith(".md") || mime.includes("markdown")) {
    const { content } = matter(buf.toString("utf8"));
    return content;
  }
  // txt / fallback
  return buf.toString("utf8");
}

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();
    const file = form.get("file") as File | null;
    if (!file) {
      return NextResponse.json({ ok: false, error: "file is required" }, { status: 400 });
    }

    const text = (await fileToText(file)).replace(/\s+\n/g, "\n").trim();
    if (!text) {
      return NextResponse.json({ ok: false, error: "empty content" }, { status: 400 });
    }

    // cria documento
    const { data: doc, error: docErr } = await supabase
      .from("rag_documents")
      .insert([{ filename: file.name, mime_type: file.type || "text/plain" }])
      .select()
      .single();
    if (docErr) throw docErr;

    // chunk + embed
    const chunks = chunkText(text);
    const emb = await openai.embeddings.create({
      model: EMBEDDINGS_MODEL,
      input: chunks,
    });

    const rows = chunks.map((c, i) => ({
      document_id: doc.id,
      chunk_index: i,
      content: c,
      embedding: emb.data[i].embedding as unknown as number[],
    }));

    const { error: insErr } = await supabase.from("rag_chunks").insert(rows);
    if (insErr) throw insErr;

    return NextResponse.json({ ok: true, documentId: doc.id, chunks: chunks.length });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message }, { status: 400 });
  }
}
