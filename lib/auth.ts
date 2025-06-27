import db from "@/lib/db";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import NextAuth, { NextAuthOptions, Session } from "next-auth";

import GitHubProvider from "next-auth/providers/github";

const adapter = PrismaAdapter(db);

export const authOptions: NextAuthOptions = {
  adapter,
  providers: [
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
      authorization: { params: { scope: "read:user public_repo" } },
    }),
  ],
  pages: {
    signIn: '/sign-in', 
  },
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
          });
          token.accessToken = account.access_token;
        } catch (e) {
          console.error("Error updating user:", e);
        }
        token.id = user.id;
        token.email = user.email ?? undefined;
      } else if (user) {
        token.id = user.id;
        token.email = user.email ?? undefined;
      }
      return token;
    },
    async session({ session, token }) {

      if (!token) {
        console.error("Token is undefined in session callback");
        return session;
      }

      // Always ensure session.user exists
      if (!session.user) {
        session.user = { id: '', email: '' };
      }

      // Only set properties if they exist in the token
      if (token.id) {
        session.user.id = token.id as string;
      }
      if (token.email) {
        session.user.email = token.email as string;
      }
      if (token.accessToken) {
        session.user.githubAccessToken = token.accessToken as string;
      }

      return session as Session;
    },
  },
  session: {
    strategy: "jwt", // Explicitly set strategy to JWT
  },
  secret: process.env.NEXTAUTH_SECRET,
};

export const { handlers, signIn, signOut, auth } = NextAuth(authOptions);
