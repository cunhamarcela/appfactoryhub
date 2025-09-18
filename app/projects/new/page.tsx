"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Rocket, Database, Code, Loader2 } from "lucide-react"
import Link from "next/link"

export default function NewProjectPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    niche: "",
    stack: "firebase",
    description: ""
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value,
      // Auto-generate slug from name
      ...(name === 'name' && { slug: value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') })
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Step 1: Create GitHub repository from template
      const repoResponse = await fetch('/api/github/create-repo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.slug,
          description: formData.description || `${formData.name} - Criado pelo App Factory Hub`
        })
      })

      if (!repoResponse.ok) {
        const error = await repoResponse.json()
        throw new Error(error.error || 'Failed to create repository')
      }

      const repoData = await repoResponse.json()

      // Step 2: Create project in database
      const projectResponse = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          slug: formData.slug,
          niche: formData.niche,
          stack: formData.stack,
          description: formData.description,
          repoUrl: repoData.repoUrl,
          repoFullName: repoData.fullName
        })
      })

      if (!projectResponse.ok) {
        const error = await projectResponse.json()
        throw new Error(error.error || 'Failed to create project')
      }

      const projectData = await projectResponse.json()

      // Step 3: Write Playbook files to repository
      const playbookFiles = [
        {
          path: "AGENTS.md",
          content: getAgentsContent(formData),
          message: "chore: add AGENTS.md from App Factory Playbook"
        },
        {
          path: "APP_SPEC_TEMPLATE.md", 
          content: getAppSpecContent(formData),
          message: "chore: add APP_SPEC_TEMPLATE.md"
        },
        {
          path: "README.md",
          content: getReadmeContent(formData),
          message: "chore: update README with project info"
        }
      ]

      await fetch('/api/github/write-files', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: repoData.fullName,
          files: playbookFiles
        })
      })

      // Step 4: Seed project with initial tasks and checklists
      await fetch(`/api/projects/${formData.slug}/seed`, {
        method: 'POST'
      })

      // Success! Redirect to project page
      router.push(`/projects/${formData.slug}`)
      
    } catch (error) {
      console.error('Error creating project:', error)
      alert(error instanceof Error ? error.message : 'Failed to create project')
    } finally {
      setLoading(false)
    }
  }

  // Helper functions to generate Playbook content
  const getAgentsContent = (data: typeof formData) => `# AGENTS.md

## Projeto: ${data.name}

### Stack: ${data.stack}
### Nicho: ${data.niche || 'Não especificado'}

Este projeto foi criado usando o App Factory Hub e segue o Playbook padrão.

## Próximos Passos

1. Configure as variáveis de ambiente
2. Execute o setup inicial do banco de dados
3. Siga o board de tarefas para desenvolvimento
4. Use os templates e prompts disponíveis no Hub

## Recursos

- [App Factory Hub](https://appfactoryhub.vercel.app)
- [Documentação do Playbook](https://github.com/cunhamarcela/app-factory-template)
`

  const getAppSpecContent = (data: typeof formData) => `# ${data.name} - Especificação

## Visão Geral

${data.description || 'Descrição do projeto a ser preenchida.'}

## Stack Tecnológica

- **Backend**: ${data.stack === 'firebase' ? 'Firebase' : 'Supabase'}
- **Frontend**: Flutter
- **Autenticação**: Apple/Google/Email
- **Analytics**: Firebase Analytics
- **Monetização**: AdMob

## Nicho

${data.niche || 'A ser definido'}

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
`

  const getReadmeContent = (data: typeof formData) => `# ${data.name}

${data.description || 'Projeto criado com App Factory Hub'}

## Stack

- **${data.stack === 'firebase' ? 'Firebase' : 'Supabase'}**
- Flutter
- ${data.niche ? `Nicho: ${data.niche}` : ''}

## Desenvolvimento

Este projeto segue o App Factory Playbook. Consulte os arquivos AGENTS.md e APP_SPEC_TEMPLATE.md para mais detalhes.

## Setup

1. Clone o repositório
2. Configure as variáveis de ambiente
3. Execute \`flutter pub get\`
4. Siga as instruções no AGENTS.md

---

Criado com ❤️ usando [App Factory Hub](https://appfactoryhub.vercel.app)
`

  const stacks = [
    { value: "firebase", label: "Firebase", description: "Next.js + Firebase + Vercel" },
    { value: "supabase", label: "Supabase", description: "Next.js + Supabase + Vercel" }
  ]

  const niches = [
    "E-commerce", "SaaS", "Marketplace", "Social Media", "Fintech", 
    "Edtech", "Healthcare", "Real Estate", "Food & Delivery", "Fitness",
    "Travel", "Gaming", "Productivity", "Entertainment", "Other"
  ]

  return (
    <div className="min-h-screen" style={{ background: 'var(--background)' }}>
      <div className="container mx-auto px-6 py-8 max-w-4xl">
        {/* Header */}
        <div className="flex items-center mb-8">
          <Link href="/projects">
            <Button variant="outline" size="sm" className="mr-4 rounded-xl">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
          </Link>
          <div>
            <h1 className="text-4xl font-bold mb-2" style={{ color: 'var(--foreground)' }}>
              Novo Projeto
            </h1>
            <p className="text-lg" style={{ color: 'var(--foreground-secondary)' }}>
              Configure seu novo projeto e comece a desenvolver
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="modern-card p-6">
              <div className="space-y-6">
                {/* Project Name */}
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--foreground)' }}>
                    Nome do Projeto *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Ex: E-commerce Platform"
                    required
                    className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    style={{ borderColor: 'var(--border)', background: 'var(--background)' }}
                  />
                </div>

                {/* Project Slug */}
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--foreground)' }}>
                    Slug do Projeto *
                  </label>
                  <input
                    type="text"
                    name="slug"
                    value={formData.slug}
                    onChange={handleInputChange}
                    placeholder="ecommerce-platform"
                    required
                    className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    style={{ borderColor: 'var(--border)', background: 'var(--background)' }}
                  />
                  <p className="text-xs mt-1" style={{ color: 'var(--foreground-secondary)' }}>
                    Será usado para URLs e nome do repositório
                  </p>
                </div>

                {/* Niche */}
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--foreground)' }}>
                    Nicho
                  </label>
                  <select
                    name="niche"
                    value={formData.niche}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    style={{ borderColor: 'var(--border)', background: 'var(--background)' }}
                  >
                    <option value="">Selecione um nicho</option>
                    {niches.map(niche => (
                      <option key={niche} value={niche.toLowerCase()}>{niche}</option>
                    ))}
                  </select>
                </div>

                {/* Stack Selection */}
                <div>
                  <label className="block text-sm font-medium mb-4" style={{ color: 'var(--foreground)' }}>
                    Stack Tecnológica *
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {stacks.map(stack => (
                      <div
                        key={stack.value}
                        className={`p-4 border-2 rounded-xl cursor-pointer transition-all duration-300 ${
                          formData.stack === stack.value 
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => setFormData(prev => ({ ...prev, stack: stack.value }))}
                      >
                        <div className="flex items-center space-x-3">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                            stack.value === 'firebase' ? 'gradient-secondary' : 'gradient-success'
                          }`}>
                            <Database className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <h3 className="font-semibold" style={{ color: 'var(--foreground)' }}>
                              {stack.label}
                            </h3>
                            <p className="text-sm" style={{ color: 'var(--foreground-secondary)' }}>
                              {stack.description}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--foreground)' }}>
                    Descrição
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Descreva brevemente o que seu projeto fará..."
                    rows={4}
                    className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    style={{ borderColor: 'var(--border)', background: 'var(--background)' }}
                  />
                </div>

                {/* Submit Button */}
                <div className="flex items-center space-x-4 pt-4">
                  <Button
                    type="submit"
                    disabled={loading || !formData.name || !formData.slug}
                    className="gradient-primary text-white px-8 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Criando Projeto...
                      </>
                    ) : (
                      <>
                        <Rocket className="w-5 h-5 mr-2" />
                        Criar Projeto
                      </>
                    )}
                  </Button>
                  <Link href="/projects">
                    <Button variant="outline" className="rounded-xl">
                      Cancelar
                    </Button>
                  </Link>
                </div>
              </div>
            </form>
          </div>

          {/* Sidebar Info */}
          <div className="space-y-6">
            <div className="modern-card p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 gradient-info rounded-xl">
                  <Code className="h-5 w-5 text-white" />
                </div>
                <h3 className="text-lg font-bold" style={{ color: 'var(--foreground)' }}>
                  O que acontece?
                </h3>
              </div>
              <div className="space-y-3 text-sm" style={{ color: 'var(--foreground-secondary)' }}>
                <div className="flex items-start space-x-2">
                  <div className="w-2 h-2 gradient-primary rounded-full mt-2"></div>
                  <span>Repositório criado no GitHub a partir do template</span>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-2 h-2 gradient-secondary rounded-full mt-2"></div>
                  <span>Arquivos do Playbook escritos automaticamente</span>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-2 h-2 gradient-success rounded-full mt-2"></div>
                  <span>Tasks e checklists iniciais criados</span>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-2 h-2 gradient-accent rounded-full mt-2"></div>
                  <span>Configuração inicial do banco de dados</span>
                </div>
              </div>
            </div>

            <div className="modern-card p-6">
              <h3 className="text-lg font-bold mb-4" style={{ color: 'var(--foreground)' }}>
                Próximos Passos
              </h3>
              <div className="space-y-3 text-sm" style={{ color: 'var(--foreground-secondary)' }}>
                <p>1. Configure as variáveis de ambiente</p>
                <p>2. Execute o setup inicial do banco</p>
                <p>3. Comece o desenvolvimento seguindo o board</p>
                <p>4. Use os templates e prompts disponíveis</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
