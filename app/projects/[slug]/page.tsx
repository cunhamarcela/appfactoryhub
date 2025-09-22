import { auth } from "@/lib/auth"
import { redirect, notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { Button } from "@/components/ui/button"
import { 
  ArrowLeft, 
  Github, 
  Kanban, 
  CheckSquare, 
  FileText, 
  DollarSign,
  Zap,
  Copy,
  Database
} from "lucide-react"
import Link from "next/link"
import { AgentSuggestions } from "@/components/AgentSuggestions"
import { CopyEnvButton } from "@/components/CopyEnvButton"
import { ProjectStatusBadge } from "@/components/ProjectStatusBadge"
import { ProjectStatusActions } from "@/components/ProjectStatusActions"

interface ProjectPageProps {
  params: { slug: string }
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const session = await auth()
  
  if (!session?.user?.id) {
    redirect("/api/auth/signin")
  }

  // Get project from database
  const project = await prisma.project.findFirst({
    where: { 
      slug: params.slug,
      userId: session.user.id
    },
    include: {
      tasks: {
        orderBy: { createdAt: 'desc' }
      },
      checklists: true,
      financeRecords: true
    }
  })

  if (!project) {
    notFound()
  }

  // Calculate project stats
  const totalTasks = project.tasks.length
  const completedTasks = project.tasks.filter(task => task.status === 'done').length
  const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

  const totalChecklists = project.checklists.length
  const completedChecklists = project.checklists.filter(checklist => checklist.progress === 100).length


  const getStackInstructions = (stack: string) => {
    if (stack === 'firebase') {
      return {
        title: "Firebase Setup",
        instructions: [
          "1. Crie um projeto no Firebase Console",
          "2. Configure Authentication (Apple/Google/Email)",
          "3. Configure Firestore Database",
          "4. Configure Analytics",
          "5. Configure AdMob",
          "6. Baixe google-services.json (Android) e GoogleService-Info.plist (iOS)"
        ],
        envVars: [
          "FIREBASE_PROJECT_ID=your-project-id",
          "FIREBASE_API_KEY=your-api-key",
          "FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com",
          "FIREBASE_STORAGE_BUCKET=your-project.appspot.com"
        ]
      }
    } else {
      return {
        title: "Supabase Setup", 
        instructions: [
          "1. Crie um projeto no Supabase",
          "2. Configure Authentication providers",
          "3. Configure Database schema",
          "4. Configure Storage buckets",
          "5. Configure Edge Functions (se necessário)"
        ],
        envVars: [
          "SUPABASE_URL=https://your-project.supabase.co",
          "SUPABASE_ANON_KEY=your-anon-key",
          "SUPABASE_SERVICE_ROLE_KEY=your-service-role-key"
        ]
      }
    }
  }

  const stackInfo = getStackInstructions(project.stack)

  return (
    <div className="min-h-screen" style={{ background: 'var(--background)' }}>
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center mb-8">
          <Link href="/projects">
            <Button variant="outline" size="sm" className="mr-4 rounded-xl">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Projetos
            </Button>
          </Link>
          <div className="flex-1">
            <div className="flex items-center space-x-4 mb-2">
              <h1 className="text-4xl font-bold" style={{ color: 'var(--foreground)' }}>
                {project.name}
              </h1>
              <ProjectStatusBadge status={project.status} />
              <ProjectStatusActions 
                projectSlug={project.slug} 
                currentStatus={project.status}
              />
            </div>
            <p className="text-lg" style={{ color: 'var(--foreground-secondary)' }}>
              {project.description || 'Projeto criado com App Factory Hub'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Project Info */}
            <div className="modern-card p-6">
              <h2 className="text-2xl font-bold mb-6" style={{ color: 'var(--foreground)' }}>
                Informações do Projeto
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--foreground)' }}>
                    Stack Tecnológica
                  </label>
                  <div className="flex items-center space-x-2">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      project.stack === 'firebase' ? 'gradient-secondary' : 'gradient-success'
                    }`}>
                      <Database className="w-4 h-4 text-white" />
                    </div>
                    <span className="font-medium capitalize" style={{ color: 'var(--foreground)' }}>
                      {project.stack}
                    </span>
                  </div>
                </div>

                {project.niche && (
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: 'var(--foreground)' }}>
                      Nicho
                    </label>
                    <span className="font-medium capitalize" style={{ color: 'var(--foreground)' }}>
                      {project.niche}
                    </span>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--foreground)' }}>
                    Criado em
                  </label>
                  <span style={{ color: 'var(--foreground)' }}>
                    {new Date(project.createdAt).toLocaleDateString('pt-BR')}
                  </span>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--foreground)' }}>
                    Última atualização
                  </label>
                  <span style={{ color: 'var(--foreground)' }}>
                    {new Date(project.updatedAt).toLocaleDateString('pt-BR')}
                  </span>
                </div>
              </div>

              {/* Repository Links */}
              {(project.repoUrl || project.githubRepo) && (
                <div className="mt-6 pt-6 border-t" style={{ borderColor: 'var(--border)' }}>
                  <div className="flex items-center space-x-4">
                    <a 
                      href={project.repoUrl || project.githubRepo || '#'} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex-1"
                    >
                      <Button className="w-full gradient-primary text-white rounded-xl">
                        <Github className="w-4 h-4 mr-2" />
                        Ver Repositório
                      </Button>
                    </a>
                    {project.repoUrl && (
                      <Button 
                        variant="outline" 
                        className="rounded-xl"
                        onClick={() => navigator.clipboard.writeText(project.repoUrl!)}
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Setup Instructions */}
            <div className="modern-card p-6">
              <h2 className="text-2xl font-bold mb-6" style={{ color: 'var(--foreground)' }}>
                {stackInfo.title}
              </h2>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-3" style={{ color: 'var(--foreground)' }}>
                    Passos de Configuração
                  </h3>
                  <div className="space-y-2">
                    {stackInfo.instructions.map((instruction, index) => (
                      <div key={index} className="flex items-start space-x-3">
                        <div className="w-6 h-6 gradient-primary rounded-full flex items-center justify-center text-white text-sm font-bold mt-0.5">
                          {index + 1}
                        </div>
                        <span style={{ color: 'var(--foreground-secondary)' }}>
                          {instruction}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-semibold" style={{ color: 'var(--foreground)' }}>
                      Variáveis de Ambiente
                    </h3>
                    <CopyEnvButton envVars={stackInfo.envVars} />
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
                    <code className="text-sm">
                      {stackInfo.envVars.map((envVar, index) => (
                        <div key={index} style={{ color: 'var(--foreground)' }}>
                          {envVar}
                        </div>
                      ))}
                    </code>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Progress Stats */}
            <div className="modern-card p-6">
              <h3 className="text-lg font-bold mb-4" style={{ color: 'var(--foreground)' }}>
                Progresso
              </h3>
              
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>
                      Tasks
                    </span>
                    <span className="text-sm font-bold" style={{ color: 'var(--foreground)' }}>
                      {completedTasks}/{totalTasks}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="h-2 rounded-full gradient-primary"
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>
                      Checklists
                    </span>
                    <span className="text-sm font-bold" style={{ color: 'var(--foreground)' }}>
                      {completedChecklists}/{totalChecklists}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="h-2 rounded-full gradient-secondary"
                      style={{ width: `${totalChecklists > 0 ? (completedChecklists / totalChecklists) * 100 : 0}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="modern-card p-6">
              <h3 className="text-lg font-bold mb-4" style={{ color: 'var(--foreground)' }}>
                Ações Rápidas
              </h3>
              
              <div className="space-y-3">
                <Link href={`/projects/${project.slug}/board`}>
                  <Button variant="outline" className="w-full justify-start rounded-xl">
                    <Kanban className="w-4 h-4 mr-3" />
                    Abrir Board
                  </Button>
                </Link>

                <Link href={`/projects/${project.slug}/checklists`}>
                  <Button variant="outline" className="w-full justify-start rounded-xl">
                    <CheckSquare className="w-4 h-4 mr-3" />
                    Checklists
                  </Button>
                </Link>

                <Link href={`/projects/${project.slug}/templates`}>
                  <Button variant="outline" className="w-full justify-start rounded-xl">
                    <FileText className="w-4 h-4 mr-3" />
                    Templates
                  </Button>
                </Link>

                <Link href={`/finances/${project.slug}`}>
                  <Button variant="outline" className="w-full justify-start rounded-xl">
                    <DollarSign className="w-4 h-4 mr-3" />
                    Finanças
                  </Button>
                </Link>
              </div>
            </div>

            {/* AI Agent Card */}
            <div className="modern-card p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 gradient-accent rounded-xl">
                  <Zap className="h-5 w-5 text-white" />
                </div>
                <h3 className="text-lg font-bold" style={{ color: 'var(--foreground)' }}>
                  Agente IA
                </h3>
              </div>
              
              <p className="text-sm mb-4" style={{ color: 'var(--foreground-secondary)' }}>
                Obtenha sugestões personalizadas para próximos passos e melhorias do projeto.
              </p>
              
              <AgentSuggestions 
                projectSlug={project.slug}
                projectName={project.name}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
