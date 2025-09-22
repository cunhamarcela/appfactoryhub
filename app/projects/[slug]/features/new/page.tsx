"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Rocket, Loader2, Zap, Code, Copy, CheckCircle, Smartphone, Globe } from "lucide-react"
import Link from "next/link"

interface Project {
  id: string
  name: string
  slug: string
  techLanguage: string
  techFrontend: string
  techBackend: string
  techDatabase: string
}

interface FeatureResponse {
  feature: {
    id: string
    status: string
  }
  prompt: string
  checklist: {
    title: string
    items: Array<{
      id: string
      label: string
      done: boolean
    }>
  }
  tasks: Array<{
    title: string
  }>
}

export default function NewFeaturePage() {
  const params = useParams()
  const slug = params.slug as string
  
  const [project, setProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<FeatureResponse | null>(null)
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    surfaces: ["app_mobile"] as string[],
    autoPlan: true
  })

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const response = await fetch(`/api/projects/${slug}`)
        if (response.ok) {
          const data = await response.json()
          setProject(data.project)
        }
      } catch (error) {
        console.error('Error fetching project:', error)
      }
    }

    fetchProject()
  }, [slug])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSurfaceToggle = (surface: string) => {
    setFormData(prev => ({
      ...prev,
      surfaces: prev.surfaces.includes(surface)
        ? prev.surfaces.filter(s => s !== surface)
        : [...prev.surfaces, surface]
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/projects/${slug}/features`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create feature')
      }

      const data = await response.json()
      setResult(data)
      
    } catch (err) {
      console.error('Error creating feature:', err)
      setError(err instanceof Error ? err.message : 'Failed to create feature')
    } finally {
      setLoading(false)
    }
  }

  const copyPrompt = async () => {
    if (result?.prompt) {
      await navigator.clipboard.writeText(result.prompt)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const surfaceOptions = [
    { value: "app_mobile", label: "App Mobile", description: "iOS & Android", icon: Smartphone },
    { value: "web_app", label: "Web App", description: "Progressive Web App", icon: Globe }
  ]

  // Se já criou a feature, mostrar resultado
  if (result) {
    return (
      <div className="min-h-screen" style={{ background: 'var(--background)' }}>
        <div className="container mx-auto px-6 py-8 max-w-4xl">
          {/* Header */}
          <div className="flex items-center mb-8">
            <Link href={`/projects/${slug}/features`}>
              <Button variant="outline" size="sm" className="mr-4 rounded-xl">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar
              </Button>
            </Link>
            <div>
              <h1 className="text-4xl font-bold mb-2" style={{ color: 'var(--foreground)' }}>
                Feature Criada!
              </h1>
              <p className="text-lg" style={{ color: 'var(--foreground-secondary)' }}>
                Sua feature foi criada com sucesso. Aqui estão os próximos passos:
              </p>
            </div>
          </div>

          <div className="space-y-6">
            {/* Success Card */}
            <div className="modern-card p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 gradient-success rounded-xl">
                  <CheckCircle className="h-5 w-5 text-white" />
                </div>
                <h3 className="text-lg font-bold" style={{ color: 'var(--foreground)' }}>
                  Feature &ldquo;{formData.title}&rdquo; criada
                </h3>
              </div>
              <p style={{ color: 'var(--foreground-secondary)' }}>
                A feature foi analisada e um plano completo foi gerado automaticamente.
              </p>
            </div>

            {/* Prompt para Cursor */}
            {result.prompt && (
              <div className="modern-card p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 gradient-primary rounded-xl">
                      <Code className="h-5 w-5 text-white" />
                    </div>
                    <h3 className="text-lg font-bold" style={{ color: 'var(--foreground)' }}>
                      Prompt para Cursor
                    </h3>
                  </div>
                  <Button
                    onClick={copyPrompt}
                    variant="outline"
                    size="sm"
                    className="rounded-lg"
                  >
                    {copied ? (
                      <>
                        <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                        Copiado!
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4 mr-2" />
                        Copiar
                      </>
                    )}
                  </Button>
                </div>
                <div className="bg-gray-100 p-4 rounded-lg border">
                  <pre className="text-sm whitespace-pre-wrap" style={{ color: 'var(--foreground)' }}>
                    {result.prompt}
                  </pre>
                </div>
                <p className="text-sm mt-2" style={{ color: 'var(--foreground-secondary)' }}>
                  Cole este prompt no Cursor para começar a implementar a feature.
                </p>
              </div>
            )}

            {/* Tasks Criadas */}
            {result.tasks && result.tasks.length > 0 && (
              <div className="modern-card p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 gradient-secondary rounded-xl">
                    <Zap className="h-5 w-5 text-white" />
                  </div>
                  <h3 className="text-lg font-bold" style={{ color: 'var(--foreground)' }}>
                    Tasks Criadas ({result.tasks.length})
                  </h3>
                </div>
                <div className="space-y-2">
                  {result.tasks.map((task, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className="w-2 h-2 gradient-secondary rounded-full"></div>
                      <span style={{ color: 'var(--foreground)' }}>{task.title}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Checklist Criada */}
            {result.checklist && result.checklist.items.length > 0 && (
              <div className="modern-card p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 gradient-accent rounded-xl">
                    <CheckCircle className="h-5 w-5 text-white" />
                  </div>
                  <h3 className="text-lg font-bold" style={{ color: 'var(--foreground)' }}>
                    {result.checklist.title} ({result.checklist.items.length} itens)
                  </h3>
                </div>
                <div className="space-y-2">
                  {result.checklist.items.map((item, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <input 
                        type="checkbox" 
                        checked={item.done} 
                        readOnly
                        className="w-4 h-4 text-blue-600 rounded"
                      />
                      <span style={{ color: 'var(--foreground)' }}>{item.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center gap-4">
              <Link href={`/projects/${slug}/features`}>
                <Button className="gradient-primary text-white px-6 py-3 rounded-xl font-semibold">
                  Ver Todas as Features
                </Button>
              </Link>
              <Link href={`/projects/${slug}/board`}>
                <Button variant="outline" className="rounded-xl">
                  Ver Board de Tasks
                </Button>
              </Link>
              <Link href={`/projects/${slug}/checklists`}>
                <Button variant="outline" className="rounded-xl">
                  Ver Checklists
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--background)' }}>
      <div className="container mx-auto px-6 py-8 max-w-4xl">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-8">
          <Link href={`/projects/${slug}/features`}>
            <Button variant="outline" size="sm" className="rounded-xl w-fit">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl sm:text-4xl font-bold mb-2" style={{ color: 'var(--foreground)' }}>
              Nova Feature
            </h1>
            <p className="text-sm sm:text-lg" style={{ color: 'var(--foreground-secondary)' }}>
              {project?.name} - Crie uma nova funcionalidade para seu projeto
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="modern-card p-6">
              <div className="space-y-6">
                {/* Feature Title */}
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--foreground)' }}>
                    Nome da Feature *
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="Ex: Sistema de Pagamentos"
                    required
                    className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    style={{ borderColor: 'var(--border)', background: 'var(--background)' }}
                  />
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
                    placeholder="Descreva o que esta feature deve fazer..."
                    rows={4}
                    className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    style={{ borderColor: 'var(--border)', background: 'var(--background)' }}
                  />
                </div>

                {/* Superfícies */}
                <div>
                  <label className="block text-sm font-medium mb-3" style={{ color: 'var(--foreground)' }}>
                    Superfícies Alvo *
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {surfaceOptions.map(surface => {
                      const Icon = surface.icon
                      return (
                        <div
                          key={surface.value}
                          className={`p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 ${
                            formData.surfaces.includes(surface.value) 
                              ? 'border-indigo-500 bg-indigo-50' 
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                          onClick={() => handleSurfaceToggle(surface.value)}
                        >
                          <div className="flex items-center space-x-3">
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                              formData.surfaces.includes(surface.value) ? 'bg-indigo-500' : 'bg-gray-400'
                            }`}>
                              <Icon className="w-5 h-5 text-white" />
                            </div>
                            <div>
                              <h4 className="font-semibold">{surface.label}</h4>
                              <p className="text-sm text-gray-600">{surface.description}</p>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                  {formData.surfaces.length === 0 && (
                    <p className="text-sm text-red-500 mt-2">Selecione pelo menos uma superfície</p>
                  )}
                </div>

                {/* Auto Plan */}
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="autoPlan"
                    checked={formData.autoPlan}
                    onChange={(e) => setFormData(prev => ({ ...prev, autoPlan: e.target.checked }))}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                  <label htmlFor="autoPlan" className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>
                    Gerar plano automaticamente (recomendado)
                  </label>
                </div>
                <p className="text-xs" style={{ color: 'var(--foreground-secondary)' }}>
                  Quando ativado, o sistema analisará seu repositório e gerará um prompt personalizado para o Cursor, além de criar tasks e checklists automaticamente.
                </p>

                {/* Error Display */}
                {error && (
                  <div className="p-4 bg-red-100 border border-red-300 rounded-lg">
                    <p className="text-red-600 font-medium">Erro ao criar feature</p>
                    <p className="text-red-500 text-sm mt-1">{error}</p>
                  </div>
                )}

                {/* Submit Button */}
                <div className="flex flex-col sm:flex-row items-center gap-4 pt-4">
                  <Button
                    type="submit"
                    disabled={loading || !formData.title || formData.surfaces.length === 0}
                    className="gradient-primary text-white px-8 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 w-full sm:w-auto"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Criando Feature...
                      </>
                    ) : (
                      <>
                        <Rocket className="w-5 h-5 mr-2" />
                        Criar Feature
                      </>
                    )}
                  </Button>
                  <Link href={`/projects/${slug}/features`} className="w-full sm:w-auto">
                    <Button variant="outline" className="rounded-xl w-full">
                      Cancelar
                    </Button>
                  </Link>
                </div>
              </div>
            </form>
          </div>

          {/* Sidebar Info */}
          <div className="space-y-6">
            {/* Project Stack */}
            {project && (
              <div className="modern-card p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 gradient-info rounded-xl">
                    <Code className="h-5 w-5 text-white" />
                  </div>
                  <h3 className="text-lg font-bold" style={{ color: 'var(--foreground)' }}>
                    Stack do Projeto
                  </h3>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span style={{ color: 'var(--foreground-secondary)' }}>Linguagem:</span>
                    <span style={{ color: 'var(--foreground)' }}>{project.techLanguage}</span>
                  </div>
                  <div className="flex justify-between">
                    <span style={{ color: 'var(--foreground-secondary)' }}>Frontend:</span>
                    <span style={{ color: 'var(--foreground)' }}>{project.techFrontend}</span>
                  </div>
                  <div className="flex justify-between">
                    <span style={{ color: 'var(--foreground-secondary)' }}>Backend:</span>
                    <span style={{ color: 'var(--foreground)' }}>{project.techBackend}</span>
                  </div>
                  <div className="flex justify-between">
                    <span style={{ color: 'var(--foreground-secondary)' }}>Database:</span>
                    <span style={{ color: 'var(--foreground)' }}>{project.techDatabase}</span>
                  </div>
                </div>
              </div>
            )}

            {/* What happens */}
            <div className="modern-card p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 gradient-accent rounded-xl">
                  <Zap className="h-5 w-5 text-white" />
                </div>
                <h3 className="text-lg font-bold" style={{ color: 'var(--foreground)' }}>
                  O que acontece?
                </h3>
              </div>
              <div className="space-y-3 text-sm" style={{ color: 'var(--foreground-secondary)' }}>
                <div className="flex items-start space-x-2">
                  <div className="w-2 h-2 gradient-primary rounded-full mt-2"></div>
                  <span>Análise automática do repositório GitHub</span>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-2 h-2 gradient-secondary rounded-full mt-2"></div>
                  <span>Geração de prompt personalizado para Cursor</span>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-2 h-2 gradient-success rounded-full mt-2"></div>
                  <span>Criação de tasks específicas da feature</span>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-2 h-2 gradient-accent rounded-full mt-2"></div>
                  <span>Checklist de implementação gerado</span>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-2 h-2 gradient-info rounded-full mt-2"></div>
                  <span>Itens cross-surface quando necessário</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
