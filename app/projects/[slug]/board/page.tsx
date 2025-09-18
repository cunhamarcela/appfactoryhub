"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { redirect, notFound } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ArrowLeft, RefreshCw } from "lucide-react"
import Link from "next/link"
import { Kanban } from "@/components/Kanban"

interface Task {
  id: string
  title: string
  description?: string
  status: 'todo' | 'doing' | 'done'
  sprint: string
  priority?: string
  category?: string
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

interface BoardPageProps {
  params: { slug: string }
}

export default function BoardPage({ params }: BoardPageProps) {
  const { data: session, status } = useSession()
  const [project, setProject] = useState<Project | null>(null)
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  if (status === "loading") {
    return <div>Loading...</div>
  }

  if (!session) {
    redirect("/api/auth/signin")
  }

  useEffect(() => {
    fetchProjectAndTasks()
  }, [params.slug])

  const fetchProjectAndTasks = async () => {
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

      // For now, we'll create mock tasks since we don't have a direct API to fetch tasks by project
      // In a real implementation, you'd have an API endpoint like /api/projects/[slug]/tasks
      const mockTasks: Task[] = [
        {
          id: '1',
          title: 'Criar repo do template e copiar App Factory',
          status: 'done',
          sprint: 'sprint0',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: '2', 
          title: 'Preencher APP_SPEC_TEMPLATE.md',
          status: 'doing',
          sprint: 'sprint0',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: '3',
          title: 'Definir BACKEND_CONTRACT.yaml',
          status: 'todo',
          sprint: 'sprint0',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: '4',
          title: 'Scaffolding Flutter (MVVM + Riverpod)',
          status: 'todo',
          sprint: 'sprint0',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: '5',
          title: 'Configurar Auth (Apple/Google/Email)',
          status: 'todo',
          sprint: 'sprint0',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: '6',
          title: 'Entregar 3–5 telas core',
          status: 'todo',
          sprint: 'sprint1',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: '7',
          title: 'Conectar backend conforme contrato',
          status: 'todo',
          sprint: 'sprint1',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: '8',
          title: 'Empty states + loop diário + push básico',
          status: 'todo',
          sprint: 'sprint2',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ]
      
      setTasks(mockTasks)

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load project')
    } finally {
      setLoading(false)
    }
  }

  const handleTaskUpdate = async (taskId: string, status: 'todo' | 'doing' | 'done') => {
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      })

      if (!response.ok) {
        throw new Error('Failed to update task')
      }

      // Update local state
      setTasks(prevTasks => 
        prevTasks.map(task => 
          task.id === taskId 
            ? { ...task, status, updatedAt: new Date().toISOString() }
            : task
        )
      )

    } catch (error) {
      console.error('Error updating task:', error)
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
                {project.name} - Board
              </h1>
              <p className="text-lg" style={{ color: 'var(--foreground-secondary)' }}>
                Gerencie as tarefas do seu projeto
              </p>
            </div>
          </div>
          
          <Button 
            variant="outline" 
            className="rounded-xl"
            onClick={fetchProjectAndTasks}
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Atualizar
          </Button>
        </div>

        {/* Kanban Board */}
        <div className="modern-card p-6">
          <Kanban 
            tasks={tasks}
            onTaskUpdate={handleTaskUpdate}
          />
        </div>
      </div>
    </div>
  )
}
