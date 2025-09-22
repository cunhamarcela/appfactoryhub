"use client"

import { useState, useEffect, useCallback } from "react"
import { useSession } from "next-auth/react"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ArrowLeft, RefreshCw, CheckSquare } from "lucide-react"
import Link from "next/link"
import { Checklist } from "@/components/Checklist"

interface ChecklistItem {
  id: string
  label: string
  done: boolean
}

interface ChecklistData {
  id: string
  type: string
  title: string
  items: ChecklistItem[]
  progress: number
  createdAt: string
  updatedAt: string
}

interface Project {
  id: string
  name: string
  slug: string
  description?: string
  stack: string
  status: string
}

interface ChecklistsPageProps {
  params: { slug: string }
}

export default function ChecklistsPage({ params }: ChecklistsPageProps) {
  const { data: session, status } = useSession()
  const [project, setProject] = useState<Project | null>(null)
  const [checklists, setChecklists] = useState<ChecklistData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchProjectAndChecklists = useCallback(async () => {
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

      // Fetch real checklists data from database
      const checklistsResponse = await fetch(`/api/projects/${params.slug}/checklists`)
      if (!checklistsResponse.ok) {
        throw new Error('Failed to fetch checklists')
      }
      
      const checklistsData = await checklistsResponse.json()
      setChecklists(checklistsData.checklists || [])

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load project')
    } finally {
      setLoading(false)
    }
  }, [session, params.slug])

  useEffect(() => {
    fetchProjectAndChecklists()
  }, [fetchProjectAndChecklists])

  if (status === "loading") {
    return <div>Loading...</div>
  }

  if (!session) {
    redirect("/api/auth/signin")
  }

  const handleItemToggle = async (checklistId: string, itemId: string, done: boolean) => {
    try {
      // Update local state optimistically
      let updatedItems: ChecklistItem[] = []
      setChecklists(prevChecklists => 
        prevChecklists.map(checklist => {
          if (checklist.id === checklistId) {
            updatedItems = checklist.items.map(item =>
              item.id === itemId ? { ...item, done } : item
            )
            const completedItems = updatedItems.filter(item => item.done).length
            const progress = Math.round((completedItems / updatedItems.length) * 100)
            
            return {
              ...checklist,
              items: updatedItems,
              progress,
              updatedAt: new Date().toISOString()
            }
          }
          return checklist
        })
      )

      // Persist the change to the database
      const response = await fetch(`/api/checklists/${checklistId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: updatedItems })
      })

      if (!response.ok) {
        throw new Error('Failed to update checklist')
      }

    } catch (error) {
      console.error('Error updating checklist item:', error)
      // Revert optimistic update on error
      fetchProjectAndChecklists()
      throw error
    }
  }

  const handleReset = async (checklistId: string) => {
    try {
      // Update local state optimistically
      setChecklists(prevChecklists => 
        prevChecklists.map(checklist => {
          if (checklist.id === checklistId) {
            const resetItems = checklist.items.map(item => ({ ...item, done: false }))
            return {
              ...checklist,
              items: resetItems,
              progress: 0,
              updatedAt: new Date().toISOString()
            }
          }
          return checklist
        })
      )

      // Persist the reset to the database
      const response = await fetch(`/api/checklists/${checklistId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reset' })
      })

      if (!response.ok) {
        throw new Error('Failed to reset checklist')
      }

    } catch (error) {
      console.error('Error resetting checklist:', error)
      // Revert optimistic update on error
      fetchProjectAndChecklists()
      throw error
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

  const totalProgress = checklists.length > 0 
    ? Math.round(checklists.reduce((sum, checklist) => sum + checklist.progress, 0) / checklists.length)
    : 0

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
                {project.name} - Checklists
              </h1>
              <p className="text-lg" style={{ color: 'var(--foreground-secondary)' }}>
                Acompanhe o progresso das etapas importantes
              </p>
            </div>
          </div>
          
          <Button 
            variant="outline" 
            className="rounded-xl"
            onClick={fetchProjectAndChecklists}
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Atualizar
          </Button>
        </div>

        {/* Overall Progress */}
        <div className="modern-card p-6 mb-8">
          <div className="flex items-center space-x-4 mb-4">
            <div className="p-3 gradient-primary rounded-xl">
              <CheckSquare className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold" style={{ color: 'var(--foreground)' }}>
                Progresso Geral
              </h2>
              <p style={{ color: 'var(--foreground-secondary)' }}>
                {checklists.length} checklists disponíveis
              </p>
            </div>
          </div>
          
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>
              Progresso Total
            </span>
            <span className="text-sm font-bold" style={{ color: 'var(--foreground)' }}>
              {totalProgress}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div 
              className={`h-3 rounded-full transition-all duration-300 ${
                totalProgress === 100 ? 'gradient-success' : 'gradient-primary'
              }`}
              style={{ width: `${totalProgress}%` }}
            ></div>
          </div>
        </div>

        {/* Checklists */}
        <div className="space-y-8">
          {checklists.map((checklist) => (
            <Checklist
              key={checklist.id}
              checklist={checklist}
              onItemToggle={handleItemToggle}
              onReset={handleReset}
            />
          ))}
        </div>

        {checklists.length === 0 && (
          <div className="modern-card p-12 text-center">
            <CheckSquare className="w-16 h-16 mx-auto mb-4" style={{ color: 'var(--foreground-secondary)' }} />
            <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--foreground)' }}>
              Nenhum checklist encontrado
            </h3>
            <p style={{ color: 'var(--foreground-secondary)' }}>
              Os checklists serão criados automaticamente quando você fizer o seed do projeto.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
