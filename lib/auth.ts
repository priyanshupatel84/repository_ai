import db from "@/lib/db"
import { PrismaAdapter } from "@next-auth/prisma-adapter"
import NextAuth, { type NextAuthOptions, type Session } from "next-auth"

import GitHubProvider from "next-auth/providers/github"
import CredentialsProvider from "next-auth/providers/credentials"

const adapter = PrismaAdapter(db)

export const authOptions: NextAuthOptions = {
  adapter,
  providers: [
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
      authorization: { params: { scope: "read:user public_repo user:email" } },
      allowDangerousEmailAccountLinking: true,
    }),
    CredentialsProvider({
      id: "demo",
      name: "Demo User",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (credentials?.username === "demo_user" && credentials?.password === "demo@123") {
          // Check if demo user exists in database
          let demoUser = await db.user.findUnique({
            where: { email: "demo@example.com" },
          })

          // Create demo user if doesn't exist
          if (!demoUser) {
            demoUser = await db.user.create({
              data: {
                email: "demo@example.com",
                name: "Demo User",
                emailVerified: new Date(),
              },
            })
          }

          return {
            id: demoUser.id,
            email: demoUser.email,
            name: demoUser.name,
            isDemoUser: true,
          }
        }
        return null
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      if (account && user && account.provider === "github") {
        try {
          await db.user.update({
            where: { id: user.id },
            data: {
              githubAccessToken: account.access_token,
              emailVerified: new Date(),
            },
          })
          token.accessToken = account.access_token
        } catch (e) {
          console.error("Error updating user:", e)
        }
        token.id = user.id
        token.email = user.email ?? undefined
      } else if (account && user && account.provider === "demo") {
        token.id = user.id
        token.email = user.email ?? undefined
        token.isDemoUser = true
      } else if (user) {
        token.id = user.id
        token.email = user.email ?? undefined
        if ("isDemoUser" in user) {
          token.isDemoUser = user.isDemoUser
        }
      }
      return token
    },
    async session({ session, token }) {
      if (!token) {
        console.error("Token is undefined in session callback")
        return session
      }

      // Always ensure session.user exists
      if (!session.user) {
        session.user = { id: "", email: "" }
      }

      // Only set properties if they exist in the token
      if (token.id) {
        session.user.id = token.id as string
      }
      if (token.email) {
        session.user.email = token.email as string
      }
      if (token.accessToken) {
        session.user.githubAccessToken = token.accessToken as string
      }
      if (token.isDemoUser) {
        session.user.isDemoUser = token.isDemoUser as boolean
      }

      return session as Session
    },
  },
  pages: {
    signIn: "/sign-in",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
}

export const { handlers, signIn, signOut, auth } = NextAuth(authOptions)
