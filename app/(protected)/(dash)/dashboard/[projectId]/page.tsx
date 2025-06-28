"use client"

import useProjects from "@/hooks/use-project"
import { ExternalLink } from "lucide-react"
import Link from "next/link"
import CommitLog from "@/components/commit-log"
import AskQuestionCard from "@/components/ask-question-card"
import { DeleteButton } from "@/components/delete-button"
import { Card, CardContent } from "@/components/ui/card"
import GithubLogo from "@/components/ui/github-logo"


const DashboardProjectPage = () => {
  const { project } = useProjects()


  return (
    <div className="space-y-6">
      {/* Project Info */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <GithubLogo className="h-5 w-5 text-muted-foreground lucide lucide-github-icon" />
          <div>
            <h1 className="text-xl font-medium">{project?.projectName}</h1>
            <Link
              href={project?.githubUrl ?? ""}
              className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center"
            >
              {project?.githubUrl}
              <ExternalLink className="ml-1 h-4 w-4" />
            </Link>
          </div>
        </div>
        <DeleteButton />
      </div>

      {/* Q&A Section */}
      <div>
        <AskQuestionCard />
      </div>

      {/* Commits */}
      <div>
        <h2 className="text-lg font-medium mb-4">Recent Commits</h2>
        <Card>
          <CardContent className="p-6">
            <CommitLog />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default DashboardProjectPage
