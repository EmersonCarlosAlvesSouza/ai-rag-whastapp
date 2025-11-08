# PROCESSO

Documenta como o projeto foi construído, decisões e prompts usados.

## 1) Inicialização
- Next.js (App Router) + TypeScript
- Setup de envs e `.gitignore` para evitar vazamento de segredos

**Commit**  
`[MANUAL] Clean up AI-generated initial setup (env files + security)`

---

## 2) Supabase + pgvector
- Criação das tabelas `rag_documents`, `rag_chunks`, índice `ivfflat` e RPC `match_chunks`.

**Commit**  
`[MANUAL] Create Supabase schema (pgvector + tables + RPC)`

---

## 3) Upload (RAG Ingest)
- Endpoint `POST /api/rag/upload` (PDF/TXT/MD)  
- Parsing com `pdf-parse` e `gray-matter`  
- Chunking com overlap + embeddings via OpenRouter → Supabase

**Prompt**  
> Add endpoint to receive PDF/TXT/MD via multipart/form-data, extract text, chunk with overlap, embed using text-embedding-3-small and store chunks+embeddings in Supabase (pgvector).

**Commit**  
`[AI] Implement document upload` — **Prompt:** (acima)

---

## 4) Query (RAG Retrieve + Generate)
- Endpoint `POST /api/rag/query`  
- Gera embedding da pergunta, chama `match_chunks` (pgvector) e cria resposta **grounded** com o modelo configurado.

**Prompt**  
> Build Next.js route to embed the query, call Supabase RPC (pgvector) to fetch top-k chunks, and generate a grounded answer using the configured chat model.

**Commit**  
`[AI] RAG query endpoint` — **Prompt:** (acima)

---

## 5) Webhook (Evolution)
- `GET /api/webhook` (verificação por `WEBHOOK_VERIFY_TOKEN`)
- `POST /api/webhook` extrai número/texto, chama `/api/rag/query` e envia via `sendText`.
- Modo **DRY-RUN** quando não há `EVOLUTION_INSTANCE`.

**Prompt**  
> Implement webhook to receive Evolution events, validate GET token, extract phone/text, query the RAG endpoint and reply via sendText. Add dry-run mode when instance is missing.

**Commits**
- `[AI] WhatsApp Evolution webhook + reply via RAG` — **Prompt:** (acima)  
- `[MANUAL] Make WhatsApp sending optional (dry-run when instance missing)`

---

## 6) Listar/Deletar documentos
- `GET /api/rag/list` e `DELETE /api/rag/delete/:id` (cascade)

**Prompt**  
> Create Next.js routes to list documents with chunk counts and delete a document by id (cascade via FK).

**Commit**  
`[AI] Implement RAG list and delete endpoints` — **Prompt:** (acima)

---

## 7) UI de Configurações
- `src/app/settings/page.tsx` armazena **model** e **system prompt** em `localStorage`.

**Prompt**  
> Create a client page that stores model and system prompt in localStorage (no API key persisted on client).

**Commit**  
`[AI] Add Settings page (model + system prompt)` — **Prompt:** (acima)

---

## 8) UI de Chat
- `src/app/chat/page.tsx` com histórico local e chamada ao `/api/rag/query`.

**Prompt**  
> Build a simple client chat that stores history in localStorage and posts questions to /api/rag/query.

**Commit**  
`[AI] Add Chat page (local history, calls RAG backend)` — **Prompt:** (acima)

---

## 9) Observações de Integração (Evolution)
- Alguns hosts exigem `EVOLUTION_INSTANCE`. Como o desafio não forneceu, o projeto opera em **DRY-RUN** até a instância ser informada.  
- Quando a instância existir, basta:
  - Definir `EVOLUTION_INSTANCE=meu-bot`
  - Remover `DRY_RUN_WHATSAPP=1`
  - Reiniciar a aplicação

---

## 10) Deploy
- Vercel com as envs de produção
- `NEXT_PUBLIC_BASE_URL=https://SEU-APP.vercel.app`
- Apontar o webhook do Evolution para `.../api/webhook?verify_token=...`