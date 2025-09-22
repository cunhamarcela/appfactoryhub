'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Github, Calendar, Bot, ExternalLink, Check, X } from "lucide-react"
import Link from "next/link"
import OpenAIConfigModal from "@/components/OpenAIConfigModal"

interface Integration {
  id: string
  name: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  status: string
  color: string
  actions: { label: string; href: string }[]
}

interface IntegrationsClientProps {
  initialHasOpenAIKey: boolean
}

export default function IntegrationsClient({ initialHasOpenAIKey }: IntegrationsClientProps) {
  const [hasOpenAIKey, setHasOpenAIKey] = useState(initialHasOpenAIKey)

  const integrations: Integration[] = [
    {
      id: 'github',
      name: 'GitHub',
      description: 'Conecte sua conta GitHub para criar repositórios automaticamente',
      icon: Github,
      status: 'connected', // TODO: Check real status
      color: 'bg-gray-900',
      actions: [
        { label: 'Configurar', href: '/api/auth/signin?callbackUrl=/settings/integrations' }
      ]
    },
    {
      id: 'google-calendar',
      name: 'Google Calendar',
      description: 'Sincronize seus eventos e agende blocos de trabalho',
      icon: Calendar,
      status: 'disconnected', // TODO: Check real status
      color: 'bg-blue-600',
      actions: [
        { label: 'Conectar', href: '/api/auth/signin?provider=google&callbackUrl=/settings/integrations' }
      ]
    },
    {
      id: 'openai',
      name: 'OpenAI',
      description: 'Configure sua chave da API para usar os agentes de IA',
      icon: Bot,
      status: hasOpenAIKey ? 'connected' : 'disconnected',
      color: 'bg-green-600',
      actions: [
        { label: hasOpenAIKey ? 'Gerenciar Chave' : 'Configurar Chave', href: '#' }
      ]
    }
  ]

  return (
    <div className="min-h-screen" style={{ background: 'var(--background)' }}>
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Link href="/settings">
              <Button variant="ghost" size="sm" className="rounded-xl">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar
              </Button>
            </Link>
            <div>
              <h1 className="text-4xl font-bold mb-2" style={{ color: 'var(--foreground)' }}>
                Integrações
              </h1>
              <p className="text-lg" style={{ color: 'var(--foreground-secondary)' }}>
                Conecte serviços externos para automatizar seu fluxo de trabalho
              </p>
            </div>
          </div>
        </div>

        {/* Integrations Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {integrations.map((integration) => {
            const Icon = integration.icon
            const isConnected = integration.status === 'connected'
            
            return (
              <Card key={integration.id} className="modern-card">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`p-3 ${integration.color} rounded-xl`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{integration.name}</CardTitle>
                      </div>
                    </div>
                    <Badge 
                      variant={isConnected ? "default" : "secondary"}
                      className={`${isConnected ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}
                    >
                      <div className="flex items-center space-x-1">
                        {isConnected ? (
                          <Check className="w-3 h-3" />
                        ) : (
                          <X className="w-3 h-3" />
                        )}
                        <span>{isConnected ? 'Conectado' : 'Desconectado'}</span>
                      </div>
                    </Badge>
                  </div>
                  <CardDescription>
                    {integration.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {integration.id === 'openai' ? (
                      <OpenAIConfigModal 
                        hasApiKey={hasOpenAIKey}
                        onApiKeyUpdated={setHasOpenAIKey}
                      />
                    ) : (
                      integration.actions.map((action, index) => (
                        <Link key={index} href={action.href}>
                          <Button 
                            variant={isConnected ? "outline" : "default"}
                            className="w-full rounded-xl"
                          >
                            {action.label}
                            <ExternalLink className="w-4 h-4 ml-2" />
                          </Button>
                        </Link>
                      ))
                    )}
                    
                    {isConnected && integration.id !== 'openai' && (
                      <Button 
                        variant="destructive" 
                        size="sm"
                        className="w-full rounded-xl"
                      >
                        Desconectar
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Help Section */}
        <Card className="modern-card mt-8">
          <CardHeader>
            <CardTitle>Precisa de Ajuda?</CardTitle>
            <CardDescription>
              Guias e documentação para configurar suas integrações
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border rounded-lg">
                <h4 className="font-semibold mb-2">GitHub OAuth</h4>
                <p className="text-sm text-muted-foreground mb-3">
                  Configure OAuth para criar repositórios automaticamente
                </p>
                <Button variant="outline" size="sm" className="rounded-xl">
                  Ver Guia
                </Button>
              </div>
              
              <div className="p-4 border rounded-lg">
                <h4 className="font-semibold mb-2">Google Calendar</h4>
                <p className="text-sm text-muted-foreground mb-3">
                  Sincronize eventos e agende blocos de trabalho
                </p>
                <Button variant="outline" size="sm" className="rounded-xl">
                  Ver Guia
                </Button>
              </div>
              
              <div className="p-4 border rounded-lg">
                <h4 className="font-semibold mb-2">OpenAI API</h4>
                <p className="text-sm text-muted-foreground mb-3">
                  Configure agentes de IA para sugestões automáticas
                </p>
                <Button variant="outline" size="sm" className="rounded-xl">
                  Ver Guia
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
