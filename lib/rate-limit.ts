import type { NextRequest } from "next/server"


class RateLimiter {
  private requests: Map<string, number[]> = new Map()

  async check(
    request: NextRequest,
    limit: number,
    token: string,
  ): Promise<{ success: boolean; limit: number; remaining: number; reset: Date }> {
    const now = Date.now()
    const windowStart = now - 60000 // 1 minute window

    // Get existing requests for this token
    const requests = this.requests.get(token) || []

    // Filter out old requests
    const validRequests = requests.filter((time) => time > windowStart)

    // Check if limit exceeded
    const success = validRequests.length < limit

    if (success) {
      validRequests.push(now)
      this.requests.set(token, validRequests)
    }

    return {
      success,
      limit,
      remaining: Math.max(0, limit - validRequests.length),
      reset: new Date(now + 60000),
    }
  }

  // Clean up old entries periodically
  cleanup() {
    const now = Date.now()
    const windowStart = now - 60000

    for (const [token, requests] of this.requests.entries()) {
      const validRequests = requests.filter((time) => time > windowStart)
      if (validRequests.length === 0) {
        this.requests.delete(token)
      } else {
        this.requests.set(token, validRequests)
      }
    }
  }
}

export const rateLimiter = new RateLimiter()

// Clean up every 5 minutes
setInterval(() => rateLimiter.cleanup(), 5 * 60 * 1000)

export async function rateLimit(
  request: NextRequest,
  limit = 100,
): Promise<{ success: boolean; limit: number; remaining: number; reset: Date }> {
  const token =
    request.headers.get("x-forwarded-for") ||
    request.headers.get("x-real-ip") ||
    "anonymous"

  return rateLimiter.check(request, limit, token)
}
