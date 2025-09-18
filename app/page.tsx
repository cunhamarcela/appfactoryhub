import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CalendarWidget } from "@/components/CalendarWidget"
import { FinanceCards } from "@/components/FinanceCards"
import { Plus, Rocket, Code, DollarSign, Calendar } from "lucide-react"
import Link from "next/link"

export default async function Home() {
  const session = await auth()

  if (!session) {
    redirect("/api/auth/signin")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
              App Factory Hub
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-1">
              Bem-vindo de volta, {session.user?.name}!
            </p>
          </div>
          <Link href="/projects/new">
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Novo Projeto
            </Button>
          </Link>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Projetos Ativos</CardTitle>
              <Rocket className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">3</div>
              <p className="text-xs text-muted-foreground">
                +1 desde o mês passado
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tasks Pendentes</CardTitle>
              <Code className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">12</div>
              <p className="text-xs text-muted-foreground">
                4 de alta prioridade
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Custo Mensal</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$127</div>
              <p className="text-xs text-muted-foreground">
                +$23 vs mês anterior
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Próximo Evento</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">2h</div>
              <p className="text-xs text-muted-foreground">
                Sprint Planning
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Projects Overview */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Projetos Recentes</CardTitle>
                <CardDescription>
                  Seus projetos mais ativos
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Project 1 */}
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Rocket className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold">E-commerce Platform</h3>
                        <p className="text-sm text-muted-foreground">
                          Next.js + Supabase
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="secondary">Development</Badge>
                      <Button variant="outline" size="sm">
                        Ver Projeto
                      </Button>
                    </div>
                  </div>

                  {/* Project 2 */}
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                        <Code className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold">Task Manager</h3>
                        <p className="text-sm text-muted-foreground">
                          React + Firebase
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="default">Deployed</Badge>
                      <Button variant="outline" size="sm">
                        Ver Projeto
                      </Button>
                    </div>
                  </div>

                  {/* Project 3 */}
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                        <DollarSign className="w-5 h-5 text-purple-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold">Finance Tracker</h3>
                        <p className="text-sm text-muted-foreground">
                          Flutter + Supabase
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline">Planning</Badge>
                      <Button variant="outline" size="sm">
                        Ver Projeto
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
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