"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CopyButton } from "./CopyButton"
import { 
  FileText, 
  Code, 
  Settings, 
  Zap,
  ChevronDown,
  ChevronRight,
  ExternalLink
} from "lucide-react"

interface Template {
  id: string
  name: string
  type: 'markdown' | 'yaml' | 'json' | 'prompt'
  category: 'playbook' | 'spec' | 'config' | 'prompt'
  content: string
  description?: string
  filename?: string
}

interface TemplateViewerProps {
  templates: Template[]
  onWriteToRepo?: (template: Template) => Promise<void>
}

export function TemplateViewer({ templates, onWriteToRepo }: TemplateViewerProps) {
  const [expandedTemplates, setExpandedTemplates] = useState<Set<string>>(new Set())
  const [writingToRepo, setWritingToRepo] = useState<string | null>(null)

  const toggleExpanded = (templateId: string) => {
    const newExpanded = new Set(expandedTemplates)
    if (newExpanded.has(templateId)) {
      newExpanded.delete(templateId)
    } else {
      newExpanded.add(templateId)
    }
    setExpandedTemplates(newExpanded)
  }

  const handleWriteToRepo = async (template: Template) => {
    if (!onWriteToRepo) return
    
    setWritingToRepo(template.id)
    try {
      await onWriteToRepo(template)
    } catch (error) {
      console.error('Error writing to repo:', error)
    } finally {
      setWritingToRepo(null)
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'markdown':
        return FileText
      case 'yaml':
      case 'json':
        return Settings
      case 'prompt':
        return Zap
      default:
        return Code
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'playbook':
        return 'gradient-primary text-white'
      case 'spec':
        return 'gradient-secondary text-white'
      case 'config':
        return 'gradient-success text-white'
      case 'prompt':
        return 'gradient-accent text-white'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'playbook':
        return 'Playbook'
      case 'spec':
        return 'Especificação'
      case 'config':
        return 'Configuração'
      case 'prompt':
        return 'Prompt'
      default:
        return category
    }
  }

  const groupedTemplates = templates.reduce((groups, template) => {
    const category = template.category
    if (!groups[category]) {
      groups[category] = []
    }
    groups[category].push(template)
    return groups
  }, {} as Record<string, Template[]>)

  return (
    <div className="space-y-8">
      {Object.entries(groupedTemplates).map(([category, categoryTemplates]) => (
        <div key={category} className="space-y-4">
          {/* Category Header */}
          <div className="flex items-center space-x-3">
            <Badge className={`px-3 py-1 ${getCategoryColor(category)}`}>
              {getCategoryLabel(category)}
            </Badge>
            <h3 className="text-lg font-semibold" style={{ color: 'var(--foreground)' }}>
              {categoryTemplates.length} template{categoryTemplates.length !== 1 ? 's' : ''}
            </h3>
          </div>

          {/* Templates */}
          <div className="space-y-4">
            {categoryTemplates.map((template) => {
              const Icon = getTypeIcon(template.type)
              const isExpanded = expandedTemplates.has(template.id)
              
              return (
                <div key={template.id} className="modern-card p-6">
                  {/* Template Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-xl">
                        <Icon className="w-5 h-5" style={{ color: 'var(--foreground)' }} />
                      </div>
                      <div>
                        <h4 className="text-lg font-semibold" style={{ color: 'var(--foreground)' }}>
                          {template.name}
                        </h4>
                        {template.description && (
                          <p className="text-sm" style={{ color: 'var(--foreground-secondary)' }}>
                            {template.description}
                          </p>
                        )}
                        {template.filename && (
                          <p className="text-xs font-mono" style={{ color: 'var(--foreground-secondary)' }}>
                            {template.filename}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <CopyButton text={template.content} />
                      
                      {onWriteToRepo && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="rounded-xl"
                          onClick={() => handleWriteToRepo(template)}
                          disabled={writingToRepo === template.id}
                        >
                          <ExternalLink className="w-4 h-4 mr-2" />
                          {writingToRepo === template.id ? 'Escrevendo...' : 'Escrever no Repo'}
                        </Button>
                      )}

                      <Button
                        variant="ghost"
                        size="sm"
                        className="rounded-xl"
                        onClick={() => toggleExpanded(template.id)}
                      >
                        {isExpanded ? (
                          <ChevronDown className="w-4 h-4" />
                        ) : (
                          <ChevronRight className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </div>

                  {/* Template Content */}
                  {isExpanded && (
                    <div className="border-t pt-4" style={{ borderColor: 'var(--border)' }}>
                      <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-4 overflow-x-auto">
                        <pre className="text-sm whitespace-pre-wrap" style={{ color: 'var(--foreground)' }}>
                          {template.content}
                        </pre>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      ))}

      {templates.length === 0 && (
        <div className="modern-card p-12 text-center">
          <FileText className="w-16 h-16 mx-auto mb-4" style={{ color: 'var(--foreground-secondary)' }} />
          <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--foreground)' }}>
            Nenhum template encontrado
          </h3>
          <p style={{ color: 'var(--foreground-secondary)' }}>
            Os templates do Playbook aparecerão aqui após a criação do projeto.
          </p>
        </div>
      )}
    </div>
  )
}
