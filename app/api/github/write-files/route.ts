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
    const { fullName, files } = body

    if (!fullName || !files || !Array.isArray(files)) {
      return NextResponse.json(
        { error: "Repository fullName and files array are required" }, 
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
    
    // Extract repo name from fullName (e.g., "owner/repo" -> "repo")
    const repoName = fullName.split('/')[1]
    
    // Write multiple files to the repository
    const results = await github.writeMultipleFiles(repoName, files)
    
    return NextResponse.json({ results })

  } catch (error) {
    console.error("Error writing files:", error)
    return NextResponse.json(
      { error: "Failed to write files to repository" }, 
      { status: 500 }
    )
  }
}
