import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { google } from "googleapis"

export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const range = searchParams.get('range') || 'week'

    // Get user's Google account for calendar access
    const account = await prisma.account.findFirst({
      where: {
        userId: session.user.id,
        provider: "google"
      }
    })

    if (!account?.access_token) {
      return NextResponse.json(
        { error: "Google Calendar not connected" }, 
        { status: 400 }
      )
    }

    // Configure Google Calendar API
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    )

    oauth2Client.setCredentials({
      access_token: account.access_token,
      refresh_token: account.refresh_token,
    })

    const calendar = google.calendar({ version: 'v3', auth: oauth2Client })

    // Calculate date range
    const now = new Date()
    const timeMin = new Date(now)
    const timeMax = new Date(now)

    switch (range) {
      case 'day':
        timeMax.setDate(timeMax.getDate() + 1)
        break
      case 'week':
        timeMax.setDate(timeMax.getDate() + 7)
        break
      case 'month':
        timeMax.setMonth(timeMax.getMonth() + 1)
        break
      default:
        timeMax.setDate(timeMax.getDate() + 7)
    }

    // Fetch events from Google Calendar
    const response = await calendar.events.list({
      calendarId: 'primary',
      timeMin: timeMin.toISOString(),
      timeMax: timeMax.toISOString(),
      maxResults: 50,
      singleEvents: true,
      orderBy: 'startTime',
    })

    const events = response.data.items || []

    // Transform events to our format
    const transformedEvents = events.map(event => ({
      id: event.id,
      title: event.summary || 'Sem título',
      description: event.description || null,
      start: event.start?.dateTime || event.start?.date,
      end: event.end?.dateTime || event.end?.date,
      allDay: !event.start?.dateTime, // If no time, it's all day
      location: event.location || null,
      attendees: event.attendees?.map(attendee => ({
        email: attendee.email,
        name: attendee.displayName,
        status: attendee.responseStatus
      })) || [],
      creator: {
        email: event.creator?.email,
        name: event.creator?.displayName
      },
      htmlLink: event.htmlLink,
      status: event.status,
      created: event.created,
      updated: event.updated
    }))

    // Categorize events
    const upcomingEvents = transformedEvents.filter(event => {
      if (!event.start) return false
      const eventStart = new Date(event.start)
      return eventStart > now
    })

    const todayEvents = transformedEvents.filter(event => {
      if (!event.start) return false
      const eventStart = new Date(event.start)
      const today = new Date()
      return eventStart.toDateString() === today.toDateString()
    })

    // Calculate some stats
    const totalEvents = transformedEvents.length
    const busyDays = new Set(
      transformedEvents
        .filter(event => event.start)
        .map(event => new Date(event.start!).toDateString())
    ).size

    return NextResponse.json({
      events: transformedEvents,
      upcoming: upcomingEvents.slice(0, 10), // Next 10 events
      today: todayEvents,
      stats: {
        total: totalEvents,
        upcoming: upcomingEvents.length,
        today: todayEvents.length,
        busyDays,
        range
      }
    })

  } catch (error) {
    console.error("Error fetching calendar events:", error)
    
    // Handle specific Google API errors
    if (error && typeof error === 'object' && 'code' in error) {
      if (error.code === 401) {
        return NextResponse.json(
          { error: "Google Calendar access expired. Please reconnect." }, 
          { status: 401 }
        )
      }

      if (error.code === 403) {
        return NextResponse.json(
          { error: "Google Calendar access denied. Check permissions." }, 
          { status: 403 }
        )
      }
    }

    return NextResponse.json(
      { error: "Failed to fetch calendar events" }, 
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { 
      title, 
      description, 
      start, 
      end, 
      location,
      attendees = []
    } = body

    // Validate required fields
    if (!title || !start || !end) {
      return NextResponse.json(
        { error: "Missing required fields: title, start, end" }, 
        { status: 400 }
      )
    }

    // Get user's Google account
    const account = await prisma.account.findFirst({
      where: {
        userId: session.user.id,
        provider: "google"
      }
    })

    if (!account?.access_token) {
      return NextResponse.json(
        { error: "Google Calendar not connected" }, 
        { status: 400 }
      )
    }

    // Configure Google Calendar API
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    )

    oauth2Client.setCredentials({
      access_token: account.access_token,
      refresh_token: account.refresh_token,
    })

    const calendar = google.calendar({ version: 'v3', auth: oauth2Client })

    // Create event
    const event = {
      summary: title,
      description,
      location,
      start: {
        dateTime: start,
        timeZone: 'America/Sao_Paulo',
      },
      end: {
        dateTime: end,
        timeZone: 'America/Sao_Paulo',
      },
      attendees: attendees.map((email: string) => ({ email })),
      reminders: {
        useDefault: false,
        overrides: [
          { method: 'email', minutes: 24 * 60 }, // 1 day before
          { method: 'popup', minutes: 30 }, // 30 minutes before
        ],
      },
    }

    const response = await calendar.events.insert({
      calendarId: 'primary',
      requestBody: event,
    })

    return NextResponse.json({
      event: {
        id: response.data.id,
        title: response.data.summary,
        start: response.data.start?.dateTime,
        end: response.data.end?.dateTime,
        htmlLink: response.data.htmlLink
      }
    }, { status: 201 })

  } catch (error) {
    console.error("Error creating calendar event:", error)
    return NextResponse.json(
      { error: "Failed to create calendar event" }, 
      { status: 500 }
    )
  }
}
