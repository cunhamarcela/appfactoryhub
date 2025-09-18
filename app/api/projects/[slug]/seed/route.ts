import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import s0 from "@/seeds/tasks.sprint0.json"
import s1 from "@/seeds/tasks.sprint1.json"
import s2 from "@/seeds/tasks.sprint2.json"
import qa from "@/seeds/checklist.qa.json"
import growth from "@/seeds/checklist.growth.json"
import ux from "@/seeds/checklist.ux.json"

export async function POST(
  req: NextRequest, 
  { params }: { params: { slug: string } }
) {
  try {
    const session = await auth()
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { slug } = params

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

    // Check if project already has tasks/checklists
    const existingTasks = await prisma.task.count({
      where: { projectId: project.id }
    })

    const existingChecklists = await prisma.checklist.count({
      where: { projectId: project.id }
    })

    if (existingTasks > 0 || existingChecklists > 0) {
      return NextResponse.json(
        { error: "Project already has tasks or checklists" }, 
        { status: 409 }
      )
    }

    // Create tasks from seeds
    const allTasks = [...s0, ...s1, ...s2]
    const tasksData = allTasks.map(task => ({
      title: task.title,
      sprint: task.sprint.toLowerCase().replace(' ', ''), // "Sprint 0" -> "sprint0"
      status: "todo",
      projectId: project.id,
      userId: session.user.id
    }))

    await prisma.task.createMany({
      data: tasksData
    })

    // Create checklists from seeds
    const checklistsData = [
      {
        type: qa.type,
        title: qa.title,
        items: qa.items,
        projectId: project.id
      },
      {
        type: growth.type,
        title: growth.title,
        items: growth.items,
        projectId: project.id
      },
      {
        type: ux.type,
        title: ux.title,
        items: ux.items,
        projectId: project.id
      }
    ]

    await prisma.checklist.createMany({
      data: checklistsData
    })

    // Count created items
    const tasksCreated = tasksData.length
    const checklistsCreated = checklistsData.length

    return NextResponse.json({
      success: true,
      tasksCreated,
      checklistsCreated,
      message: `Created ${tasksCreated} tasks and ${checklistsCreated} checklists for project ${project.name}`
    })

  } catch (error) {
    console.error("Error seeding project:", error)
    return NextResponse.json(
      { error: "Failed to seed project" }, 
      { status: 500 }
    )
  }
}
