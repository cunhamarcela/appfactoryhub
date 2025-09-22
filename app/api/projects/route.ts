import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { GitHubClient } from "@/lib/github"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    console.log('Projects API: Starting request processing...')
    const session = await auth()
    console.log('Projects API: Session retrieved:', session ? 'Session exists' : 'No session')
    
    if (!session?.user?.email || !session?.user?.id) {
      console.log('Projects API: No session, email, or user ID, returning 401')
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    console.log('Projects API: Session valid, extracting access token from session...')
    // For Auth.js v5, we need to get the token differently
    // The accessToken should be available in the session or we need to get it from the database
    
    // First, let's try to get the user from database to find their account
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        accounts: {
          where: { provider: 'github' }
        }
      }
    })
    
    console.log('Projects API: User found:', user ? 'Yes' : 'No')
    console.log('Projects API: GitHub accounts:', user?.accounts?.length || 0)
    
    const githubAccount = user?.accounts?.find(account => account.provider === 'github')
    const accessToken = githubAccount?.access_token
    
    console.log('Projects API: Access token from database:', accessToken ? 'Access token present' : 'No access token')
    
    if (!accessToken) {
      console.log('Projects API: No access token, returning 400')
      return NextResponse.json({ error: "GitHub not connected" }, { status: 400 })
    }

    // Initialize GitHub client with user's token
    console.log('Projects API: Initializing GitHub client with token:', accessToken ? 'Token present' : 'No token')
    const github = new GitHubClient(accessToken)
    
    // Get user's repositories from GitHub (authenticated user's repos)
    console.log('Projects API: Fetching repositories from GitHub...')
    const startTime = Date.now()
    const repos = await github.getUserRepositories()
    const endTime = Date.now()
    console.log(`Projects API: GitHub repositories fetched successfully in ${endTime - startTime}ms. Found ${repos.length} repositories.`)
    
    // Get existing projects from database
    const existingProjects = await prisma.project.findMany({
      where: { userId: session.user.id }
    })

    // Define interfaces
    interface GitHubRepo {
      id: number
      name: string
      html_url: string
      description: string | null
      topics?: string[]
      pushed_at: string
      created_at: string
      updated_at: string
      stargazers_count: number
      language: string | null
      private: boolean
      homepage: string | null
      size: number
      fork: boolean
    }

    interface ProjectData {
      id: string
      name: string
      slug: string
      description: string
      githubRepo: string
      stack: string
      status: string
      createdAt: string
      updatedAt: string
      lastPush: string
      stars: number
      language: string | null
      isPrivate: boolean
      homepage: string | null
      progress: number
    }

    // Transform GitHub repos into project format and sync with database
    const projects: ProjectData[] = []
    
    for (const repo of repos) {
      let existingProject = existingProjects.find(p => p.githubRepo === repo.html_url)
      
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

      const slug = repo.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')
      
      // If project doesn't exist in database, create it
      if (!existingProject) {
        try {
          existingProject = await prisma.project.create({
            data: {
              name: repo.name,
              slug,
              description: repo.description || "Projeto importado do GitHub",
              stack,
              status,
              userId: session.user.id,
              githubRepo: repo.html_url,
              repoUrl: repo.html_url
            }
          })
        } catch (error) {
          console.error(`Error creating project for repo ${repo.name}:`, error)
          // If creation fails (e.g., duplicate slug), try to find existing by slug
          const foundProject = await prisma.project.findFirst({
            where: { 
              slug,
              userId: session.user.id 
            }
          })
          existingProject = foundProject || undefined
        }
      } else {
        // Update existing project with latest GitHub data
        try {
          existingProject = await prisma.project.update({
            where: { id: existingProject.id },
            data: {
              description: repo.description || existingProject.description,
              status,
              githubRepo: repo.html_url,
              repoUrl: repo.html_url
            }
          })
        } catch (error) {
          console.error(`Error updating project ${existingProject.id}:`, error)
        }
      }

      if (existingProject) {
        projects.push({
          id: existingProject.id,
          name: repo.name,
          slug: existingProject.slug,
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
          progress: repo.size > 0 ? 25 : 5
        })
      }
    }

    // Filter out forks and focus on original repos
    const originalProjects = projects.filter((project: ProjectData) => 
      !repos.find((r: GitHubRepo) => r.name === project.name)?.fork
    )

    // Sort by last activity
    originalProjects.sort((a, b) => 
      new Date(b.lastPush || b.updatedAt).getTime() - new Date(a.lastPush || a.updatedAt).getTime()
    )

    return NextResponse.json({ 
      projects: originalProjects,
      total: originalProjects.length 
    })

  } catch (error) {
    console.error("Error fetching projects:", error)
    
    // Provide more specific error messages
    let errorMessage = "Failed to fetch projects"
    let statusCode = 500
    
    if (error instanceof Error) {
      if (error.message.includes("GitHub not connected")) {
        errorMessage = "GitHub account not connected. Please connect your GitHub account in settings."
        statusCode = 400
      } else if (error.message.includes("Unauthorized") || error.message.includes("401")) {
        errorMessage = "GitHub authorization expired. Please reconnect your GitHub account."
        statusCode = 401
      } else if (error.message.includes("403")) {
        errorMessage = "GitHub API rate limit exceeded. Please try again later."
        statusCode = 429
      } else if (error.message.includes("Failed to fetch repositories")) {
        errorMessage = `GitHub API error: ${error.message}`
        statusCode = 502
      }
    }
    
    return NextResponse.json(
      { 
        error: errorMessage,
        details: error instanceof Error ? error.message : "Unknown error"
      }, 
      { status: statusCode }
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
