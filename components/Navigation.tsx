"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { signOut, useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { 
  Home, 
  FolderOpen, 
  DollarSign, 
  Calendar, 
  Settings, 
  LogOut,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  Plus
} from "lucide-react"
import { cn } from "@/lib/utils"

const navigation = [
  { name: "Dashboard", href: "/", icon: Home },
  { name: "Projetos", href: "/projects", icon: FolderOpen },
  { name: "Novo Projeto", href: "/projects/new", icon: Plus },
  { name: "Finanças", href: "/finances", icon: DollarSign },
  { name: "Calendar", href: "/calendar", icon: Calendar },
  { name: "Configurações", href: "/settings", icon: Settings },
]

interface NavigationProps {
  onCollapseChange?: (collapsed: boolean) => void
  isCollapsed?: boolean
}

export function Navigation({ onCollapseChange, isCollapsed: externalCollapsed }: NavigationProps = {}) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [internalCollapsed, setInternalCollapsed] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const pathname = usePathname()
  const { data: session } = useSession()

  const isDesktopCollapsed = externalCollapsed ?? internalCollapsed

  // Auto-collapse on smaller screens
  useEffect(() => {
    const handleResize = () => {
      const shouldCollapse = window.innerWidth < 1280
      if (externalCollapsed === undefined) {
        setInternalCollapsed(shouldCollapse)
      }
      onCollapseChange?.(shouldCollapse)
    }
    
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [externalCollapsed, onCollapseChange])

  const handleToggleCollapse = () => {
    const newCollapsed = !isDesktopCollapsed
    if (externalCollapsed === undefined) {
      setInternalCollapsed(newCollapsed)
    }
    onCollapseChange?.(newCollapsed)
  }

  return (
    <>
      {/* Desktop Navigation */}
      <nav 
        className={cn(
          "hidden lg:flex lg:flex-col lg:fixed lg:inset-y-0 transition-all duration-300 ease-in-out z-30 gradient-primary",
          isDesktopCollapsed && !isHovered ? "lg:w-16" : "lg:w-64"
        )}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={{
          background: 'var(--sidebar-background)',
          boxShadow: '4px 0 20px rgba(99, 102, 241, 0.15)'
        }}
      >
        <div className="flex flex-col flex-grow pt-5 pb-4 overflow-y-auto">
          <div className="flex items-center justify-between flex-shrink-0 px-4">
            <h1 className={cn(
              "text-xl font-bold transition-opacity duration-300",
              isDesktopCollapsed && !isHovered ? "opacity-0 w-0" : "opacity-100"
            )}
            style={{ color: 'var(--sidebar-text)' }}>
              App Factory Hub
            </h1>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleToggleCollapse}
              className={cn(
                "transition-all duration-300 hover:bg-white/10 text-white",
                isDesktopCollapsed && !isHovered ? "ml-0" : "ml-2"
              )}
            >
              {isDesktopCollapsed ? (
                <ChevronRight className="h-4 w-4" />
              ) : (
                <ChevronLeft className="h-4 w-4" />
              )}
            </Button>
          </div>
          <div className="mt-8 flex-grow flex flex-col">
            <nav className="flex-1 px-2 space-y-1">
              {navigation.map((item) => {
                const isActive = pathname === item.href
                const isCollapsed = isDesktopCollapsed && !isHovered
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      "group flex items-center px-3 py-3 text-sm font-medium rounded-xl transition-all duration-300 relative mx-2",
                      isActive
                        ? "bg-white/20 text-white shadow-lg"
                        : "text-white/80 hover:bg-white/10 hover:text-white",
                      isCollapsed ? "justify-center" : ""
                    )}
                    title={isCollapsed ? item.name : undefined}
                  >
                    <item.icon
                      className={cn(
                        "h-5 w-5 transition-all duration-300",
                        isCollapsed ? "mr-0" : "mr-3",
                        isActive ? "text-white" : "text-white/80 group-hover:text-white"
                      )}
                    />
                    <span className={cn(
                      "transition-all duration-300 font-medium",
                      isCollapsed ? "opacity-0 w-0 overflow-hidden" : "opacity-100"
                    )}>
                      {item.name}
                    </span>
                    {/* Tooltip for collapsed state */}
                    {isCollapsed && (
                      <div className="absolute left-full ml-3 px-3 py-2 bg-slate-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50 shadow-lg">
                        {item.name}
                        <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-1 w-2 h-2 bg-slate-900 rotate-45"></div>
                      </div>
                    )}
                  </Link>
                )
              })}
            </nav>
          </div>
          <div className="flex-shrink-0 flex border-t border-white/10 p-4 mt-4">
            <div className={cn(
              "flex items-center w-full transition-all duration-300",
              isDesktopCollapsed && !isHovered ? "justify-center" : ""
            )}>
              <div className="flex-shrink-0">
                <Image
                  className="h-10 w-10 rounded-full ring-2 ring-white/20"
                  src={session?.user?.image || "/default-avatar.png"}
                  alt={session?.user?.name || "User"}
                  width={40}
                  height={40}
                />
              </div>
              <div className={cn(
                "ml-3 flex-1 transition-all duration-300",
                isDesktopCollapsed && !isHovered ? "opacity-0 w-0 overflow-hidden" : "opacity-100"
              )}>
                <p className="text-sm font-medium text-white">
                  {session?.user?.name}
                </p>
                <p className="text-xs text-white/60">
                  {session?.user?.email}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => signOut()}
                className={cn(
                  "transition-all duration-300 hover:bg-white/10 text-white/80 hover:text-white",
                  isDesktopCollapsed && !isHovered ? "ml-0" : "ml-2"
                )}
                title={isDesktopCollapsed && !isHovered ? "Logout" : undefined}
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Navigation */}
      <div className="lg:hidden">
        <div className="flex items-center justify-between modern-card border-0 rounded-none px-4 py-4 shadow-sm">
          <h1 className="text-lg font-bold" style={{ color: 'var(--foreground)' }}>
            App Factory Hub
          </h1>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            {isMobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </Button>
        </div>

        {isMobileMenuOpen && (
          <>
            {/* Mobile overlay */}
            <div 
              className="fixed inset-0 bg-black bg-opacity-50 z-40"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            <div className="relative z-50 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
              <nav className="px-2 pt-2 pb-3 space-y-1">
              {navigation.map((item) => {
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={cn(
                      "group flex items-center px-2 py-2 text-base font-medium rounded-md",
                      isActive
                        ? "bg-blue-100 text-blue-900 dark:bg-blue-900 dark:text-blue-100"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white"
                    )}
                  >
                    <item.icon
                      className={cn(
                        "mr-3 h-6 w-6",
                        isActive
                          ? "text-blue-500"
                          : "text-gray-400 group-hover:text-gray-500"
                      )}
                    />
                    {item.name}
                  </Link>
                )
              })}
            </nav>
              <div className="pt-4 pb-3 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center px-4">
                  <div className="flex-shrink-0">
                    <Image
                      className="h-10 w-10 rounded-full"
                      src={session?.user?.image || "/default-avatar.png"}
                      alt={session?.user?.name || "User"}
                      width={40}
                      height={40}
                    />
                  </div>
                  <div className="ml-3">
                    <div className="text-base font-medium text-gray-800 dark:text-gray-200">
                      {session?.user?.name}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {session?.user?.email}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => signOut()}
                    className="ml-auto"
                  >
                    <LogOut className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

    </>
  )
}
