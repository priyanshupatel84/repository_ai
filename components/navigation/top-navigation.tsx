"use client"
import { useSession } from "next-auth/react"
import { ChevronDown, Menu, X, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useState, useEffect } from "react"

import { ThemeToggle } from "@/components/theme-toggle"
import GithubLogo from "../ui/github-logo"
import { SignOut } from "../sign-out"

interface Project {
  id: string
  projectName: string
  status: string
}

interface TopNavigationProps {
  projects: Project[]
  selectedProject?: Project | null
  isMobileOpen: boolean
  setIsMobileOpen: (open: boolean) => void
}

export function TopNavigation({ selectedProject, isMobileOpen, setIsMobileOpen }: TopNavigationProps) {
  const { data: session } = useSession()
  const router = useRouter()

  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const getUserInitials = () => {
    const name = session?.user?.name || session?.user?.email || "User"
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  const getDisplayName = () => {
    if (session?.user?.isDemoUser) {
      return "Demo User"
    }
    return session?.user?.name || session?.user?.email?.split("@")[0] || "User"
  }

  if (!mounted) {
    return (
      <header className="fixed top-0 left-0 w-full z-50 border-b bg-sidebar h-14">
        <div className="flex items-center justify-between h-14 px-4 sm:px-6">
          <div className="flex items-center space-x-3">
            <div className="h-5 w-5 bg-muted rounded animate-pulse" />
            <div className="w-0.5 h-6 bg-sidebar-border" />
            <div className="h-4 w-20 bg-muted rounded animate-pulse" />
          </div>
          <div className="flex items-center space-x-2">
            <div className="h-8 w-8 bg-muted rounded animate-pulse" />
            <div className="h-8 w-8 bg-muted rounded-full animate-pulse" />
          </div>
        </div>
      </header>
    )
  }

  return (
    <header className="fixed top-0 left-0 w-full z-50 border-b bg-sidebar">
      <div className="flex items-center justify-between h-14 px-4 sm:px-6">
        {/* Left: Logo, Hamburger, and User Info */}
        <div className="flex items-center space-x-3 min-w-0 flex-1">
          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden h-8 w-8 text-sidebar-foreground flex-shrink-0"
            onClick={() => setIsMobileOpen(!isMobileOpen)}
            aria-label={isMobileOpen ? "Close sidebar" : "Open sidebar"}
          >
            {isMobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>

          {/* Logo */}
          <GithubLogo
            className="h-5 w-5 text-sidebar-foreground cursor-pointer flex-shrink-0 lucide lucide-github-icon lucide-github"
            onClick={() => router.push("/")}
          />

          {/* <div className="w-0.5 h-6 bg-sidebar-border flex-shrink-0" /> */}

          {/* User Name - Hidden on very small screens */}
          <div className="flex items-center space-x-2 xs:flex">
            <div className="w-0.5 h-6 bg-sidebar-border flex-shrink-0" />
            <span className="text-sm text-sidebar-foreground truncate">{getDisplayName()}</span>
            {session?.user?.isDemoUser && (
              <div className="px-2 py-1 bg-orange-100 dark:bg-orange-900/50 rounded-full">
                <span className="text-xs font-medium text-orange-700 dark:text-orange-300">DEMO</span>
              </div>
            )}
          </div>

          {/* Project Selector - Only show on project pages */}
          {selectedProject && (
            <div className="flex items-center space-x-2">
              <div className="w-0.5 h-6 bg-sidebar-border flex-shrink-0" />
              <span className="text-sm text-sidebar-foreground truncate">{selectedProject.projectName}</span>
            </div>
          )}
        </div>

        {/* Right: Theme Toggle and User Menu */}
        <div className="flex items-center space-x-2 flex-shrink-0">
          {/* Theme Toggle */}
          <ThemeToggle />

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 text-sidebar-foreground hover:bg-sidebar-accent flex items-center gap-2 cursor-pointer"
              >
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                    session?.user?.isDemoUser ? "bg-orange-100 dark:bg-orange-900/50" : "bg-sidebar-accent"
                  }`}
                >
                  <span
                    className={`text-xs font-medium ${
                      session?.user?.isDemoUser ? "text-orange-700 dark:text-orange-300" : "text-sidebar-foreground"
                    }`}
                  >
                    {getUserInitials()}
                  </span>
                </div>
                <ChevronDown className="h-3 w-3 hidden sm:block" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 bg-sidebar border-sidebar-border">
              <div className="px-2 py-1.5">
                <p className="text-sm font-medium text-sidebar-foreground truncate">{getDisplayName()}</p>
                <p className="text-xs text-sidebar-foreground/70 truncate">{session?.user?.email}</p>
                {session?.user?.isDemoUser && (
                  <div className="flex items-center gap-1 mt-1">
                    <User className="h-3 w-3 text-orange-500" />
                    <span className="text-xs text-orange-600 dark:text-orange-400 font-medium">Demo Access</span>
                  </div>
                )}
              </div>
              <DropdownMenuSeparator className="bg-sidebar-border" />
              <DropdownMenuItem className="w-full flex items-center gap-2 text-sm text-sidebar-foreground hover:bg-sidebar-accent cusor-pointer">
                <SignOut />
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
