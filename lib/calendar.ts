import { google } from 'googleapis'

export class CalendarClient {
  private auth: any

  constructor(accessToken: string) {
    this.auth = new google.auth.OAuth2()
    this.auth.setCredentials({ access_token: accessToken })
  }

  async getUpcomingEvents(maxResults = 10) {
    const calendar = google.calendar({ version: 'v3', auth: this.auth })
    
    try {
      const response = await calendar.events.list({
        calendarId: 'primary',
        timeMin: new Date().toISOString(),
        maxResults,
        singleEvents: true,
        orderBy: 'startTime',
      })

      return response.data.items || []
    } catch (error) {
      console.error('Error fetching calendar events:', error)
      return []
    }
  }

  async createEvent(summary: string, description: string, startTime: Date, endTime: Date) {
    const calendar = google.calendar({ version: 'v3', auth: this.auth })
    
    try {
      const response = await calendar.events.insert({
        calendarId: 'primary',
        requestBody: {
          summary,
          description,
          start: {
            dateTime: startTime.toISOString(),
            timeZone: 'America/Sao_Paulo',
          },
          end: {
            dateTime: endTime.toISOString(),
            timeZone: 'America/Sao_Paulo',
          },
        },
      })

      return response.data
    } catch (error) {
      console.error('Error creating calendar event:', error)
      throw error
    }
  }
}
