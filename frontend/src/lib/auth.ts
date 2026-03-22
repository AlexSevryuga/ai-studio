import NextAuth from "next-auth"
import GitHub from "next-auth/providers/github"
import { authConfig } from "./auth.config"

export const { auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    GitHub({
      clientId: process.env.AUTH_GITHUB_ID,
      clientSecret: process.env.AUTH_GITHUB_SECRET,
    }),
  ],
})
