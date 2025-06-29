import type { DefaultSession, DefaultUser } from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      email: string
      githubAccessToken?: string
      isDemoUser?: boolean
    } & DefaultSession["user"]
  }
  interface User extends DefaultUser {
    githubAccessToken?: string
    isDemoUser?: boolean
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string
    email?: string
    accessToken?: string
    isDemoUser?: boolean
  }
}
