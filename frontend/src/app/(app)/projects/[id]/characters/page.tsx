import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { EmptyState } from "@/components/empty-state"
import { ArrowLeft, FileText, User } from "lucide-react"

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

export default async function CharactersPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user) redirect("/login")

  const { id } = await params
  const project = await getProject(id)
  if (!project) redirect("/dashboard")

  const characters = await getCharacters(id)

  return (
    <div className="p-6 space-y-6">
      <Link
        href={`/projects/${id}`}
        className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to project
      </Link>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Characters</h1>
          <p className="text-muted-foreground">
            {characters.length} character{characters.length !== 1 ? "s" : ""} in {project.title}
          </p>
        </div>
      </div>

      {characters.length === 0 ? (
        <EmptyState
          icon={<User className="h-12 w-12" />}
          title="No characters yet"
          description="Run the Ingestor to extract characters from your book."
          action={{ label: "Go to project", href: `/projects/${id}` }}
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {characters.map((char: { id: string; name: string; role: string; description?: string; appearance?: string; arc?: string }) => (
            <Card key={char.id} className="hover:bg-muted/30 transition-colors">
              <CardHeader className="flex flex-row items-start gap-4 pb-3">
                <Avatar className="h-12 w-12">
                  <AvatarFallback className="text-lg bg-primary/10 text-primary">
                    {char.name.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <CardTitle className="text-lg">{char.name}</CardTitle>
                  <CardDescription className="capitalize">{char.role || "unknown"}</CardDescription>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                {char.description && (
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {char.description}
                  </p>
                )}
                {char.appearance && (
                  <p className="text-xs text-muted-foreground">
                    <span className="font-medium">Appearance:</span> {char.appearance}
                  </p>
                )}
                {char.arc && (
                  <p className="text-xs text-muted-foreground">
                    <span className="font-medium">Arc:</span> {char.arc}
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
