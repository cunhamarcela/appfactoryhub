import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Plus, DollarSign, TrendingUp, Calendar } from "lucide-react"
import Link from "next/link"

interface ProjectFinancePageProps {
  params: {
    slug: string
  }
}

async function getProjectFinanceData(slug: string, userId: string) {
  const project = await prisma.project.findFirst({
    where: { slug, userId },
    include: {
      financeRecords: {
        orderBy: { createdAt: 'desc' }
      }
    }
  })

  if (!project) {
    return null
  }

  const monthlyTotal = project.financeRecords
    .filter(record => record.recurring && record.period === 'monthly')
    .reduce((sum, record) => sum + record.amount, 0)

  const yearlyTotal = project.financeRecords
    .filter(record => record.recurring && record.period === 'yearly')
    .reduce((sum, record) => sum + record.amount / 12, 0)

  const oneTimeTotal = project.financeRecords
    .filter(record => !record.recurring || record.period === 'one-time')
    .reduce((sum, record) => sum + record.amount, 0)

  const totalMonthly = monthlyTotal + yearlyTotal

  const byCategory = project.financeRecords.reduce((acc, record) => {
    acc[record.category] = (acc[record.category] || 0) + record.amount
    return acc
  }, {} as Record<string, number>)

  const byProvider = project.financeRecords.reduce((acc, record) => {
    acc[record.provider] = (acc[record.provider] || 0) + record.amount
    return acc
  }, {} as Record<string, number>)

  return {
    project,
    records: project.financeRecords,
    monthlyTotal: totalMonthly,
    oneTimeTotal,
    byCategory,
    byProvider
  }
}

export default async function ProjectFinancePage({ params }: ProjectFinancePageProps) {
  const session = await auth()

  if (!session?.user?.id) {
    redirect("/api/auth/signin")
  }

  const financeData = await getProjectFinanceData(params.slug, session.user.id)

  if (!financeData) {
    redirect("/projects")
  }

  const { project, records, monthlyTotal, oneTimeTotal, byCategory, byProvider } = financeData

  return (
    <div className="min-h-screen" style={{ background: 'var(--background)' }}>
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Link href="/finances">
              <Button variant="ghost" size="sm" className="rounded-xl">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar
              </Button>
            </Link>
            <div>
              <h1 className="text-4xl font-bold mb-2" style={{ color: 'var(--foreground)' }}>
                Finanças - {project.name}
              </h1>
              <p className="text-lg" style={{ color: 'var(--foreground-secondary)' }}>
                Custos e despesas do projeto
              </p>
            </div>
          </div>
          <Button className="gradient-primary text-white px-6 py-3 rounded-xl font-semibold">
            <Plus className="w-5 h-5 mr-2" />
            Adicionar Custo
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="modern-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Custo Mensal</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">R$ {monthlyTotal.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">
                Custos recorrentes mensais
              </p>
            </CardContent>
          </Card>

          <Card className="modern-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Custos Únicos</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">R$ {oneTimeTotal.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">
                Investimentos únicos
              </p>
            </CardContent>
          </Card>

          <Card className="modern-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Registros</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{records.length}</div>
              <p className="text-xs text-muted-foreground">
                Registros financeiros
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Records List */}
          <div className="lg:col-span-2">
            <Card className="modern-card">
              <CardHeader>
                <CardTitle>Registros Financeiros</CardTitle>
              </CardHeader>
              <CardContent>
                {records.length > 0 ? (
                  <div className="space-y-4">
                    {records.map((record) => (
                      <div key={record.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <h4 className="font-semibold">{record.description}</h4>
                          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                            <Badge variant="outline" className="text-xs">
                              {record.category}
                            </Badge>
                            <span>•</span>
                            <span>{record.provider}</span>
                            {record.recurring && (
                              <>
                                <span>•</span>
                                <span>{record.period}</span>
                              </>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold">
                            R$ {record.amount.toFixed(2)}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {new Date(record.createdAt).toLocaleDateString('pt-BR')}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <DollarSign className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                    <h3 className="text-lg font-semibold mb-2">Nenhum registro ainda</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Adicione custos e despesas para este projeto
                    </p>
                    <Button className="gradient-primary text-white">
                      <Plus className="w-4 h-4 mr-2" />
                      Adicionar Primeiro Custo
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* By Category */}
            <Card className="modern-card">
              <CardHeader>
                <CardTitle>Por Categoria</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(byCategory).map(([category, amount]) => (
                    <div key={category} className="flex justify-between">
                      <span className="capitalize">{category}</span>
                      <span className="font-semibold">R$ {amount.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* By Provider */}
            <Card className="modern-card">
              <CardHeader>
                <CardTitle>Por Provedor</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(byProvider).map(([provider, amount]) => (
                    <div key={provider} className="flex justify-between">
                      <span className="capitalize">{provider}</span>
                      <span className="font-semibold">R$ {amount.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
