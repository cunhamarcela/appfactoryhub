"use client"

import { Button } from "@/components/ui/button"
import { Copy } from "lucide-react"

interface CopyEnvButtonProps {
  envVars: string[]
}

export function CopyEnvButton({ envVars }: CopyEnvButtonProps) {
  const handleCopy = () => {
    navigator.clipboard.writeText(envVars.join('\n'))
  }

  return (
    <Button 
      variant="outline" 
      size="sm"
      className="rounded-lg"
      onClick={handleCopy}
    >
      <Copy className="w-4 h-4 mr-2" />
      Copiar
    </Button>
  )
}
