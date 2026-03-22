import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { EmptyState } from "@/components/empty-state"
import { ArrowLeft, MapPin } from "lucide-react"

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

async function getLocations(projectId: string) {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
  try {
    const res = await fetch(`${baseUrl}/api/locations/project/${projectId}`, { cache: "no-store" })
    if (!res.ok) return []
    return res.json()
  } catch {
    return []
  }
}

export default async function LocationsPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user) redirect("/login")

  const { id } = await params
  const project = await getProject(id)
  if (!project) redirect("/dashboard")

  const locations = await getLocations(id)

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
        <h1 className="text-2xl font-bold">Locations</h1>
        <p className="text-muted-foreground">
          {locations.length} location{locations.length !== 1 ? "s" : ""} in {project.title}
        </p>
      </div>

      {locations.length === 0 ? (
        <EmptyState
          icon={<MapPin className="h-12 w-12" />}
          title="No locations yet"
          description="Run the Ingestor to extract locations from your book."
          action={{ label: "Go to project", href: `/projects/${id}` }}
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {locations.map((loc: { id: string; name: string; int_ext: string; description?: string; visual_description?: string }) => (
            <Card key={loc.id} className="hover:bg-muted/30 transition-colors">
              <CardHeader className="flex flex-row items-start gap-4 pb-3">
                <div className="rounded-full bg-primary/10 p-2">
                  <MapPin className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <CardTitle className="text-lg">{loc.name}</CardTitle>
                  <CardDescription>{loc.int_ext || "INT/EXT"}</CardDescription>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                {loc.description && (
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {loc.description}
                  </p>
                )}
                {loc.visual_description && (
                  <p className="text-xs text-muted-foreground">
                    <span className="font-medium">Visual:</span> {loc.visual_description}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
