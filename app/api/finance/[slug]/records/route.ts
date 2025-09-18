import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(
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

    // Get finance records for this project
    const records = await prisma.financeRecord.findMany({
      where: { 
        projectId: project.id
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({ records })

  } catch (error) {
    console.error("Error fetching finance records:", error)
    return NextResponse.json(
      { error: "Failed to fetch finance records" }, 
      { status: 500 }
    )
  }
}

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
    const body = await req.json()
    const { 
      category, 
      provider, 
      description, 
      amount, 
      currency = "BRL", 
      recurring = false, 
      period,
      userIdExternal 
    } = body

    // Validate required fields
    if (!category || !provider || !description || amount === undefined) {
      return NextResponse.json(
        { error: "Missing required fields: category, provider, description, amount" }, 
        { status: 400 }
      )
    }

    // Validate category
    const validCategories = ['infra', 'tool', 'subscription', 'user_cost']
    if (!validCategories.includes(category)) {
      return NextResponse.json(
        { error: `Invalid category. Must be one of: ${validCategories.join(', ')}` }, 
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

    // Create finance record
    const record = await prisma.financeRecord.create({
      data: {
        projectId: project.id,
        category,
        provider,
        description,
        amount: parseFloat(amount),
        currency,
        recurring,
        period,
        userIdExternal,
        ownerId: session.user.id
      }
    })

    return NextResponse.json({ record }, { status: 201 })

  } catch (error) {
    console.error("Error creating finance record:", error)
    return NextResponse.json(
      { error: "Failed to create finance record" }, 
      { status: 500 }
    )
  }
}
