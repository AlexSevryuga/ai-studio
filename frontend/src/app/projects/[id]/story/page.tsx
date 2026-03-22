import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowLeft, BookOpen, Play } from "lucide-react"

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

async function getScenes(projectId: string) {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
  try {
    const res = await fetch(`${baseUrl}/api/scenes/project/${projectId}`, { cache: "no-store" })
    if (!res.ok) return []
    return res.json()
  } catch {
    return []
  }
}

export default async function StoryPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user) redirect("/login")

  const { id } = await params
  const project = await getProject(id)
  if (!project) redirect("/dashboard")

  const scenes = await getScenes(id)

  const acts = [
    { num: 1, title: "Act I - Setup", scenes: scenes.filter((s: { act: number }) => s.act === 1) },
    { num: 2, title: "Act II - Confrontation", scenes: scenes.filter((s: { act: number }) => s.act === 2) },
    { num: 3, title: "Act III - Resolution", scenes: scenes.filter((s: { act: number }) => s.act === 3) },
  ]

  return (
    <div className="container mx-auto py-10">
      <Link
        href={`/projects/${id}`}
        className="mb-6 inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to project
      </Link>

      <div className="mb-8">
        <h1 className="text-3xl font-bold">Story Structure</h1>
        <p className="text-muted-foreground">
          {project.title} — {scenes.length} scene{scenes.length !== 1 ? "s" : ""}
        </p>
      </div>

      {scenes.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <BookOpen className="mb-4 h-12 w-12 text-muted-foreground" />
            <p className="mb-4 text-muted-foreground">No story structure yet</p>
            <p className="text-sm text-muted-foreground">
              Run the orchestrator to generate story structure from your book
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-8">
          {acts.map((act) => (
            <div key={act.num} className="space-y-4">
              <h2 className="text-xl font-semibold">{act.title}</h2>
              <div className="space-y-2">
                {act.scenes.map((scene: { id: string; order: number; title: string; int_ext?: string; time_of_day?: string }) => (
                  <Link key={scene.id} href={`/projects/${id}/scenes/${scene.id}`}>
                    <Card className="hover:bg-muted/50 transition-colors">
                      <CardContent className="flex items-center gap-4 p-4">
                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-medium">
                          {scene.order}
                        </span>
                        <div className="flex-1">
                          <p className="font-medium">{scene.title}</p>
                          <p className="text-sm text-muted-foreground">
                            {scene.int_ext} • {scene.time_of_day}
                          </p>
                        </div>
                        <Play className="h-4 w-4 text-muted-foreground" />
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
