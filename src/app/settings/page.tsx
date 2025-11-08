"use client";
import { useEffect, useState } from "react";

export default function SettingsPage() {
  const [model, setModel] = useState("openai/gpt-4o-mini");
  const [systemPrompt, setSystemPrompt] = useState("Você é um assistente útil em pt-BR.");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const m = localStorage.getItem("cfg:model");
    const s = localStorage.getItem("cfg:systemPrompt");
    if (m) setModel(m);
    if (s) setSystemPrompt(s);
  }, []);

  function save() {
    localStorage.setItem("cfg:model", model);
    localStorage.setItem("cfg:systemPrompt", systemPrompt);
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  }

  return (
    <main className="max-w-2xl mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Configurações</h1>

      <label className="block space-y-1">
        <span className="text-sm font-medium">Modelo</span>
        <input
          className="w-full border rounded p-2"
          value={model}
          onChange={(e) => setModel(e.target.value)}
          placeholder="openai/gpt-4o-mini, anthropic/claude-3-haiku, meta-llama/..."
        />
        <small className="text-gray-500">
          (Somente leitura no backend: OPENROUTER_API_KEY das envs do servidor)
        </small>
      </label>

      <label className="block space-y-1">
        <span className="text-sm font-medium">System Prompt</span>
        <textarea
          className="w-full border rounded p-2 min-h-[120px]"
          value={systemPrompt}
          onChange={(e) => setSystemPrompt(e.target.value)}
        />
      </label>

      <button onClick={save} className="px-4 py-2 rounded bg-black text-white">
        Salvar
      </button>
      {saved && <span className="text-green-600 ml-2">Salvo!</span>}
    </main>
  );
}
