import { GitCommit, MessageSquare } from "lucide-react"

export default function Features() {
  return (
    <section id="features" className="bg-background py-16 md:py-24">
      <div className="container mx-auto px-6">
        <h2 className="mb-12 text-center text-3xl font-bold md:text-4xl text-foreground">Key Features</h2>
        <div className="grid gap-8 md:grid-cols-2">
          <div className="rounded-lg bg-card p-6 shadow-md border">
            <GitCommit className="mb-4 h-12 w-12 text-accent" />
            <h3 className="mb-2 text-xl font-semibold text-card-foreground">AI Summarized Commits</h3>
            <p className="text-muted-foreground">
              Get concise and clear summaries of your repository&apos;s commit history.
            </p>
          </div>
          <div className="rounded-lg bg-card p-6 shadow-md border">
            <MessageSquare className="mb-4 h-12 w-12 text-accent" />
            <h3 className="mb-2 text-xl font-semibold text-card-foreground">Intelligent Q&A</h3>
            <p className="text-muted-foreground">
              Ask questions about your repo, and let AI provide detailed insights.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
