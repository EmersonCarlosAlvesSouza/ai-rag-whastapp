
import "server-only";
import { NextRequest, NextResponse } from "next/server";
import { sendText } from "@/lib/evolution";

function getBaseUrl(req: NextRequest) {
  return (
    process.env.NEXT_PUBLIC_BASE_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : req.nextUrl.origin)
  );
}

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("verify_token");
  const ok = token === process.env.WEBHOOK_VERIFY_TOKEN;
  return NextResponse.json({ ok }, { status: ok ? 200 : 401 });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    let from: string | undefined;
    let text: string | undefined;

    if (body?.data?.key?.remoteJid && body?.data?.message) {
      from = String(body.data.key.remoteJid).replace("@s.whatsapp.net", "");
      text =
        body.data.message?.conversation ||
        body.data.message?.extendedTextMessage?.text ||
        body.data.message?.imageMessage?.caption ||
        body.data.message?.videoMessage?.caption;
    }
    if (!from && body?.phone) from = String(body.phone);
    if (!text && body?.text) text = body.text;

    if (from && text) {
      const base = getBaseUrl(req);
      const ragUrl = new URL("/api/rag/query", base).toString();

      const rag = await fetch(ragUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: text }),
      }).then((r) => r.json());

      const answer = rag?.answer ?? "Não encontrei essa informação nas minhas fontes.";
      await sendText(from, String(answer).slice(0, 3000));
    }

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 400 });
  }
}
