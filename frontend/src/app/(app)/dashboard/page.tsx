import { auth } from "@/lib/auth"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { EmptyState } from "@/components/empty-state"
import { Plus, Search, LayoutGrid, List, BookOpen, Clapperboard, FileText } from "lucide-react"

async function getProjects() {
  const session = await auth()
  if (!session?.user) return []

  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
  try {
    const res = await fetch(`${baseUrl}/api/projects`, {
      headers: {
        Authorization: `Bearer ${session.user.email}`,
      },
      cache: "no-store",
    })
    if (!res.ok) return []
    return res.json()
  } catch {
    return []
  }
}

async function getProjectStats(id: string) {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
  try {
    const [chars, locs, scenes, scripts, clips] = await Promise.all([
      fetch(`${baseUrl}/api/characters/project/${id}`, { cache: "no-store" }).then(r => r.ok ? r.json() : []),
      fetch(`${baseUrl}/api/locations/project/${id}`, { cache: "no-store" }).then(r => r.ok ? r.json() : []),
      fetch(`${baseUrl}/api/scenes/project/${id}`, { cache: "no-store" }).then(r => r.ok ? r.json() : []),
      Promise.resolve([]), // scripts API not available yet
      Promise.resolve([]), // clips API not available yet
    ])
    return {
      characters: chars.length || 0,
      locations: locs.length || 0,
      scenes: scenes.length || 0,
      scripts: 0,
      clips: 0,
    }
  } catch {
    return { characters: 0, locations: 0, scenes: 0, scripts: 0, clips: 0 }
  }
}

const STATUS_COLORS: Record<string, string> = {
  draft: "bg-muted text-muted-foreground",
  parsing: "bg-blue-500/10 text-blue-500",
  scripting: "bg-yellow-500/10 text-yellow-500",
  rendering: "bg-purple-500/10 text-purple-500",
  complete: "bg-green-500/10 text-green-500",
}

function getProgressPercent(status: string): number {
  const progressMap: Record<string, number> = {
    draft: 0,
    parsing: 25,
    scripting: 50,
    rendering: 75,
    complete: 100,
  }
  return progressMap[status] || 0
}

export default async function DashboardPage() {
  const session = await auth()

  const projects = await getProjects()

  // Calculate global stats
  let totalScenes = 0
  let totalClips = 0
  const projectsWithStats = await Promise.all(
    projects.map(async (project: { id: string }) => {
      const stats = await getProjectStats(project.id)
      totalScenes += stats.scenes
      totalClips += stats.clips
      return { ...project, stats }
    })
  )

  const greeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return "Good morning"
    if (hour < 18) return "Good afternoon"
    return "Good evening"
  }

  return (
    <div className="p-6 space-y-8">
      {/* Welcome Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">
            {greeting()}, {session?.user?.name?.split(" ")[0] || "Creator"}
          </h1>
          <p className="text-muted-foreground mt-1">
            You have {projects.length} project{projects.length !== 1 ? "s" : ""}
            {totalScenes > 0 && ` • ${totalScenes} scene${totalScenes !== 1 ? "s" : ""} generated`}
            {totalClips > 0 && ` • ${totalClips} clip${totalClips !== 1 ? "s" : ""} rendered`}
          </p>
        </div>
        <Link href="/projects/new">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            New Project
          </Button>
        </Link>
      </div>

      {projects.length === 0 ? (
        <EmptyState
          icon={<BookOpen className="h-12 w-12" />}
          title="No projects yet"
          description="Create your first project to start converting books into multimedia content."
          action={{ label: "Create your first project", href: "/projects/new" }}
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {projectsWithStats.map((project) => {
            const progress = getProgressPercent(project.status)
            return (
              <Link key={project.id} href={`/projects/${project.id}`} className="block">
                <Card className="hover:bg-muted/30 transition-all duration-200 group">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="text-lg leading-tight group-hover:text-primary transition-colors">
                        {project.title}
                      </CardTitle>
                      <span
                        className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${
                          STATUS_COLORS[project.status] || STATUS_COLORS.draft
                        }`}
                      >
                        {project.status || "draft"}
                      </span>
                    </div>
                    <CardDescription className="line-clamp-2">
                      {project.description || "No description"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Progress Bar */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>Pipeline Progress</span>
                        <span>{progress}%</span>
                      </div>
                      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full transition-all duration-500"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <FileText className="h-3.5 w-3.5" />
                        <span>{project.stats.characters} chars</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <BookOpen className="h-3.5 w-3.5" />
                        <span>{project.stats.scenes} scenes</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <Clapperboard className="h-3.5 w-3.5" />
                        <span>{project.stats.clips} clips</span>
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-2 border-t border-border">
                      {project.created_at && (
                        <span className="text-xs text-muted-foreground">
                          {new Date(project.created_at).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </span>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-auto py-1 px-2 text-xs text-primary hover:text-primary"
                      >
                        Continue →
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
