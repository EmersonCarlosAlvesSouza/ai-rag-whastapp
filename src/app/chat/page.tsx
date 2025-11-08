"use client";
import { useState } from "react";

export default function ChatPage() {
  const [input, setInput] = useState("");
  const [items, setItems] = useState<{role:"user"|"assistant"; content:string}[]>([]);
  const [loading, setLoading] = useState(false);

  const send = async () => {
    if (!input.trim()) return;
    const userMsg = input.trim();
    setItems(prev => [...prev, { role: "user", content: userMsg }]);
    setInput("");
    setLoading(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMsg })
      });
      const data = await res.json();
      setItems(prev => [...prev, { role: "assistant", content: data.answer || "(sem resposta)" }]);
    } catch (e:any) {
      setItems(prev => [...prev, { role: "assistant", content: "Erro ao chamar a IA." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={{ padding: 24 }}>
      <h1>Chat (local)</h1>
      <div style={{ border: "1px solid #ddd", padding: 12, height: 360, overflowY: "auto", marginBottom: 12 }}>
        {items.map((m, i) => (
          <div key={i} style={{ marginBottom: 8 }}>
            <b>{m.role === "user" ? "Você" : "Assistente"}:</b> {m.content}
          </div>
        ))}
        {loading && <div>pensando…</div>}
      </div>
      <input
        value={input}
        onChange={e=>setInput(e.target.value)}
        onKeyDown={e=> e.key === "Enter" ? send() : null}
        placeholder="Pergunte algo…"
        style={{ width: 420 }}
      />
      <button onClick={send} style={{ marginLeft: 8 }}>Enviar</button>
    </main>
  );
}
