import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import IntegrationsClient from "@/components/IntegrationsClient"

export default async function IntegrationsPage() {
  const session = await auth()

  if (!session?.user?.id) {
    redirect("/api/auth/signin")
  }

  // Check user settings for OpenAI key
  const userSettings = await prisma.userSettings.findUnique({
    where: { userId: session.user.id }
  })

  const hasOpenAIKey = !!userSettings?.openaiApiKey

  return <IntegrationsClient initialHasOpenAIKey={hasOpenAIKey} />
}
