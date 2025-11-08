export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin as supabase } from "@/lib/supabase";

// NOTE: em Next recente, `params` pode vir como Promise
export async function DELETE(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params; // <-- pegue o id aguardando a Promise

  const { error } = await supabase.from("rag_documents").delete().eq("id", id);
  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 400 });
  }
  return NextResponse.json({ ok: true });
}
