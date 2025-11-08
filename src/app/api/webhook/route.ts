import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const payload = await req.json();
  console.log('[WEBHOOK] payload:', JSON.stringify(payload));
  // Em breve: IA + RAG + resposta via Evolution
  return NextResponse.json({ ok: true });
}
