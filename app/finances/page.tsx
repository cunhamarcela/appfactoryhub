import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DollarSign, TrendingUp, Plus, CreditCard, Server, Users, Calendar } from "lucide-react"

export default async function FinancesPage() {
  const session = await auth()

  if (!session) {
    redirect("/api/auth/signin")
  }

  // Mock data - will be replaced with real API data
  const financialData = {
    totalMonthly: 127,
    previousMonth: 104,
    breakdown: {
      tools: 89, // Cursor + ChatGPT + Vercel + etc
      infrastructure: 23, // Firebase/Supabase
      perUser: 15
    },
    providers: [
      { name: "Cursor", category: "tool", amount: 20, recurring: true, period: "monthly" },
      { name: "ChatGPT Plus", category: "tool", amount: 20, recurring: true, period: "monthly" },
      { name: "GitHub Copilot", category: "tool", amount: 10, recurring: true, period: "monthly" },
      { name: "Vercel Pro", category: "tool", amount: 20, recurring: true, period: "monthly" },
      { name: "Figma", category: "tool", amount: 12, recurring: true, period: "monthly" },
      { name: "Notion", category: "tool", amount: 8, recurring: true, period: "monthly" },
      { name: "Firebase", category: "infrastructure", amount: 15, recurring: true, period: "monthly" },
      { name: "Supabase", category: "infrastructure", amount: 8, recurring: true, period: "monthly" }
    ],
    projectCosts: [
      { name: "E-commerce Platform", monthly: 25, users: 150, costPerUser: 0.17 },
      { name: "Task Manager", monthly: 18, users: 89, costPerUser: 0.20 },
      { name: "Finance Tracker", monthly: 12, users: 45, costPerUser: 0.27 }
    ]
  }

  const monthlyChange = financialData.totalMonthly - financialData.previousMonth
  const changePercentage = ((monthlyChange / financialData.previousMonth) * 100).toFixed(1)
  const isIncrease = monthlyChange > 0

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "tool":
        return <CreditCard className="w-5 h-5" />
      case "infrastructure":
        return <Server className="w-5 h-5" />
      default:
        return <DollarSign className="w-5 h-5" />
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "tool":
        return "gradient-primary"
      case "infrastructure":
        return "gradient-secondary"
      default:
        return "gradient-accent"
    }
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--background)' }}>
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2" style={{ color: 'var(--foreground)' }}>
              Finanças
            </h1>
            <p className="text-lg" style={{ color: 'var(--foreground-secondary)' }}>
              Controle completo dos custos dos seus projetos
            </p>
          </div>
          <Button className="gradient-primary text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
            <Plus className="w-5 h-5 mr-2" />
            Adicionar Custo
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Monthly */}
          <div className="modern-card p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 gradient-accent opacity-10 rounded-full -mr-10 -mt-10"></div>
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 gradient-accent rounded-xl">
                <DollarSign className="h-6 w-6 text-white" />
              </div>
              <Badge className={`text-xs px-2 py-1 ${isIncrease ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                {isIncrease ? '+' : ''}{changePercentage}%
              </Badge>
            </div>
            <div className="text-3xl font-bold mb-1" style={{ color: 'var(--foreground)' }}>
              ${financialData.totalMonthly}
            </div>
            <p className="text-sm font-medium" style={{ color: 'var(--foreground-secondary)' }}>
              Total Mensal
            </p>
          </div>

          {/* Tools */}
          <div className="modern-card p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 gradient-primary opacity-10 rounded-full -mr-10 -mt-10"></div>
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 gradient-primary rounded-xl">
                <CreditCard className="h-6 w-6 text-white" />
              </div>
            </div>
            <div className="text-3xl font-bold mb-1" style={{ color: 'var(--foreground)' }}>
              ${financialData.breakdown.tools}
            </div>
            <p className="text-sm font-medium" style={{ color: 'var(--foreground-secondary)' }}>
              Ferramentas
            </p>
          </div>

          {/* Infrastructure */}
          <div className="modern-card p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 gradient-secondary opacity-10 rounded-full -mr-10 -mt-10"></div>
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 gradient-secondary rounded-xl">
                <Server className="h-6 w-6 text-white" />
              </div>
            </div>
            <div className="text-3xl font-bold mb-1" style={{ color: 'var(--foreground)' }}>
              ${financialData.breakdown.infrastructure}
            </div>
            <p className="text-sm font-medium" style={{ color: 'var(--foreground-secondary)' }}>
              Infraestrutura
            </p>
          </div>

          {/* Per User */}
          <div className="modern-card p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 gradient-info opacity-10 rounded-full -mr-10 -mt-10"></div>
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 gradient-info rounded-xl">
                <Users className="h-6 w-6 text-white" />
              </div>
            </div>
            <div className="text-3xl font-bold mb-1" style={{ color: 'var(--foreground)' }}>
              ${financialData.breakdown.perUser}
            </div>
            <p className="text-sm font-medium" style={{ color: 'var(--foreground-secondary)' }}>
              Por Usuário
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Providers List */}
          <div className="modern-card p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold" style={{ color: 'var(--foreground)' }}>
                Assinaturas
              </h2>
              <Button variant="outline" className="rounded-xl">
                Gerenciar
              </Button>
            </div>
            <div className="space-y-4">
              {financialData.providers.map((provider, index) => (
                <div key={index} className="flex items-center justify-between p-4 border rounded-xl hover:shadow-sm transition-all duration-300" style={{ borderColor: 'var(--border)' }}>
                  <div className="flex items-center space-x-4">
                    <div className={`w-10 h-10 ${getCategoryColor(provider.category)} rounded-xl flex items-center justify-center`}>
                      {getCategoryIcon(provider.category)}
                      <span className="text-white text-xs">
                        {/* Icon will be here */}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-semibold" style={{ color: 'var(--foreground)' }}>
                        {provider.name}
                      </h3>
                      <p className="text-sm" style={{ color: 'var(--foreground-secondary)' }}>
                        {provider.recurring ? `Mensal` : 'Único'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-lg" style={{ color: 'var(--foreground)' }}>
                      ${provider.amount}
                    </div>
                    <div className="text-xs" style={{ color: 'var(--foreground-secondary)' }}>
                      /mês
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Project Costs */}
          <div className="modern-card p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold" style={{ color: 'var(--foreground)' }}>
                Custos por Projeto
              </h2>
              <Button variant="outline" className="rounded-xl">
                Ver Detalhes
              </Button>
            </div>
            <div className="space-y-4">
              {financialData.projectCosts.map((project, index) => (
                <div key={index} className="p-4 border rounded-xl" style={{ borderColor: 'var(--border)' }}>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold" style={{ color: 'var(--foreground)' }}>
                      {project.name}
                    </h3>
                    <div className="font-bold text-lg" style={{ color: 'var(--foreground)' }}>
                      ${project.monthly}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span style={{ color: 'var(--foreground-secondary)' }}>Usuários: </span>
                      <span className="font-medium" style={{ color: 'var(--foreground)' }}>{project.users}</span>
                    </div>
                    <div>
                      <span style={{ color: 'var(--foreground-secondary)' }}>Por usuário: </span>
                      <span className="font-medium" style={{ color: 'var(--foreground)' }}>${project.costPerUser}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Monthly Trend Chart Placeholder */}
        <div className="modern-card p-6 mt-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold" style={{ color: 'var(--foreground)' }}>
              Tendência Mensal
            </h2>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" className="rounded-xl">
                <Calendar className="w-4 h-4 mr-2" />
                Últimos 6 meses
              </Button>
            </div>
          </div>
          <div className="h-64 flex items-center justify-center border-2 border-dashed rounded-xl" style={{ borderColor: 'var(--border)' }}>
            <div className="text-center">
              <TrendingUp className="w-12 h-12 mx-auto mb-4" style={{ color: 'var(--foreground-secondary)' }} />
              <p style={{ color: 'var(--foreground-secondary)' }}>
                Gráfico de tendência será implementado aqui
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
