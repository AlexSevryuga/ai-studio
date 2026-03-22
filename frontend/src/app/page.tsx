import { auth } from "@/lib/auth"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default async function Home() {
  const session = await auth()

  if (session?.user) {
    return (
      <div className="flex min-h-screen flex-col">
        <header className="border-b">
          <div className="container mx-auto flex h-16 items-center justify-between px-4">
            <span className="text-xl font-bold">AI Studio</span>
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground">
                {session.user.name || session.user.email}
              </span>
              <Link href="/dashboard">
                <Button size="sm">Go to Dashboard</Button>
              </Link>
            </div>
          </div>
        </header>
        <main className="flex flex-1 items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold">You are logged in</h1>
            <p className="mt-2 text-muted-foreground">
              Go to your dashboard to manage projects
            </p>
            <Button asChild className="mt-4">
              <Link href="/dashboard">Open Dashboard</Link>
            </Button>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <span className="text-xl font-bold">AI Studio</span>
          <Link href="/login">
            <Button size="sm">Sign In</Button>
          </Link>
        </div>
      </header>
      <main className="flex flex-1 items-center justify-center bg-gradient-to-b from-primary/10 to-background">
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-5xl font-bold tracking-tight">
            Literary IP to Multimedia
          </h1>
          <p className="mt-4 text-xl text-muted-foreground">
            Transform books into film, animation, and games with AI-powered
            adaptation
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <Button size="lg" asChild>
              <Link href="/login">Get Started</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/login">Learn More</Link>
            </Button>
          </div>
        </div>
      </main>
    </div>
  )
}
