"use client"

import { useSession } from "next-auth/react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { User, Sparkles, X } from "lucide-react"
import { useState } from "react"

export function DemoUserBanner() {
  const { data: session } = useSession()
  const [isVisible, setIsVisible] = useState(true)

  if (!session?.user?.isDemoUser || !isVisible) {
    return null
  }

  return (
    <Card className="mb-6 border-2 border-dashed border-orange-200 bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-950/20 dark:to-amber-950/20 dark:border-orange-800">
      <CardContent className="p-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/50 rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-semibold text-orange-800 dark:text-orange-200">Demo Mode Active</h3>
                <Sparkles className="w-4 h-4 text-orange-500" />
              </div>
              <p className="text-sm text-orange-700 dark:text-orange-300">
                You are exploring the application with full demo access. All features are available for testing.
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsVisible(false)}
            className="text-orange-600 hover:text-orange-700 hover:bg-orange-100 dark:text-orange-400 dark:hover:bg-orange-900/30"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
