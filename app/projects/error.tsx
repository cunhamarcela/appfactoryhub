"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { AlertTriangle, RefreshCw, Github, Plus } from "lucide-react"
import Link from "next/link"

interface ErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function ProjectsError({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error('Projects page error:', error)
  }, [error])

  const isGitHubError = error.message?.includes('GitHub') || 
                       error.message?.includes('not connected') ||
                       error.message?.includes('Unauthorized')

  return (
    <div className="min-h-screen" style={{ background: 'var(--background)' }}>
      <div className="container mx-auto px-6 py-8">
        <div className="modern-card p-12 text-center max-w-2xl mx-auto">
          <div className="p-4 bg-red-100 dark:bg-red-900/20 rounded-full w-16 h-16 mx-auto mb-6 flex items-center justify-center">
            <AlertTriangle className="w-8 h-8 text-red-600 dark:text-red-400" />
          </div>
          
          <h2 className="text-3xl font-bold mb-4" style={{ color: 'var(--foreground)' }}>
            Erro ao carregar projetos
          </h2>
          
          <p className="text-lg mb-8" style={{ color: 'var(--foreground-secondary)' }}>
            {isGitHubError 
              ? "Não foi possível conectar com o GitHub. Verifique sua conexão e tente novamente."
              : "Ocorreu um problema ao carregar seus projetos. Tente novamente ou crie um novo projeto."
            }
          </p>

          {process.env.NODE_ENV === 'development' && (
            <details className="mb-8 text-left bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
              <summary className="cursor-pointer text-sm font-medium mb-2" style={{ color: 'var(--foreground)' }}>
                Detalhes do erro (desenvolvimento)
              </summary>
              <div className="text-xs overflow-auto max-h-32">
                <pre style={{ color: 'var(--foreground-secondary)' }}>
                  {error.message}
                  {error.stack}
                  {error.digest && `\nDigest: ${error.digest}`}
                </pre>
              </div>
            </details>
          )}

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {isGitHubError ? (
              <>
                <Button
                  onClick={() => window.location.href = '/api/auth/signin'}
                  className="gradient-primary text-white rounded-xl px-6 py-3"
                >
                  <Github className="w-5 h-5 mr-2" />
                  Conectar GitHub
                </Button>
                <Button
                  onClick={reset}
                  variant="outline"
                  className="rounded-xl px-6 py-3"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Tentar Novamente
                </Button>
              </>
            ) : (
              <>
                <Button
                  onClick={reset}
                  className="gradient-primary text-white rounded-xl px-6 py-3"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Recarregar Projetos
                </Button>
                <Link href="/projects/new">
                  <Button variant="outline" className="rounded-xl px-6 py-3">
                    <Plus className="w-4 h-4 mr-2" />
                    Criar Novo Projeto
                  </Button>
                </Link>
              </>
            )}
          </div>

          <div className="mt-8 pt-8 border-t" style={{ borderColor: 'var(--border)' }}>
            <p className="text-sm" style={{ color: 'var(--foreground-secondary)' }}>
              Se o problema persistir, entre em contato com o suporte ou{' '}
              <Link href="/" className="text-blue-600 hover:underline">
                volte ao dashboard
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
