"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
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
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Próximos Eventos
        </CardTitle>
        <CardDescription>
          Seus compromissos agendados
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {events.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                Nenhum evento próximo
              </p>
            ) : (
              events.map((event) => (
                <div key={event.id} className="flex items-start space-x-3 p-3 border rounded-lg">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {event.summary}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
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
            
            <Button variant="outline" size="sm" className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              Agendar Bloco
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
