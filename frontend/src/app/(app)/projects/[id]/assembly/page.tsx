import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { EmptyState } from "@/components/empty-state"
import { ArrowLeft, Clapperboard, Film } from "lucide-react"

async function getProject(id: string) {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
  try {
    const res = await fetch(`${baseUrl}/api/projects/${id}`, { cache: "no-store" })
    if (!res.ok) return null
    return res.json()
  } catch {
    return null
  }
}

export default async function AssemblyPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user) redirect("/login")

  const { id } = await params
  const project = await getProject(id)
  if (!project) redirect("/dashboard")

  return (
    <div className="p-6 space-y-6">
      <Link
        href={`/projects/${id}`}
        className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to project
      </Link>

      <div className="flex items-center gap-4">
        <div className="rounded-full bg-primary/10 p-3">
          <Clapperboard className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Assembly</h1>
          <p className="text-muted-foreground">
            Final assembly of {project.title}
          </p>
        </div>
      </div>

      <EmptyState
        icon={<Film className="h-12 w-12" />}
        title="Assembly module coming soon"
        description="Generate clips for all scenes first, then assemble them into a final video."
        action={{ label: "Go to Vision", href: `/projects/${id}/vision` }}
      />
    </div>
  )
}
