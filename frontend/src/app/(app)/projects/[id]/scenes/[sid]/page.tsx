import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScriptEditor } from "@/components/script-editor"
import { EmptyState } from "@/components/empty-state"
import { ArrowLeft, FileText, Clapperboard, Eye, MapPin, Clock, User } from "lucide-react"

async function getScene(projectId: string, sceneId: string) {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
  try {
    const res = await fetch(`${baseUrl}/api/scenes/${sceneId}`, { cache: "no-store" })
    if (!res.ok) return null
    return res.json()
  } catch {
    return null
  }
}

async function getScripts(sceneId: string) {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
  try {
    const res = await fetch(`${baseUrl}/api/scripts/scene/${sceneId}`, { cache: "no-store" })
    if (!res.ok) return []
    return res.json()
  } catch {
    return []
  }
}

async function getClips(sceneId: string) {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
  try {
    const res = await fetch(`${baseUrl}/api/clips/scene/${sceneId}`, { cache: "no-store" })
    if (!res.ok) return []
    return res.json()
  } catch {
    return []
  }
}

async function getCharacters(projectId: string) {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
  try {
    const res = await fetch(`${baseUrl}/api/characters/project/${projectId}`, { cache: "no-store" })
    if (!res.ok) return []
    return res.json()
  } catch {
    return []
  }
}

export default async function SceneDetailPage({
  params,
}: {
  params: Promise<{ id: string; sid: string }>
}) {
  const session = await auth()
  if (!session?.user) redirect("/login")

  const { id, sid } = await params
  const scene = await getScene(id, sid)
  if (!scene) redirect(`/projects/${id}/story`)

  const [scripts, clips, characters] = await Promise.all([
    getScripts(sid),
    getClips(sid),
    getCharacters(id),
  ])

  return (
    <div className="p-6 space-y-6">
      <Link
        href={`/projects/${id}/story`}
        className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to story
      </Link>

      <div className="flex items-center gap-4">
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-lg font-medium">
          {scene.order}
        </span>
        <div>
          <h1 className="text-2xl font-bold">{scene.title || `Scene ${scene.order}`}</h1>
          <p className="text-muted-foreground">
            {scene.int_ext || "INT/EXT"} • {scene.time_of_day || "day"} • Act {scene.act || "?"}
          </p>
        </div>
      </div>

      {/* Scene Metadata */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <MapPin className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Location</p>
              <p className="font-medium text-sm">{scene.int_ext || "Unknown"}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <Clock className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Time of Day</p>
              <p className="font-medium text-sm">{scene.time_of_day || "Day"}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <User className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Characters</p>
              <p className="font-medium text-sm">{scene.characters?.length || 0}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <FileText className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Scripts</p>
              <p className="font-medium text-sm">{scripts.length}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {scene.description && (
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">{scene.description}</p>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="script" className="space-y-4">
        <TabsList>
          <TabsTrigger value="script">
            <FileText className="mr-2 h-4 w-4" />
            Script
          </TabsTrigger>
          <TabsTrigger value="clips">
            <Clapperboard className="mr-2 h-4 w-4" />
            Clips ({clips.length})
          </TabsTrigger>
          <TabsTrigger value="vision">
            <Eye className="mr-2 h-4 w-4" />
            Vision
          </TabsTrigger>
        </TabsList>

        <TabsContent value="script">
          {scripts.length === 0 ? (
            <EmptyState
              icon={<FileText className="h-12 w-12" />}
              title="No script yet"
              description="Generate a script for this scene or write one manually."
              action={{ label: "Generate Script", href: `/projects/${id}/story` }}
            />
          ) : (
            <ScriptEditor
              sceneId={sid}
              scripts={scripts}
            />
          )}
        </TabsContent>

        <TabsContent value="clips">
          {clips.length === 0 ? (
            <EmptyState
              icon={<Clapperboard className="h-12 w-12" />}
              title="No clips yet"
              description="Generate vision prompts to create video clips for this scene."
              action={{ label: "Go to Vision", href: `/projects/${id}/vision` }}
            />
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {clips.map((clip: { id: string; order: number; prompt?: string; status?: string; video_url?: string }) => (
                <Card key={clip.id}>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm">Clip {clip.order}</CardTitle>
                      <span className={`rounded-full px-2 py-0.5 text-xs ${
                        clip.status === "done" ? "bg-green-500/10 text-green-500" : "bg-muted text-muted-foreground"
                      }`}>
                        {clip.status || "draft"}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {clip.prompt && (
                      <p className="text-sm text-muted-foreground">{clip.prompt}</p>
                    )}
                    {clip.video_url && (
                      <div className="mt-3 aspect-video rounded-lg bg-muted flex items-center justify-center">
                        <Clapperboard className="h-8 w-8 text-muted-foreground" />
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="vision">
          <EmptyState
            icon={<Eye className="h-12 w-12" />}
            title="Vision prompts"
            description="Generate vision prompts from the Vision page."
            action={{ label: "Go to Vision", href: `/projects/${id}/vision` }}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
