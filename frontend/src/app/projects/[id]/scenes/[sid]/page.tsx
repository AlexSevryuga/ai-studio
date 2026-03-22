import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, FileText, Clapperboard, Eye } from "lucide-react"

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

  const scripts = await getScripts(sid)
  const clips = await getClips(sid)

  return (
    <div className="container mx-auto py-10">
      <Link
        href={`/projects/${id}/story`}
        className="mb-6 inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to story
      </Link>

      <div className="mb-8">
        <div className="flex items-center gap-4">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-lg font-medium">
            {scene.order}
          </span>
          <div>
            <h1 className="text-3xl font-bold">{scene.title}</h1>
            <p className="text-muted-foreground">
              {scene.int_ext} • {scene.time_of_day} • Act {scene.act}
            </p>
          </div>
        </div>
      </div>

      {scene.description && (
        <Card className="mb-8">
          <CardContent className="p-6">
            <p className="text-muted-foreground">{scene.description}</p>
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
            Clips
          </TabsTrigger>
          <TabsTrigger value="vision">
            <Eye className="mr-2 h-4 w-4" />
            Vision
          </TabsTrigger>
        </TabsList>

        <TabsContent value="script">
          <Card>
            <CardHeader>
              <CardTitle>Script</CardTitle>
              <CardDescription>Scene script versions</CardDescription>
            </CardHeader>
            <CardContent>
              {scripts.length === 0 ? (
                <div className="py-8 text-center">
                  <p className="text-muted-foreground">No script yet</p>
                  <Button className="mt-4" asChild>
                    <Link href={`/projects/${id}/story`}>Generate Script</Link>
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {scripts.map((script: { id: string; version: number; content: string; created_at?: string }) => (
                    <div key={script.id} className="rounded-lg border p-4">
                      <div className="mb-2 flex items-center justify-between">
                        <span className="font-medium">Version {script.version}</span>
                        {script.created_at && (
                          <span className="text-sm text-muted-foreground">
                            {new Date(script.created_at).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                      <pre className="whitespace-pre-wrap text-sm">{script.content}</pre>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="clips">
          <Card>
            <CardHeader>
              <CardTitle>Video Clips</CardTitle>
              <CardDescription>Generated clips for this scene</CardDescription>
            </CardHeader>
            <CardContent>
              {clips.length === 0 ? (
                <div className="py-8 text-center">
                  <p className="text-muted-foreground">No clips yet</p>
                  <Button className="mt-4" asChild>
                    <Link href={`/projects/${id}/vision`}>Generate Vision</Link>
                  </Button>
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  {clips.map((clip: { id: string; order: number; prompt?: string; status?: string; video_url?: string }) => (
                    <div key={clip.id} className="rounded-lg border p-4">
                      <div className="mb-2 flex items-center justify-between">
                        <span className="font-medium">Clip {clip.order}</span>
                        <span className="rounded-full bg-primary/10 px-2 py-1 text-xs">
                          {clip.status || "draft"}
                        </span>
                      </div>
                      {clip.prompt && (
                        <p className="text-sm text-muted-foreground">{clip.prompt}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="vision">
          <Card>
            <CardHeader>
              <CardTitle>Vision Prompts</CardTitle>
              <CardDescription>AI-generated video prompts</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="py-8 text-center">
                <p className="text-muted-foreground">
                  Generate vision prompts to create clips for this scene
                </p>
                <Button className="mt-4" asChild>
                  <Link href={`/projects/${id}/vision`}>Generate Vision</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
