"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, Plus, ChevronLeft, ChevronRight, Filter } from "lucide-react"

interface CalendarEvent {
  id: string
  title: string
  start: Date
  end: Date
  type: "meeting" | "deadline" | "sprint" | "personal"
  description?: string
}

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [view, setView] = useState<"month" | "week" | "day">("month")

  useEffect(() => {
    // Mock events data
    const mockEvents: CalendarEvent[] = [
      {
        id: "1",
        title: "Sprint Planning",
        start: new Date(2024, 11, 20, 10, 0),
        end: new Date(2024, 11, 20, 11, 30),
        type: "sprint",
        description: "Planejamento do próximo sprint"
      },
      {
        id: "2", 
        title: "Code Review",
        start: new Date(2024, 11, 21, 14, 0),
        end: new Date(2024, 11, 21, 15, 0),
        type: "meeting",
        description: "Revisão de código do projeto e-commerce"
      },
      {
        id: "3",
        title: "Client Meeting",
        start: new Date(2024, 11, 22, 16, 0),
        end: new Date(2024, 11, 22, 17, 0),
        type: "meeting",
        description: "Reunião com cliente para feedback"
      },
      {
        id: "4",
        title: "Deploy Deadline",
        start: new Date(2024, 11, 25, 18, 0),
        end: new Date(2024, 11, 25, 18, 0),
        type: "deadline",
        description: "Deadline para deploy em produção"
      }
    ]
    setEvents(mockEvents)
  }, [])

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case "meeting":
        return "gradient-primary"
      case "deadline":
        return "gradient-accent"
      case "sprint":
        return "gradient-secondary"
      case "personal":
        return "gradient-info"
      default:
        return "gradient-primary"
    }
  }

  const getEventTypeBadge = (type: string) => {
    switch (type) {
      case "meeting":
        return "bg-blue-100 text-blue-800"
      case "deadline":
        return "bg-red-100 text-red-800"
      case "sprint":
        return "bg-orange-100 text-orange-800"
      case "personal":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    })
  }

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    const days = []
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null)
    }
    
    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day))
    }
    
    return days
  }

  const getEventsForDate = (date: Date | null) => {
    if (!date) return []
    return events.filter(event => 
      event.start.toDateString() === date.toDateString()
    )
  }

  const navigateMonth = (direction: "prev" | "next") => {
    setCurrentDate(prev => {
      const newDate = new Date(prev)
      if (direction === "prev") {
        newDate.setMonth(prev.getMonth() - 1)
      } else {
        newDate.setMonth(prev.getMonth() + 1)
      }
      return newDate
    })
  }

  const monthDays = getDaysInMonth(currentDate)
  const todayEvents = getEventsForDate(selectedDate || new Date())

  return (
    <div className="min-h-screen" style={{ background: 'var(--background)' }}>
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2" style={{ color: 'var(--foreground)' }}>
              Calendário
            </h1>
            <p className="text-lg" style={{ color: 'var(--foreground-secondary)' }}>
              Gerencie seus compromissos e deadlines
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Button
                variant={view === "month" ? "default" : "outline"}
                size="sm"
                onClick={() => setView("month")}
                className="rounded-xl"
              >
                Mês
              </Button>
              <Button
                variant={view === "week" ? "default" : "outline"}
                size="sm"
                onClick={() => setView("week")}
                className="rounded-xl"
              >
                Semana
              </Button>
              <Button
                variant={view === "day" ? "default" : "outline"}
                size="sm"
                onClick={() => setView("day")}
                className="rounded-xl"
              >
                Dia
              </Button>
            </div>
            <Button className="gradient-primary text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
              <Plus className="w-5 h-5 mr-2" />
              Novo Evento
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Calendar */}
          <div className="lg:col-span-3">
            <div className="modern-card p-6">
              {/* Calendar Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigateMonth("prev")}
                    className="rounded-xl"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <h2 className="text-2xl font-bold" style={{ color: 'var(--foreground)' }}>
                    {currentDate.toLocaleDateString('pt-BR', { 
                      month: 'long', 
                      year: 'numeric' 
                    })}
                  </h2>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigateMonth("next")}
                    className="rounded-xl"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
                <Button variant="outline" className="rounded-xl">
                  <Filter className="w-4 h-4 mr-2" />
                  Filtros
                </Button>
              </div>

              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-1">
                {/* Week days header */}
                {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(day => (
                  <div key={day} className="p-3 text-center font-semibold text-sm" style={{ color: 'var(--foreground-secondary)' }}>
                    {day}
                  </div>
                ))}
                
                {/* Calendar days */}
                {monthDays.map((day, index) => {
                  const dayEvents = day ? getEventsForDate(day) : []
                  const isToday = day && day.toDateString() === new Date().toDateString()
                  const isSelected = day && selectedDate && day.toDateString() === selectedDate.toDateString()
                  
                  return (
                    <div
                      key={index}
                      className={`min-h-[100px] p-2 border cursor-pointer transition-all duration-200 ${
                        day 
                          ? `hover:bg-gray-50 dark:hover:bg-gray-800 ${
                              isSelected ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-300' : ''
                            } ${
                              isToday ? 'ring-2 ring-blue-500' : ''
                            }`
                          : 'bg-gray-50 dark:bg-gray-800'
                      }`}
                      style={{ borderColor: 'var(--border)' }}
                      onClick={() => day && setSelectedDate(day)}
                    >
                      {day && (
                        <>
                          <div className={`text-sm font-medium mb-1 ${
                            isToday ? 'text-blue-600 font-bold' : ''
                          }`} style={{ color: day ? 'var(--foreground)' : 'var(--foreground-secondary)' }}>
                            {day.getDate()}
                          </div>
                          <div className="space-y-1">
                            {dayEvents.slice(0, 2).map(event => (
                              <div
                                key={event.id}
                                className="text-xs p-1 rounded text-white truncate"
                                style={{ background: `var(--${getEventTypeColor(event.type).replace('gradient-', '')}gradient-start)` }}
                              >
                                {event.title}
                              </div>
                            ))}
                            {dayEvents.length > 2 && (
                              <div className="text-xs text-gray-500">
                                +{dayEvents.length - 2} mais
                              </div>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Today's Events */}
            <div className="modern-card p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 gradient-info rounded-xl">
                  <Calendar className="h-5 w-5 text-white" />
                </div>
                <h3 className="text-lg font-bold" style={{ color: 'var(--foreground)' }}>
                  {selectedDate ? formatDate(selectedDate) : 'Hoje'}
                </h3>
              </div>
              
              {todayEvents.length === 0 ? (
                <p className="text-sm text-center py-4" style={{ color: 'var(--foreground-secondary)' }}>
                  Nenhum evento agendado
                </p>
              ) : (
                <div className="space-y-3">
                  {todayEvents.map(event => (
                    <div key={event.id} className="p-3 border rounded-xl" style={{ borderColor: 'var(--border)' }}>
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-semibold text-sm" style={{ color: 'var(--foreground)' }}>
                          {event.title}
                        </h4>
                        <Badge className={`text-xs ${getEventTypeBadge(event.type)}`}>
                          {event.type}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 text-xs mb-2" style={{ color: 'var(--foreground-secondary)' }}>
                        <Clock className="h-3 w-3" />
                        {formatTime(event.start)} - {formatTime(event.end)}
                      </div>
                      {event.description && (
                        <p className="text-xs" style={{ color: 'var(--foreground-secondary)' }}>
                          {event.description}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="modern-card p-6">
              <h3 className="text-lg font-bold mb-4" style={{ color: 'var(--foreground)' }}>
                Ações Rápidas
              </h3>
              <div className="space-y-3">
                <Button variant="outline" className="w-full rounded-xl justify-start">
                  <Plus className="w-4 h-4 mr-2" />
                  Agendar Reunião
                </Button>
                <Button variant="outline" className="w-full rounded-xl justify-start">
                  <Calendar className="w-4 h-4 mr-2" />
                  Bloco de Desenvolvimento
                </Button>
                <Button variant="outline" className="w-full rounded-xl justify-start">
                  <Clock className="w-4 h-4 mr-2" />
                  Definir Deadline
                </Button>
              </div>
            </div>

            {/* Event Types Legend */}
            <div className="modern-card p-6">
              <h3 className="text-lg font-bold mb-4" style={{ color: 'var(--foreground)' }}>
                Tipos de Evento
              </h3>
              <div className="space-y-2">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 gradient-primary rounded-full"></div>
                  <span className="text-sm" style={{ color: 'var(--foreground-secondary)' }}>Reuniões</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 gradient-secondary rounded-full"></div>
                  <span className="text-sm" style={{ color: 'var(--foreground-secondary)' }}>Sprints</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 gradient-accent rounded-full"></div>
                  <span className="text-sm" style={{ color: 'var(--foreground-secondary)' }}>Deadlines</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 gradient-info rounded-full"></div>
                  <span className="text-sm" style={{ color: 'var(--foreground-secondary)' }}>Pessoal</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
