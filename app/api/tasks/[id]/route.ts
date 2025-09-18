import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const body = await req.json()
    const { status } = body

    // Validate status
    if (!status || !['todo', 'doing', 'done'].includes(status)) {
      return NextResponse.json(
        { error: "Invalid status. Must be 'todo', 'doing', or 'done'" }, 
        { status: 400 }
      )
    }

    // Check if task exists and belongs to user
    const existingTask = await prisma.task.findFirst({
      where: { 
        id,
        userId: session.user.id
      },
      include: {
        project: true
      }
    })

    if (!existingTask) {
      return NextResponse.json(
        { error: "Task not found" }, 
        { status: 404 }
      )
    }

    // Update task status
    const updatedTask = await prisma.task.update({
      where: { id },
      data: { 
        status,
        updatedAt: new Date()
      },
      include: {
        project: true
      }
    })

    return NextResponse.json({ task: updatedTask })

  } catch (error) {
    console.error("Error updating task:", error)
    return NextResponse.json(
      { error: "Failed to update task" }, 
      { status: 500 }
    )
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params

    // Get task
    const task = await prisma.task.findFirst({
      where: { 
        id,
        userId: session.user.id
      },
      include: {
        project: true
      }
    })

    if (!task) {
      return NextResponse.json(
        { error: "Task not found" }, 
        { status: 404 }
      )
    }

    return NextResponse.json({ task })

  } catch (error) {
    console.error("Error fetching task:", error)
    return NextResponse.json(
      { error: "Failed to fetch task" }, 
      { status: 500 }
    )
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params

    // Check if task exists and belongs to user
    const existingTask = await prisma.task.findFirst({
      where: { 
        id,
        userId: session.user.id
      }
    })

    if (!existingTask) {
      return NextResponse.json(
        { error: "Task not found" }, 
        { status: 404 }
      )
    }

    // Delete task
    await prisma.task.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error("Error deleting task:", error)
    return NextResponse.json(
      { error: "Failed to delete task" }, 
      { status: 500 }
    )
  }
}
