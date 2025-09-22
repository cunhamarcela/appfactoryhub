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

    // Get all checklists for this project
    const checklists = await prisma.checklist.findMany({
      where: { 
        projectId: project.id
      },
      orderBy: { createdAt: 'asc' }
    })

    return NextResponse.json({ 
      checklists,
      project: {
        id: project.id,
        name: project.name,
        slug: project.slug
      }
    })

  } catch (error) {
    console.error("Error fetching project checklists:", error)
    return NextResponse.json(
      { error: "Failed to fetch checklists" }, 
      { status: 500 }
    )
  }
}
