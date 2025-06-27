"use client"

import type React from "react"
import { TopNavigation } from "@/components/navigation/top-navigation"
import { AppSidebar } from "@/components/navigation/app-sidebar"
import useProjects from "@/hooks/use-project"
import { useState, Suspense } from "react"
import { ComponentLoadingSpinner } from "@/components/loading-spinner"
import { ErrorBoundary } from "@/components/error-boundary"

type Props = {
  children: React.ReactNode
}

function DashboardLayoutContent({ children }: Props) {
  const { allProjects, project, setSelectedProjectId } = useProjects()
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  const handleProjectChange = (projectId: string) => {
    setSelectedProjectId(projectId)
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <TopNavigation
        projects={allProjects}
        selectedProject={project}
        onProjectChange={handleProjectChange}
        isMobileOpen={isMobileOpen}
        setIsMobileOpen={setIsMobileOpen}
      />
      <div className="flex flex-1 pt-14">
        <AppSidebar isMobileOpen={isMobileOpen} setIsMobileOpen={setIsMobileOpen} />
        <main className="flex-1 overflow-y-auto h-[calc(100vh-56px)]">
          <div className="p-4 sm:p-6 max-w-7xl mx-auto">
            <ErrorBoundary>{children}</ErrorBoundary>
          </div>
        </main>
      </div>
    </div>
  )
}

const DashboardLayout = ({ children }: Props) => {
  return (
    <Suspense fallback={<ComponentLoadingSpinner />}>
      <DashboardLayoutContent>{children}</DashboardLayoutContent>
    </Suspense>
  )
}

export default DashboardLayout
