import { auth } from "@/lib/auth"
import NextAuth from "next-auth"

const { handlers } = NextAuth(auth)

export const { GET, POST } = handlers
