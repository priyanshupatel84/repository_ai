"use client"

import type React from "react"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, User, Eye, EyeOff, Info } from "lucide-react"
import { toast } from "sonner"

export function DemoSignIn() {
  const [isLoading, setIsLoading] = useState(false)
  const [showCredentials, setShowCredentials] = useState(false)
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")

  const handleDemoSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const result = await signIn("demo", {
        username,
        password,
        redirect: false,
      })

      if (result?.error) {
        toast.error("Invalid demo credentials. Please check your username and password.")
      } else if (result?.ok) {
        toast.success("Demo login successful! Welcome to the demo environment.")
        window.location.href = "/dashboard"
      }
    } catch (error) {
      console.error("Demo sign-in error:", error)
      toast.error("An error occurred during demo sign-in. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const fillDemoCredentials = () => {
    setUsername("demo_user")
    setPassword("demo@123")
    setShowCredentials(true)
  }

  return (
    <Card className="border-2 border-dashed border-orange-200 bg-orange-50/30 dark:border-orange-800 dark:bg-orange-950/20">
      <CardHeader className="text-center pb-4">
        <div className="flex items-center justify-center mb-2">
          <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/50 rounded-full flex items-center justify-center">
            <User className="w-5 h-5 text-orange-600 dark:text-orange-400" />
          </div>
        </div>
        <CardTitle className="text-lg text-orange-800 dark:text-orange-200">Demo Access</CardTitle>
        <CardDescription className="text-orange-700 dark:text-orange-300">
          Experience the full application without GitHub authentication
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {!showCredentials ? (
          <div className="space-y-4">
            <div className="bg-orange-100 dark:bg-orange-900/30 border border-orange-200 dark:border-orange-800 rounded-lg p-3">
              <div className="flex items-start space-x-2">
                <Info className="h-4 w-4 text-orange-600 dark:text-orange-400 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-orange-800 dark:text-orange-200">
                  <p className="font-medium mb-1">Demo Features:</p>
                  <ul className="text-xs space-y-1 text-orange-700 dark:text-orange-300">
                    <li>• Full access to all application features</li>
                    <li>• Pre-loaded sample projects and data</li>
                    <li>• AI-powered repository analysis</li>
                    <li>• Complete Q&A functionality</li>
                  </ul>
                </div>
              </div>
            </div>

            <Button
              onClick={fillDemoCredentials}
              className="w-full bg-orange-600 hover:bg-orange-700 text-white"
              size="lg"
            >
              <User className="mr-2 h-4 w-4" />
              Use Demo Credentials
            </Button>
          </div>
        ) : (
          <form onSubmit={handleDemoSignIn} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="demo-username" className="text-orange-800 dark:text-orange-200">
                Username
              </Label>
              <Input
                id="demo-username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="demo_user"
                className="border-orange-200 focus:border-orange-400 dark:border-orange-700"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="demo-password" className="text-orange-800 dark:text-orange-200">
                Password
              </Label>
              <div className="relative">
                <Input
                  id="demo-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="demo@123"
                  className="border-orange-200 focus:border-orange-400 dark:border-orange-700 pr-10"
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowCredentials(!showCredentials)}
                >
                  {showCredentials ? (
                    <EyeOff className="h-4 w-4 text-orange-600" />
                  ) : (
                    <Eye className="h-4 w-4 text-orange-600" />
                  )}
                </Button>
              </div>
            </div>

            <div className="flex space-x-2">
              <Button
                type="submit"
                disabled={isLoading || !username || !password}
                className="flex-1 bg-orange-600 hover:bg-orange-700 text-white"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  <>
                    <User className="mr-2 h-4 w-4" />
                    Sign In as Demo
                  </>
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowCredentials(false)}
                className="border-orange-200 text-orange-700 hover:bg-orange-50 dark:border-orange-700 dark:text-orange-300"
              >
                Cancel
              </Button>
            </div>

            <div className="text-center">
              <p className="text-xs text-orange-600 dark:text-orange-400">
                Demo credentials: <span className="font-mono">demo_user</span> /{" "}
                <span className="font-mono">demo@123</span>
              </p>
            </div>
          </form>
        )}
      </CardContent>
    </Card>
  )
}
