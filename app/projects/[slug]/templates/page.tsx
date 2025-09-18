"use client"

import { useState, useEffect, useCallback } from "react"
import { useSession } from "next-auth/react"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ArrowLeft, RefreshCw } from "lucide-react"
import Link from "next/link"
import { TemplateViewer } from "@/components/TemplateViewer"

interface Template {
  id: string
  name: string
  type: 'markdown' | 'yaml' | 'json' | 'prompt'
  category: 'playbook' | 'spec' | 'config' | 'prompt'
  content: string
  description?: string
  filename?: string
}

interface Project {
  id: string
  name: string
  slug: string
  description?: string
  stack: string
  status: string
  repoUrl?: string
  repoFullName?: string
}

interface TemplatesPageProps {
  params: { slug: string }
}

export default function TemplatesPage({ params }: TemplatesPageProps) {
  const { data: session, status } = useSession()
  const [project, setProject] = useState<Project | null>(null)
  const [templates, setTemplates] = useState<Template[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchProjectAndTemplates = useCallback(async () => {
    if (!session) return
    try {
      setLoading(true)
      setError(null)

      // Fetch project data
      const projectResponse = await fetch(`/api/projects`)
      if (!projectResponse.ok) {
        throw new Error('Failed to fetch projects')
      }
      
      const projectsData = await projectResponse.json()
      const currentProject = projectsData.projects?.find((p: Project) => p.slug === params.slug)
      
      if (!currentProject) {
        throw new Error('Project not found')
      }
      
      setProject(currentProject)

      // Generate templates based on the project
      const projectTemplates = generateTemplates(currentProject)
      setTemplates(projectTemplates)

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load project')
    } finally {
      setLoading(false)
    }
  }, [session, params.slug])

  useEffect(() => {
    fetchProjectAndTemplates()
  }, [fetchProjectAndTemplates])

  if (status === "loading") {
    return <div>Loading...</div>
  }

  if (!session) {
    redirect("/api/auth/signin")
  }

  const generateTemplates = (project: Project): Template[] => {
    const stack = project.stack
    const projectName = project.name
    const niche = 'A ser definido' // Default value since niche is not in Project interface

    return [
      // Playbook Templates
      {
        id: 'agents',
        name: 'AGENTS.md',
        type: 'markdown',
        category: 'playbook',
        filename: 'AGENTS.md',
        description: 'Guia principal do projeto com instruções para desenvolvimento',
        content: `# AGENTS.md

## Projeto: ${projectName}

### Stack: ${stack}
### Nicho: ${niche}

Este projeto foi criado usando o App Factory Hub e segue o Playbook padrão.

## Próximos Passos

1. Configure as variáveis de ambiente
2. Execute o setup inicial do banco de dados
3. Siga o board de tarefas para desenvolvimento
4. Use os templates e prompts disponíveis no Hub

## Recursos

- [App Factory Hub](https://appfactoryhub.vercel.app)
- [Documentação do Playbook](https://github.com/cunhamarcela/app-factory-template)

## Desenvolvimento

### Sprint 0 - Setup Inicial
- Configurar autenticação (Apple/Google/Email)
- Implementar analytics básicos
- Setup do banco de dados
- Configurar AdMob

### Sprint 1 - Core Features
- Desenvolver 3-5 telas principais
- Conectar com backend
- Implementar anúncios básicos
- Validar eventos de analytics

### Sprint 2 - Polimento
- Empty states e UX
- Loop diário e notificações
- Preparação para lançamento
- QA completo`
      },
      {
        id: 'app-spec',
        name: 'APP_SPEC_TEMPLATE.md',
        type: 'markdown',
        category: 'spec',
        filename: 'APP_SPEC_TEMPLATE.md',
        description: 'Especificação técnica detalhada do aplicativo',
        content: `# ${projectName} - Especificação

## Visão Geral

${project.description || 'Descrição do projeto a ser preenchida.'}

## Stack Tecnológica

- **Backend**: ${stack === 'firebase' ? 'Firebase' : 'Supabase'}
- **Frontend**: Flutter
- **Autenticação**: Apple/Google/Email
- **Analytics**: Firebase Analytics
- **Monetização**: AdMob

## Nicho

${niche}

## Funcionalidades Core

- [ ] Autenticação
- [ ] Tela principal
- [ ] Funcionalidade core 1
- [ ] Funcionalidade core 2
- [ ] Sistema de notificações

## Roadmap

### Sprint 0
- Setup inicial e configurações
- Implementação da autenticação
- Analytics básicos

### Sprint 1
- Desenvolvimento das telas core
- Integração com backend
- Implementação de anúncios

### Sprint 2
- Polimento e UX
- Preparação para lançamento
- QA completo

## Monetização

- Anúncios intersticiais
- Anúncios rewarded
- Banner ads
- Premium features (futuro)

## Analytics

- Eventos de onboarding
- Eventos de engajamento
- Eventos de monetização
- Eventos de retenção`
      },
      {
        id: 'auth-spec',
        name: 'AUTH_SPEC.md',
        type: 'markdown',
        category: 'spec',
        filename: 'AUTH_SPEC.md',
        description: 'Especificação do sistema de autenticação',
        content: `# Especificação de Autenticação

## Provedores Suportados

- **Apple Sign In** (iOS)
- **Google Sign In** (iOS/Android)
- **Email/Senha** (fallback)

## Fluxo de Autenticação

### 1. Tela de Login
- Botões para Apple/Google
- Campo de email/senha
- Link "Esqueci minha senha"
- Link "Criar conta"

### 2. Primeiro Login
- Coleta de dados básicos do usuário
- Termos de uso e política de privacidade
- Configurações de notificação

### 3. Gerenciamento de Sessão
- Token refresh automático
- Logout seguro
- Detecção de sessão expirada

## Configuração ${stack === 'firebase' ? 'Firebase' : 'Supabase'}

${stack === 'firebase' ? `
### Firebase Auth
\`\`\`
// Configure no Firebase Console
- Ativar Apple Sign In
- Ativar Google Sign In
- Ativar Email/Password
- Configurar domínios autorizados
\`\`\`
` : `
### Supabase Auth
\`\`\`
// Configure no Supabase Dashboard
- Ativar Apple provider
- Ativar Google provider
- Configurar redirect URLs
- Configurar email templates
\`\`\`
`}

## Segurança

- Validação de email obrigatória
- Senhas com mínimo 8 caracteres
- Rate limiting para tentativas de login
- Logout automático após inatividade`
      },
      {
        id: 'backend-contract',
        name: 'BACKEND_CONTRACT.yaml',
        type: 'yaml',
        category: 'config',
        filename: 'BACKEND_CONTRACT.yaml',
        description: 'Contrato da API backend',
        content: `# Backend Contract - ${projectName}

openapi: 3.0.0
info:
  title: ${projectName} API
  version: 1.0.0
  description: API contract for ${projectName}

servers:
  - url: https://api.${project.slug}.com
    description: Production server

paths:
  /auth/login:
    post:
      summary: User login
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                email:
                  type: string
                password:
                  type: string
      responses:
        '200':
          description: Login successful
          content:
            application/json:
              schema:
                type: object
                properties:
                  token:
                    type: string
                  user:
                    $ref: '#/components/schemas/User'

  /user/profile:
    get:
      summary: Get user profile
      security:
        - bearerAuth: []
      responses:
        '200':
          description: User profile
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/User'

components:
  schemas:
    User:
      type: object
      properties:
        id:
          type: string
        email:
          type: string
        name:
          type: string
        createdAt:
          type: string
          format: date-time

  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT`
      },
      // Prompts
      {
        id: 'cursor-bootstrap',
        name: 'Cursor Bootstrap',
        type: 'prompt',
        category: 'prompt',
        description: 'Prompt para inicializar o projeto no Cursor',
        content: `Você é um desenvolvedor Flutter experiente. Preciso que você me ajude a implementar o projeto "${projectName}" seguindo exatamente as especificações do AGENTS.md e APP_SPEC_TEMPLATE.md.

Stack: ${stack === 'firebase' ? 'Firebase' : 'Supabase'} + Flutter
Nicho: ${niche}

Tarefas prioritárias:
1. Setup inicial do projeto Flutter
2. Configurar autenticação (Apple/Google/Email)
3. Implementar analytics básicos
4. Configurar ${stack === 'firebase' ? 'Firebase' : 'Supabase'}

Por favor, comece pelo setup inicial e me guie passo a passo. Use as melhores práticas de arquitetura MVVM + Riverpod.`
      },
      {
        id: 'feature-brief',
        name: 'Feature Brief',
        type: 'prompt',
        category: 'prompt',
        description: 'Template para especificar novas funcionalidades',
        content: `# Feature Brief Template

## Funcionalidade: [NOME DA FEATURE]

### Contexto
- Por que esta feature é necessária?
- Qual problema ela resolve?
- Como se alinha com os objetivos do ${projectName}?

### Especificação Técnica
- Telas/componentes necessários
- APIs/endpoints requeridos
- Modelos de dados
- Dependências externas

### Critérios de Aceite
- [ ] Critério 1
- [ ] Critério 2
- [ ] Critério 3

### Analytics
- Eventos a serem trackeados
- Métricas de sucesso
- KPIs relacionados

### Monetização
- Como esta feature impacta a monetização?
- Oportunidades de anúncios
- Potencial para features premium

### Estimativa
- Tempo de desenvolvimento: X dias
- Sprint sugerido: Sprint X
- Prioridade: Alta/Média/Baixa`
      },
      {
        id: 'api-change-request',
        name: 'API Change Request',
        type: 'prompt',
        category: 'prompt',
        description: 'Template para mudanças na API',
        content: `# API Change Request - ${projectName}

## Endpoint: [METHOD] /api/endpoint

### Mudança Solicitada
Descreva a mudança necessária na API...

### Justificativa
Por que esta mudança é necessária?

### Impacto
- Breaking change? Sim/Não
- Versioning necessário? Sim/Não
- Clientes afetados: [lista]

### Especificação
\`\`\`json
// Request
{
  "campo": "valor"
}

// Response
{
  "resultado": "valor"
}
\`\`\`

### Testes
- [ ] Testes unitários
- [ ] Testes de integração
- [ ] Testes de regressão

### Deploy
- Estratégia de rollout
- Rollback plan
- Monitoramento`
      }
    ]
  }

  const handleWriteToRepo = async (template: Template) => {
    if (!project?.repoFullName) {
      alert('Repositório não configurado para este projeto')
      return
    }

    try {
      const response = await fetch('/api/github/write-files', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: project.repoFullName,
          files: [{
            path: template.filename || `${template.name}.md`,
            content: template.content,
            message: `chore: add ${template.name} template`
          }]
        })
      })

      if (!response.ok) {
        throw new Error('Failed to write file to repository')
      }

      alert(`${template.name} foi escrito no repositório com sucesso!`)
    } catch (error) {
      console.error('Error writing to repo:', error)
      alert('Erro ao escrever no repositório. Verifique suas permissões.')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen" style={{ background: 'var(--background)' }}>
        <div className="container mx-auto px-6 py-8">
          <div className="flex items-center justify-center h-64">
            <RefreshCw className="w-8 h-8 animate-spin" style={{ color: 'var(--foreground-secondary)' }} />
          </div>
        </div>
      </div>
    )
  }

  if (error || !project) {
    return (
      <div className="min-h-screen" style={{ background: 'var(--background)' }}>
        <div className="container mx-auto px-6 py-8">
          <div className="modern-card p-12 text-center">
            <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--foreground)' }}>
              Erro ao carregar projeto
            </h3>
            <p className="mb-6" style={{ color: 'var(--foreground-secondary)' }}>
              {error || 'Projeto não encontrado'}
            </p>
            <Link href="/projects">
              <Button className="gradient-primary text-white rounded-xl">
                Voltar aos Projetos
              </Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--background)' }}>
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <Link href={`/projects/${project.slug}`}>
              <Button variant="outline" size="sm" className="mr-4 rounded-xl">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar
              </Button>
            </Link>
            <div>
              <h1 className="text-4xl font-bold mb-2" style={{ color: 'var(--foreground)' }}>
                {project.name} - Templates
              </h1>
              <p className="text-lg" style={{ color: 'var(--foreground-secondary)' }}>
                Biblioteca de templates e prompts do Playbook
              </p>
            </div>
          </div>
          
          <Button 
            variant="outline" 
            className="rounded-xl"
            onClick={fetchProjectAndTemplates}
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Atualizar
          </Button>
        </div>

        {/* Templates */}
        <TemplateViewer 
          templates={templates}
          onWriteToRepo={project.repoFullName ? handleWriteToRepo : undefined}
        />
      </div>
    </div>
  )
}
