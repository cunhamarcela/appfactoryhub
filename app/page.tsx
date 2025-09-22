import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CalendarWidget } from "@/components/CalendarWidget"
import { FinanceCards } from "@/components/FinanceCards"
import { DashboardStats, ProjectStatusOverview } from "@/components/DashboardStats"
import { Plus, Rocket, Code, DollarSign, Calendar, ExternalLink } from "lucide-react"
import Link from "next/link"
import { prisma } from "@/lib/prisma"

async function getDashboardData(userId: string) {
  const [projects, tasks, financeRecords] = await Promise.all([
    prisma.project.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
      take: 3,
      include: {
        tasks: {
          where: { status: { not: 'done' } },
          take: 5
        },
        _count: {
          select: {
            tasks: { where: { status: { not: 'done' } } }
          }
        }
      }
    }),
    prisma.task.findMany({
      where: { 
        userId,
        status: { not: 'done' }
      },
      orderBy: { createdAt: 'desc' }
    }),
    prisma.financeRecord.findMany({
      where: { ownerId: userId },
      orderBy: { createdAt: 'desc' }
    })
  ])

  const totalProjects = await prisma.project.count({ where: { userId } })
  const activeProjects = projects.filter(p => ['development', 'testing'].includes(p.status)).length
  const totalTasks = tasks.length
  const completedTasks = await prisma.task.count({ 
    where: { userId, status: 'done' }
  })
  const highPriorityTasks = tasks.filter(task => task.priority === 'high').length
  
  // Calculate tasks from this week
  const weekStart = new Date()
  weekStart.setDate(weekStart.getDate() - weekStart.getDay())
  weekStart.setHours(0, 0, 0, 0)
  
  const thisWeekTasks = await prisma.task.count({
    where: {
      userId,
      createdAt: { gte: weekStart },
      status: { not: 'done' }
    }
  })
  
  const overdueTasks = await prisma.task.count({
    where: {
      userId,
      status: { not: 'done' },
      dueDate: { lt: new Date() }
    }
  })
  
  // Get project status distribution
  const projectsByStatus = await prisma.project.groupBy({
    by: ['status'],
    where: { userId },
    _count: { status: true }
  })
  
  const statusDistribution = projectsByStatus.reduce((acc, item) => {
    acc[item.status] = item._count.status
    return acc
  }, {} as Record<string, number>)
  
  const monthlyTotal = financeRecords
    .filter(record => record.recurring && record.period === 'monthly')
    .reduce((sum, record) => sum + record.amount, 0)

  return {
    projects,
    totalProjects,
    activeProjects,
    totalTasks,
    completedTasks,
    highPriorityTasks,
    thisWeekTasks,
    overdueTasks,
    monthlyTotal,
    projectsByStatus: statusDistribution,
    recentProjects: projects.slice(0, 3)
  }
}

export default async function Home() {
  const session = await auth()

  if (!session?.user?.id) {
    redirect("/api/auth/signin")
  }

  const dashboardData = await getDashboardData(session.user.id)

  return (
    <div className="min-h-screen" style={{ background: 'var(--background)' }}>
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2" style={{ color: 'var(--foreground)' }}>
              Olá, {session.user?.name?.split(' ')[0]}! 👋
            </h1>
            <p className="text-lg" style={{ color: 'var(--foreground-secondary)' }}>
              Bem-vindo de volta ao App Factory Hub
            </p>
          </div>
          <Link href="/projects/new">
            <Button className="gradient-primary text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
              <Plus className="w-5 h-5 mr-2" />
              Novo Projeto
            </Button>
          </Link>
        </div>

        {/* Dashboard Stats */}
        <DashboardStats stats={{
          totalProjects: dashboardData.totalProjects,
          activeProjects: dashboardData.activeProjects,
          completedTasks: dashboardData.completedTasks,
          totalTasks: dashboardData.totalTasks,
          monthlyBurn: dashboardData.monthlyTotal,
          thisWeekTasks: dashboardData.thisWeekTasks,
          overdueTasks: dashboardData.overdueTasks,
          projectsByStatus: dashboardData.projectsByStatus
        }} />

        {/* Quick Stats - Legacy (keeping for now) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8" style={{ display: 'none' }}>
          <div className="modern-card p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 gradient-primary opacity-10 rounded-full -mr-10 -mt-10"></div>
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 gradient-primary rounded-xl">
                <Rocket className="h-6 w-6 text-white" />
              </div>
              {dashboardData.totalProjects > 0 && (
                <Badge className="bg-green-100 text-green-800 text-xs px-2 py-1">
                  {dashboardData.totalProjects > 1 ? `${dashboardData.totalProjects} ativos` : 'ativo'}
                </Badge>
              )}
            </div>
            <div className="text-3xl font-bold mb-1" style={{ color: 'var(--foreground)' }}>
              {dashboardData.totalProjects}
            </div>
            <p className="text-sm font-medium" style={{ color: 'var(--foreground-secondary)' }}>
              Projetos Ativos
            </p>
            <p className="text-xs mt-2" style={{ color: 'var(--foreground-secondary)' }}>
              {dashboardData.totalProjects === 0 ? 'Crie seu primeiro projeto' : 'Total de projetos'}
            </p>
          </div>
          
          <div className="modern-card p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 gradient-secondary opacity-10 rounded-full -mr-10 -mt-10"></div>
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 gradient-secondary rounded-xl">
                <Code className="h-6 w-6 text-white" />
              </div>
              {dashboardData.highPriorityTasks > 0 && (
                <Badge className="bg-orange-100 text-orange-800 text-xs px-2 py-1">
                  {dashboardData.highPriorityTasks} alta
                </Badge>
              )}
            </div>
            <div className="text-3xl font-bold mb-1" style={{ color: 'var(--foreground)' }}>
              {dashboardData.totalTasks}
            </div>
            <p className="text-sm font-medium" style={{ color: 'var(--foreground-secondary)' }}>
              Tasks Pendentes
            </p>
            <p className="text-xs mt-2" style={{ color: 'var(--foreground-secondary)' }}>
              {dashboardData.highPriorityTasks > 0 
                ? `${dashboardData.highPriorityTasks} de alta prioridade`
                : 'Nenhuma task pendente'
              }
            </p>
          </div>

          <div className="modern-card p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 gradient-accent opacity-10 rounded-full -mr-10 -mt-10"></div>
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 gradient-accent rounded-xl">
                <DollarSign className="h-6 w-6 text-white" />
              </div>
              {dashboardData.monthlyTotal > 0 && (
                <Badge className="bg-blue-100 text-blue-800 text-xs px-2 py-1">mensal</Badge>
              )}
            </div>
            <div className="text-3xl font-bold mb-1" style={{ color: 'var(--foreground)' }}>
              R$ {dashboardData.monthlyTotal.toFixed(0)}
            </div>
            <p className="text-sm font-medium" style={{ color: 'var(--foreground-secondary)' }}>
              Custo Mensal
            </p>
            <p className="text-xs mt-2" style={{ color: 'var(--foreground-secondary)' }}>
              {dashboardData.monthlyTotal === 0 ? 'Nenhum custo registrado' : 'Custos recorrentes'}
            </p>
          </div>

          <div className="modern-card p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 gradient-info opacity-10 rounded-full -mr-10 -mt-10"></div>
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 gradient-info rounded-xl">
                <Calendar className="h-6 w-6 text-white" />
              </div>
              <Badge className="bg-blue-100 text-blue-800 text-xs px-2 py-1">Em breve</Badge>
            </div>
            <div className="text-3xl font-bold mb-1" style={{ color: 'var(--foreground)' }}>--</div>
            <p className="text-sm font-medium" style={{ color: 'var(--foreground-secondary)' }}>
              Próximo Evento
            </p>
            <p className="text-xs mt-2" style={{ color: 'var(--foreground-secondary)' }}>
              Conecte seu calendário
            </p>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Projects Overview */}
          <div className="lg:col-span-2">
            <div className="modern-card p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold mb-1" style={{ color: 'var(--foreground)' }}>
                    Projetos Recentes
                  </h2>
                  <p style={{ color: 'var(--foreground-secondary)' }}>
                    Seus projetos mais ativos
                  </p>
                </div>
                <Link href="/projects">
                  <Button variant="outline" className="rounded-xl">
                    Ver Todos
                  </Button>
                </Link>
              </div>
              <div className="space-y-4">
                {dashboardData.recentProjects.length > 0 ? (
                  dashboardData.recentProjects.map((project) => {
                    const getStatusColor = (status: string) => {
                      switch (status) {
                        case 'planning': return 'bg-gray-100 text-gray-700'
                        case 'development': return 'gradient-secondary text-white border-0'
                        case 'deployed': return 'gradient-success text-white border-0'
                        case 'archived': return 'bg-red-100 text-red-700'
                        default: return 'bg-gray-100 text-gray-700'
                      }
                    }

                    const getStackIcon = (stack: string) => {
                      switch (stack) {
                        case 'firebase': return <Rocket className="w-6 h-6 text-white" />
                        case 'supabase': return <Code className="w-6 h-6 text-white" />
                        default: return <DollarSign className="w-6 h-6 text-white" />
                      }
                    }

                    const getStackGradient = (stack: string) => {
                      switch (stack) {
                        case 'firebase': return 'gradient-primary'
                        case 'supabase': return 'gradient-accent'
                        default: return 'gradient-secondary'
                      }
                    }

                    return (
                      <div key={project.id} className="flex items-center justify-between p-5 border rounded-xl hover:shadow-md transition-all duration-300" style={{ borderColor: 'var(--border)' }}>
                        <div className="flex items-center space-x-4">
                          <div className={`w-12 h-12 ${getStackGradient(project.stack)} rounded-xl flex items-center justify-center`}>
                            {getStackIcon(project.stack)}
                          </div>
                          <div>
                            <h3 className="font-semibold text-lg" style={{ color: 'var(--foreground)' }}>
                              {project.name}
                            </h3>
                            <p className="text-sm" style={{ color: 'var(--foreground-secondary)' }}>
                              {project.stack === 'firebase' ? 'Flutter + Firebase' : 'Next.js + Supabase'}
                              {project.niche && ` • ${project.niche}`}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <Badge className={`${getStatusColor(project.status)} px-3 py-1 capitalize`}>
                            {project.status === 'planning' ? 'Planejamento' : 
                             project.status === 'development' ? 'Desenvolvimento' :
                             project.status === 'deployed' ? 'Publicado' : 
                             project.status}
                          </Badge>
                          <Link href={`/projects/${project.slug}`}>
                            <Button variant="outline" size="sm" className="rounded-xl">
                              Ver Projeto
                            </Button>
                          </Link>
                          {project.repoUrl && (
                            <Link href={project.repoUrl} target="_blank">
                              <Button variant="ghost" size="sm" className="rounded-xl">
                                <ExternalLink className="w-4 h-4" />
                              </Button>
                            </Link>
                          )}
                        </div>
                      </div>
                    )
                  })
                ) : (
                  <div className="text-center py-12">
                    <Rocket className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                    <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--foreground)' }}>
                      Nenhum projeto ainda
                    </h3>
                    <p className="text-sm mb-4" style={{ color: 'var(--foreground-secondary)' }}>
                      Comece criando seu primeiro projeto
                    </p>
                    <Link href="/projects/new">
                      <Button className="gradient-primary text-white">
                        <Plus className="w-4 h-4 mr-2" />
                        Criar Projeto
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Project Status Overview */}
            <ProjectStatusOverview projectsByStatus={dashboardData.projectsByStatus} />
            
            {/* Calendar Widget */}
            <CalendarWidget />
            
            {/* Finance Cards */}
            <FinanceCards />
          </div>
        </div>
      </div>
    </div>
  )
}