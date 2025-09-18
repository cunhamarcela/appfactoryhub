import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
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

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="modern-card p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 gradient-primary opacity-10 rounded-full -mr-10 -mt-10"></div>
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 gradient-primary rounded-xl">
                <Rocket className="h-6 w-6 text-white" />
              </div>
              <Badge className="bg-green-100 text-green-800 text-xs px-2 py-1">+1</Badge>
            </div>
            <div className="text-3xl font-bold mb-1" style={{ color: 'var(--foreground)' }}>3</div>
            <p className="text-sm font-medium" style={{ color: 'var(--foreground-secondary)' }}>
              Projetos Ativos
            </p>
            <p className="text-xs mt-2" style={{ color: 'var(--foreground-secondary)' }}>
              +1 desde o mês passado
            </p>
          </div>
          
          <div className="modern-card p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 gradient-secondary opacity-10 rounded-full -mr-10 -mt-10"></div>
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 gradient-secondary rounded-xl">
                <Code className="h-6 w-6 text-white" />
              </div>
              <Badge className="bg-orange-100 text-orange-800 text-xs px-2 py-1">4 alta</Badge>
            </div>
            <div className="text-3xl font-bold mb-1" style={{ color: 'var(--foreground)' }}>12</div>
            <p className="text-sm font-medium" style={{ color: 'var(--foreground-secondary)' }}>
              Tasks Pendentes
            </p>
            <p className="text-xs mt-2" style={{ color: 'var(--foreground-secondary)' }}>
              4 de alta prioridade
            </p>
          </div>

          <div className="modern-card p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 gradient-accent opacity-10 rounded-full -mr-10 -mt-10"></div>
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 gradient-accent rounded-xl">
                <DollarSign className="h-6 w-6 text-white" />
              </div>
              <Badge className="bg-red-100 text-red-800 text-xs px-2 py-1">+$23</Badge>
            </div>
            <div className="text-3xl font-bold mb-1" style={{ color: 'var(--foreground)' }}>$127</div>
            <p className="text-sm font-medium" style={{ color: 'var(--foreground-secondary)' }}>
              Custo Mensal
            </p>
            <p className="text-xs mt-2" style={{ color: 'var(--foreground-secondary)' }}>
              +$23 vs mês anterior
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
            <div className="text-3xl font-bold mb-1" style={{ color: 'var(--foreground)' }}>2h</div>
            <p className="text-sm font-medium" style={{ color: 'var(--foreground-secondary)' }}>
              Próximo Evento
            </p>
            <p className="text-xs mt-2" style={{ color: 'var(--foreground-secondary)' }}>
              Sprint Planning
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
                <Button variant="outline" className="rounded-xl">
                  Ver Todos
                </Button>
              </div>
              <div className="space-y-4">
                {/* Project 1 */}
                <div className="flex items-center justify-between p-5 border rounded-xl hover:shadow-md transition-all duration-300" style={{ borderColor: 'var(--border)' }}>
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 gradient-primary rounded-xl flex items-center justify-center">
                      <Rocket className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg" style={{ color: 'var(--foreground)' }}>E-commerce Platform</h3>
                      <p className="text-sm" style={{ color: 'var(--foreground-secondary)' }}>
                        Next.js + Supabase
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Badge className="gradient-secondary text-white border-0 px-3 py-1">Development</Badge>
                    <Button variant="outline" size="sm" className="rounded-xl">
                      Ver Projeto
                    </Button>
                  </div>
                </div>

                {/* Project 2 */}
                <div className="flex items-center justify-between p-5 border rounded-xl hover:shadow-md transition-all duration-300" style={{ borderColor: 'var(--border)' }}>
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 gradient-success rounded-xl flex items-center justify-center">
                      <Code className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg" style={{ color: 'var(--foreground)' }}>Task Manager</h3>
                      <p className="text-sm" style={{ color: 'var(--foreground-secondary)' }}>
                        React + Firebase
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Badge className="gradient-success text-white border-0 px-3 py-1">Deployed</Badge>
                    <Button variant="outline" size="sm" className="rounded-xl">
                      Ver Projeto
                    </Button>
                  </div>
                </div>

                {/* Project 3 */}
                <div className="flex items-center justify-between p-5 border rounded-xl hover:shadow-md transition-all duration-300" style={{ borderColor: 'var(--border)' }}>
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 gradient-accent rounded-xl flex items-center justify-center">
                      <DollarSign className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg" style={{ color: 'var(--foreground)' }}>Finance Tracker</h3>
                      <p className="text-sm" style={{ color: 'var(--foreground-secondary)' }}>
                        Flutter + Supabase
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Badge className="bg-gray-100 text-gray-700 border-0 px-3 py-1">Planning</Badge>
                    <Button variant="outline" size="sm" className="rounded-xl">
                      Ver Projeto
                    </Button>
                  </div>
                </div>
              </div>
            </div>
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