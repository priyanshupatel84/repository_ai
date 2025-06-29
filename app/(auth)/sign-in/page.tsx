"use client"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { GithubSignIn } from "@/components/github-sign-in"
import { DemoSignIn } from "@/components/demo-sign-in"
import { ArrowLeft, Loader2, Shield, Zap } from "lucide-react"
import { useEffect } from "react"

export default function SignInPage() {
  const router = useRouter()
  const { data: session, status } = useSession()

  // Redirect if already authenticated
  useEffect(() => {
    if (session) {
      router.push("/dashboard")
    }
  }, [session, router])

  // Show loading state while checking authentication
  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
          <p className="text-sm text-muted-foreground">Checking authentication...</p>
        </div>
      </div>
    )
  }

  // Don't render if already authenticated (prevents flash)
  if (status === "authenticated") {
    return null
  }

  return (
    <div className="space-y-6">
      {/* Back to Home Button - Top */}
      <div className="flex justify-start">
        <Button
          variant="ghost"
          onClick={() => router.push("/")}
          className="text-muted-foreground hover:text-foreground -ml-2 cursor-pointer"
          size="sm"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Home
        </Button>
      </div>

      {/* Main Sign In Card */}
      <Card className="border shadow-lg bg-card/95 backdrop-blur-sm">
        <CardHeader className="space-y-4 text-center pb-6">
          <div className="space-y-2">
            <CardTitle className="text-2xl sm:text-3xl font-bold tracking-tight">Welcome Back</CardTitle>
            <p className="text-muted-foreground">Sign in to access your dashboard</p>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* GitHub Sign In */}
          <div className="space-y-4">
            <GithubSignIn />
          </div>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border/50" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">Or try demo access</span>
            </div>
          </div>

          {/* Demo Sign In */}
          <div className="space-y-4">
            <DemoSignIn />
          </div>

          {/* Features preview */}
          <div className="space-y-4 pt-4 border-t border-border/50">
            <h3 className="font-medium text-center text-sm text-muted-foreground">What you&apos;ll get:</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex items-center gap-3 text-sm p-2 rounded-lg bg-muted/30">
                <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Shield className="w-4 h-4 text-primary" />
                </div>
                <div className="min-w-0">
                  <p className="font-medium text-foreground">Secure Access</p>
                  <p className="text-muted-foreground text-xs">Protected authentication</p>
                </div>
              </div>

              <div className="flex items-center gap-3 text-sm p-2 rounded-lg bg-muted/30">
                <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Zap className="w-4 h-4 text-primary" />
                </div>
                <div className="min-w-0">
                  <p className="font-medium text-foreground">Fast Setup</p>
                  <p className="text-muted-foreground text-xs">Get started in seconds</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
