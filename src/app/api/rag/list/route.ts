import { NextResponse } from "next/server";
import { supabaseAdmin as supabase } from "@/lib/supabase";

export async function GET() {
  const { data, error } = await supabase
    .from("rag_documents")
    .select("id, filename, mime_type, created_at, rag_chunks(count)")
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 400 });

  const rows = (data || []).map((d: any) => ({
    id: d.id,
    filename: d.filename,
    mime_type: d.mime_type,
    created_at: d.created_at,
    chunks: d.rag_chunks?.[0]?.count ?? 0,
  }));

  return NextResponse.json({ ok: true, documents: rows });
}
