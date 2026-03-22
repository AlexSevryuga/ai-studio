import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { ProjectClient } from "./PipelineClient"

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

export default async function ProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user) redirect("/login")

  const { id } = await params
  const project = await getProject(id)
  if (!project) redirect("/dashboard")

  const stats = await getProjectStats(id)

  return (
    <ProjectClient
      projectId={id}
      projectTitle={project.title}
      projectDescription={project.description}
      projectStatus={project.status || "draft"}
      projectSourceText={project.source_text}
      characters={stats.characters}
      locations={stats.locations}
      scenes={stats.scenes}
      scripts={stats.scripts}
      clips={stats.clips}
    />
  )
}
