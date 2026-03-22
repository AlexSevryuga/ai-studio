import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { EmptyState } from "@/components/empty-state"
import { ArrowLeft, Eye, Wand2 } from "lucide-react"

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

async function getClips(projectId: string) {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
  const scenes = await getScenes(projectId)
  const allClips: { id: string; order: number; prompt?: string; status?: string }[] = []

  for (const scene of scenes) {
    try {
      const res = await fetch(`${baseUrl}/api/clips/scene/${scene.id}`, { cache: "no-store" })
      if (res.ok) {
        const clips = await res.json()
        allClips.push(...clips)
      }
    } catch {
      // Skip
    }
  }
  return allClips
}

export default async function VisionPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user) redirect("/login")

  const { id } = await params
  const project = await getProject(id)
  if (!project) redirect("/dashboard")

  const scenes = await getScenes(id)
  const clips = await getClips(id)

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
          <Eye className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Vision Prompts</h1>
          <p className="text-muted-foreground">
            AI-generated video prompts for {project.title}
          </p>
        </div>
      </div>

      {scenes.length === 0 ? (
        <EmptyState
          icon={<Wand2 className="h-12 w-12" />}
          title="No scenes to generate prompts for"
          description="Create story structure first to generate vision prompts."
          action={{ label: "Go to Story", href: `/projects/${id}/story` }}
        />
      ) : (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Scenes</CardTitle>
              <CardDescription>
                {scenes.length} scene{scenes.length !== 1 ? "s" : ""} ready for vision generation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {scenes.map((scene: { id: string; order: number; title: string }) => (
                  <div
                    key={scene.id}
                    className="flex items-center justify-between rounded-lg border p-3 hover:bg-muted/30 transition-colors"
                  >
                    <span className="font-medium">
                      {scene.order}. {scene.title || `Scene ${scene.order}`}
                    </span>
                    <Button size="sm" variant="outline">
                      Generate
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {clips.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Generated Clips</CardTitle>
                <CardDescription>
                  {clips.length} clip{clips.length !== 1 ? "s" : ""} generated
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {clips.map((clip: { id: string; order: number; prompt?: string; status?: string }) => (
                    <div key={clip.id} className="rounded-lg border p-3">
                      <div className="mb-2 flex items-center justify-between">
                        <span className="font-medium">Clip {clip.order}</span>
                        <span className={`rounded-full px-2 py-0.5 text-xs ${
                          clip.status === "done" ? "bg-green-500/10 text-green-500" : "bg-muted text-muted-foreground"
                        }`}>
                          {clip.status || "draft"}
                        </span>
                      </div>
                      {clip.prompt && (
                        <p className="text-sm text-muted-foreground line-clamp-3">
                          {clip.prompt}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  )
}
