type Msg = { role: 'system'|'user'|'assistant'; content: string };

export async function orChat(messages: Msg[], model = process.env.OPENROUTER_MODEL!) {
  const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://your-app.vercel.app',
      'X-Title': 'RAG WhatsApp'
    },
    body: JSON.stringify({ model, messages, stream: false })
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}
