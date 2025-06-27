import { ArrowRight } from "lucide-react"

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="bg-muted py-16 md:py-24">
      <div className="container mx-auto px-6">
        <h2 className="mb-12 text-center text-3xl font-bold md:text-4xl text-foreground">How It Works</h2>
        <div className="flex flex-col items-center md:flex-row md:justify-between">
          <div className="mb-8 flex flex-col items-center md:mb-0">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary text-2xl font-bold text-primary-foreground">
              1
            </div>
            <h3 className="mb-2 text-xl font-semibold text-foreground">Enter GitHub URL</h3>
            <p className="text-center text-muted-foreground">Provide your repository URL</p>
          </div>
          <ArrowRight className="mb-8 hidden h-8 w-8 text-accent md:block" />
          <div className="mb-8 flex flex-col items-center md:mb-0">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary text-2xl font-bold text-primary-foreground">
              2
            </div>
            <h3 className="mb-2 text-xl font-semibold text-foreground">AI Analysis</h3>
            <p className="text-center text-muted-foreground">Get summaries and insights</p>
          </div>
          <ArrowRight className="mb-8 hidden h-8 w-8 text-accent md:block" />
          <div className="flex flex-col items-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary text-2xl font-bold text-primary-foreground">
              3
            </div>
            <h3 className="mb-2 text-xl font-semibold text-foreground">Enhance Productivity</h3>
            <p className="text-center text-muted-foreground">Boost your understanding</p>
          </div>
        </div>
      </div>
    </section>
  )
}
