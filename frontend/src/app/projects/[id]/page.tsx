import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  BookOpen,
  Users,
  MapPin,
  Clapperboard,
} from "lucide-react"

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

async function getProjectStats(id: string) {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
  try {
    const [chars, locs, scenes] = await Promise.all([
      fetch(`${baseUrl}/api/characters/project/${id}`, { cache: "no-store" }).then(r => r.ok ? r.json() : []),
      fetch(`${baseUrl}/api/locations/project/${id}`, { cache: "no-store" }).then(r => r.ok ? r.json() : []),
      fetch(`${baseUrl}/api/scenes/project/${id}`, { cache: "no-store" }).then(r => r.ok ? r.json() : []),
    ])
    return { characters: chars.length, locations: locs.length, scenes: scenes.length }
  } catch {
    return { characters: 0, locations: 0, scenes: 0 }
  }
}

export default async function ProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user) redirect("/login")

  const { id } = await params
  const project = await getProject(id)
  if (!project) redirect("/dashboard")

  const stats = await getProjectStats(id)

  return (
    <div className="container mx-auto py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">{project.title}</h1>
        {project.description && (
          <p className="mt-2 text-muted-foreground">{project.description}</p>
        )}
        <div className="mt-2 flex items-center gap-4 text-sm text-muted-foreground">
          <span className="rounded-full bg-primary/10 px-2 py-1">{project.status}</span>
          <span>{project.source_text ? "Text loaded" : "No text uploaded"}</span>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Link href={`/projects/${id}/characters`}>
          <Card className="hover:bg-muted/50 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Characters</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.characters}</div>
            </CardContent>
          </Card>
        </Link>

        <Link href={`/projects/${id}/locations`}>
          <Card className="hover:bg-muted/50 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Locations</CardTitle>
              <MapPin className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.locations}</div>
            </CardContent>
          </Card>
        </Link>

        <Link href={`/projects/${id}/scenes`}>
          <Card className="hover:bg-muted/50 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Scenes</CardTitle>
              <Clapperboard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.scenes}</div>
            </CardContent>
          </Card>
        </Link>

        <Link href={`/projects/${id}/story`}>
          <Card className="hover:bg-muted/50 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Story</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">-</div>
            </CardContent>
          </Card>
        </Link>
      </div>

      <Tabs defaultValue="overview" className="mt-8">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="story">Story</TabsTrigger>
          <TabsTrigger value="vision">Vision</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Project Overview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium">Status</h4>
                <p className="text-sm text-muted-foreground">{project.status}</p>
              </div>
              <div>
                <h4 className="font-medium">Created</h4>
                <p className="text-sm text-muted-foreground">
                  {project.created_at ? new Date(project.created_at).toLocaleDateString() : "N/A"}
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="story" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Story Structure</CardTitle>
              <CardDescription>AI-generated story breakdown</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Run the orchestrator to generate story structure from your book.
              </p>
              <Button className="mt-4" asChild>
                <Link href={`/projects/${id}/story`}>Generate Story</Link>
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="vision" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Vision Prompts</CardTitle>
              <CardDescription>AI-generated video prompts</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Generate video prompts for your scenes.
              </p>
              <Button className="mt-4" asChild>
                <Link href={`/projects/${id}/vision`}>Generate Prompts</Link>
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
