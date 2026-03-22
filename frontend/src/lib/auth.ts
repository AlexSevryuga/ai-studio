import NextAuth from "next-auth"
import GitHub from "next-auth/providers/github"
import { authConfig } from "./auth.config"

const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    GitHub({
      clientId: process.env.AUTH_GITHUB_ID,
      clientSecret: process.env.AUTH_GITHUB_SECRET,
    }),
  ],
})

export { auth, signIn, signOut, handlers }
