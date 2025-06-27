"use client"
import { useSession } from "next-auth/react"
import { ChevronDown, LogOut, Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { usePathname, useRouter } from "next/navigation"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { signOut } from "next-auth/react"
import { useState, useEffect } from "react"
import { ThemeToggle } from "@/components/theme-toggle"
import GithubLogo from "../ui/github-logo"

interface Project {
  id: string
  projectName: string
  status: string
}

interface TopNavigationProps {
  projects: Project[]
  selectedProject?: Project | null
  onProjectChange: (projectId: string) => void
  isMobileOpen: boolean
  setIsMobileOpen: (open: boolean) => void
}

export function TopNavigation({
  projects,
  selectedProject,
  onProjectChange,
  isMobileOpen,
  setIsMobileOpen,
}: TopNavigationProps) {
  const { data: session } = useSession()
  const pathname = usePathname()
  const router = useRouter()
  const isProjectPage = /^\/dashboard\/[^/]+/.test(pathname || "")
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleProjectChange = (projectId: string) => {
    onProjectChange(projectId)
    router.push(`/dashboard/${projectId}`)
  }

  const handleSignOut = async () => {
    await signOut()
  }

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

          <div className="w-0.5 h-6 bg-sidebar-border flex-shrink-0" />

          {/* User Name - Hidden on very small screens */}
          <span className="text-sm text-sidebar-foreground truncate hidden xs:block">{getDisplayName()}</span>

          {/* Project Selector - Only show on project pages */}
          {isProjectPage && (
            <>
              <div className="w-0.5 h-6 bg-sidebar-border flex-shrink-0" />
              <div className="min-w-0 flex-1 max-w-xs">
                <Select value={selectedProject?.id || ""} onValueChange={handleProjectChange}>
                  <SelectTrigger className="h-8 text-sm bg-sidebar-accent border-sidebar-border text-sidebar-foreground">
                    <SelectValue placeholder="Select project">
                      <span className="truncate">
                        {selectedProject ? selectedProject.projectName : "Select project"}
                      </span>
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent className="bg-sidebar border-sidebar-border">
                    {projects.length === 0 ? (
                      <SelectItem value="no-projects" disabled>
                        No projects available
                      </SelectItem>
                    ) : (
                      projects.map((project) => (
                        <SelectItem key={project.id} value={project.id} className="text-sidebar-foreground">
                          <div className="flex items-center space-x-2 min-w-0">
                            <span className="truncate">{project.projectName}</span>
                            <div
                              className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${project.status === "ready"
                                  ? "bg-green-500"
                                  : project.status === "loading"
                                    ? "bg-yellow-500"
                                    : "bg-red-500"
                                }`}
                            />
                          </div>
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
            </>
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
                className="h-8 text-sidebar-foreground hover:bg-sidebar-accent flex items-center gap-2"
              >
                <div className="w-6 h-6 bg-sidebar-accent rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-medium text-sidebar-foreground">{getUserInitials()}</span>
                </div>
                <ChevronDown className="h-3 w-3 hidden sm:block" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 bg-sidebar border-sidebar-border">
              <div className="px-2 py-1.5">
                <p className="text-sm font-medium text-sidebar-foreground truncate">{getDisplayName()}</p>
                <p className="text-xs text-sidebar-foreground/70 truncate">{session?.user?.email}</p>
              </div>
              <DropdownMenuSeparator className="bg-sidebar-border" />
              <DropdownMenuItem onClick={handleSignOut} className="text-red-400 hover:bg-sidebar-accent cursor-pointer">
                <LogOut className="mr-2 h-4 w-4" />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
