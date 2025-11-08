import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin as supabase } from "@/lib/supabase";

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params;
  const { error } = await supabase.from("rag_documents").delete().eq("id", id);
  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}
