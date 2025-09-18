"use client"

import { Button } from "@/components/ui/button"
import { Calendar, Clock, Plus } from "lucide-react"
import { useState, useEffect } from "react"

interface CalendarEvent {
  id: string
  summary: string
  start: {
    dateTime?: string
    date?: string
  }
  end: {
    dateTime?: string
    date?: string
  }
}

export function CalendarWidget() {
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Mock data for now - will be replaced with real Google Calendar API
    const mockEvents: CalendarEvent[] = [
      {
        id: "1",
        summary: "Sprint Planning",
        start: { dateTime: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString() },
        end: { dateTime: new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString() }
      },
      {
        id: "2", 
        summary: "Code Review",
        start: { dateTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() },
        end: { dateTime: new Date(Date.now() + 25 * 60 * 60 * 1000).toISOString() }
      },
      {
        id: "3",
        summary: "Client Meeting", 
        start: { dateTime: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString() },
        end: { dateTime: new Date(Date.now() + 49 * 60 * 60 * 1000).toISOString() }
      }
    ]
    
    setTimeout(() => {
      setEvents(mockEvents)
      setLoading(false)
    }, 1000)
  }, [])

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    if (date.toDateString() === today.toDateString()) {
      return "Hoje"
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return "Amanhã"
    } else {
      return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit'
      })
    }
  }

  return (
    <div className="modern-card p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 gradient-info rounded-xl">
          <Calendar className="h-5 w-5 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-bold" style={{ color: 'var(--foreground)' }}>
            Próximos Eventos
          </h3>
          <p className="text-sm" style={{ color: 'var(--foreground-secondary)' }}>
            Seus compromissos agendados
          </p>
        </div>
      </div>
      
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded-lg w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded-lg w-1/2"></div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {events.length === 0 ? (
            <p className="text-sm text-center py-6" style={{ color: 'var(--foreground-secondary)' }}>
              Nenhum evento próximo
            </p>
          ) : (
            events.map((event) => (
              <div key={event.id} className="flex items-start space-x-4 p-4 border rounded-xl hover:shadow-sm transition-all duration-300" style={{ borderColor: 'var(--border)' }}>
                <div className="w-3 h-3 gradient-info rounded-full mt-1.5"></div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate mb-1" style={{ color: 'var(--foreground)' }}>
                    {event.summary}
                  </p>
                  <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--foreground-secondary)' }}>
                    <Clock className="h-3 w-3" />
                    {event.start.dateTime && (
                      <>
                        {formatDate(event.start.dateTime)} às {formatTime(event.start.dateTime)}
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
          
          <Button variant="outline" size="sm" className="w-full rounded-xl mt-4 border-dashed">
            <Plus className="h-4 w-4 mr-2" />
            Agendar Bloco
          </Button>
        </div>
      )}
    </div>
  )
}
