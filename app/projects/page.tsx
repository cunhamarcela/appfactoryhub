import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, Rocket, Code, Search, Filter } from "lucide-react"
import Link from "next/link"

export default async function ProjectsPage() {
  const session = await auth()

  if (!session) {
    redirect("/api/auth/signin")
  }

  // Mock data - will be replaced with real data from database
  const projects = [
    {
      id: "1",
      name: "E-commerce Platform",
      slug: "ecommerce-platform",
      description: "Plataforma completa de e-commerce com Next.js",
      stack: "Next.js + Supabase",
      status: "Development",
      progress: 65,
      lastUpdate: "2 horas atrás",
      repoUrl: "https://github.com/user/ecommerce-platform"
    },
    {
      id: "2", 
      name: "Task Manager",
      slug: "task-manager",
      description: "Sistema de gerenciamento de tarefas e projetos",
      stack: "React + Firebase",
      status: "Deployed",
      progress: 100,
      lastUpdate: "1 dia atrás",
      repoUrl: "https://github.com/user/task-manager"
    },
    {
      id: "3",
      name: "Finance Tracker",
      slug: "finance-tracker", 
      description: "Aplicativo de controle financeiro pessoal",
      stack: "Flutter + Supabase",
      status: "Planning",
      progress: 15,
      lastUpdate: "3 dias atrás",
      repoUrl: null
    },
    {
      id: "4",
      name: "Social Media Dashboard",
      slug: "social-dashboard",
      description: "Dashboard para gerenciar múltiplas redes sociais",
      stack: "Vue.js + Firebase",
      status: "Development", 
      progress: 40,
      lastUpdate: "5 horas atrás",
      repoUrl: "https://github.com/user/social-dashboard"
    }
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Deployed":
        return "gradient-success text-white border-0"
      case "Development":
        return "gradient-secondary text-white border-0"
      case "Planning":
        return "bg-gray-100 text-gray-700 border-0"
      default:
        return "bg-gray-100 text-gray-700 border-0"
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
                  className="pl-10 pr-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  style={{ borderColor: 'var(--border)', background: 'var(--background)' }}
                />
              </div>
              <Button variant="outline" className="rounded-xl">
                <Filter className="w-4 h-4 mr-2" />
                Filtros
              </Button>
            </div>
            <div className="text-sm" style={{ color: 'var(--foreground-secondary)' }}>
              {projects.length} projetos encontrados
            </div>
          </div>
        </div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {projects.map((project) => (
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
                    <p className="text-sm" style={{ color: 'var(--foreground-secondary)' }}>
                      {project.stack}
                    </p>
                  </div>
                </div>
                <Badge className={`px-3 py-1 ${getStatusColor(project.status)}`}>
                  {project.status}
                </Badge>
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
                  Atualizado {project.lastUpdate}
                </div>
                <div className="flex items-center space-x-2">
                  {project.repoUrl && (
                    <Button variant="outline" size="sm" className="rounded-xl">
                      <Code className="w-4 h-4 mr-1" />
                      Repo
                    </Button>
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

        {/* Empty State (if no projects) */}
        {projects.length === 0 && (
          <div className="modern-card p-12 text-center">
            <div className="w-16 h-16 gradient-primary rounded-xl flex items-center justify-center mx-auto mb-4">
              <Rocket className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--foreground)' }}>
              Nenhum projeto encontrado
            </h3>
            <p className="mb-6" style={{ color: 'var(--foreground-secondary)' }}>
              Comece criando seu primeiro projeto
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
