"use client";
import { useEffect, useState } from "react";

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [system_prompt, setSP] = useState("");
  const [openrouter_model, setModel] = useState("");
  const [embeddings_model, setEmb] = useState("");
  const [msg, setMsg] = useState("");

  useEffect(() => {
    (async () => {
      const r = await fetch("/api/config");
      const j = await r.json();
      setSP(j.system_prompt ?? "");
      setModel(j.openrouter_model ?? "");
      setEmb(j.embeddings_model ?? "");
      setLoading(false);
    })();
  }, []);

  const save = async () => {
    setMsg("");
    const r = await fetch("/api/config", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        system_prompt,
        openrouter_model,
        embeddings_model,
      }),
    });
    if (r.ok) setMsg("Configuração salva!");
    else setMsg("Erro ao salvar.");
  };

  if (loading) return <main style={{ padding: 24 }}>Carregando…</main>;
  return (
    <main style={{ padding: 24, maxWidth: 800 }}>
      <h1>Configurações</h1>
      <label>System Prompt</label>
      <textarea value={system_prompt} onChange={e => setSP(e.target.value)} rows={6} style={{ width: "100%" }} />
      <br /><br />
      <label>Modelo (OpenRouter)</label>
      <input value={openrouter_model} onChange={e => setModel(e.target.value)} style={{ width: "100%" }} />
      <br /><br />
      <label>Embeddings</label>
      <input value={embeddings_model} onChange={e => setEmb(e.target.value)} style={{ width: "100%" }} />
      <br /><br />
      <button onClick={save}>Salvar</button>
      {msg && <p>{msg}</p>}
    </main>
  );
}
