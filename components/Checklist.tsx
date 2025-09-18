"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Circle, RotateCcw } from "lucide-react"

interface ChecklistItem {
  id: string
  label: string
  done: boolean
}

interface ChecklistData {
  id: string
  type: string
  title: string
  items: ChecklistItem[]
  progress: number
  createdAt: string
  updatedAt: string
}

interface ChecklistProps {
  checklist: ChecklistData
  onItemToggle: (checklistId: string, itemId: string, done: boolean) => Promise<void>
  onReset?: (checklistId: string) => Promise<void>
}

export function Checklist({ checklist, onItemToggle, onReset }: ChecklistProps) {
  const [loading, setLoading] = useState<string | null>(null)
  const [resetting, setResetting] = useState(false)

  const handleItemToggle = async (itemId: string, currentDone: boolean) => {
    setLoading(itemId)
    try {
      await onItemToggle(checklist.id, itemId, !currentDone)
    } catch (error) {
      console.error('Error toggling checklist item:', error)
    } finally {
      setLoading(null)
    }
  }

  const handleReset = async () => {
    if (!onReset) return
    
    setResetting(true)
    try {
      await onReset(checklist.id)
    } catch (error) {
      console.error('Error resetting checklist:', error)
    } finally {
      setResetting(false)
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'QA_RELEASE':
        return 'gradient-primary text-white'
      case 'GROWTH_LAUNCH':
        return 'gradient-secondary text-white'
      case 'UX_RETENTION':
        return 'gradient-success text-white'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'QA_RELEASE':
        return 'QA & Release'
      case 'GROWTH_LAUNCH':
        return 'Growth & Launch'
      case 'UX_RETENTION':
        return 'UX & Retention'
      default:
        return type
    }
  }

  const completedItems = checklist.items.filter(item => item.done).length
  const totalItems = checklist.items.length
  const progressPercentage = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0

  return (
    <div className="modern-card p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <Badge className={`px-3 py-1 ${getTypeColor(checklist.type)}`}>
            {getTypeLabel(checklist.type)}
          </Badge>
          <div>
            <h3 className="text-xl font-bold" style={{ color: 'var(--foreground)' }}>
              {checklist.title}
            </h3>
            <p className="text-sm" style={{ color: 'var(--foreground-secondary)' }}>
              {completedItems} de {totalItems} itens concluídos
            </p>
          </div>
        </div>

        {onReset && (
          <Button
            variant="outline"
            size="sm"
            className="rounded-xl"
            onClick={handleReset}
            disabled={resetting || completedItems === 0}
          >
            <RotateCcw className={`w-4 h-4 mr-2 ${resetting ? 'animate-spin' : ''}`} />
            Reset
          </Button>
        )}
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>
            Progresso
          </span>
          <span className="text-sm font-bold" style={{ color: 'var(--foreground)' }}>
            {progressPercentage}%
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div 
            className={`h-3 rounded-full transition-all duration-300 ${
              progressPercentage === 100 ? 'gradient-success' : 'gradient-primary'
            }`}
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
      </div>

      {/* Checklist Items */}
      <div className="space-y-3">
        {checklist.items.map((item) => (
          <div
            key={item.id}
            className={`flex items-start space-x-3 p-3 rounded-xl border transition-all duration-200 cursor-pointer hover:shadow-sm ${
              item.done 
                ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' 
                : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700'
            }`}
            onClick={() => handleItemToggle(item.id, item.done)}
          >
            <div className="flex-shrink-0 mt-0.5">
              {loading === item.id ? (
                <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
              ) : item.done ? (
                <CheckCircle className="w-5 h-5 text-green-600" />
              ) : (
                <Circle className="w-5 h-5 text-gray-400" />
              )}
            </div>
            
            <div className="flex-1 min-w-0">
              <p 
                className={`text-sm font-medium ${
                  item.done 
                    ? 'line-through text-green-700 dark:text-green-400' 
                    : 'text-gray-900 dark:text-gray-100'
                }`}
              >
                {item.label}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      {progressPercentage === 100 && (
        <div className="mt-6 p-4 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800">
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <span className="text-sm font-medium text-green-700 dark:text-green-400">
              Checklist concluído! 🎉
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
