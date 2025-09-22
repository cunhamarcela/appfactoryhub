import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import crypto from "crypto"

// Simple encryption for API keys (in production, use proper key management)
const ENCRYPTION_KEY = process.env.NEXTAUTH_SECRET || 'fallback-key-for-dev'

function encrypt(text: string): string {
  const cipher = crypto.createCipher('aes-256-cbc', ENCRYPTION_KEY)
  let encrypted = cipher.update(text, 'utf8', 'hex')
  encrypted += cipher.final('hex')
  return encrypted
}

function decrypt(encryptedText: string): string {
  const decipher = crypto.createDecipher('aes-256-cbc', ENCRYPTION_KEY)
  let decrypted = decipher.update(encryptedText, 'hex', 'utf8')
  decrypted += decipher.final('utf8')
  return decrypted
}

// GET - Retrieve user settings
export async function GET() {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const settings = await prisma.userSettings.findUnique({
      where: { userId: session.user.id }
    })

    // Return settings without exposing the actual API key
    return NextResponse.json({
      hasOpenaiKey: !!settings?.openaiApiKey,
      // Add other settings here as needed
    })

  } catch (error) {
    console.error("Error fetching user settings:", error)
    return NextResponse.json(
      { error: "Failed to fetch settings" }, 
      { status: 500 }
    )
  }
}

// POST - Save user settings
export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { openaiApiKey } = body

    if (!openaiApiKey || typeof openaiApiKey !== 'string') {
      return NextResponse.json(
        { error: "OpenAI API key is required" }, 
        { status: 400 }
      )
    }

    // Basic validation for OpenAI API key format
    if (!openaiApiKey.startsWith('sk-') || openaiApiKey.length < 20) {
      return NextResponse.json(
        { error: "Invalid OpenAI API key format" }, 
        { status: 400 }
      )
    }

    // Encrypt the API key before storing
    const encryptedKey = encrypt(openaiApiKey)

    // Upsert user settings
    await prisma.userSettings.upsert({
      where: { userId: session.user.id },
      update: { 
        openaiApiKey: encryptedKey,
        updatedAt: new Date()
      },
      create: {
        userId: session.user.id,
        openaiApiKey: encryptedKey
      }
    })

    return NextResponse.json({
      success: true,
      hasOpenaiKey: true
    })

  } catch (error) {
    console.error("Error saving user settings:", error)
    return NextResponse.json(
      { error: "Failed to save settings" }, 
      { status: 500 }
    )
  }
}

// DELETE - Remove OpenAI API key
export async function DELETE() {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await prisma.userSettings.upsert({
      where: { userId: session.user.id },
      update: { 
        openaiApiKey: null,
        updatedAt: new Date()
      },
      create: {
        userId: session.user.id,
        openaiApiKey: null
      }
    })

    return NextResponse.json({
      success: true,
      hasOpenaiKey: false
    })

  } catch (error) {
    console.error("Error removing OpenAI key:", error)
    return NextResponse.json(
      { error: "Failed to remove API key" }, 
      { status: 500 }
    )
  }
}

// Helper function to get decrypted OpenAI key for internal use
export async function getUserOpenAIKey(userId: string): Promise<string | null> {
  try {
    const settings = await prisma.userSettings.findUnique({
      where: { userId }
    })

    if (!settings?.openaiApiKey) {
      return null
    }

    return decrypt(settings.openaiApiKey)
  } catch (error) {
    console.error("Error decrypting OpenAI key:", error)
    return null
  }
}
