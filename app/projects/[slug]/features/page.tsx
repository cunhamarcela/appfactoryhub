"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Plus, Zap, Code, GitBranch, Clock, CheckCircle, AlertCircle } from "lucide-react"
import Link from "next/link"

interface Feature {
  id: string
  title: string
  description?: string
  surfaces: string[]
  status: string
  createdAt: string
  updatedAt: string
}

interface Project {
  id: string
  name: string
  slug: string
  techLanguage: string
  techFrontend: string
  techBackend: string
  techDatabase: string
}

export default function FeaturesPage() {
  const params = useParams()
  const slug = params.slug as string
  const [project, setProject] = useState<Project | null>(null)
  const [features, setFeatures] = useState<Feature[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Buscar dados do projeto
        const projectResponse = await fetch(`/api/projects/${slug}`)
        if (projectResponse.ok) {
          const projectData = await projectResponse.json()
          setProject(projectData.project)
        }

        // Buscar features
        const featuresResponse = await fetch(`/api/projects/${slug}/features`)
        if (featuresResponse.ok) {
          const featuresData = await featuresResponse.json()
          setFeatures(featuresData.features || [])
        }
      } catch (err) {
        console.error('Error fetching data:', err)
        setError(err instanceof Error ? err.message : 'Erro ao carregar dados')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [slug])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'planned':
        return <Clock className="w-4 h-4 text-blue-500" />
      case 'in_progress':
        return <AlertCircle className="w-4 h-4 text-yellow-500" />
      case 'done':
        return <CheckCircle className="w-4 h-4 text-green-500" />
      default:
        return <Clock className="w-4 h-4 text-gray-500" />
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'planned':
        return 'Planejada'
      case 'in_progress':
        return 'Em Desenvolvimento'
      case 'done':
        return 'Concluída'
      default:
        return 'Desconhecido'
    }
  }

  const getSurfaceLabel = (surface: string) => {
    switch (surface) {
      case 'app_mobile':
        return 'Mobile'
      case 'web_app':
        return 'Web'
      default:
        return surface
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--background)' }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p style={{ color: 'var(--foreground-secondary)' }}>Carregando features...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--background)' }}>
        <div className="text-center">
          <div className="p-4 bg-red-100 rounded-lg mb-4">
            <p className="text-red-600 font-medium">Erro ao carregar features</p>
            <p className="text-red-500 text-sm mt-1">{error}</p>
          </div>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Tentar Novamente
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--background)' }}>
      <div className="container mx-auto px-6 py-8 max-w-6xl">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div className="flex items-center">
            <Link href={`/projects/${slug}`}>
              <Button variant="outline" size="sm" className="mr-4 rounded-xl">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl sm:text-4xl font-bold mb-2" style={{ color: 'var(--foreground)' }}>
                Features
              </h1>
              <p className="text-sm sm:text-lg" style={{ color: 'var(--foreground-secondary)' }}>
                {project?.name} - Gerencie as funcionalidades do seu projeto
              </p>
            </div>
          </div>
          
          <Link href={`/projects/${slug}/features/new`}>
            <Button className="gradient-primary text-white px-4 sm:px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 w-full sm:w-auto">
              <Plus className="w-5 h-5 mr-2" />
              Nova Feature
            </Button>
          </Link>
        </div>

        {/* Stack Info */}
        {project && (
          <div className="modern-card p-6 mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 gradient-info rounded-xl">
                <Code className="h-5 w-5 text-white" />
              </div>
              <h3 className="text-lg font-bold" style={{ color: 'var(--foreground)' }}>
                Stack do Projeto
              </h3>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm font-medium" style={{ color: 'var(--foreground-secondary)' }}>Linguagem</p>
                <Badge variant="secondary" className="mt-1">{project.techLanguage}</Badge>
              </div>
              <div>
                <p className="text-sm font-medium" style={{ color: 'var(--foreground-secondary)' }}>Frontend</p>
                <Badge variant="secondary" className="mt-1">{project.techFrontend}</Badge>
              </div>
              <div>
                <p className="text-sm font-medium" style={{ color: 'var(--foreground-secondary)' }}>Backend</p>
                <Badge variant="secondary" className="mt-1">{project.techBackend}</Badge>
              </div>
              <div>
                <p className="text-sm font-medium" style={{ color: 'var(--foreground-secondary)' }}>Database</p>
                <Badge variant="secondary" className="mt-1">{project.techDatabase}</Badge>
              </div>
            </div>
          </div>
        )}

        {/* Features List */}
        <div className="space-y-6">
          {features.length === 0 ? (
            <div className="modern-card p-12 text-center">
              <div className="p-4 gradient-accent rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center">
                <Zap className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--foreground)' }}>
                Nenhuma feature criada ainda
              </h3>
              <p className="text-lg mb-6" style={{ color: 'var(--foreground-secondary)' }}>
                Crie sua primeira feature para começar a planejar funcionalidades
              </p>
              <Link href={`/projects/${slug}/features/new`}>
                <Button className="gradient-primary text-white px-8 py-3 rounded-xl font-semibold">
                  <Plus className="w-5 h-5 mr-2" />
                  Criar Primeira Feature
                </Button>
              </Link>
            </div>
          ) : (
            <div className="grid gap-6">
              {features.map((feature) => (
                <div key={feature.id} className="modern-card p-4 sm:p-6 hover:shadow-lg transition-shadow duration-300">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
                    <div className="flex-1">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2">
                        <h3 className="text-lg sm:text-xl font-bold" style={{ color: 'var(--foreground)' }}>
                          {feature.title}
                        </h3>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(feature.status)}
                          <span className="text-sm font-medium" style={{ color: 'var(--foreground-secondary)' }}>
                            {getStatusLabel(feature.status)}
                          </span>
                        </div>
                      </div>
                      {feature.description && (
                        <p className="text-base mb-4" style={{ color: 'var(--foreground-secondary)' }}>
                          {feature.description}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                      <div className="flex items-center gap-2">
                        <GitBranch className="w-4 h-4" style={{ color: 'var(--foreground-secondary)' }} />
                        <span className="text-sm" style={{ color: 'var(--foreground-secondary)' }}>
                          Superfícies:
                        </span>
                        <div className="flex gap-1 flex-wrap">
                          {feature.surfaces.map((surface) => (
                            <Badge key={surface} variant="outline" className="text-xs">
                              {getSurfaceLabel(surface)}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="rounded-lg hover:bg-gray-50 transition-colors flex-1 sm:flex-none"
                        onClick={() => {
                          // TODO: Implementar modal de detalhes ou página dedicada
                          alert(`Detalhes da feature: ${feature.title}`)
                        }}
                      >
                        Ver Detalhes
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="rounded-lg hover:bg-gray-50 transition-colors flex-1 sm:flex-none"
                        onClick={() => {
                          // TODO: Implementar edição inline ou modal
                          alert(`Editar feature: ${feature.title}`)
                        }}
                      >
                        Editar
                      </Button>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t" style={{ borderColor: 'var(--border)' }}>
                    <div className="flex items-center justify-between text-sm" style={{ color: 'var(--foreground-secondary)' }}>
                      <span>Criada em {new Date(feature.createdAt).toLocaleDateString('pt-BR')}</span>
                      <span>Atualizada em {new Date(feature.updatedAt).toLocaleDateString('pt-BR')}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
