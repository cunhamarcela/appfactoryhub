import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { GitHubClient } from "@/lib/github"

export async function POST(
  req: NextRequest, 
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const session = await auth()
    
    if (!session?.user?.email || !session.user.id) {
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

    if (!project.repoFullName) {
      return NextResponse.json(
        { error: "Project does not have a GitHub repository" }, 
        { status: 400 }
      )
    }

    // Parse owner and repo from repoFullName
    const [owner, repo] = project.repoFullName.split('/')
    
    if (!owner || !repo) {
      return NextResponse.json(
        { error: "Invalid repository format" }, 
        { status: 400 }
      )
    }

    // Initialize GitHub client
    const github = new GitHubClient()

    // Get repository information
    const [repoInfo, detectedStack, languages] = await Promise.all([
      github.getRepository(owner, repo),
      github.detectTechStack(owner, repo),
      github.getRepositoryLanguages(owner, repo)
    ])

    // Update project with detected information
    const updatedProject = await prisma.project.update({
      where: { id: project.id },
      data: {
        stack: detectedStack,
        description: repoInfo.description || project.description,
        updatedAt: new Date()
      }
    })

    return NextResponse.json({
      success: true,
      project: updatedProject,
      detectedStack,
      languages,
      repoInfo: {
        description: repoInfo.description,
        language: repoInfo.language,
        stargazers_count: repoInfo.stargazers_count,
        forks_count: repoInfo.forks_count,
        updated_at: repoInfo.updated_at
      }
    })

  } catch (error) {
    console.error("Error syncing project with GitHub:", error)
    return NextResponse.json(
      { error: "Failed to sync project with GitHub" }, 
      { status: 500 }
    )
  }
}
