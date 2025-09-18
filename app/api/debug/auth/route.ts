import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const session = await auth()
    
    if (!session) {
      return NextResponse.json({ 
        error: "No session found",
        authenticated: false 
      })
    }

    // Check if user exists in database
    const user = session.user?.email ? await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        accounts: {
          select: {
            provider: true,
            access_token: true,
            expires_at: true
          }
        }
      }
    }) : null

    // Check GitHub account specifically
    const githubAccount = session.user?.id ? await prisma.account.findFirst({
      where: {
        userId: session.user.id,
        provider: "github"
      }
    }) : null

    return NextResponse.json({
      authenticated: true,
      session: {
        user: session.user,
        expires: session.expires
      },
      userInDb: !!user,
      accounts: user?.accounts || [],
      githubAccount: githubAccount ? {
        hasToken: !!githubAccount.access_token,
        expiresAt: githubAccount.expires_at,
        isExpired: githubAccount.expires_at ? Date.now() > githubAccount.expires_at * 1000 : false
      } : null
    })

  } catch (error) {
    console.error("Debug auth error:", error)
    return NextResponse.json({
      error: "Debug failed",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 })
  }
}
