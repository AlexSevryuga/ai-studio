import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { EmptyState } from "@/components/empty-state"
import { ArrowLeft, Clapperboard, Play } from "lucide-react"

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

export default async function ScenesPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user) redirect("/login")

  const { id } = await params
  const project = await getProject(id)
  if (!project) redirect("/dashboard")

  const scenes = await getScenes(id)

  return (
    <div className="p-6 space-y-6">
      <Link
        href={`/projects/${id}`}
        className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to project
      </Link>

      <div>
        <h1 className="text-2xl font-bold">Scenes</h1>
        <p className="text-muted-foreground">
          {scenes.length} scene{scenes.length !== 1 ? "s" : ""} in {project.title}
        </p>
      </div>

      {scenes.length === 0 ? (
        <EmptyState
          icon={<Clapperboard className="h-12 w-12" />}
          title="No scenes yet"
          description="Run the orchestrator to generate scenes from your book."
          action={{ label: "Go to project", href: `/projects/${id}` }}
        />
      ) : (
        <div className="space-y-3">
          {scenes
            .sort((a: { order: number }, b: { order: number }) => a.order - b.order)
            .map((scene: { id: string; order: number; title: string; act?: number; int_ext?: string; time_of_day?: string; status?: string }) => (
              <Link key={scene.id} href={`/projects/${id}/scenes/${scene.id}`}>
                <Card className="hover:bg-muted/30 transition-colors">
                  <CardContent className="flex items-center gap-4 p-4">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-medium">
                      {scene.order}
                    </span>
                    <div className="flex-1">
                      <p className="font-medium">{scene.title || `Scene ${scene.order}`}</p>
                      <p className="text-sm text-muted-foreground">
                        {scene.int_ext || "INT/EXT"} • {scene.time_of_day || "day"} • Act {scene.act || "?"}
                      </p>
                    </div>
                    <span className={`text-xs rounded-full px-2 py-0.5 ${
                      scene.status === "done" ? "bg-green-500/10 text-green-500" : "bg-muted text-muted-foreground"
                    }`}>
                      {scene.status || "draft"}
                    </span>
                    <Play className="h-4 w-4 text-muted-foreground" />
                  </CardContent>
                </Card>
              </Link>
            ))}
        </div>
      )}
    </div>
  )
}
