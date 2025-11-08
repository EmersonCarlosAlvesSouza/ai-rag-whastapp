// src/app/chat/page.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

type Msg = {
  id: string;
  role: "user" | "assistant";
  content: string;
  sources?: { title?: string; snippet?: string }[];
  createdAt: number;
};

const LS_KEY = "rag_chat_history_v1";

export default function ChatPage() {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

  // carrega/salva histórico
  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (raw) setMessages(JSON.parse(raw));
    } catch {}
  }, []);
  useEffect(() => {
    try {
      localStorage.setItem(LS_KEY, JSON.stringify(messages));
    } catch {}
    // scroll pro fim
    listRef.current?.scrollTo({ top: 999999, behavior: "smooth" });
  }, [messages]);

  async function send() {
    const q = input.trim();
    if (!q || loading) return;

    const userMsg: Msg = {
      id: crypto.randomUUID(),
      role: "user",
      content: q,
      createdAt: Date.now(),
    };
    setInput("");
    setMessages((m) => [...m, userMsg]);
    setLoading(true);

    try {
      const r = await fetch("/api/rag/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: q, k: 5 }),
      });

      const j = await r.json();

      // tenta extrair resposta e fontes de formas comuns
      const answer: string =
        j.answer ?? j.content ?? j.text ?? j.response ?? JSON.stringify(j);
      const sources =
        j.sources ??
        j.context ??
        j.matches ??
        j.topK ??
        undefined;

      const botMsg: Msg = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: String(answer || "Sem resposta."),
        sources:
          Array.isArray(sources)
            ? sources.map((s: any) => ({
                title: s.title ?? s.filename ?? s.name,
                snippet:
                  s.snippet ??
                  s.content?.slice?.(0, 320) ??
                  s.text?.slice?.(0, 320),
              }))
            : undefined,
        createdAt: Date.now(),
      };

      setMessages((m) => [...m, botMsg]);
    } catch (e: any) {
      const botMsg: Msg = {
        id: crypto.randomUUID(),
        role: "assistant",
        content:
          "Ocorreu um erro ao consultar o RAG. Verifique o console e as variáveis de ambiente.",
        createdAt: Date.now(),
      };
      setMessages((m) => [...m, botMsg]);
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  }

  function clearChat() {
    if (confirm("Limpar histórico do chat?")) {
      setMessages([]);
      localStorage.removeItem(LS_KEY);
    }
  }

  return (
    <div style={styles.shell}>
      {/* Topbar */}
      <header style={styles.header}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Link href="/" style={styles.link}>
            ← Home
          </Link>
          <h1 style={styles.title}>Chat (RAG)</h1>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <Link href="/docs" style={styles.secondaryBtn}>
            Docs
          </Link>
          <Link href="/settings" style={styles.secondaryBtn}>
            Settings
          </Link>
          <button onClick={clearChat} style={styles.ghostBtn}>
            Limpar
          </button>
        </div>
      </header>

      {/* Lista de mensagens */}
      <div ref={listRef} style={styles.messages}>
        {messages.length === 0 && (
          <div style={styles.empty}>
            <div style={styles.emptyBadge}>Pronto para conversar</div>
            <p style={styles.emptyText}>
              Envie uma pergunta. Se você já fez upload de documentos, a IA vai
              usar o conteúdo como contexto.
            </p>
          </div>
        )}

        {messages.map((m) => (
          <Bubble key={m.id} msg={m} />
        ))}

        {loading && <Typing />}
      </div>

      {/* Input */}
      <div style={styles.inputBar}>
        <textarea
          placeholder="Pergunte algo sobre os documentos… (Shift+Enter para nova linha)"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={onKeyDown}
          rows={2}
          style={styles.textarea}
        />
        <button onClick={send} disabled={loading || !input.trim()} style={styles.sendBtn}>
          {loading ? "Enviando…" : "Enviar"}
        </button>
      </div>
    </div>
  );
}

function Bubble({ msg }: { msg: Msg }) {
  const isUser = msg.role === "user";
  return (
    <div
      style={{
        display: "flex",
        justifyContent: isUser ? "flex-end" : "flex-start",
      }}
    >
      <div
        style={{
          maxWidth: 760,
          borderRadius: 14,
          padding: "12px 14px",
          lineHeight: 1.6,
          fontSize: 15,
          whiteSpace: "pre-wrap",
          background: isUser ? "#111827" : "#ffffff",
          color: isUser ? "#fff" : "#0f172a",
          border: isUser ? "1px solid #111827" : "1px solid #e5e7eb",
          boxShadow: isUser
            ? "0 4px 14px rgba(0,0,0,.15)"
            : "0 4px 14px rgba(2,6,23,.06)",
        }}
      >
        {msg.content}
        {/* fontes (se houverem) */}
        {msg.sources && msg.sources.length > 0 && (
          <div style={{ marginTop: 8, borderTop: "1px dashed #e5e7eb", paddingTop: 8 }}>
            <div style={{ fontSize: 12, color: "#64748b", marginBottom: 6 }}>
              Fontes:
            </div>
            <ul style={{ margin: 0, paddingLeft: 16 }}>
              {msg.sources.slice(0, 3).map((s, i) => (
                <li key={i} style={{ color: "#475569", fontSize: 13 }}>
                  <strong>{s.title ?? "Documento"}</strong>
                  {s.snippet ? ` — ${s.snippet}` : null}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

function Typing() {
  return (
    <div style={{ display: "flex", justifyContent: "flex-start" }}>
      <div style={{ ...styles.typing, ...styles.bubbleBase }}>
        <span style={styles.dot} />
        <span style={{ ...styles.dot, animationDelay: "120ms" }} />
        <span style={{ ...styles.dot, animationDelay: "240ms" }} />
      </div>
      <style>{`
        @keyframes blink {
          0%, 80%, 100% { opacity: .2; transform: translateY(0); }
          40% { opacity: 1; transform: translateY(-2px); }
        }
      `}</style>
    </div>
  );
}

/* ---------- styles ---------- */
const styles: Record<string, React.CSSProperties> = {
  shell: {
    minHeight: "100vh",
    background: "linear-gradient(180deg,#f8fafc,#eef2f7)",
    display: "grid",
    gridTemplateRows: "auto 1fr auto",
    fontFamily:
      "Inter, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
    padding: "16px 20px",
    background: "#ffffffcc",
    borderBottom: "1px solid #e5e7eb",
    backdropFilter: "saturate(150%) blur(4px)",
    position: "sticky",
    top: 0,
    zIndex: 10,
  },
  title: { margin: 0, fontSize: 22, fontWeight: 800, color: "#0f172a" },
  link: {
    color: "#111827",
    textDecoration: "none",
    fontWeight: 600,
    border: "1px solid #e5e7eb",
    padding: "6px 10px",
    borderRadius: 8,
    background: "#fff",
  },
  secondaryBtn: {
    color: "#111827",
    textDecoration: "none",
    fontWeight: 600,
    border: "1px solid #e5e7eb",
    padding: "8px 12px",
    borderRadius: 8,
    background: "#fff",
  },
  ghostBtn: {
    color: "#64748b",
    background: "transparent",
    border: "1px solid #e5e7eb",
    padding: "8px 12px",
    borderRadius: 8,
    cursor: "pointer",
    fontWeight: 600,
  },
  messages: {
    padding: "20px",
    display: "grid",
    gap: 12,
    overflowY: "auto",
  },
  empty: {
    margin: "40px auto",
    textAlign: "center",
    maxWidth: 560,
  },
  emptyBadge: {
    display: "inline-block",
    background: "#e6f0ff",
    color: "#1d4ed8",
    fontWeight: 700,
    fontSize: 12,
    padding: "6px 10px",
    borderRadius: 999,
    marginBottom: 10,
  },
  emptyText: { margin: 0, color: "#475569" },
  inputBar: {
    display: "grid",
    gridTemplateColumns: "1fr auto",
    gap: 10,
    padding: 16,
    background: "#ffffffcc",
    borderTop: "1px solid #e5e7eb",
    backdropFilter: "saturate(150%) blur(4px)",
  },
  textarea: {
    width: "100%",
    padding: "12px 14px",
    borderRadius: 10,
    border: "1px solid #cbd5e1",
    outline: "none",
    fontSize: 15,
    resize: "none",
    background: "#fff",
  },
  sendBtn: {
    padding: "12px 18px",
    borderRadius: 10,
    border: "1px solid #111827",
    background: "#111827",
    color: "#fff",
    fontWeight: 700,
    cursor: "pointer",
    minWidth: 110,
  },
  bubbleBase: {
    maxWidth: 760,
    borderRadius: 14,
    padding: "12px 14px",
    background: "#ffffff",
    border: "1px solid #e5e7eb",
  },
  typing: {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    padding: "10px 12px",
    background: "#fff",
    border: "1px solid #e5e7eb",
    borderRadius: 12,
    boxShadow: "0 4px 14px rgba(2,6,23,.06)",
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 999,
    background: "#94a3b8",
    animation: "blink 1.2s infinite both",
  },
};
