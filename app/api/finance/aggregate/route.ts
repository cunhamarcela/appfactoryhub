import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get all finance records for the user
    const records = await prisma.financeRecord.findMany({
      where: { 
        ownerId: session.user.id
      },
      include: {
        project: true
      }
    })

    // Calculate total monthly costs (only recurring records)
    const monthlyRecords = records.filter(record => record.recurring && record.period === 'monthly')
    const totalMonthly = monthlyRecords.reduce((sum, record) => sum + record.amount, 0)

    // Group by provider
    const byProvider: Record<string, number> = {}
    monthlyRecords.forEach(record => {
      if (!byProvider[record.provider]) {
        byProvider[record.provider] = 0
      }
      byProvider[record.provider] += record.amount
    })

    // Calculate per-project costs
    const projectCosts: Record<string, { total: number, userCost?: number }> = {}
    
    records.forEach(record => {
      if (record.project) {
        const projectSlug = record.project.slug
        if (!projectCosts[projectSlug]) {
          projectCosts[projectSlug] = { total: 0 }
        }
        
        if (record.recurring && record.period === 'monthly') {
          projectCosts[projectSlug].total += record.amount
        }
        
        // Calculate user cost if available
        if (record.category === 'user_cost' && record.userIdExternal) {
          // This would typically come from your app's user analytics
          // For now, we'll use a mock calculation
          const estimatedUsers = 100 // This should come from your analytics
          projectCosts[projectSlug].userCost = record.amount / estimatedUsers
        }
      }
    })

    // Calculate per-project user costs (simplified)
    const perProjectUserCost: Record<string, number> = {}
    Object.entries(projectCosts).forEach(([slug, costs]) => {
      if (costs.userCost) {
        perProjectUserCost[slug] = costs.userCost
      } else {
        // Estimate based on total costs and assumed user base
        const estimatedUsers = 100 // This should come from your analytics
        perProjectUserCost[slug] = costs.total / estimatedUsers
      }
    })

    // Get category breakdown
    const byCategory: Record<string, number> = {}
    monthlyRecords.forEach(record => {
      if (!byCategory[record.category]) {
        byCategory[record.category] = 0
      }
      byCategory[record.category] += record.amount
    })

    // Get recent records for activity feed
    const recentRecords = records
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 10)
      .map(record => ({
        id: record.id,
        description: record.description,
        amount: record.amount,
        currency: record.currency,
        provider: record.provider,
        category: record.category,
        projectName: record.project?.name,
        createdAt: record.createdAt
      }))

    const response = {
      total_monthly: totalMonthly,
      by_provider: byProvider,
      by_category: byCategory,
      per_project_user_cost: perProjectUserCost,
      project_totals: Object.fromEntries(
        Object.entries(projectCosts).map(([slug, costs]) => [slug, costs.total])
      ),
      recent_records: recentRecords,
      summary: {
        total_records: records.length,
        recurring_records: monthlyRecords.length,
        active_projects: Object.keys(projectCosts).length,
        top_provider: Object.entries(byProvider).sort((a, b) => b[1] - a[1])[0]?.[0] || null
      }
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error("Error aggregating finance data:", error)
    return NextResponse.json(
      { error: "Failed to aggregate finance data" }, 
      { status: 500 }
    )
  }
}
