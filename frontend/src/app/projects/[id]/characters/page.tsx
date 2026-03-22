import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ArrowLeft } from "lucide-react"

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
    <div className="container mx-auto py-10">
      <Link
        href={`/projects/${id}`}
        className="mb-6 inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to project
      </Link>

      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Characters</h1>
          <p className="text-muted-foreground">
            {characters.length} character{characters.length !== 1 ? "s" : ""} in {project.title}
          </p>
        </div>
      </div>

      {characters.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <p className="mb-4 text-muted-foreground">No characters yet</p>
            <p className="text-sm text-muted-foreground">
              Run the Ingestor to extract characters from your book
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {characters.map((char: { id: string; name: string; role: string; description?: string; aliases?: string }) => (
            <Card key={char.id}>
              <CardHeader className="flex flex-row items-start gap-4">
                <Avatar className="h-12 w-12">
                  <AvatarFallback className="text-lg">
                    {char.name.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <CardTitle className="text-lg">{char.name}</CardTitle>
                  <CardDescription className="capitalize">{char.role}</CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                {char.description && (
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {char.description}
                  </p>
                )}
                {char.aliases && (
                  <p className="mt-2 text-xs text-muted-foreground">
                    Also known as: {char.aliases}
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
