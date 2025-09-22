import { 
  TrendingUp, 
  TrendingDown, 
  Minus,
  Clock,
  CheckCircle,
  AlertTriangle,
  Code,
  Rocket,
  DollarSign,
  Calendar
} from "lucide-react"

interface DashboardStatsProps {
  stats: {
    totalProjects: number
    activeProjects: number
    completedTasks: number
    totalTasks: number
    monthlyBurn: number
    thisWeekTasks: number
    overdueTasks: number
    projectsByStatus: Record<string, number>
  }
}

export function DashboardStats({ stats }: DashboardStatsProps) {
  const completionRate = stats.totalTasks > 0 ? (stats.completedTasks / stats.totalTasks) * 100 : 0
  const activeProjectsRate = stats.totalProjects > 0 ? (stats.activeProjects / stats.totalProjects) * 100 : 0

  const getTrendIcon = (value: number, threshold: number = 50) => {
    if (value > threshold) return <TrendingUp className="w-4 h-4 text-green-600" />
    if (value < threshold * 0.5) return <TrendingDown className="w-4 h-4 text-red-600" />
    return <Minus className="w-4 h-4 text-yellow-600" />
  }

  const statCards = [
    {
      title: "Projetos Ativos",
      value: stats.activeProjects,
      total: stats.totalProjects,
      icon: Code,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      percentage: activeProjectsRate,
      trend: getTrendIcon(activeProjectsRate)
    },
    {
      title: "Taxa de Conclusão",
      value: `${completionRate.toFixed(1)}%`,
      subtitle: `${stats.completedTasks}/${stats.totalTasks} tasks`,
      icon: CheckCircle,
      color: "text-green-600", 
      bgColor: "bg-green-50",
      percentage: completionRate,
      trend: getTrendIcon(completionRate)
    },
    {
      title: "Burn Mensal",
      value: `R$ ${stats.monthlyBurn.toFixed(0)}`,
      subtitle: "Custos recorrentes",
      icon: DollarSign,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      percentage: null,
      trend: null
    },
    {
      title: "Tasks da Semana",
      value: stats.thisWeekTasks,
      subtitle: stats.overdueTasks > 0 ? `${stats.overdueTasks} atrasadas` : "Em dia",
      icon: Calendar,
      color: stats.overdueTasks > 0 ? "text-red-600" : "text-blue-600",
      bgColor: stats.overdueTasks > 0 ? "bg-red-50" : "bg-blue-50",
      percentage: null,
      trend: stats.overdueTasks > 0 ? <AlertTriangle className="w-4 h-4 text-red-600" /> : <CheckCircle className="w-4 h-4 text-green-600" />
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {statCards.map((stat, index) => {
        const Icon = stat.icon
        
        return (
          <div key={index} className="modern-card p-6">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-xl ${stat.bgColor}`}>
                <Icon className={`h-6 w-6 ${stat.color}`} />
              </div>
              {stat.trend && (
                <div className="flex items-center">
                  {stat.trend}
                </div>
              )}
            </div>
            
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-gray-600">
                {stat.title}
              </h3>
              <div className="flex items-baseline space-x-2">
                <span className="text-2xl font-bold text-gray-900">
                  {stat.value}
                </span>
                {stat.total && (
                  <span className="text-sm text-gray-500">
                    de {stat.total}
                  </span>
                )}
              </div>
              {stat.subtitle && (
                <p className="text-sm text-gray-500">
                  {stat.subtitle}
                </p>
              )}
              {stat.percentage !== null && (
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${
                      stat.percentage > 75 ? 'bg-green-500' :
                      stat.percentage > 50 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${Math.min(100, stat.percentage)}%` }}
                  ></div>
                </div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

interface ProjectStatusOverviewProps {
  projectsByStatus: Record<string, number>
}

export function ProjectStatusOverview({ projectsByStatus }: ProjectStatusOverviewProps) {
  const statusConfig = {
    planning: { label: "Planejamento", color: "bg-blue-500", icon: Clock },
    development: { label: "Desenvolvimento", color: "bg-yellow-500", icon: Code },
    testing: { label: "Testes", color: "bg-purple-500", icon: CheckCircle },
    deployed: { label: "Publicado", color: "bg-green-500", icon: Rocket },
    paused: { label: "Pausado", color: "bg-orange-500", icon: AlertTriangle },
    archived: { label: "Arquivado", color: "bg-gray-500", icon: Clock }
  }

  const total = Object.values(projectsByStatus).reduce((sum, count) => sum + count, 0)

  return (
    <div className="modern-card p-6">
      <h3 className="text-lg font-semibold mb-4 text-gray-900">
        Status dos Projetos
      </h3>
      
      <div className="space-y-3">
        {Object.entries(projectsByStatus).map(([status, count]) => {
          const config = statusConfig[status as keyof typeof statusConfig]
          if (!config || count === 0) return null
          
          const percentage = total > 0 ? (count / total) * 100 : 0
          const Icon = config.icon
          
          return (
            <div key={status} className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className={`w-3 h-3 rounded-full ${config.color}`}></div>
                <span className="text-sm font-medium text-gray-700">
                  {config.label}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">
                  {count} ({percentage.toFixed(0)}%)
                </span>
                <Icon className="w-4 h-4 text-gray-400" />
              </div>
            </div>
          )
        })}
      </div>
      
      {total === 0 && (
        <div className="text-center py-8 text-gray-500">
          <Clock className="w-8 h-8 mx-auto mb-2 text-gray-400" />
          <p className="text-sm">Nenhum projeto encontrado</p>
        </div>
      )}
    </div>
  )
}
