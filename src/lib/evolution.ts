const base = process.env.EVOLUTION_BASE_URL!;
const instance = process.env.EVOLUTION_INSTANCE!;
const apiKey = process.env.EVOLUTION_API_KEY!;

export async function evoSendText(number: string, text: string) {
  const res = await fetch(`${base}/message/sendText/${instance}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'apikey': apiKey },
    body: JSON.stringify({ number, text, linkPreview: true })
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}
