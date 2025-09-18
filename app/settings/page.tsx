"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  User, 
  Bell, 
  Shield, 
  Palette, 
  Key, 
  Github, 
  Calendar,
  Zap,
  Save
} from "lucide-react"

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("profile")
  const [settings, setSettings] = useState({
    profile: {
      name: "Marcela Cunha",
      email: "cunhamarcela@example.com",
      timezone: "America/Sao_Paulo",
      language: "pt-BR"
    },
    notifications: {
      emailNotifications: true,
      pushNotifications: true,
      weeklyReports: true,
      projectUpdates: true,
      deadlineReminders: true
    },
    integrations: {
      github: { connected: true, username: "cunhamarcela" },
      google: { connected: false, email: "" },
      openai: { connected: false, apiKey: "" }
    },
    appearance: {
      theme: "system",
      sidebarCollapsed: false,
      compactMode: false
    }
  })

  const tabs = [
    { id: "profile", label: "Perfil", icon: User },
    { id: "notifications", label: "Notificações", icon: Bell },
    { id: "integrations", label: "Integrações", icon: Zap },
    { id: "appearance", label: "Aparência", icon: Palette },
    { id: "security", label: "Segurança", icon: Shield }
  ]

  const handleSettingChange = (category: string, key: string, value: boolean | string) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category as keyof typeof prev],
        [key]: value
      }
    }))
  }

  const renderProfileSettings = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium mb-2" style={{ color: 'var(--foreground)' }}>
          Nome Completo
        </label>
        <input
          type="text"
          value={settings.profile.name}
          onChange={(e) => handleSettingChange('profile', 'name', e.target.value)}
          className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
          style={{ borderColor: 'var(--border)', background: 'var(--background)' }}
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-2" style={{ color: 'var(--foreground)' }}>
          Email
        </label>
        <input
          type="email"
          value={settings.profile.email}
          onChange={(e) => handleSettingChange('profile', 'email', e.target.value)}
          className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
          style={{ borderColor: 'var(--border)', background: 'var(--background)' }}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: 'var(--foreground)' }}>
            Fuso Horário
          </label>
          <select
            value={settings.profile.timezone}
            onChange={(e) => handleSettingChange('profile', 'timezone', e.target.value)}
            className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            style={{ borderColor: 'var(--border)', background: 'var(--background)' }}
          >
            <option value="America/Sao_Paulo">São Paulo (GMT-3)</option>
            <option value="America/New_York">New York (GMT-5)</option>
            <option value="Europe/London">London (GMT+0)</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: 'var(--foreground)' }}>
            Idioma
          </label>
          <select
            value={settings.profile.language}
            onChange={(e) => handleSettingChange('profile', 'language', e.target.value)}
            className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            style={{ borderColor: 'var(--border)', background: 'var(--background)' }}
          >
            <option value="pt-BR">Português (Brasil)</option>
            <option value="en-US">English (US)</option>
            <option value="es-ES">Español</option>
          </select>
        </div>
      </div>
    </div>
  )

  const renderNotificationSettings = () => (
    <div className="space-y-6">
      {Object.entries(settings.notifications).map(([key, value]) => (
        <div key={key} className="flex items-center justify-between p-4 border rounded-xl" style={{ borderColor: 'var(--border)' }}>
          <div>
            <h3 className="font-medium" style={{ color: 'var(--foreground)' }}>
              {key === 'emailNotifications' && 'Notificações por Email'}
              {key === 'pushNotifications' && 'Notificações Push'}
              {key === 'weeklyReports' && 'Relatórios Semanais'}
              {key === 'projectUpdates' && 'Atualizações de Projetos'}
              {key === 'deadlineReminders' && 'Lembretes de Deadline'}
            </h3>
            <p className="text-sm" style={{ color: 'var(--foreground-secondary)' }}>
              {key === 'emailNotifications' && 'Receba notificações importantes por email'}
              {key === 'pushNotifications' && 'Notificações em tempo real no navegador'}
              {key === 'weeklyReports' && 'Resumo semanal dos seus projetos'}
              {key === 'projectUpdates' && 'Notificações sobre mudanças nos projetos'}
              {key === 'deadlineReminders' && 'Lembretes antes dos prazos importantes'}
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={value as boolean}
              onChange={(e) => handleSettingChange('notifications', key, e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
          </label>
        </div>
      ))}
    </div>
  )

  const renderIntegrationSettings = () => (
    <div className="space-y-6">
      {/* GitHub Integration */}
      <div className="p-6 border rounded-xl" style={{ borderColor: 'var(--border)' }}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gray-900 rounded-xl">
              <Github className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold" style={{ color: 'var(--foreground)' }}>GitHub</h3>
              <p className="text-sm" style={{ color: 'var(--foreground-secondary)' }}>
                Conecte sua conta para criar repositórios automaticamente
              </p>
            </div>
          </div>
          {settings.integrations.github.connected ? (
            <Badge className="gradient-success text-white border-0">Conectado</Badge>
          ) : (
            <Badge className="bg-gray-100 text-gray-700 border-0">Desconectado</Badge>
          )}
        </div>
        {settings.integrations.github.connected ? (
          <div className="flex items-center justify-between">
            <span className="text-sm" style={{ color: 'var(--foreground-secondary)' }}>
              @{settings.integrations.github.username}
            </span>
            <Button variant="outline" size="sm" className="rounded-xl">
              Desconectar
            </Button>
          </div>
        ) : (
          <Button className="gradient-primary text-white rounded-xl">
            <Github className="w-4 h-4 mr-2" />
            Conectar GitHub
          </Button>
        )}
      </div>

      {/* Google Calendar Integration */}
      <div className="p-6 border rounded-xl" style={{ borderColor: 'var(--border)' }}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 gradient-info rounded-xl">
              <Calendar className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold" style={{ color: 'var(--foreground)' }}>Google Calendar</h3>
              <p className="text-sm" style={{ color: 'var(--foreground-secondary)' }}>
                Sincronize eventos e agende blocos de desenvolvimento
              </p>
            </div>
          </div>
          <Badge className="bg-gray-100 text-gray-700 border-0">Desconectado</Badge>
        </div>
        <Button className="gradient-info text-white rounded-xl">
          <Calendar className="w-4 h-4 mr-2" />
          Conectar Google Calendar
        </Button>
      </div>

      {/* OpenAI Integration */}
      <div className="p-6 border rounded-xl" style={{ borderColor: 'var(--border)' }}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 gradient-secondary rounded-xl">
              <Zap className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold" style={{ color: 'var(--foreground)' }}>OpenAI</h3>
              <p className="text-sm" style={{ color: 'var(--foreground-secondary)' }}>
                Configure sua chave API para sugestões inteligentes
              </p>
            </div>
          </div>
          <Badge className="bg-gray-100 text-gray-700 border-0">Desconectado</Badge>
        </div>
        <div className="space-y-3">
          <input
            type="password"
            placeholder="sk-..."
            className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            style={{ borderColor: 'var(--border)', background: 'var(--background)' }}
          />
          <Button className="gradient-secondary text-white rounded-xl">
            <Key className="w-4 h-4 mr-2" />
            Salvar Chave API
          </Button>
        </div>
      </div>
    </div>
  )

  const renderAppearanceSettings = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium mb-4" style={{ color: 'var(--foreground)' }}>
          Tema
        </label>
        <div className="grid grid-cols-3 gap-4">
          {['light', 'dark', 'system'].map(theme => (
            <div
              key={theme}
              className={`p-4 border-2 rounded-xl cursor-pointer transition-all duration-300 ${
                settings.appearance.theme === theme 
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => handleSettingChange('appearance', 'theme', theme)}
            >
              <div className="text-center">
                <div className={`w-8 h-8 mx-auto mb-2 rounded-lg ${
                  theme === 'light' ? 'bg-white border-2 border-gray-300' :
                  theme === 'dark' ? 'bg-gray-900' : 'bg-gradient-to-br from-white to-gray-900'
                }`}></div>
                <span className="text-sm font-medium capitalize" style={{ color: 'var(--foreground)' }}>
                  {theme === 'system' ? 'Sistema' : theme === 'light' ? 'Claro' : 'Escuro'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between p-4 border rounded-xl" style={{ borderColor: 'var(--border)' }}>
          <div>
            <h3 className="font-medium" style={{ color: 'var(--foreground)' }}>
              Sidebar Colapsada por Padrão
            </h3>
            <p className="text-sm" style={{ color: 'var(--foreground-secondary)' }}>
              Iniciar com a barra lateral minimizada
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.appearance.sidebarCollapsed}
              onChange={(e) => handleSettingChange('appearance', 'sidebarCollapsed', e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
          </label>
        </div>

        <div className="flex items-center justify-between p-4 border rounded-xl" style={{ borderColor: 'var(--border)' }}>
          <div>
            <h3 className="font-medium" style={{ color: 'var(--foreground)' }}>
              Modo Compacto
            </h3>
            <p className="text-sm" style={{ color: 'var(--foreground-secondary)' }}>
              Interface mais densa com menos espaçamento
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.appearance.compactMode}
              onChange={(e) => handleSettingChange('appearance', 'compactMode', e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
          </label>
        </div>
      </div>
    </div>
  )

  const renderSecuritySettings = () => (
    <div className="space-y-6">
      <div className="p-6 border rounded-xl" style={{ borderColor: 'var(--border)' }}>
        <h3 className="font-semibold mb-4" style={{ color: 'var(--foreground)' }}>
          Alterar Senha
        </h3>
        <div className="space-y-4">
          <input
            type="password"
            placeholder="Senha atual"
            className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            style={{ borderColor: 'var(--border)', background: 'var(--background)' }}
          />
          <input
            type="password"
            placeholder="Nova senha"
            className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            style={{ borderColor: 'var(--border)', background: 'var(--background)' }}
          />
          <input
            type="password"
            placeholder="Confirmar nova senha"
            className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            style={{ borderColor: 'var(--border)', background: 'var(--background)' }}
          />
          <Button className="gradient-primary text-white rounded-xl">
            Atualizar Senha
          </Button>
        </div>
      </div>

      <div className="p-6 border rounded-xl" style={{ borderColor: 'var(--border)' }}>
        <h3 className="font-semibold mb-4" style={{ color: 'var(--foreground)' }}>
          Sessões Ativas
        </h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
            <div>
              <p className="font-medium" style={{ color: 'var(--foreground)' }}>
                Chrome - macOS
              </p>
              <p className="text-sm" style={{ color: 'var(--foreground-secondary)' }}>
                São Paulo, Brasil • Ativo agora
              </p>
            </div>
            <Badge className="gradient-success text-white border-0">Atual</Badge>
          </div>
        </div>
      </div>

      <div className="p-6 border border-red-200 rounded-xl bg-red-50 dark:bg-red-900/20">
        <h3 className="font-semibold mb-2 text-red-800 dark:text-red-200">
          Zona de Perigo
        </h3>
        <p className="text-sm text-red-600 dark:text-red-300 mb-4">
          Ações irreversíveis que afetarão permanentemente sua conta.
        </p>
        <Button variant="outline" className="border-red-300 text-red-700 hover:bg-red-50 rounded-xl">
          Excluir Conta
        </Button>
      </div>
    </div>
  )

  const renderTabContent = () => {
    switch (activeTab) {
      case "profile":
        return renderProfileSettings()
      case "notifications":
        return renderNotificationSettings()
      case "integrations":
        return renderIntegrationSettings()
      case "appearance":
        return renderAppearanceSettings()
      case "security":
        return renderSecuritySettings()
      default:
        return renderProfileSettings()
    }
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--background)' }}>
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2" style={{ color: 'var(--foreground)' }}>
              Configurações
            </h1>
            <p className="text-lg" style={{ color: 'var(--foreground-secondary)' }}>
              Personalize sua experiência no App Factory Hub
            </p>
          </div>
          <Button className="gradient-primary text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
            <Save className="w-5 h-5 mr-2" />
            Salvar Alterações
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="modern-card p-6">
              <nav className="space-y-2">
                {tabs.map(tab => {
                  const Icon = tab.icon
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center space-x-3 px-4 py-3 text-left rounded-xl transition-all duration-300 ${
                        activeTab === tab.id
                          ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                          : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                      }`}
                      style={{ 
                        color: activeTab === tab.id ? undefined : 'var(--foreground-secondary)' 
                      }}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="font-medium">{tab.label}</span>
                    </button>
                  )
                })}
              </nav>
            </div>
          </div>

          {/* Content */}
          <div className="lg:col-span-3">
            <div className="modern-card p-6">
              <div className="flex items-center space-x-3 mb-6">
                {tabs.find(tab => tab.id === activeTab) && (
                  <>
                    <div className="p-2 gradient-primary rounded-xl">
                      {(() => {
                        const Icon = tabs.find(tab => tab.id === activeTab)!.icon
                        return <Icon className="h-5 w-5 text-white" />
                      })()}
                    </div>
                    <h2 className="text-2xl font-bold" style={{ color: 'var(--foreground)' }}>
                      {tabs.find(tab => tab.id === activeTab)?.label}
                    </h2>
                  </>
                )}
              </div>
              {renderTabContent()}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
