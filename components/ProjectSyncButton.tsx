'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { RefreshCw, Database } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface ProjectSyncButtonProps {
  projectSlug: string
  className?: string
}

interface ProjectSeedButtonProps {
  projectSlug: string
  className?: string
}

export function ProjectSyncButton({ projectSlug, className }: ProjectSyncButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSync = async () => {
    setIsLoading(true)
    
    try {
      const response = await fetch(`/api/projects/${projectSlug}/sync`, {
        method: 'POST',
      })

      if (response.ok) {
        const data = await response.json()
        console.log('Project synced successfully:', data)
        
        // Refresh the page to show updated data
        router.refresh()
        
        // Show success message (you could use a toast here)
        alert('Projeto sincronizado com sucesso!')
      } else {
        const error = await response.json()
        console.error('Sync failed:', error)
        alert('Erro ao sincronizar projeto: ' + (error.error || 'Erro desconhecido'))
      }
    } catch (error) {
      console.error('Sync error:', error)
      alert('Erro ao sincronizar projeto')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button
      onClick={handleSync}
      disabled={isLoading}
      variant="outline"
      size="sm"
      className={className}
    >
      <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
      {isLoading ? 'Sincronizando...' : 'Sincronizar'}
    </Button>
  )
}

export function ProjectSeedButton({ projectSlug, className }: ProjectSeedButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSeed = async () => {
    const confirmed = confirm(
      'Isso criará tasks e checklists baseados nos seeds padrão. ' +
      'Se já existirem tasks/checklists, a operação falhará. Continuar?'
    )
    
    if (!confirmed) return

    setIsLoading(true)
    
    try {
      const response = await fetch(`/api/projects/${projectSlug}/seed`, {
        method: 'POST',
      })

      if (response.ok) {
        const data = await response.json()
        console.log('Project seeded successfully:', data)
        
        // Refresh the page to show new tasks/checklists
        router.refresh()
        
        // Show success message
        alert(`Sucesso! Criadas ${data.tasksCreated} tasks, ${data.checklistsCreated} checklists e ${data.surfacesCreated} superfícies.`)
      } else {
        const error = await response.json()
        console.error('Seed failed:', error)
        
        if (error.error === 'Project already has tasks or checklists') {
          alert('Este projeto já possui tasks ou checklists. O seed só pode ser executado uma vez por projeto.')
        } else {
          alert('Erro ao criar seeds: ' + (error.error || 'Erro desconhecido'))
        }
      }
    } catch (error) {
      console.error('Seed error:', error)
      alert('Erro ao criar seeds do projeto')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button
      onClick={handleSeed}
      disabled={isLoading}
      variant="outline"
      size="sm"
      className={className}
    >
      <Database className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
      {isLoading ? 'Criando Seeds...' : 'Criar Tasks & Checklists'}
    </Button>
  )
}
