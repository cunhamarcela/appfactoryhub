import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { slug } = await params

    // Find the project
    const project = await prisma.project.findFirst({
      where: { 
        slug,
        userId: session.user.id
      }
    })

    if (!project) {
      return NextResponse.json(
        { error: "Project not found" }, 
        { status: 404 }
      )
    }

    // Get all tasks for this project
    const tasks = await prisma.task.findMany({
      where: { 
        projectId: project.id,
        userId: session.user.id
      },
      orderBy: [
        { sprint: 'asc' },
        { createdAt: 'asc' }
      ]
    })

    return NextResponse.json({ 
      tasks,
      project: {
        id: project.id,
        name: project.name,
        slug: project.slug
      }
    })

  } catch (error) {
    console.error("Error fetching project tasks:", error)
    return NextResponse.json(
      { error: "Failed to fetch tasks" }, 
      { status: 500 }
    )
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { slug } = await params
    const body = await req.json()
    const { title, description, sprint, priority, category } = body

    if (!title) {
      return NextResponse.json(
        { error: "Task title is required" }, 
        { status: 400 }
      )
    }

    // Find the project
    const project = await prisma.project.findFirst({
      where: { 
        slug,
        userId: session.user.id
      }
    })

    if (!project) {
      return NextResponse.json(
        { error: "Project not found" }, 
        { status: 404 }
      )
    }

    // Create new task
    const task = await prisma.task.create({
      data: {
        title,
        description: description || null,
        sprint: sprint || 'sprint0',
        priority: priority || 'medium',
        category: category || 'development',
        status: 'todo',
        projectId: project.id,
        userId: session.user.id
      }
    })

    return NextResponse.json({ task }, { status: 201 })

  } catch (error) {
    console.error("Error creating task:", error)
    return NextResponse.json(
      { error: "Failed to create task" }, 
      { status: 500 }
    )
  }
}
