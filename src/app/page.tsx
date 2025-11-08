// src/app/page.tsx
import Link from "next/link";

export default function Home() {
  return (
    <main
      style={{
        minHeight: "100vh",
        background: "linear-gradient(180deg,#f8fafc,#eef2f7)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
        fontFamily:
          "Inter, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 920,
          display: "grid",
          gridTemplateColumns: "1.1fr 1fr",
          gap: 28,
          alignItems: "center",
        }}
      >
        {/* Hero */}
        <section>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "6px 10px",
              borderRadius: 999,
              background: "#e6f0ff",
              color: "#1d4ed8",
              fontWeight: 600,
              fontSize: 12,
              marginBottom: 14,
            }}
          >
            <span>⚡</span> Chat de IA com RAG + WhatsApp
          </div>

          <h1
            style={{
              fontSize: 44,
              fontWeight: 800,
              lineHeight: 1.1,
              margin: 0,
              color: "#0f172a",
            }}
          >
            RAG WhatsApp
          </h1>

          <p
            style={{
              marginTop: 12,
              color: "#475569",
              fontSize: 18,
              lineHeight: 1.6,
            }}
          >
            Faça upload de documentos, busque por contexto e responda
            automaticamente via WhatsApp (Evolution API). Interface de testes e
            painel de configurações inclusos.
          </p>

          <div style={{ display: "flex", gap: 12, marginTop: 22 }}>
            <Link
              href="/chat"
              style={{
                padding: "12px 16px",
                background: "#111827",
                color: "#fff",
                borderRadius: 10,
                fontWeight: 600,
                textDecoration: "none",
              }}
            >
              Abrir Chat
            </Link>

            <Link
              href="/settings"
              style={{
                padding: "12px 16px",
                background: "#ffffff",
                border: "1px solid #e5e7eb",
                color: "#111827",
                borderRadius: 10,
                fontWeight: 600,
                textDecoration: "none",
              }}
            >
              Configurações
            </Link>
          </div>

          <div
            style={{
              marginTop: 16,
              fontSize: 12,
              color: "#64748b",
            }}
          >
            Deploy: Vercel • Vetores: Supabase/pgvector • Modelos: OpenRouter
          </div>
        </section>

        {/* Cards */}
        <section
          style={{
            display: "grid",
            gridTemplateColumns: "1fr",
            gap: 14,
          }}
        >
          <HomeCard
            title="Chat"
            href="/chat"
            icon="💬"
            desc="Converse com a IA usando RAG. Histórico local e respostas baseadas nos seus documentos."
          />
          <HomeCard
            title="Docs"
            href="/docs"
            icon="📄"
            desc="Envie PDFs/TXT/MD e gerencie seus documentos para compor o contexto do chat."
          />
          <HomeCard
            title="Settings"
            href="/settings"
            icon="⚙️"
            desc="Escolha o modelo e ajuste o System Prompt. (Chaves ficam seguras no servidor.)"
          />
        </section>
      </div>
    </main>
  );
}

function HomeCard({
  title,
  desc,
  href,
  icon,
}: {
  title: string;
  desc: string;
  href: string;
  icon: string;
}) {
  return (
    <Link href={href} style={{ textDecoration: "none" }}>
      <div
        style={{
          borderRadius: 14,
          background: "#ffffff",
          border: "1px solid #e5e7eb",
          boxShadow: "0 6px 20px rgba(2, 6, 23, .06)",
          padding: 18,
        }}
      >
        <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              background: "#f1f5f9",
              display: "grid",
              placeItems: "center",
              fontSize: 22,
            }}
            aria-hidden
          >
            {icon}
          </div>
          <div>
            <h3
              style={{
                margin: "2px 0 6px",
                color: "#0f172a",
                fontSize: 18,
                fontWeight: 700,
              }}
            >
              {title}
            </h3>
            <p style={{ margin: 0, color: "#475569", fontSize: 14, lineHeight: 1.6 }}>
              {desc}
            </p>
          </div>
        </div>
      </div>
    </Link>
  );
}
