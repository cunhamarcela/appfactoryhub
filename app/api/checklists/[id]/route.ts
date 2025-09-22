import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const body = await req.json()
    const { items } = body

    if (!items || !Array.isArray(items)) {
      return NextResponse.json(
        { error: "Items array is required" }, 
        { status: 400 }
      )
    }

    // Find the checklist and verify ownership through project
    const checklist = await prisma.checklist.findFirst({
      where: { 
        id,
        project: {
          userId: session.user.id
        }
      },
      include: {
        project: true
      }
    })

    if (!checklist) {
      return NextResponse.json(
        { error: "Checklist not found" }, 
        { status: 404 }
      )
    }

    // Calculate progress
    const completedItems = items.filter((item: { done: boolean }) => item.done).length
    const progress = Math.round((completedItems / items.length) * 100)

    // Update checklist with new items and progress
    const updatedChecklist = await prisma.checklist.update({
      where: { id },
      data: { 
        items: items,
        progress: progress,
        updatedAt: new Date()
      }
    })

    return NextResponse.json({ checklist: updatedChecklist })

  } catch (error) {
    console.error("Error updating checklist:", error)
    return NextResponse.json(
      { error: "Failed to update checklist" }, 
      { status: 500 }
    )
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const body = await req.json()
    const { action } = body

    if (action !== 'reset') {
      return NextResponse.json(
        { error: "Invalid action. Only 'reset' is supported" }, 
        { status: 400 }
      )
    }

    // Find the checklist and verify ownership
    const checklist = await prisma.checklist.findFirst({
      where: { 
        id,
        project: {
          userId: session.user.id
        }
      }
    })

    if (!checklist) {
      return NextResponse.json(
        { error: "Checklist not found" }, 
        { status: 404 }
      )
    }

    // Reset all items to not done
    const items = Array.isArray(checklist.items) ? checklist.items : []
    const resetItems = items.map((item) => {
      if (typeof item === 'object' && item !== null) {
        return { ...item, done: false }
      }
      return item
    })

    // Update checklist with reset items
    const updatedChecklist = await prisma.checklist.update({
      where: { id },
      data: { 
        items: resetItems,
        progress: 0,
        updatedAt: new Date()
      }
    })

    return NextResponse.json({ checklist: updatedChecklist })

  } catch (error) {
    console.error("Error resetting checklist:", error)
    return NextResponse.json(
      { error: "Failed to reset checklist" }, 
      { status: 500 }
    )
  }
}
