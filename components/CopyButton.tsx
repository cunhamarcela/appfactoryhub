"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Copy, Check } from "lucide-react"

interface CopyButtonProps {
  text: string
  variant?: "default" | "outline" | "ghost"
  size?: "sm" | "default" | "lg"
  className?: string
  children?: React.ReactNode
}

export function CopyButton({ 
  text, 
  variant = "outline", 
  size = "sm", 
  className = "",
  children 
}: CopyButtonProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Failed to copy text:', error)
    }
  }

  return (
    <Button
      variant={variant}
      size={size}
      className={`rounded-xl transition-all duration-200 ${className}`}
      onClick={handleCopy}
      disabled={copied}
    >
      {copied ? (
        <>
          <Check className="w-4 h-4 mr-2" />
          Copiado!
        </>
      ) : (
        <>
          <Copy className="w-4 h-4 mr-2" />
          {children || "Copiar"}
        </>
      )}
    </Button>
  )
}
