import type { NextAuthConfig } from "next-auth"

export const authConfig: NextAuthConfig = {
  providers: [],
  pages: {
    signIn: "/login",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user
      const isOnProtected = !nextUrl.pathname.startsWith("/login")
      if (isOnProtected) {
        if (isLoggedIn) return true
        return false
      }
      return true
    },
  },
} satisfies NextAuthConfig
