"use client"

import { useState } from "react"
// Using a simple select for now instead of dropdown menu
import { 
  Clock,
  Code,
  Rocket,
  Archive,
  CheckCircle,
  AlertCircle,
  RefreshCw
} from "lucide-react"

interface ProjectStatusActionsProps {
  projectSlug: string
  currentStatus: string
  onStatusChange?: (newStatus: string) => void
}

const statusOptions = [
  { value: "planning", label: "Planejamento", icon: Clock },
  { value: "development", label: "Desenvolvimento", icon: Code },
  { value: "testing", label: "Testes", icon: CheckCircle },
  { value: "deployed", label: "Publicado", icon: Rocket },
  { value: "paused", label: "Pausado", icon: AlertCircle },
  { value: "archived", label: "Arquivado", icon: Archive },
]

export function ProjectStatusActions({ 
  projectSlug, 
  currentStatus, 
  onStatusChange 
}: ProjectStatusActionsProps) {
  const [loading, setLoading] = useState(false)

  const handleStatusChange = async (newStatus: string) => {
    if (newStatus === currentStatus) return

    try {
      setLoading(true)
      
      const response = await fetch(`/api/projects/${projectSlug}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      })

      if (!response.ok) {
        throw new Error('Failed to update project status')
      }

      onStatusChange?.(newStatus)
      
      // Refresh the page to show updated status
      window.location.reload()

    } catch (error) {
      console.error('Error updating project status:', error)
      alert('Erro ao atualizar status do projeto')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center space-x-2">
      <select
        value={currentStatus}
        onChange={(e) => handleStatusChange(e.target.value)}
        disabled={loading}
        className="px-3 py-1 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        {statusOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {loading && (
        <RefreshCw className="w-4 h-4 animate-spin text-gray-500" />
      )}
    </div>
  )
}
