import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { GitHubClient } from "@/lib/github"
import { prisma } from "@/lib/prisma"

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { name, description } = body

    if (!name) {
      return NextResponse.json(
        { error: "Repository name is required" }, 
        { status: 400 }
      )
    }

    // Get user's GitHub access token
    const account = await prisma.account.findFirst({
      where: {
        userId: session.user.id,
        provider: "github"
      }
    })

    if (!account?.access_token) {
      return NextResponse.json(
        { error: "GitHub not connected" }, 
        { status: 400 }
      )
    }

    // Initialize GitHub client with user's token
    const github = new GitHubClient(account.access_token)
    
    // Create repository from template
    const repo = await github.createFromTemplate(name, description)
    
    return NextResponse.json({
      repoUrl: repo.html_url,
      fullName: repo.full_name,
      cloneUrl: repo.clone_url,
      sshUrl: repo.ssh_url
    })

  } catch (error) {
    console.error("Error creating repository:", error)
    
    // Handle specific GitHub API errors
    if (error.message.includes("422")) {
      return NextResponse.json(
        { error: "Repository name already exists or is invalid" }, 
        { status: 422 }
      )
    }
    
    return NextResponse.json(
      { error: "Failed to create repository" }, 
      { status: 500 }
    )
  }
}
