"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog"
import { 
  Rocket, 
  Lightbulb, 
  AlertTriangle, 
  Copy, 
  RefreshCw,
  Zap,
  CheckCircle
} from "lucide-react"
import { CopyButton } from "@/components/CopyButton"

interface NextStep {
  title: string
  why: string
  impact: string
}

interface Risk {
  title: string
  mitigation: string
}

interface Suggestions {
  next_steps: NextStep[]
  risks: Risk[]
  cursor_prompt: string
}

interface AgentSuggestionsProps {
  projectSlug: string
  projectName: string
}

export function AgentSuggestions({ projectSlug, projectName }: AgentSuggestionsProps) {
  const [suggestions, setSuggestions] = useState<Suggestions | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [open, setOpen] = useState(false)

  const generateSuggestions = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch('/api/agent/suggest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug: projectSlug })
      })

      if (!response.ok) {
        throw new Error('Failed to generate suggestions')
      }

      const data = await response.json()
      setSuggestions(data)
      setOpen(true)

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate suggestions')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Button 
        className="w-full gradient-accent text-white rounded-xl"
        onClick={generateSuggestions}
        disabled={loading}
      >
        {loading ? (
          <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
        ) : (
          <Rocket className="w-4 h-4 mr-2" />
        )}
        {loading ? 'Gerando...' : 'Gerar Sugestões'}
      </Button>

      {error && (
        <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-700">{error}</p>
          <Button 
            variant="outline" 
            size="sm" 
            className="mt-2 text-red-700 border-red-200"
            onClick={generateSuggestions}
          >
            Tentar Novamente
          </Button>
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <div className="p-2 gradient-accent rounded-lg">
                <Zap className="h-5 w-5 text-white" />
              </div>
              <span>Sugestões IA para {projectName}</span>
            </DialogTitle>
            <DialogDescription>
              Análise inteligente do seu projeto com próximos passos e recomendações
            </DialogDescription>
          </DialogHeader>

          {suggestions && (
            <div className="space-y-6">
              {/* Next Steps */}
              <div>
                <div className="flex items-center space-x-2 mb-4">
                  <Lightbulb className="h-5 w-5 text-blue-600" />
                  <h3 className="text-lg font-semibold">Próximos Passos</h3>
                </div>
                <div className="space-y-3">
                  {suggestions.next_steps.map((step, index) => (
                    <div key={index} className="border rounded-lg p-4 bg-blue-50/50">
                      <div className="flex items-start space-x-3">
                        <div className="w-6 h-6 gradient-primary rounded-full flex items-center justify-center text-white text-sm font-bold mt-0.5">
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900 mb-1">
                            {step.title}
                          </h4>
                          <p className="text-sm text-gray-600 mb-2">
                            <strong>Por quê:</strong> {step.why}
                          </p>
                          <div className="flex items-center space-x-2">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            <span className="text-sm text-green-700 font-medium">
                              {step.impact}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Risks */}
              <div>
                <div className="flex items-center space-x-2 mb-4">
                  <AlertTriangle className="h-5 w-5 text-orange-600" />
                  <h3 className="text-lg font-semibold">Riscos e Mitigações</h3>
                </div>
                <div className="space-y-3">
                  {suggestions.risks.map((risk, index) => (
                    <div key={index} className="border rounded-lg p-4 bg-orange-50/50">
                      <h4 className="font-semibold text-gray-900 mb-1 flex items-center">
                        <AlertTriangle className="h-4 w-4 text-orange-600 mr-2" />
                        {risk.title}
                      </h4>
                      <p className="text-sm text-gray-600">
                        <strong>Mitigação:</strong> {risk.mitigation}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Cursor Prompt */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <Copy className="h-5 w-5 text-purple-600" />
                    <h3 className="text-lg font-semibold">Prompt para Cursor</h3>
                  </div>
                  <CopyButton 
                    text={suggestions.cursor_prompt}
                    className="gradient-primary text-white rounded-lg px-4 py-2"
                  />
                </div>
                <div className="bg-gray-900 rounded-lg p-4 text-gray-100 text-sm font-mono">
                  <pre className="whitespace-pre-wrap">{suggestions.cursor_prompt}</pre>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-between pt-4 border-t">
                <Button 
                  variant="outline" 
                  onClick={generateSuggestions}
                  disabled={loading}
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Gerar Novas Sugestões
                </Button>
                <Button onClick={() => setOpen(false)}>
                  Fechar
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
