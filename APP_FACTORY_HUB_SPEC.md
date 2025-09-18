
APP_FACTORY_HUB_SPEC.md

App Factory Hub — Especificação Completa (Cursor-ready)

0. Objetivo e Escopo

Objetivo: criar um webapp único que centraliza meu fluxo de criação de apps:
Cursor → GitHub (template) → (Firebase | Supabase) → Vercel.
O Hub deve:
	•	Criar projetos a partir do template app-factory-template no GitHub.
	•	Gerar/Escrever arquivos do Playbook (AGENTS.md etc.) no novo repo.
	•	Exibir taskboard/kanban (Sprint 0/1/2) e checklists (QA, Growth, UX).
	•	Exibir biblioteca de templates/prompts do Playbook (copy-to-clipboard).
	•	Integrar Google Calendar (mostrar próximos eventos e agendar blocos).
	•	Suportar stack por projeto: firebase (padrão) ou supabase.
	•	Ter módulo financeiro: custos fixos (Cursor, ChatGPT, Vercel, etc.), infra (Firebase/Supabase), custo por usuário e por projeto.
	•	Incluir agentes LLM (OpenAI) para sugestões de próximos passos, nichos e melhorias.
	•	Autenticação via GitHub OAuth (NextAuth); uso individual (apenas minha conta).

Não Objetivos (v1):
	•	Multi-tenant (vários usuários externos).
	•	Painéis públicos.
	•	Billing automático via APIs de provedores (pode ficar manual/semiautomático no v1).

⸻

1. Stack e Diretrizes
	•	Next.js 15 (App Router) + Vercel
	•	DB: Postgres (Supabase ou Vercel Postgres) + Prisma
	•	Auth: NextAuth (GitHub OAuth; Google OAuth para Calendar)
	•	UI: Tailwind + shadcn/ui (cards, dialog, checkbox, tabs, badge, progress)
	•	Estado: TanStack React Query
	•	LLM: OpenAI (API) para agentes
	•	Integrações: GitHub REST (template + contents), Google Calendar
	•	Estilo de código: TS estrito, módulos organizados, server components quando possível, rotas API em app/api/*.

Regras “anti-alucinação”:
	•	Não inventar campos fora dos contratos definidos abaixo.
	•	Não renomear tabelas, colunas, rotas ou parâmetros.
	•	Manter exatamente os schemas Prisma, contratos JSON e rotas aqui definidos.
	•	Em caso de dúvida, abortar trecho e inserir // TODO(ask-marcela).

⸻

2. Variáveis de Ambiente (.env.local)

NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=defina_um_secret_seguro

# GitHub OAuth (login)
GITHUB_ID=xxx
GITHUB_SECRET=xxx

# GitHub API (criar repos do template + escrever arquivos)
GITHUB_OWNER=cunhamarcela
GITHUB_TEMPLATE_REPO=app-factory-template
GITHUB_TOKEN=token_com_scopes_repo_e_workflow

# DB (Postgres)
DATABASE_URL=postgresql://postgres:PASS@HOST:5432/postgres?schema=public

# Google OAuth (Calendar)
GOOGLE_CLIENT_ID=xxx
GOOGLE_CLIENT_SECRET=xxx
GOOGLE_REDIRECT_URI=http://localhost:3000/api/auth/callback/google

# OpenAI (agentes)
OPENAI_API_KEY=sk-...


⸻

3. Estrutura de Pastas (esperada)

app-factory/
├─ app/
│  ├─ layout.tsx
│  ├─ page.tsx                      # Dashboard
│  ├─ projects/
│  │  ├─ new/page.tsx               # Wizard de novo projeto
│  │  ├─ [slug]/page.tsx            # Overview do projeto
│  │  ├─ [slug]/board/page.tsx      # Kanban (todo/doing/done; Sprint 0/1/2)
│  │  ├─ [slug]/checklists/page.tsx # Checklists QA/Growth/UX
│  │  └─ [slug]/templates/page.tsx  # Biblioteca: AGENTS, AUTH_SPEC, prompts
│  ├─ finances/page.tsx             # Dashboard financeiro consolidado
│  ├─ finances/[slug]/page.tsx      # Finanças por projeto
│  ├─ settings/integrations/page.tsx
│  └─ api/
│     ├─ auth/[...nextauth]/route.ts
│     ├─ github/create-repo/route.ts
│     ├─ github/write-files/route.ts
│     ├─ projects/route.ts
│     ├─ projects/[slug]/seed/route.ts
│     ├─ tasks/[id]/route.ts
│     ├─ finance/[slug]/records/route.ts
│     ├─ finance/aggregate/route.ts
│     ├─ calendar/events/route.ts
│     └─ agent/suggest/route.ts
├─ prisma/
│  └─ schema.prisma
├─ seeds/
│  ├─ tasks.sprint0.json
│  ├─ tasks.sprint1.json
│  ├─ tasks.sprint2.json
│  ├─ checklist.qa.json
│  ├─ checklist.growth.json
│  └─ checklist.ux.json
├─ lib/
│  ├─ prisma.ts
│  ├─ github.ts
│  ├─ calendar.ts
│  ├─ openai.ts
│  └─ utils.ts
├─ components/
│  ├─ Kanban.tsx
│  ├─ Checklist.tsx
│  ├─ TemplateViewer.tsx
│  ├─ CopyButton.tsx
│  ├─ FinanceCards.tsx
│  ├─ FinanceTable.tsx
│  └─ CalendarWidget.tsx
├─ public/
└─ package.json


⸻

4. Banco de Dados (Prisma)

Não alterar nomes de modelos/campos.

// prisma/schema.prisma
datasource db { provider = "postgresql"; url = env("DATABASE_URL") }
generator client { provider = "prisma-client-js" }

model User {
  id        String   @id @default(cuid())
  email     String?  @unique
  name      String?
  image     String?
  accounts  Account[]
  sessions  Session[]
  projects  Project[]
  createdAt DateTime @default(now())
}

model Project {
  id           String    @id @default(cuid())
  name         String
  slug         String    @unique
  niche        String?
  repoUrl      String?
  repoFullName String?
  stack        String    @default("firebase") // firebase | supabase
  status       String    @default("active")
  createdById  String
  createdBy    User      @relation(fields: [createdById], references: [id])
  tasks        Task[]
  checklists   Checklist[]
  finances     FinanceRecord[]
  createdAt    DateTime  @default(now())
  updatedAt    DateTime  @updatedAt
}

model Task {
  id         String   @id @default(cuid())
  projectId  String
  project    Project  @relation(fields: [projectId], references: [id])
  title      String
  sprint     String?  // "Sprint 0" | "Sprint 1" | "Sprint 2"
  status     String   @default("todo") // todo | doing | done
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt
}

model Checklist {
  id         String   @id @default(cuid())
  projectId  String
  project    Project  @relation(fields: [projectId], references: [id])
  type       String   // "QA_RELEASE" | "GROWTH_LAUNCH" | "UX_RETENTION"
  title      String
  items      Json     // [{id, label, done}]
  progress   Int      @default(0) // 0..100
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt
}

model FinanceRecord {
  id          String   @id @default(cuid())
  projectId   String?
  project     Project? @relation(fields: [projectId], references: [id])
  category    String   // infra | tool | subscription | user_cost
  provider    String   // firebase | supabase | cursor | chatgpt | vercel | other
  description String
  amount      Float
  currency    String   @default("BRL")
  recurring   Boolean  @default(false)
  period      String?  // monthly | yearly | one-time
  userId      String?  // opcional: custo por usuário (id externo)
  createdAt   DateTime @default(now())
}

/*** NextAuth ***/
model Account {
  id                String  @id @default(cuid())
  userId            String
  user              User    @relation(fields: [userId], references: [id], onDelete: Cascade)
  type              String
  provider          String
  providerAccountId String
  access_token      String?
  token_type        String?
  scope             String?
  expires_at        Int?
  refresh_token     String?
  id_token          String?
  @@unique([provider, providerAccountId])
}
model Session { id String @id @default(cuid()); sessionToken String @unique; userId String; user User @relation(fields: [userId], references: [id], onDelete: Cascade); expires DateTime }
model VerificationToken { identifier String; token String @unique; expires DateTime; @@unique([identifier, token]) }


⸻

5. Seeds (JSON fixos)

5.1 Tasks (TASKBOARD)

seeds/tasks.sprint0.json

[
  {"title":"Criar repo do template e copiar App Factory","sprint":"Sprint 0"},
  {"title":"Preencher APP_SPEC_TEMPLATE.md","sprint":"Sprint 0"},
  {"title":"Definir BACKEND_CONTRACT.yaml","sprint":"Sprint 0"},
  {"title":"Scaffolding Flutter (MVVM + Riverpod)","sprint":"Sprint 0"},
  {"title":"Configurar Auth (Apple/Google/Email)","sprint":"Sprint 0"},
  {"title":"Instrumentar Analytics mínimos","sprint":"Sprint 0"},
  {"title":"Implementar AdService (banner/interstitial/rewarded)","sprint":"Sprint 0"}
]

seeds/tasks.sprint1.json

[
  {"title":"Entregar 3–5 telas core","sprint":"Sprint 1"},
  {"title":"Conectar backend conforme contrato","sprint":"Sprint 1"},
  {"title":"Inserir Banner/Interstitial e 1 Rewarded","sprint":"Sprint 1"},
  {"title":"Validar eventos e caps de anúncios","sprint":"Sprint 1"}
]

seeds/tasks.sprint2.json

[
  {"title":"Empty states + loop diário + push básico","sprint":"Sprint 2"},
  {"title":"Assets de loja + primeiros anúncios pagos","sprint":"Sprint 2"},
  {"title":"QA completo e release beta","sprint":"Sprint 2"}
]

5.2 Checklists

seeds/checklist.qa.json

{
  "type":"QA_RELEASE",
  "title":"QA & Release Checklist",
  "items":[
    {"id":"auth","label":"Auth: login/logout/reset + deep links ok","done":false},
    {"id":"ads","label":"Ads: interstitial cap + rewarded entrega recompensa","done":false},
    {"id":"analytics","label":"Analytics: eventos mínimos disparam","done":false},
    {"id":"lgpd","label":"LGPD: consentimento salvo e respeitado","done":false},
    {"id":"build","label":"Build/TestFlight sem crashes no fluxo principal","done":false}
  ]
}

seeds/checklist.growth.json

{
  "type":"GROWTH_LAUNCH",
  "title":"Growth & Launch",
  "items":[
    {"id":"aso","label":"ASO: ícone + screenshots (2 variações)","done":false},
    {"id":"desc","label":"Descrição focada em benefícios + 3 keywords","done":false},
    {"id":"policy","label":"Política de privacidade publicada","done":false},
    {"id":"ads_campaigns","label":"2 vídeos + 2 estáticos; campanhas ativas","done":false},
    {"id":"metrics","label":"Monitorar CPI, IPM, D1, ARPDAU, eCPM, Fill","done":false}
  ]
}

seeds/checklist.ux.json

{
  "type":"UX_RETENTION",
  "title":"UX & Retention",
  "items":[
    {"id":"onboarding","label":"Onboarding ≤3 telas com promessa clara","done":false},
    {"id":"empty","label":"Empty states com CTA de ação","done":false},
    {"id":"feedback","label":"Feedback instantâneo pós-ação","done":false},
    {"id":"loop","label":"Loop diário (estreak leve)","done":false},
    {"id":"perf","label":"TTI < 2s, offline básico","done":false}
  ]
}


⸻

6. Rotas de API (contratos)

6.1 GitHub — criar repo do template

POST /api/github/create-repo
Body:

{ "name":"string", "description":"string" }

Response 200:

{ "repoUrl":"https://github.com/owner/name", "fullName":"owner/name" }

6.2 GitHub — escrever arquivos no repo

POST /api/github/write-files
Body:

{
  "fullName":"owner/name",
  "files":[
    {"path":"AGENTS.md", "content":"...md...", "message":"chore: add AGENTS.md"}
  ]
}

Response 200:

{ "results":[{"path":"AGENTS.md","ok":true}] }

6.3 Projetos

POST /api/projects → cria projeto
Body:

{
  "name":"Ray Club", "slug":"ray-club",
  "niche":"fitness", "stack":"firebase",
  "repoUrl":"https://github.com/owner/ray-club",
  "repoFullName":"owner/ray-club"
}

Response 200: { "project": Project }

POST /api/projects/[slug]/seed → cria tasks e checklists a partir de seeds/*

6.4 Tasks (Kanban)

PATCH /api/tasks/:id
Body: { "status":"todo|doing|done" }
Response 200: { "task": Task }

6.5 Finanças

GET /api/finance/[slug]/records → lista registros do projeto
POST /api/finance/[slug]/records → cria registro
Body:

{
  "category":"tool",
  "provider":"cursor",
  "description":"Assinatura mensal",
  "amount":20.0,
  "currency":"BRL",
  "recurring":true,
  "period":"monthly"
}

GET /api/finance/aggregate → consolida tudo
Response 200 (exemplo):

{
  "total_monthly": 450.0,
  "by_provider": {"cursor":20,"chatgpt":90,"firebase":150,"supabase":80,"vercel":50,"other":60},
  "per_project_user_cost": {"ray-club":1.25, "dermia":0.9}
}

6.6 Calendar

GET /api/calendar/events?range=week → próximos eventos (usar token Google do usuário)

6.7 Agente (LLM)

POST /api/agent/suggest
Body: { "slug":"ray-club" }
Response: lista de sugestões, riscos e prompts prontos para colar no Cursor.

⸻

7. UI/Fluxos por Página

7.1 Dashboard /
	•	Cards: Projetos ativos, Próximos eventos (Calendar), Resumo financeiro (total mensal).
	•	Tabela recente: últimos projetos e status.

7.2 Novo Projeto /projects/new
	•	Form: name, slug, niche, stack (firebase|supabase).
	•	Ações em sequência (com feedback visual):
	1.	POST /api/github/create-repo
	2.	POST /api/github/write-files (escrever AGENTS.md, AUTH_SPEC.md, etc. — conteúdo vem do Playbook)
	3.	POST /api/projects (salvar)
	4.	POST /api/projects/[slug]/seed (inserir tasks e checklists)
	•	Mostrar link do repo + botão “Abrir Board”.

7.3 Overview do Projeto /projects/[slug]
	•	Info: nome, stack, repo link.
	•	.env guia (instruções específicas para Firebase/Supabase).
	•	Botões: “Abrir Board”, “Checklists”, “Templates”, “Finanças”.
	•	Card Agente: “Gerar próximos passos” → chama /api/agent/suggest e lista 3–5 sugestões + 1 prompt para Cursor.

7.4 Board /projects/[slug]/board
	•	Kanban 3 colunas (todo/doing/done).
	•	Drag & Drop (opcional) ou dropdown de status.
	•	Filtros por Sprint.

7.5 Checklists /projects/[slug]/checklists
	•	Render de checklist.qa.json, checklist.growth.json, checklist.ux.json.
	•	Checkbox atualiza items[*].done e recalcula progress.
	•	Salvar via PATCH em Checklist (ou POST update específico).

7.6 Templates /projects/[slug]/templates
	•	Renderizar AGENTS.md, APP_SPEC_TEMPLATE.md, AUTH_SPEC.md, BACKEND_CONTRACT.yaml, ANALYTICS_EVENTS.md, ADS_PLAYBOOK.md, prompts (cursor_bootstrap, feature_brief, api_change_request, ab_test_plan).
	•	CopyButton para cada bloco.
	•	(Opcional) Botão “Escrever no repo” caso ainda não tenha sido escrito.

7.7 Finanças /finances e /finances/[slug]
	•	Cards: Total mensal, custos por provedor, custo por usuário (se disponível).
	•	Tabelas: assinaturas e infra (Cursor, ChatGPT, Firebase, Supabase, Vercel).
	•	Form “Adicionar custo manual”.
	•	Import CSV/JSON (opcional para v1).

7.8 Settings → Integrações
	•	Conectar GitHub (login), Google (Calendar) e OpenAI (chave salva localmente/temporária, não persistir em DB no v1).

⸻

8. Integrações (implementação mínima)

8.1 GitHub (Template → Repo)
	•	Endpoint: POST /repos/{owner}/{template}/generate com Authorization: Bearer ${GITHUB_TOKEN}.
	•	Depois, Contents API PUT /repos/{fullName}/contents/{path} para cada arquivo do Playbook.

8.2 Google Calendar
	•	NextAuth com Google Provider (escopo read-only de eventos).
	•	GET /api/calendar/events usa o access token da sessão para listar agenda.

8.3 OpenAI (Agentes)
	•	POST /api/agent/suggest: montar prompt com contexto do projeto (tasks, checklists, finanças) e do Playbook; retornar JSON estrito:

{
  "next_steps":[{"title":"...", "why":"...", "impact":"..."}],
  "risks":[{"title":"...", "mitigation":"..."}],
  "cursor_prompt":"(texto pronto p/ colar no Cursor)"
}


⸻

9. Conteúdo do Playbook (fonte dos arquivos)

Usar exatamente os blocos do App Factory Playbook (v1) já definidos (AGENTS.md, APP_SPEC_TEMPLATE.md, TECH_STACK.md, AUTH_SPEC.md, BACKEND_CONTRACT.yaml, ANALYTICS_EVENTS.md, ADS_PLAYBOOK.md, UX_RETENTION_CHECKLIST.md, GROWTH_LAUNCH_CHECKLIST.md, QA_RELEASE_CHECKLIST.md, TASKBOARD.yml, prompts/*).
Não alterar textos; apenas copiá-los para o repo do projeto novo via /api/github/write-files.

⸻

10. Regras de Segurança e Erros
	•	Nunca logar tokens em console/response.
	•	Em falhas de API (GitHub/Google/OpenAI), retornar {error, details} e exibir toast amigável.
	•	Validação via Zod para bodies das rotas.
	•	try/catch em todas rotas externas.

⸻

11. Passos para o Cursor (geração do projeto)

/goal: Criar o webapp “App Factory Hub” seguindo esta especificação exatamente, sem inventar nomes de campos ou rotas.

/steps:
	1.	Scaffold Next.js (TS, App Router, Tailwind).
	2.	Adicionar shadcn/ui e componentes listados.
	3.	Configurar Prisma, criar schema.prisma, gerar client, prisma migrate dev.
	4.	Implementar rotas API exatamente como especificado (paths, bodies, responses).
	5.	Implementar páginas e componentes (Dashboard, Wizard, Overview, Board, Checklists, Templates, Finanças, Settings).
	6.	Implementar integrações GitHub (create-repo, write-files), Google Calendar, OpenAI (agente).
	7.	Incluir seeds JSON em /seeds e rota /api/projects/[slug]/seed.
	8.	Criar lib/* (prisma, github, calendar, openai, utils) com funções puras.
	9.	Adicionar CopyButton e render de templates/prompts.
	10.	Teste local: criar um projeto dummy → gerar repo → escrever Playbook → seed → interagir no board e checklists → ver finanças.
	11.	Preparar para Vercel: ler envs do painel da Vercel e documentar no README.

/output:
	•	Projeto completo, rodando em npm run dev.
	•	README com instruções de .env.local, auth, integrações e deploy.
	•	Sem warnings de TypeScript.
	•	Rotas testadas com cURL (exemplos no README).

⸻

12. Critérios de Aceite (v1)
	•	Consigo criar um projeto pelo wizard que:
(a) gera repo no GitHub a partir do template,
(b) escreve arquivos do Playbook no repo,
(c) cria tasks e checklists (seed),
(d) exibe tudo nas telas correspondentes.
	•	Board permite mover task entre colunas (status persiste).
	•	Checklists marcam itens e atualizam progresso.
	•	Templates mostram o conteúdo e têm botão copiar.
	•	Finanças permite criar registros, ver total mensal e custos por provedor/projeto.
	•	Calendar mostra próximos eventos ao logar com Google.
	•	Agente retorna próximos passos + um prompt pronto para o Cursor.
	•	Build local sem erros, deployável na Vercel (após configurar envs).

⸻

Anexo A — Exemplos de Implementação (resumidos)

app/api/github/create-repo/route.ts

import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { name, description } = await req.json();
  const owner = process.env.GITHUB_OWNER!;
  const template = process.env.GITHUB_TEMPLATE_REPO!;
  const token = process.env.GITHUB_TOKEN!;

  const res = await fetch(`https://api.github.com/repos/${owner}/${template}/generate`, {
    method: "POST",
    headers: { "Authorization": `Bearer ${token}`, "Accept": "application/vnd.github+json" },
    body: JSON.stringify({ owner, name, description: description ?? "Repo gerado pelo App Factory Hub", private: true })
  });

  if (!res.ok) return NextResponse.json({ error: await res.text() }, { status: 400 });
  const data = await res.json();
  return NextResponse.json({ repoUrl: data.html_url, fullName: data.full_name });
}

app/api/github/write-files/route.ts

import { NextRequest, NextResponse } from "next/server";
export async function POST(req: NextRequest) {
  const { fullName, files } = await req.json();
  const token = process.env.GITHUB_TOKEN!;
  const results = [];
  for (const f of files) {
    const res = await fetch(`https://api.github.com/repos/${fullName}/contents/${encodeURIComponent(f.path)}`, {
      method: "PUT",
      headers: { "Authorization": `Bearer ${token}`, "Accept": "application/vnd.github+json" },
      body: JSON.stringify({
        message: f.message ?? `chore: add ${f.path}`,
        content: Buffer.from(f.content, "utf-8").toString("base64")
      })
    });
    results.push({ path: f.path, ok: res.ok });
  }
  return NextResponse.json({ results });
}

app/api/projects/[slug]/seed/route.ts (usa os JSONs do seeds/)

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import s0 from "@/seeds/tasks.sprint0.json";
import s1 from "@/seeds/tasks.sprint1.json";
import s2 from "@/seeds/tasks.sprint2.json";
import qa from "@/seeds/checklist.qa.json";
import growth from "@/seeds/checklist.growth.json";
import ux from "@/seeds/checklist.ux.json";

export async function POST(_: NextRequest, { params }: { params: { slug: string } }) {
  const project = await prisma.project.findUnique({ where: { slug: params.slug }});
  if (!project) return NextResponse.json({ error: "not found" }, { status: 404 });

  await prisma.task.createMany({ data: [...s0, ...s1, ...s2].map(t => ({ ...t, projectId: project.id })) });
  const mk = (c:any) => ({ type: c.type, title: c.title, items: c.items, projectId: project.id });
  await prisma.checklist.createMany({ data: [mk(qa), mk(growth), mk(ux)] });

  return NextResponse.json({ ok: true });
}

