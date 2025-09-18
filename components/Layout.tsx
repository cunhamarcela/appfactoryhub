"use client"

import { ReactNode, useEffect, useState } from 'react'
import { Navigation } from './Navigation'
import { cn } from '@/lib/utils'

interface LayoutProps {
  children: ReactNode
  hasSession: boolean
}

export function Layout({ children, hasSession }: LayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted) {
    return null
  }

  return (
    <>
      {hasSession && (
        <Navigation 
          onCollapseChange={setSidebarCollapsed}
          isCollapsed={sidebarCollapsed}
        />
      )}
      <main 
        className={cn(
          "transition-all duration-300 ease-in-out min-h-screen",
          hasSession && (sidebarCollapsed ? "lg:pl-16" : "lg:pl-64")
        )}
      >
        {children}
      </main>
    </>
  )
}
