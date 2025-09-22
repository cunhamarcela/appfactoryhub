'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Bot, Eye, EyeOff, ExternalLink, Key, Loader2, AlertCircle, CheckCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface OpenAIConfigModalProps {
  hasApiKey: boolean
  onApiKeyUpdated: (hasKey: boolean) => void
  trigger?: React.ReactNode
}

export default function OpenAIConfigModal({ 
  hasApiKey, 
  onApiKeyUpdated, 
  trigger 
}: OpenAIConfigModalProps) {
  const [open, setOpen] = useState(false)
  const [apiKey, setApiKey] = useState('')
  const [showKey, setShowKey] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleSave = async () => {
    if (!apiKey.trim()) {
      setError('Por favor, insira sua chave da API')
      return
    }

    if (!apiKey.startsWith('sk-') || apiKey.length < 20) {
      setError('Formato de chave inválido. A chave deve começar com "sk-"')
      return
    }

    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const response = await fetch('/api/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ openaiApiKey: apiKey }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao salvar a chave')
      }

      setSuccess('Chave da OpenAI salva com sucesso!')
      setApiKey('')
      onApiKeyUpdated(true)
      
      // Close modal after success
      setTimeout(() => {
        setOpen(false)
        setSuccess('')
      }, 1500)

    } catch (error) {
      console.error('Error saving OpenAI key:', error)
      setError(error instanceof Error ? error.message : 'Erro ao salvar a chave')
    } finally {
      setLoading(false)
    }
  }

  const handleRemove = async () => {
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const response = await fetch('/api/settings', {
        method: 'DELETE',
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao remover a chave')
      }

      setSuccess('Chave da OpenAI removida com sucesso!')
      onApiKeyUpdated(false)
      
      // Close modal after success
      setTimeout(() => {
        setOpen(false)
        setSuccess('')
      }, 1500)

    } catch (error) {
      console.error('Error removing OpenAI key:', error)
      setError(error instanceof Error ? error.message : 'Erro ao remover a chave')
    } finally {
      setLoading(false)
    }
  }

  const defaultTrigger = (
    <Button 
      variant={hasApiKey ? "outline" : "default"}
      className="w-full rounded-xl"
    >
      <Key className="w-4 h-4 mr-2" />
      {hasApiKey ? 'Gerenciar Chave' : 'Configurar Chave'}
    </Button>
  )

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Bot className="w-5 h-5 text-green-600" />
            <span>Configurar OpenAI</span>
          </DialogTitle>
          <DialogDescription>
            Configure sua chave da API da OpenAI para usar os agentes de IA
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Current Status */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-lg ${hasApiKey ? 'bg-green-100' : 'bg-gray-100'}`}>
                  {hasApiKey ? (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-gray-500" />
                  )}
                </div>
                <div>
                  <p className="font-medium">
                    {hasApiKey ? 'Chave configurada' : 'Nenhuma chave configurada'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {hasApiKey 
                      ? 'Os agentes de IA estão funcionais' 
                      : 'Configure sua chave para usar os agentes'
                    }
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* API Key Input */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="apikey">Chave da API OpenAI</Label>
              <div className="relative">
                <Input
                  id="apikey"
                  type={showKey ? "text" : "password"}
                  placeholder="sk-..."
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowKey(!showKey)}
                >
                  {showKey ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Sua chave será criptografada e armazenada com segurança
              </p>
            </div>

            {/* Help Link */}
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="pt-4">
                <div className="flex items-start space-x-3">
                  <div className="p-1 bg-blue-100 rounded">
                    <ExternalLink className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-blue-900">
                      Precisa de uma chave da API?
                    </p>
                    <p className="text-xs text-blue-700 mb-2">
                      Crie uma conta na OpenAI e gere sua chave da API
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-blue-600 border-blue-300 hover:bg-blue-100"
                      onClick={() => window.open('https://platform.openai.com/api-keys', '_blank')}
                    >
                      Obter Chave da API
                      <ExternalLink className="w-3 h-3 ml-1" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Error/Success Messages */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">{success}</AlertDescription>
            </Alert>
          )}

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <Button
              onClick={handleSave}
              disabled={loading || !apiKey.trim()}
              className="flex-1"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Key className="w-4 h-4 mr-2" />
              )}
              Salvar Chave
            </Button>

            {hasApiKey && (
              <Button
                variant="destructive"
                onClick={handleRemove}
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  'Remover'
                )}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
