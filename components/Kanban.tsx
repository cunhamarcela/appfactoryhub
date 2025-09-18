"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  MoreHorizontal, 
  Clock, 
  Play, 
  CheckCircle,
  Filter,
  Plus
} from "lucide-react"

interface Task {
  id: string
  title: string
  description?: string
  status: 'todo' | 'doing' | 'done'
  sprint: string
  priority?: string
  category?: string
  createdAt: string
  updatedAt: string
}

interface KanbanProps {
  tasks: Task[]
  onTaskUpdate: (taskId: string, status: 'todo' | 'doing' | 'done') => Promise<void>
  onTaskCreate?: (task: Partial<Task>) => Promise<void>
}

export function Kanban({ tasks, onTaskUpdate, onTaskCreate }: KanbanProps) {
  const [selectedSprint, setSelectedSprint] = useState<string>('all')
  const [loading, setLoading] = useState<string | null>(null)

  const sprints = ['all', 'sprint0', 'sprint1', 'sprint2']
  const sprintLabels = {
    'all': 'Todos os Sprints',
    'sprint0': 'Sprint 0',
    'sprint1': 'Sprint 1', 
    'sprint2': 'Sprint 2'
  }

  const filteredTasks = selectedSprint === 'all' 
    ? tasks 
    : tasks.filter(task => task.sprint === selectedSprint)

  const columns = [
    {
      id: 'todo',
      title: 'To Do',
      icon: Clock,
      color: 'bg-gray-100 text-gray-700',
      tasks: filteredTasks.filter(task => task.status === 'todo')
    },
    {
      id: 'doing', 
      title: 'Doing',
      icon: Play,
      color: 'gradient-secondary text-white',
      tasks: filteredTasks.filter(task => task.status === 'doing')
    },
    {
      id: 'done',
      title: 'Done', 
      icon: CheckCircle,
      color: 'gradient-success text-white',
      tasks: filteredTasks.filter(task => task.status === 'done')
    }
  ]

  const handleStatusChange = async (taskId: string, newStatus: 'todo' | 'doing' | 'done') => {
    setLoading(taskId)
    try {
      await onTaskUpdate(taskId, newStatus)
    } catch (error) {
      console.error('Error updating task:', error)
    } finally {
      setLoading(null)
    }
  }

  const getSprintColor = (sprint: string) => {
    switch (sprint) {
      case 'sprint0':
        return 'bg-blue-100 text-blue-800'
      case 'sprint1':
        return 'bg-purple-100 text-purple-800'
      case 'sprint2':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  const TaskCard = ({ task }: { task: Task }) => (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <h3 className="font-medium text-sm leading-tight" style={{ color: 'var(--foreground)' }}>
          {task.title}
        </h3>
        <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
          <MoreHorizontal className="h-3 w-3" />
        </Button>
      </div>

      {task.description && (
        <p className="text-xs mb-3" style={{ color: 'var(--foreground-secondary)' }}>
          {task.description}
        </p>
      )}

      <div className="flex items-center justify-between">
        <Badge className={`text-xs px-2 py-1 ${getSprintColor(task.sprint)}`}>
          {sprintLabels[task.sprint as keyof typeof sprintLabels] || task.sprint}
        </Badge>

        <div className="flex items-center space-x-1">
          {task.status !== 'todo' && (
            <Button
              variant="ghost"
              size="sm"
              className="h-6 px-2 text-xs"
              onClick={() => handleStatusChange(task.id, 'todo')}
              disabled={loading === task.id}
            >
              To Do
            </Button>
          )}
          {task.status !== 'doing' && (
            <Button
              variant="ghost"
              size="sm"
              className="h-6 px-2 text-xs"
              onClick={() => handleStatusChange(task.id, 'doing')}
              disabled={loading === task.id}
            >
              Doing
            </Button>
          )}
          {task.status !== 'done' && (
            <Button
              variant="ghost"
              size="sm"
              className="h-6 px-2 text-xs"
              onClick={() => handleStatusChange(task.id, 'done')}
              disabled={loading === task.id}
            >
              Done
            </Button>
          )}
        </div>
      </div>
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4" style={{ color: 'var(--foreground-secondary)' }} />
            <span className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>
              Sprint:
            </span>
          </div>
          <div className="flex items-center space-x-2">
            {sprints.map(sprint => (
              <Button
                key={sprint}
                variant={selectedSprint === sprint ? "default" : "outline"}
                size="sm"
                className="rounded-xl"
                onClick={() => setSelectedSprint(sprint)}
              >
                {sprintLabels[sprint as keyof typeof sprintLabels]}
              </Button>
            ))}
          </div>
        </div>

        <div className="text-sm" style={{ color: 'var(--foreground-secondary)' }}>
          {filteredTasks.length} tasks
        </div>
      </div>

      {/* Kanban Board */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {columns.map(column => {
          const Icon = column.icon
          return (
            <div key={column.id} className="space-y-4">
              {/* Column Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-xl ${column.color}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="font-semibold" style={{ color: 'var(--foreground)' }}>
                      {column.title}
                    </h2>
                    <span className="text-sm" style={{ color: 'var(--foreground-secondary)' }}>
                      {column.tasks.length} tasks
                    </span>
                  </div>
                </div>
                
                {onTaskCreate && (
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <Plus className="h-4 w-4" />
                  </Button>
                )}
              </div>

              {/* Tasks */}
              <div className="space-y-3 min-h-[200px]">
                {column.tasks.map(task => (
                  <TaskCard key={task.id} task={task} />
                ))}
                
                {column.tasks.length === 0 && (
                  <div className="flex items-center justify-center h-32 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl">
                    <span className="text-sm" style={{ color: 'var(--foreground-secondary)' }}>
                      Nenhuma task
                    </span>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
