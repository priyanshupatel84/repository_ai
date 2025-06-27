"use client"

import { useState, useEffect } from "react"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { LayoutDashboard, MessageSquare, GitCommitIcon, ArrowLeft } from "lucide-react"
import { cn } from "@/lib/utils"
import useProjects from "@/hooks/use-project"

const navigationItems = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    requiresProject: false,
  },
  {
    title: "Q&A",
    href: "/dashboard/[projectId]/qa",
    icon: MessageSquare,
    requiresProject: true,
  },
  {
    title: "Commits",
    href: "/dashboard/[projectId]",
    icon: GitCommitIcon,
    requiresProject: true,
  },
]

export function AppSidebar({ isMobileOpen, setIsMobileOpen }: { isMobileOpen: boolean, setIsMobileOpen: (open: boolean) => void }) {
  const [mounted, setMounted] = useState(false)
  const pathname = usePathname()
  const { projectId } = useProjects()

  useEffect(() => {
    setMounted(true)
  }, [])

  const getHref = (item: (typeof navigationItems)[0]) => {
    if (item.href.includes("[projectId]") && projectId) {
      return item.href.replace("[projectId]", projectId)
    }
    return item.href
  }

  const isActive = (item: (typeof navigationItems)[0]) => {
    if (!mounted) return false

    if (item.title === "Dashboard") {
      return pathname === "/dashboard"
    }
    if (item.title === "Q&A") {
      return pathname === `/dashboard/${projectId}/qa`
    }
    if (item.title === "Commits") {
      return pathname === `/dashboard/${projectId}` && pathname !== "/dashboard"
    }
    return false
  }

  const shouldShowItem = (item: (typeof navigationItems)[0]) => {
    if (item.requiresProject) {
      return !!projectId
    }
    return true
  }

  const isDisabled = (item: (typeof navigationItems)[0]) => {
    return item.href.includes("[projectId]") && !projectId
  }

  if (!mounted) {
    return (
      <aside className="w-48 h-screen border-r border-sidebar-border bg-sidebar hidden md:block">
        <nav className="p-4">
          <ul className="space-y-1">
            {navigationItems.map((item) => (
              <li key={item.title}>
                <div className="flex items-center px-3 py-2 text-sm text-sidebar-foreground">
                  <item.icon className="h-4 w-4 mr-3" />
                  {item.title}
                </div>
              </li>
            ))}
          </ul>
        </nav>
      </aside>
    )
  }

  return (
    <>
      {/* Mobile Overlay */}
      {(
        <div
          className={cn(
            "fixed inset-0 z-40 md:hidden transition-opacity duration-300",
            isMobileOpen ? "opacity-100 bg-black/50 pointer-events-auto" : "opacity-0 bg-black/0 pointer-events-none"
          )}
          aria-hidden="true"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "w-54 border-r border-sidebar-border bg-sidebar transition-transform duration-300 ease-in-out",
          "hidden md:block",
          "md:relative md:translate-x-0",
          isMobileOpen
            ? "fixed inset-y-0 left-0 z-50 block translate-x-0 shadow-xl"
            : "fixed -translate-x-full md:translate-x-0 shadow-none",
        )}
      >
        {/* Close button for mobile modal mode */}
        {isMobileOpen && (
          <button
            className="absolute top-3 right-3 z-50 p-1 rounded hover:bg-sidebar-accent focus:outline-none md:hidden"
            onClick={() => setIsMobileOpen(false)}
            aria-label="Close sidebar"
            type="button"
          >
            <ArrowLeft className="h-5 w-5 text-sidebar-foreground" />
          </button>
        )}

        <nav className="p-4">
          <ul className="space-y-2 mt-5 mr-8">
            {navigationItems.filter(shouldShowItem).map((item) => {
              const href = getHref(item)
              const active = isActive(item)
              const disabled = isDisabled(item)
              const Icon = item.icon

              return (
                <li key={item.title}>
                  {disabled ? (
                    <div className="flex items-center px-3 py-2 text-sm text-sidebar-foreground/50 cursor-not-allowed">
                      <Icon className="h-4 w-4 mr-3" />
                      {item.title}
                    </div>
                  ) : (
                    <Link
                      href={href}
                      onClick={() => setIsMobileOpen(false)}
                      className={cn(
                        "flex items-center px-3 py-2 text-sm rounded-md transition-colors",
                        active
                          ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                          : "text-sidebar-foreground hover:text-sidebar-accent-foreground hover:bg-sidebar-accent/50",
                      )}
                    >
                      <Icon className="h-4 w-4 mr-3" />
                      {item.title}
                    </Link>
                  )}
                </li>
              )
            })}
          </ul>
        </nav>
      </aside>
    </>
  )
}
