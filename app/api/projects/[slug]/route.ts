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

    // Get project from database
    const project = await prisma.project.findFirst({
      where: { 
        slug,
        userId: session.user.id
      },
      include: {
        tasks: {
          orderBy: { createdAt: 'desc' }
        },
        checklists: true,
        financeRecords: true
      }
    })

    if (!project) {
      return NextResponse.json(
        { error: "Project not found" }, 
        { status: 404 }
      )
    }

    return NextResponse.json({ project })

  } catch (error) {
    console.error("Error fetching project:", error)
    return NextResponse.json(
      { error: "Failed to fetch project" }, 
      { status: 500 }
    )
  }
}

export async function PATCH(
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
    const { status, name, description, niche, stack } = body

    // Find the project
    const existingProject = await prisma.project.findFirst({
      where: { 
        slug,
        userId: session.user.id
      }
    })

    if (!existingProject) {
      return NextResponse.json(
        { error: "Project not found" }, 
        { status: 404 }
      )
    }

    // Validate status if provided
    const validStatuses = ['planning', 'development', 'testing', 'deployed', 'paused', 'archived']
    if (status && !validStatuses.includes(status)) {
      return NextResponse.json(
        { error: "Invalid status. Must be one of: " + validStatuses.join(', ') }, 
        { status: 400 }
      )
    }

    // Update project
    const updatedProject = await prisma.project.update({
      where: { id: existingProject.id },
      data: {
        ...(status && { status }),
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(niche !== undefined && { niche }),
        ...(stack && { stack }),
        updatedAt: new Date()
      }
    })

    return NextResponse.json({ project: updatedProject })

  } catch (error) {
    console.error("Error updating project:", error)
    return NextResponse.json(
      { error: "Failed to update project" }, 
      { status: 500 }
    )
  }
}

export async function DELETE(
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
    const existingProject = await prisma.project.findFirst({
      where: { 
        slug,
        userId: session.user.id
      }
    })

    if (!existingProject) {
      return NextResponse.json(
        { error: "Project not found" }, 
        { status: 404 }
      )
    }

    // Delete project (this will cascade delete related tasks, checklists, etc.)
    await prisma.project.delete({
      where: { id: existingProject.id }
    })

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error("Error deleting project:", error)
    return NextResponse.json(
      { error: "Failed to delete project" }, 
      { status: 500 }
    )
  }
}
