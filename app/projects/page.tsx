"use client"

import { useState, useEffect, useCallback } from "react"
import { useSession } from "next-auth/react"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, Rocket, Code, Search, RefreshCw, Github } from "lucide-react"
import Link from "next/link"

interface Project {
  id: string
  name: string
  slug: string
  description: string
  githubRepo: string
  stack: string
  status: string
  progress: number
  lastPush: string
  stars: number
  language: string
  isPrivate: boolean
  homepage?: string
}

export default function ProjectsPage() {
  const { data: session, status } = useSession()
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")

  const fetchProjects = useCallback(async () => {
    if (!session) return
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch('/api/projects')
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `HTTP ${response.status}: Failed to fetch projects`)
      }
      
      const data = await response.json()
      setProjects(data.projects || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load projects')
    } finally {
      setLoading(false)
    }
  }, [session])

  useEffect(() => {
    fetchProjects()
  }, [fetchProjects])

  if (status === "loading") {
    return <div>Loading...</div>
  }

  if (status === "unauthenticated") {
    redirect("/api/auth/signin")
  }

  if (!session) {
    return <div>Loading...</div>
  }

  const filteredProjects = projects.filter(project =>
    project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.description.toLowerCase().includes(searchTerm.toLowerCase())
  )


  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "deployed":
        return "gradient-success text-white border-0"
      case "development":
        return "gradient-secondary text-white border-0"
      case "planning":
        return "bg-gray-100 text-gray-700 border-0"
      default:
        return "bg-gray-100 text-gray-700 border-0"
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status.toLowerCase()) {
      case "deployed":
        return "Deployed"
      case "development":
        return "Development"
      case "planning":
        return "Planning"
      default:
        return "Unknown"
    }
  }

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return "gradient-success"
    if (progress >= 50) return "gradient-secondary"
    return "gradient-primary"
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--background)' }}>
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2" style={{ color: 'var(--foreground)' }}>
              Projetos
            </h1>
            <p className="text-lg" style={{ color: 'var(--foreground-secondary)' }}>
              Gerencie todos os seus projetos em um só lugar
            </p>
          </div>
          <Link href="/projects/new">
            <Button className="gradient-primary text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
              <Plus className="w-5 h-5 mr-2" />
              Novo Projeto
            </Button>
          </Link>
        </div>

        {/* Filters */}
        <div className="modern-card p-6 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4" style={{ color: 'var(--foreground-secondary)' }} />
                <input
                  type="text"
                  placeholder="Buscar projetos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  style={{ borderColor: 'var(--border)', background: 'var(--background)' }}
                />
              </div>
              <Button 
                variant="outline" 
                className="rounded-xl"
                onClick={fetchProjects}
                disabled={loading}
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Atualizar
              </Button>
            </div>
            <div className="text-sm" style={{ color: 'var(--foreground-secondary)' }}>
              {filteredProjects.length} projetos encontrados
            </div>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="modern-card p-6 mb-8 border-red-200 bg-red-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-red-100 rounded-xl">
                  <Github className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-red-800">Erro ao carregar projetos</h3>
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              </div>
              {error.includes("GitHub") && (
                <div className="flex items-center space-x-2">
                  <Button 
                    variant="outline" 
                    className="rounded-xl border-red-300 text-red-700 hover:bg-red-50"
                    onClick={() => window.location.href = '/api/auth/signin'}
                  >
                    <Github className="w-4 h-4 mr-2" />
                    Conectar GitHub
                  </Button>
                  <Button 
                    variant="outline" 
                    className="rounded-xl"
                    onClick={fetchProjects}
                    disabled={loading}
                  >
                    <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                    Tentar Novamente
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="modern-card p-12 text-center">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4" style={{ color: 'var(--foreground-secondary)' }} />
            <p style={{ color: 'var(--foreground-secondary)' }}>
              Carregando projetos do GitHub...
            </p>
          </div>
        )}

        {/* Projects Grid */}
        {!loading && !error && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredProjects.map((project) => (
            <div key={project.id} className="modern-card p-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-20 h-20 gradient-primary opacity-5 rounded-full -mr-10 -mt-10"></div>
              
              {/* Project Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 gradient-primary rounded-xl flex items-center justify-center">
                    <Rocket className="w-6 h-6 text-white" />
                  </div>
                    <div>
                      <h3 className="text-xl font-bold mb-1" style={{ color: 'var(--foreground)' }}>
                        {project.name}
                      </h3>
                      <div className="flex items-center space-x-2 text-sm" style={{ color: 'var(--foreground-secondary)' }}>
                        <span>{project.stack}</span>
                        {project.language && (
                          <>
                            <span>•</span>
                            <span>{project.language}</span>
                          </>
                        )}
                        {project.stars > 0 && (
                          <>
                            <span>•</span>
                            <span>⭐ {project.stars}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge className={`px-3 py-1 ${getStatusColor(project.status)}`}>
                      {getStatusLabel(project.status)}
                    </Badge>
                    {project.isPrivate && (
                      <Badge className="bg-gray-100 text-gray-700 border-0 text-xs">
                        Private
                      </Badge>
                    )}
                  </div>
              </div>

              {/* Project Description */}
              <p className="text-sm mb-4" style={{ color: 'var(--foreground-secondary)' }}>
                {project.description}
              </p>

              {/* Progress Bar */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>
                    Progresso
                  </span>
                  <span className="text-sm font-bold" style={{ color: 'var(--foreground)' }}>
                    {project.progress}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${getProgressColor(project.progress)}`}
                    style={{ width: `${project.progress}%` }}
                  ></div>
                </div>
              </div>

              {/* Project Footer */}
              <div className="flex items-center justify-between">
                <div className="text-xs" style={{ color: 'var(--foreground-secondary)' }}>
                  {project.lastPush ? `Último push: ${new Date(project.lastPush).toLocaleDateString('pt-BR')}` : 'Sem atividade recente'}
                </div>
                <div className="flex items-center space-x-2">
                  {project.githubRepo && (
                    <a href={project.githubRepo} target="_blank" rel="noopener noreferrer">
                      <Button variant="outline" size="sm" className="rounded-xl">
                        <Github className="w-4 h-4 mr-1" />
                        Repo
                      </Button>
                    </a>
                  )}
                  {project.homepage && (
                    <a href={project.homepage} target="_blank" rel="noopener noreferrer">
                      <Button variant="outline" size="sm" className="rounded-xl">
                        <Code className="w-4 h-4 mr-1" />
                        Demo
                      </Button>
                    </a>
                  )}
                  <Link href={`/projects/${project.slug}`}>
                    <Button variant="outline" size="sm" className="rounded-xl">
                      Ver Projeto
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
            ))}
          </div>
        )}

        {/* Empty State (if no projects) */}
        {!loading && !error && filteredProjects.length === 0 && (
          <div className="modern-card p-12 text-center">
            <div className="w-16 h-16 gradient-primary rounded-xl flex items-center justify-center mx-auto mb-4">
              <Rocket className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--foreground)' }}>
              {searchTerm ? 'Nenhum projeto encontrado' : 'Nenhum repositório encontrado'}
            </h3>
            <p className="mb-6" style={{ color: 'var(--foreground-secondary)' }}>
              {searchTerm 
                ? 'Tente ajustar os termos de busca' 
                : 'Conecte sua conta do GitHub ou crie seu primeiro projeto'
              }
            </p>
            <Link href="/projects/new">
              <Button className="gradient-primary text-white px-6 py-3 rounded-xl">
                <Plus className="w-5 h-5 mr-2" />
                Criar Primeiro Projeto
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
