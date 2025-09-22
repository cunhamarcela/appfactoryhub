"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { AlertTriangle, RefreshCw, Home, Github } from "lucide-react"
import Link from "next/link"

interface ErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log do erro para monitoramento
    console.error('Application error:', error)
  }, [error])

  // Verificar se é um erro relacionado ao GitHub
  const isGitHubError = error.message?.includes('GitHub') || 
                       error.message?.includes('not connected') ||
                       error.message?.includes('Unauthorized')

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--background)' }}>
      <div className="modern-card p-8 max-w-md w-full mx-4 text-center">
        <div className="p-4 bg-red-100 dark:bg-red-900/20 rounded-full w-16 h-16 mx-auto mb-6 flex items-center justify-center">
          <AlertTriangle className="w-8 h-8 text-red-600 dark:text-red-400" />
        </div>
        
        <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--foreground)' }}>
          Ops! Algo deu errado
        </h2>
        
        <p className="text-sm mb-6" style={{ color: 'var(--foreground-secondary)' }}>
          {isGitHubError 
            ? "Parece que há um problema com a conexão do GitHub. Tente reconectar sua conta."
            : "Ocorreu um erro inesperado. Nossa equipe foi notificada e está trabalhando para resolver o problema."
          }
        </p>

        {process.env.NODE_ENV === 'development' && (
          <details className="mb-6 text-left">
            <summary className="cursor-pointer text-sm font-medium mb-2" style={{ color: 'var(--foreground)' }}>
              Detalhes do erro (desenvolvimento)
            </summary>
            <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-lg text-xs overflow-auto max-h-32">
              <pre style={{ color: 'var(--foreground)' }}>
                {error.message}
                {error.digest && `\nDigest: ${error.digest}`}
              </pre>
            </div>
          </details>
        )}

        <div className="flex flex-col sm:flex-row gap-3">
          {isGitHubError ? (
            <>
              <Button
                onClick={() => window.location.href = '/api/auth/signin'}
                className="gradient-primary text-white rounded-xl flex-1"
              >
                <Github className="w-4 h-4 mr-2" />
                Conectar GitHub
              </Button>
              <Button
                onClick={reset}
                variant="outline"
                className="rounded-xl flex-1"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Tentar Novamente
              </Button>
            </>
          ) : (
            <>
              <Button
                onClick={reset}
                className="gradient-primary text-white rounded-xl flex-1"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Tentar Novamente
              </Button>
              <Link href="/" className="flex-1">
                <Button variant="outline" className="w-full rounded-xl">
                  <Home className="w-4 h-4 mr-2" />
                  Ir para Home
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
