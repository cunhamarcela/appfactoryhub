
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


APP_FACTORY_HUB_SPEC_ADDON_STACKS_FEATURES.md

Objetivo deste add-on
	1.	No Wizard de novo projeto, permitir escolher linguagem, frontend, backend e banco (ex.: Flutter+Firebase, React+Supabase, etc).
	2.	A partir dessas escolhas, gerar checklists iniciais personalizados (auth, DB, ads, analytics) + templates/arquivos específicos no repo.
	3.	Em projeto existente, permitir criar “Feature” que:

	•	lê o repositório no GitHub,
	•	gera prompts prontos para o Cursor,
	•	cria checklists/tarefas padrão de feature + tarefas cross-surface (ex.: “também atualizar web app do HiClub”).

Este add-on não altera o que já existe; apenas adiciona.

⸻

1) Novos campos do Wizard “Novo Projeto”

No passo /projects/new, adicionar campos:
	•	Linguagem (enum): flutter | react | react_native
	•	Frontend (enum): flutter | nextjs | react_native
	•	Backend (enum): none | node | firebase_functions | supabase_edge
	•	Banco (enum): firebase | supabase
	•	Superfícies (multi-select): app_mobile (iOS/Android), web_app

Regra: persistir essas escolhas em Project.tech* (ver Prisma abaixo) e usá-las para gerar seeds (checklists e tasks) com base no stack.

⸻

2) Prisma — novos modelos e campos

Não renomear nada fora deste bloco.
Adicione estes modelos/campos ao prisma/schema.prisma original.

model Project {
  id           String    @id @default(cuid())
  name         String
  slug         String    @unique
  niche        String?
  repoUrl      String?
  repoFullName String?
  stack        String    @default("firebase") // legado
  status       String    @default("active")

  // NOVO: escolhas de stack
  techLanguage String    @default("flutter")     // flutter | react | react_native
  techFrontend String    @default("flutter")     // flutter | nextjs | react_native
  techBackend  String    @default("firebase_functions") // none | node | firebase_functions | supabase_edge
  techDatabase String    @default("firebase")    // firebase | supabase

  // NOVO: superfícies (app, web etc.)
  surfaces     Surface[]

  createdById  String
  createdBy    User      @relation(fields: [createdById], references: [id])

  tasks        Task[]
  checklists   Checklist[]
  finances     FinanceRecord[]
  features     Feature[] // NOVO

  createdAt    DateTime  @default(now())
  updatedAt    DateTime  @updatedAt
}

// Superfícies (app_mobile, web_app)
model Surface {
  id          String   @id @default(cuid())
  projectId   String
  project     Project  @relation(fields: [projectId], references: [id])
  kind        String   // "app_mobile" | "web_app"
  name        String   // ex.: "HiClub App", "HiClub Web"
  active      Boolean  @default(true)
}

// Feature por projeto
model Feature {
  id          String   @id @default(cuid())
  projectId   String
  project     Project  @relation(fields: [projectId], references: [id])

  title       String
  description String?
  surfaces    String[] // ex.: ["app_mobile","web_app"]
  status      String   @default("planned") // planned | in_progress | done

  // Metadados da análise do repo no momento da criação
  repoSnapshot Json?   // { languages, tree, packages, paths }
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
}

Depois de editar o schema:

npx prisma migrate dev -n "stacks_and_features"


⸻

3) Seeds por Stack (checklists e tasks dinâmicos)

Adicionar novos arquivos em /seeds/stacks/:

seeds/stacks/
├─ flutter_firebase.json
├─ flutter_supabase.json
├─ nextjs_supabase.json
├─ react_native_firebase.json
└─ common_feature_checklist.json

Exemplo: seeds/stacks/flutter_firebase.json

{
  "stack": "flutter_firebase",
  "checklists": [
    {
      "type": "QA_RELEASE",
      "title": "QA & Release (Flutter + Firebase)",
      "items": [
        {"id":"auth_ff","label":"Configurar Firebase Auth (Apple/Google/Email)","done":false},
        {"id":"firestore","label":"Definir coleções e regras de segurança (RLS)","done":false},
        {"id":"analytics_fb","label":"Firebase Analytics mínimo + Crashlytics","done":false},
        {"id":"ads_admob","label":"AdMob: banner/interstitial/rewarded com caps","done":false}
      ]
    }
  ],
  "tasks": [
    {"title":"Configurar Firebase (projeto, apps iOS/Android, plist/json)","sprint":"Sprint 0"},
    {"title":"Instalar pacotes FlutterFire e inicializar no app","sprint":"Sprint 0"},
    {"title":"Implementar AuthRepository com Apple/Google/Email","sprint":"Sprint 0"}
  ]
}

Exemplo: seeds/stacks/nextjs_supabase.json

{
  "stack": "nextjs_supabase",
  "checklists": [
    {
      "type": "QA_RELEASE",
      "title": "QA & Release (Next.js + Supabase)",
      "items": [
        {"id":"auth_sb","label":"Supabase Auth configurado e testado (OAuth + email)","done":false},
        {"id":"policies","label":"RLS policies revisadas para todas as tabelas","done":false},
        {"id":"edge","label":"Supabase Edge Functions para rotas críticas","done":false}
      ]
    }
  ],
  "tasks": [
    {"title":"Criar projeto no Supabase e configurar .env","sprint":"Sprint 0"},
    {"title":"Definir schema SQL (DDL) e políticas RLS","sprint":"Sprint 0"},
    {"title":"Criar wrapper de supabase-js e hooks React","sprint":"Sprint 0"}
  ]
}

seeds/stacks/common_feature_checklist.json (para qualquer feature)

{
  "title": "Checklist padrão de Feature",
  "items": [
    {"id":"spec","label":"Escrever Feature Brief (prompts/feature_brief.md)","done":false},
    {"id":"contracts","label":"Verificar impacto no BACKEND_CONTRACT.yaml","done":false},
    {"id":"analytics","label":"Adicionar eventos analytics (ANALYTICS_EVENTS.md)","done":false},
    {"id":"ads","label":"Checar impacto em Ads (ADS_PLAYBOOK.md)","done":false},
    {"id":"tests","label":"Atualizar testes críticos/fluxo principal","done":false},
    {"id":"docs","label":"Atualizar README/CHANGELOG","done":false}
  ]
}


⸻

4) Geração de checklists/tarefas no seed, com base no stack

Regras do seed (em /api/projects/[slug]/seed):
	1.	Carregar os seeds base (já existentes: s0, s1, s2 + checklists QA/Growth/UX).
	2.	Detectar techLanguage/techFrontend/techBackend/techDatabase do Project.
	3.	Carregar um arquivo stack correspondente (exemplos acima) e mesclar:
	•	Append de tasks por stack à Sprint 0 (ou Sprint 1, conforme arquivo).
	•	Append de checklists por stack às checklists existentes.
	4.	Criar surfaces conforme seleção do Wizard (ex.: app_mobile, web_app).

Importante: caso não exista um arquivo stack exato, cair em fallback: flutter_firebase (default).

⸻

5) Novo fluxo “Criar Feature”

5.1 UI

Nova rota/página:
/projects/[slug]/features/new
Campos:
	•	Title (obrigatório)
	•	Description (opcional)
	•	Surfaces alvo (checkbox): app_mobile, web_app
	•	Criar tasks/checklist automaticamente (toggle)

Ação:
	1.	Analisar repositório (GitHub):
	•	GET /repos/{fullName}/languages
	•	GET /repos/{fullName}/git/trees/main?recursive=1 (ajuste branch se necessário)
	•	Salvar snapshot em Feature.repoSnapshot.
	2.	Gerar prompts (LLM) com base em:
	•	Playbook (AGENTS.md, etc.)
	•	Stack do projeto
	•	Snapshot do repo (paths, packages, frameworks detectados)
	•	Surfaces marcadas
	3.	Criar checklist de feature (baseado em common_feature_checklist.json) + itens cross-surface:
	•	Se web_app estiver ativo no projeto e não estiver na seleção, incluir item:
{"id":"cross_web_sync","label":"Atualizar Web App (HiClub) com a mesma feature","done":false}
	•	Se app_mobile estiver fora e existir, idem para mobile:
{"id":"cross_app_sync","label":"Atualizar App Mobile com a mesma feature","done":false}
	4.	Criar tarefas específicas com base no prompt do agente (máx. 6), status todo.

5.2 Prisma & API

Nova rota: POST /api/projects/[slug]/features
Body:

{
  "title": "Clube Premium",
  "description": "Assinatura mensal com conteúdos extras",
  "surfaces": ["app_mobile","web_app"],
  "autoPlan": true
}

Response 200:

{
  "feature": { "id":"...", "status":"planned" },
  "prompt": "texto pronto p/ Cursor",
  "checklist": { "title":"...", "items":[...] },
  "tasks": [ { "title":"..." }, { "title":"..." } ]
}

Regras da rota:
	•	Buscar Project por slug.
	•	Chamar GitHub API para languages e tree (salvar em repoSnapshot).
	•	Chamar LLM POST /api/agent/feature-plan (nova rota — ver abaixo).
	•	Criar Feature, inserir checklist (tipo FEATURE_PLAN) e tasks (sprint “Sprint 1” por padrão).
	•	Retornar tudo.

⸻

6) Novas rotas de API (contratos)

6.1 Catálogo de stacks (para o Wizard)

GET /api/stacks/catalog
Response 200:

{
  "languages":["flutter","react","react_native"],
  "frontends":["flutter","nextjs","react_native"],
  "backends":["none","node","firebase_functions","supabase_edge"],
  "databases":["firebase","supabase"]
}

6.2 Gerar checklists por stack (utilitário)

POST /api/checklists/generate
Body:

{ "techLanguage":"flutter", "techFrontend":"flutter", "techBackend":"firebase_functions", "techDatabase":"firebase" }

Response 200 (append candidates):

{ "checklists":[...], "tasks":[...] }

6.3 Criar Feature (principal)

POST /api/projects/[slug]/features (definido acima)

6.4 Agente de feature (LLM)

POST /api/agent/feature-plan
Body:

{
  "project": { "name":"HiClub", "slug":"hi-club", "techLanguage":"flutter", "techFrontend":"flutter", "techBackend":"firebase_functions", "techDatabase":"firebase", "surfaces":["app_mobile","web_app"] },
  "feature": { "title":"...", "description":"...", "surfaces":["app_mobile"] },
  "repoSnapshot": { "languages": {...}, "tree": {...} },
  "playbook": { "agentsMd":"...", "analytics":"...", "ads":"...", "auth":"..." }
}

Response 200 (formato obrigatório, sem alucinação):

{
  "cursor_prompt":"(texto pronto, detalhando telas/arquitetura/contratos, citando arquivos e camadas)",
  "tasks":[
    {"title":"Atualizar BACKEND_CONTRACT.yaml com entidade PremiumPlan"},
    {"title":"Criar tela Paywall (Flutter) com variant A/B"},
    {"title":"Instrumentar eventos analytics: paywall_view, paywall_purchase"},
    {"title":"Ajustar AdService: remover interstitial após compra (flag)"},
    {"title":"Atualizar README e CHANGELOG"}
  ],
  "checklist_additions":[
    {"id":"security_rules","label":"Revisar regras (Firestore/Storage) para novos dados","done":false}
  ],
  "cross_surface":[
    {"id":"cross_web_sync","label":"Atualizar Web App do HiClub com Paywall","done":false}
  ]
}


⸻

7) Prompts (LLM) prontos — copiar para o Cursor

7.1 Prompt — Project Stack Seed Generator

Você é o “Project Stack Seed Generator”. Gere **apenas JSON** que será consumido por API, no formato:
{ "checklists":[...], "tasks":[...] }

Contexto:
- Playbook padrão (AGENTS.md, AUTH_SPEC.md, ADS_PLAYBOOK.md, ANALYTICS_EVENTS.md, BACKEND_CONTRACT.yaml).
- Stack do projeto:
  - language: {{techLanguage}}
  - frontend: {{techFrontend}}
  - backend: {{techBackend}}
  - database: {{techDatabase}}

Regras:
- NÃO invente novos tipos além de QA_RELEASE, GROWTH_LAUNCH, UX_RETENTION.
- Use linguagem e framework corretos (ex.: FlutterFire ou supabase-js).
- Máximo 1 checklist extra por stack no seed.
- 3–5 tasks específicas da stack para a Sprint 0/1.

Saída JSON, nada além do JSON.

7.2 Prompt — Feature Planner

Você é o “Feature Planner”. Gere **apenas JSON** no formato:
{
  "cursor_prompt":"string",
  "tasks":[{"title":"..."}],
  "checklist_additions":[{"id":"...","label":"...","done":false}],
  "cross_surface":[{"id":"...","label":"...","done":false}]
}

Contexto:
- Projeto: {{projectJson}}
- Feature: {{featureJson}}
- RepoSnapshot (languages, tree, packages): {{repoSnapshotJson}}
- Playbook: regras de AUTH_SPEC, ADS_PLAYBOOK, ANALYTICS_EVENTS.

Regras:
- O cursor_prompt deve ser **copiável** para o Cursor, descrevendo:
  - arquivos a criar/modificar, contratos, eventos de analytics, impacto em ads,
  - stubs de código e TODOs,
  - se existir web_app mas a feature só marcou app_mobile, incluir instrução de “criar contrapartida na web” (e vice-versa).
- 3–6 tasks objetivas no máximo.
- `checklist_additions` devem complementar o checklist padrão de feature.
- `cross_surface` deve conter itens obrigatórios quando superfícies não foram marcadas, mas existem no projeto.

Saída JSON, nada além do JSON.


⸻

8) UI/UX — ajustes
	•	Wizard (/projects/new): adicionar grupo “Stack do Projeto” (linguagem, frontend, backend, database, superfícies).
	•	Overview (/projects/[slug]): card com stack escolhido e surfaces ativas.
	•	Templates: mostrar blocos específicos (por ex., snippet de inicialização FlutterFire vs supabase-js).
	•	Features:
	•	Lista em /projects/[slug]/features mostrando status.
	•	Botão “Nova Feature” abre /projects/[slug]/features/new.
	•	Ao criar, renderizar prompt gerado (copy) + checklist e tasks adicionadas.

⸻

9) Regras anti-alucinação (extras deste módulo)
	•	Stack: restringir valores aos enums definidos.
	•	Seeds por stack: se não houver arquivo exato, usar fallback flutter_firebase.
	•	Feature Planner: saída APENAS JSON com as chaves exigidas; se não puder decidir, retornar campos vazios.
	•	GitHub Analysis: usar apenas /languages e /git/trees?recursive=1 para snapshot; não inferir conteúdos inexistentes.

⸻

10) Passos de implementação (para o Cursor)
	1.	Atualizar Prisma com novos modelos/campos e migrar.
	2.	Adicionar seeds por stack em /seeds/stacks/*.
	3.	Atualizar /api/projects/[slug]/seed para mesclar seeds de stack e criar Surface.
	4.	Criar rotas:
	•	GET /api/stacks/catalog
	•	POST /api/checklists/generate
	•	POST /api/projects/[slug]/features
	•	POST /api/agent/feature-plan
	5.	Wizard: coletar stack + superfícies; enviar ao backend.
	6.	Tela de Features: criar/listar; exibir prompt/itens criados.
	7.	Testes: projeto Flutter+Firebase e Next.js+Supabase, criando ao menos 1 feature para cada.

⸻

11) Critérios de aceite (módulo)
	•	Consigo criar projeto escolhendo stack e superfícies; o seed resulta em checklists/tasks do stack correto.
	•	Em projeto com app_mobile e web_app, ao criar feature apenas para app_mobile, a resposta inclui cross_surface para atualizar web_app.
	•	O prompt de feature sai pronto para o Cursor, citando arquivos/contratos corretos do stack.
	•	GitHub snapshot é salvo em Feature.repoSnapshot.
	•	Nada quebra o fluxo já especificado no APP_FACTORY_HUB_SPEC.md.

 abaixo vão os blocos prontos (arquivos completos) para colar no seu projeto do App Factory Hub e habilitar:
	•	seleção de stack no wizard,
	•	seeds por stack,
	•	criação de Feature que analisa o repositório no GitHub,
	•	agente que retorna prompt pro Cursor + tasks + checklist de feature,
	•	endpoints utilitários.

Como usar: copie e cole um arquivo por vez nas paths indicadas. Onde já existir arquivo, substitua o conteúdo (ou aplique o patch).
Os arquivos usam TypeScript e App Router do Next.js.

⸻

0) Comandos para criar pastas/arquivos

# dentro do diretório do app-factory-hub
mkdir -p seeds/stacks
mkdir -p app/api/stacks/catalog
mkdir -p app/api/checklists/generate
mkdir -p app/api/projects/[slug]/features
mkdir -p app/api/agent/feature-plan
mkdir -p lib


⸻

1) Prisma — patch do schema

Se você já aplicou o addon, ignore este bloco. Caso ainda não, adicione os modelos/campos abaixo ao seu prisma/schema.prisma e rode a migração.

// --- PATCH: acrescente estes campos e modelos ao schema existente ---

model Project {
  id           String    @id @default(cuid())
  name         String
  slug         String    @unique
  niche        String?
  repoUrl      String?
  repoFullName String?
  stack        String    @default("firebase")
  status       String    @default("active")

  // NOVOS CAMPOS
  techLanguage String    @default("flutter")            // flutter | react | react_native
  techFrontend String    @default("flutter")            // flutter | nextjs | react_native
  techBackend  String    @default("firebase_functions") // none | node | firebase_functions | supabase_edge
  techDatabase String    @default("firebase")           // firebase | supabase

  surfaces     Surface[]                                // NOVO

  createdById  String
  createdBy    User      @relation(fields: [createdById], references: [id])

  tasks        Task[]
  checklists   Checklist[]
  finances     FinanceRecord[]
  features     Feature[]                                 // NOVO

  createdAt    DateTime  @default(now())
  updatedAt    DateTime  @updatedAt
}

model Surface {
  id          String   @id @default(cuid())
  projectId   String
  project     Project  @relation(fields: [projectId], references: [id])
  kind        String   // "app_mobile" | "web_app"
  name        String
  active      Boolean  @default(true)
}

model Feature {
  id          String   @id @default(cuid())
  projectId   String
  project     Project  @relation(fields: [projectId], references: [id])

  title       String
  description String?
  surfaces    String[] // ["app_mobile","web_app"]
  status      String   @default("planned") // planned | in_progress | done
  repoSnapshot Json?   // { languages, tree, packages, paths }

  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
}

npx prisma migrate dev -n "stacks_and_features"


⸻

2) Seeds por stack (JSON)

seeds/stacks/flutter_firebase.json

{
  "stack": "flutter_firebase",
  "checklists": [
    {
      "type": "QA_RELEASE",
      "title": "QA & Release (Flutter + Firebase)",
      "items": [
        {"id":"auth_ff","label":"Configurar Firebase Auth (Apple/Google/Email)","done":false},
        {"id":"firestore","label":"Definir coleções + regras de segurança (Firestore/Storage)","done":false},
        {"id":"analytics_fb","label":"Firebase Analytics + Crashlytics configurados","done":false},
        {"id":"ads_admob","label":"AdMob: banner/interstitial/rewarded com caps e consentimento","done":false}
      ]
    }
  ],
  "tasks": [
    {"title":"Criar projeto Firebase e apps iOS/Android; baixar GoogleService-Info/ google-services.json","sprint":"Sprint 0"},
    {"title":"Instalar/flutterfire configure e inicializar no app","sprint":"Sprint 0"},
    {"title":"Implementar AuthRepository Apple/Google/Email","sprint":"Sprint 0"}
  ]
}

seeds/stacks/flutter_supabase.json

{
  "stack": "flutter_supabase",
  "checklists": [
    {
      "type": "QA_RELEASE",
      "title": "QA & Release (Flutter + Supabase)",
      "items": [
        {"id":"auth_sb","label":"Supabase Auth (OAuth + email) testado no app","done":false},
        {"id":"rls","label":"RLS policies revisadas para todas as tabelas","done":false},
        {"id":"edge","label":"Edge Functions (se necessário) para lógicas sensíveis","done":false}
      ]
    }
  ],
  "tasks": [
    {"title":"Criar projeto Supabase e configurar .env","sprint":"Sprint 0"},
    {"title":"Definir schema SQL (DDL) + policies RLS","sprint":"Sprint 0"},
    {"title":"Integrar supabase-flutter e wrappers de auth/db","sprint":"Sprint 0"}
  ]
}

seeds/stacks/nextjs_supabase.json

{
  "stack": "nextjs_supabase",
  "checklists": [
    {
      "type": "QA_RELEASE",
      "title": "QA & Release (Next.js + Supabase)",
      "items": [
        {"id":"auth_web_sb","label":"Auth Supabase no Next.js com SSR/Client OK","done":false},
        {"id":"policies_web","label":"RLS policies aplicadas e testadas","done":false},
        {"id":"analytics_web","label":"Analytics + error tracking configurados","done":false}
      ]
    }
  ],
  "tasks": [
    {"title":"Adicionar supabase-js e configurar client/server","sprint":"Sprint 0"},
    {"title":"Criar rotas protegidas com middleware/SSR","sprint":"Sprint 0"},
    {"title":"Implementar UI de login/registro","sprint":"Sprint 0"}
  ]
}

seeds/stacks/react_native_firebase.json

{
  "stack": "react_native_firebase",
  "checklists": [
    {
      "type": "QA_RELEASE",
      "title": "QA & Release (React Native + Firebase)",
      "items": [
        {"id":"rn_auth","label":"Firebase Auth (Apple/Google/Email) via react-native-firebase","done":false},
        {"id":"rn_crash","label":"Crashlytics e Analytics integrados","done":false}
      ]
    }
  ],
  "tasks": [
    {"title":"Instalar react-native-firebase e configurar nativo iOS/Android","sprint":"Sprint 0"},
    {"title":"Criar AuthContext + hooks","sprint":"Sprint 0"}
  ]
}

seeds/stacks/common_feature_checklist.json

{
  "title": "Checklist padrão de Feature",
  "items": [
    {"id":"spec","label":"Escrever Feature Brief (prompts/feature_brief.md)","done":false},
    {"id":"contracts","label":"Verificar impacto no BACKEND_CONTRACT.yaml","done":false},
    {"id":"analytics","label":"Adicionar eventos analytics (ANALYTICS_EVENTS.md)","done":false},
    {"id":"ads","label":"Checar impacto em Ads (ADS_PLAYBOOK.md)","done":false},
    {"id":"tests","label":"Atualizar testes críticos/fluxo principal","done":false},
    {"id":"docs","label":"Atualizar README/CHANGELOG","done":false}
  ]
}


⸻

3) Helpers de lib

lib/github.ts

export async function ghGenerateFromTemplate(owner: string, template: string, name: string, description?: string) {
  const token = process.env.GITHUB_TOKEN!;
  const res = await fetch(`https://api.github.com/repos/${owner}/${template}/generate`, {
    method: "POST",
    headers: { "Authorization": `Bearer ${token}`, "Accept": "application/vnd.github+json" },
    body: JSON.stringify({ owner, name, description: description ?? "Repo gerado pelo App Factory Hub", private: true })
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json(); // { html_url, full_name, ... }
}

export async function ghWriteFiles(fullName: string, files: {path:string; content:string; message?:string}[]) {
  const token = process.env.GITHUB_TOKEN!;
  const results: {path:string; ok:boolean}[] = [];
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
  return results;
}

export async function ghGetLanguages(fullName: string) {
  const token = process.env.GITHUB_TOKEN!;
  const res = await fetch(`https://api.github.com/repos/${fullName}/languages`, {
    headers: { "Authorization": `Bearer ${token}`, "Accept": "application/vnd.github+json" }
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json(); // { Dart: 12345, ... }
}

export async function ghGetTree(fullName: string, ref = "main") {
  const token = process.env.GITHUB_TOKEN!;
  const res = await fetch(`https://api.github.com/repos/${fullName}/git/trees/${ref}?recursive=1`, {
    headers: { "Authorization": `Bearer ${token}`, "Accept": "application/vnd.github+json" }
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json(); // { tree: [{path, type}], ... }
}

lib/openai.ts

type FeaturePlanResponse = {
  cursor_prompt: string;
  tasks: { title: string }[];
  checklist_additions: { id: string; label: string; done: boolean }[];
  cross_surface: { id: string; label: string; done: boolean }[];
};

export async function callFeaturePlannerLLM(payload: any): Promise<FeaturePlanResponse> {
  const apiKey = process.env.OPENAI_API_KEY!;
  const prompt = `Você é o “Feature Planner”. Gere APENAS JSON com as chaves:
{
  "cursor_prompt":"string",
  "tasks":[{"title":"..."}],
  "checklist_additions":[{"id":"...","label":"...","done":false}],
  "cross_surface":[{"id":"...","label":"...","done":false}]
}
Contexto: ${JSON.stringify(payload, null, 2)}
Regras:
- Não invente chaves.
- Máx 6 tasks objetivas.
- Se existir web_app e a feature não selecionou, incluir item cross_surface correspondente (e vice-versa).
- Cursor_prompt deve citar arquivos/camadas impactadas e eventos analytics/ads conforme Playbook.`;

  // Modelo livre; use aquele que você tiver disponível
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.2
    })
  });
  if (!res.ok) throw new Error(await res.text());
  const data = await res.json();
  const content = data.choices?.[0]?.message?.content ?? "{}";
  // Tentar parsear
  try { return JSON.parse(content); } catch { return { cursor_prompt:"", tasks:[], checklist_additions:[], cross_surface:[] }; }
}

Se você já tem um wrapper para OpenAI, adapte. O importante é retornar exatamente o JSON esperado.

⸻

4) Endpoints novos

app/api/stacks/catalog/route.ts

import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    languages: ["flutter","react","react_native"],
    frontends: ["flutter","nextjs","react_native"],
    backends:  ["none","node","firebase_functions","supabase_edge"],
    databases: ["firebase","supabase"]
  });
}

app/api/checklists/generate/route.ts

import { NextRequest, NextResponse } from "next/server";
import flutterFirebase from "@/seeds/stacks/flutter_firebase.json";
import flutterSupabase from "@/seeds/stacks/flutter_supabase.json";
import nextjsSupabase from "@/seeds/stacks/nextjs_supabase.json";
import rnFirebase from "@/seeds/stacks/react_native_firebase.json";

function pickStackSeed(lang: string, fe: string, be: string, db: string) {
  const key = `${fe}_${db}`; // heurística simples
  if (key === "flutter_firebase") return flutterFirebase;
  if (key === "flutter_supabase") return flutterSupabase;
  if (key === "nextjs_supabase") return nextjsSupabase;
  if (key === "react_native_firebase") return rnFirebase;
  return flutterFirebase; // fallback
}

export async function POST(req: NextRequest) {
  const { techLanguage, techFrontend, techBackend, techDatabase } = await req.json();
  const seed = pickStackSeed(techLanguage, techFrontend, techBackend, techDatabase);
  return NextResponse.json({ checklists: seed.checklists ?? [], tasks: seed.tasks ?? [] });
}

Atualização do seed de projeto — app/api/projects/[slug]/seed/route.ts

Substitua pelo conteúdo abaixo para mesclar seeds base + stack + criar Surface.

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import s0 from "@/seeds/tasks.sprint0.json";
import s1 from "@/seeds/tasks.sprint1.json";
import s2 from "@/seeds/tasks.sprint2.json";
import qa from "@/seeds/checklist.qa.json";
import growth from "@/seeds/checklist.growth.json";
import ux from "@/seeds/checklist.ux.json";

import flutterFirebase from "@/seeds/stacks/flutter_firebase.json";
import flutterSupabase from "@/seeds/stacks/flutter_supabase.json";
import nextjsSupabase from "@/seeds/stacks/nextjs_supabase.json";
import rnFirebase from "@/seeds/stacks/react_native_firebase.json";

function pickStackSeed(fe: string, db: string) {
  const key = `${fe}_${db}`;
  if (key === "flutter_firebase") return flutterFirebase;
  if (key === "flutter_supabase") return flutterSupabase;
  if (key === "nextjs_supabase") return nextjsSupabase;
  if (key === "react_native_firebase") return rnFirebase;
  return flutterFirebase; // fallback
}

export async function POST(_: NextRequest, { params }: { params: { slug: string }}) {
  const project = await prisma.project.findUnique({ where: { slug: params.slug }});
  if (!project) return NextResponse.json({ error: "not found" }, { status: 404 });

  // 1) tasks base
  const tasksData = [...s0, ...s1, ...s2].map(t => ({ title: t.title, sprint: t.sprint, projectId: project.id }));
  await prisma.task.createMany({ data: tasksData });

  // 2) checklists base
  const mk = (c:any) => ({ type: c.type, title: c.title, items: c.items, projectId: project.id });
  await prisma.checklist.createMany({ data: [mk(qa), mk(growth), mk(ux)] });

  // 3) stack-specific
  const stackSeed = pickStackSeed(project.techFrontend, project.techDatabase);
  if (stackSeed?.tasks?.length) {
    await prisma.task.createMany({ data: stackSeed.tasks.map((t:any) => ({ title: t.title, sprint: t.sprint ?? "Sprint 0", projectId: project.id })) });
  }
  if (stackSeed?.checklists?.length) {
    await prisma.checklist.createMany({ data: stackSeed.checklists.map((c:any) => mk(c)) });
  }

  // 4) surfaces — se quiser criar automaticamente as duas; ajuste conforme seu wizard
  const surfacesToCreate = [
    { kind: "app_mobile", name: `${project.name} App` },
    { kind: "web_app", name: `${project.name} Web` }
  ];
  await prisma.surface.createMany({ data: surfacesToCreate.map(s => ({ ...s, projectId: project.id })) });

  return NextResponse.json({ ok: true });
}

Criar Feature — app/api/projects/[slug]/features/route.ts

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ghGetLanguages, ghGetTree } from "@/lib/github";
import commonFeatureChecklist from "@/seeds/stacks/common_feature_checklist.json";
import { callFeaturePlannerLLM } from "@/lib/openai";

export async function POST(req: NextRequest, { params }: { params: { slug: string } }) {
  const body = await req.json();
  const { title, description, surfaces = ["app_mobile"], autoPlan = true } = body;

  const project = await prisma.project.findUnique({ where: { slug: params.slug }, include: { surfaces: true }});
  if (!project) return NextResponse.json({ error: "project_not_found" }, { status: 404 });
  if (!title) return NextResponse.json({ error: "title_required" }, { status: 400 });

  // 1) snapshot do repo
  let repoSnapshot: any = undefined;
  if (project.repoFullName) {
    try {
      const languages = await ghGetLanguages(project.repoFullName);
      const tree = await ghGetTree(project.repoFullName);
      repoSnapshot = { languages, tree };
    } catch (e:any) {
      // mantém sem snapshot
      repoSnapshot = { error: "snapshot_failed", message: String(e) };
    }
  }

  // 2) criar feature
  const feature = await prisma.feature.create({
    data: {
      projectId: project.id,
      title,
      description,
      surfaces,
      repoSnapshot
    }
  });

  // 3) gerar plano via LLM (prompt -> tasks/checklists)
  let planner: any = { cursor_prompt:"", tasks:[], checklist_additions:[], cross_surface:[] };
  if (autoPlan) {
    const payload = {
      project: {
        name: project.name, slug: project.slug,
        techLanguage: project.techLanguage, techFrontend: project.techFrontend,
        techBackend: project.techBackend, techDatabase: project.techDatabase,
        surfaces: project.surfaces.map(s => s.kind)
      },
      feature: { title, description, surfaces },
      repoSnapshot,
      playbook: { // placeholders — você pode buscar os conteúdos reais se desejar
        agentsMd: "AGENTS.md",
        analytics: "ANALYTICS_EVENTS.md",
        ads: "ADS_PLAYBOOK.md",
        auth: "AUTH_SPEC.md"
      }
    };
    try {
      planner = await callFeaturePlannerLLM(payload);
    } catch (e:any) {
      planner = { cursor_prompt:"", tasks:[], checklist_additions:[], cross_surface:[] };
    }
  }

  // 4) checklist padrão de feature + additions + cross_surface
  const featureChecklistItems = [
    ...commonFeatureChecklist.items,
    ...(planner.checklist_additions ?? []),
    ...(planner.cross_surface ?? [])
  ];
  await prisma.checklist.create({
    data: {
      projectId: project.id,
      type: "FEATURE_PLAN",
      title: `Feature: ${title}`,
      items: featureChecklistItems
    }
  });

  // 5) tasks derivadas do planner (Sprint 1 por padrão)
  if (planner.tasks?.length) {
    await prisma.task.createMany({
      data: planner.tasks.slice(0, 6).map((t:any) => ({
        title: t.title,
        sprint: "Sprint 1",
        projectId: project.id
      }))
    });
  }

  return NextResponse.json({
    feature: { id: feature.id, status: feature.status },
    prompt: planner.cursor_prompt ?? "",
    checklist: { title: `Feature: ${title}`, items: featureChecklistItems },
    tasks: planner.tasks ?? []
  });
}

Agente de Feature — app/api/agent/feature-plan/route.ts

(Opcional — se você quiser expor a rota separada. O endpoint de features acima já chama o callFeaturePlannerLLM.)

import { NextRequest, NextResponse } from "next/server";
import { callFeaturePlannerLLM } from "@/lib/openai";

export async function POST(req: NextRequest) {
  const payload = await req.json();
  try {
    const out = await callFeaturePlannerLLM(payload);
    return NextResponse.json(out);
  } catch (e:any) {
    return NextResponse.json({ error: String(e) }, { status: 400 });
  }
}


⸻

5) Endpoint do catálogo de stacks já adicionado ao Wizard

No Wizard (/projects/new), faça o fetch de GET /api/stacks/catalog para montar os selects:
	•	techLanguage, techFrontend, techBackend, techDatabase
	•	surfaces: checkboxes app_mobile, web_app

Quando criar o projeto (POST /api/projects), inclua os novos campos no body:

{
  "name":"HiClub",
  "slug":"hi-club",
  "niche":"fitness",
  "stack":"firebase",
  "repoUrl":"https://github.com/cunhamarcela/hi-club",
  "repoFullName":"cunhamarcela/hi-club",
  "techLanguage":"flutter",
  "techFrontend":"flutter",
  "techBackend":"firebase_functions",
  "techDatabase":"firebase",
  "surfaces":["app_mobile","web_app"]
}

Garanta que seu handler de /api/projects salva esses campos e cria as Surface (você pode criar ali ou deixar para o /seed como fizemos).

⸻

Dicas finais
	•	Tokens/segredos: confirme envs (GITHUB_TOKEN, OPENAI_API_KEY etc.).
	•	Branches: se o repo gerado não usar main, ajuste ghGetTree(repo, "main") → "master" conforme necessário.
	•	Limpeza: todos endpoints retornam JSON estrito. Se der erro, retornam {error: "..."}; trate na UI com toast.

