import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { GitHubClient } from "@/lib/github"
import { prisma } from "@/lib/prisma"

export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get user's GitHub access token from the session
    const account = await prisma.account.findFirst({
      where: {
        userId: session.user.id,
        provider: "github"
      }
    })

    if (!account?.access_token) {
      return NextResponse.json({ error: "GitHub not connected" }, { status: 400 })
    }

    // Initialize GitHub client with user's token
    const github = new GitHubClient(account.access_token)
    
    // Get user's repositories from GitHub
    const repos = await github.getUserRepositories()
    
    // Get existing projects from database
    const existingProjects = await prisma.project.findMany({
      where: { userId: session.user.id }
    })

    // Transform GitHub repos into project format
    const projects = repos.map((repo: any) => {
      const existingProject = existingProjects.find(p => p.githubRepo === repo.html_url)
      
      // Determine stack based on repo topics or description
      let stack = "firebase" // default
      if (repo.topics?.includes("supabase") || repo.description?.toLowerCase().includes("supabase")) {
        stack = "supabase"
      }

      // Determine status based on repo activity
      let status = "planning"
      if (repo.pushed_at) {
        const lastPush = new Date(repo.pushed_at)
        const daysSinceLastPush = (Date.now() - lastPush.getTime()) / (1000 * 60 * 60 * 24)
        
        if (daysSinceLastPush < 7) {
          status = "development"
        } else if (repo.homepage) {
          status = "deployed"
        }
      }

      return {
        id: existingProject?.id || repo.id.toString(),
        name: repo.name,
        slug: repo.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        description: repo.description || "Projeto sem descrição",
        githubRepo: repo.html_url,
        stack,
        status,
        createdAt: repo.created_at,
        updatedAt: repo.updated_at,
        lastPush: repo.pushed_at,
        stars: repo.stargazers_count,
        language: repo.language,
        isPrivate: repo.private,
        homepage: repo.homepage,
        // Calculate progress based on commits, issues, etc.
        progress: existingProject ? 
          Math.min(100, Math.max(0, Math.floor(Math.random() * 100))) : // TODO: Calculate real progress
          repo.size > 0 ? 25 : 5
      }
    })

    // Filter out forks and focus on original repos
    const originalProjects = projects.filter((project: any) => 
      !repos.find((r: any) => r.name === project.name)?.fork
    )

    // Sort by last activity
    originalProjects.sort((a: any, b: any) => 
      new Date(b.lastPush || b.updatedAt).getTime() - new Date(a.lastPush || a.updatedAt).getTime()
    )

    return NextResponse.json({ 
      projects: originalProjects,
      total: originalProjects.length 
    })

  } catch (error) {
    console.error("Error fetching projects:", error)
    return NextResponse.json(
      { error: "Failed to fetch projects" }, 
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
    const { name, slug, niche, stack, description } = body

    // Validate required fields
    if (!name || !slug) {
      return NextResponse.json(
        { error: "Name and slug are required" }, 
        { status: 400 }
      )
    }

    // Check if project already exists
    const existingProject = await prisma.project.findFirst({
      where: {
        OR: [
          { slug },
          { name }
        ],
        userId: session.user.id
      }
    })

    if (existingProject) {
      return NextResponse.json(
        { error: "Project with this name or slug already exists" }, 
        { status: 409 }
      )
    }

    // Create project in database
    const project = await prisma.project.create({
      data: {
        name,
        slug,
        description,
        stack: stack || "firebase",
        status: "planning",
        userId: session.user.id,
        ...(niche && { niche })
      }
    })

    return NextResponse.json({ project }, { status: 201 })

  } catch (error) {
    console.error("Error creating project:", error)
    return NextResponse.json(
      { error: "Failed to create project" }, 
      { status: 500 }
    )
  }
}
