"use client"

import { ArrowRight } from "lucide-react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState, useMemo } from "react"

export default function Hero() {
  const { data: session } = useSession()
  const router = useRouter()
  const [displayedText, setDisplayedText] = useState("")
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isDeleting, setIsDeleting] = useState(false)
  const [currentPhraseIndex, setCurrentPhraseIndex] = useState(0)

  const phrases = useMemo(
    () => [
      "Unlock the Power of Your GitHub Repository with AI!",
      "Transform Your Code Analysis with Intelligence!",
      "Discover Hidden Insights in Your Projects!",
    ],
    []
  )

  const handleTryItNow = () => {
    router.push(session ? "/dashboard" : "/sign-in")
  }

  useEffect(() => {
    const currentPhrase = phrases[currentPhraseIndex]
    
    const timer = setTimeout(() => {
      if (!isDeleting) {
        // Typing
        if (currentIndex < currentPhrase.length) {
          setDisplayedText(currentPhrase.substring(0, currentIndex + 1))
          setCurrentIndex(currentIndex + 1)
        } else {
          // Pause before deleting
          setTimeout(() => setIsDeleting(true), 2000)
        }
      } else {
        // Deleting
        if (currentIndex > 0) {
          setDisplayedText(currentPhrase.substring(0, currentIndex - 1))
          setCurrentIndex(currentIndex - 1)
        } else {
          setIsDeleting(false)
          setCurrentPhraseIndex((prev) => (prev + 1) % phrases.length)
        }
      }
    }, isDeleting ? 50 : 100)

    return () => clearTimeout(timer)
  }, [currentIndex, isDeleting, currentPhraseIndex, phrases])

  return (
    <section className="bg-primary text-primary-foreground pt-16 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-10 w-72 h-72 bg-accent rounded-full mix-blend-multiply filter blur-xl animate-blob"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-secondary rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-accent rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-4000"></div>
      </div>

      <div className="container mx-auto px-6 py-20 md:py-28 flex items-center justify-center min-h-[80vh] relative z-10">
        <div className="text-center space-y-8 max-w-4xl">
          <div className="min-h-[200px] md:min-h-[240px] lg:min-h-[280px] xl:min-h-[320px] flex items-center justify-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl leading-tight font-bold">
              <span className="inline-block typing-text">
                {displayedText}
                <span className="animate-pulse text-accent">|</span>
              </span>
            </h1>
          </div>
          
          <p className="text-xl md:text-2xl lg:text-3xl text-primary-foreground/80 max-w-3xl mx-auto animate-fade-in-up">
            AI-summarized commits and intelligent Q&A for your GitHub projects.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 mt-12 justify-center animate-fade-in-up animation-delay-500">
            <button
              onClick={handleTryItNow}
              className="group inline-flex items-center justify-center rounded-lg bg-accent px-8 py-4 text-lg font-semibold text-accent-foreground transition-all duration-300 hover:bg-accent/90 hover:scale-105 hover:shadow-2xl shadow-lg transform-gpu cursor-pointer"
            >
              {session ? "Go to Dashboard" : "Try It Now"}
              <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
