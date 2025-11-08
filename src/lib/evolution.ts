import "server-only";

const DRY = process.env.DRY_RUN_WHATSAPP === "1";

export async function sendText(to: string, text: string) {
  const baseURL = process.env.EVOLUTION_BASE_URL!;
  const apiKey  = process.env.EVOLUTION_API_KEY!;
  const instance = process.env.EVOLUTION_INSTANCE; // pode estar vazio

  if (!baseURL || !apiKey) {
    console.warn("[evolution] envs faltando: EVOLUTION_BASE_URL / EVOLUTION_API_KEY");
    return { ok: false, dryRun: true };
  }

  const number = to.includes("@") ? to : `${to}@s.whatsapp.net`;

  // Sem instance OU DRY-RUN → apenas loga e retorna ok
  if (!instance || DRY) {
    console.log("[evolution] DRY RUN (sem instance):", { number, text: text.slice(0, 120) });
    return { ok: true, dryRun: true };
  }

  const url = `${baseURL.replace(/\/+$/,"")}/message/sendText/${encodeURIComponent(instance)}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", apikey: apiKey },
    body: JSON.stringify({ number, text }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Evolution sendText failed: ${res.status} ${url} :: ${body}`);
  }
  return res.json().catch(() => ({}));
}
