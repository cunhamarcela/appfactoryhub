'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { RefreshCw } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface ProjectSyncButtonProps {
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
