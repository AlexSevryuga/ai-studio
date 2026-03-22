import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { AppSidebar, AppSidebarInset } from "@/components/app-sidebar"
import { SidebarProvider } from "@/components/ui/sidebar"

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

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  if (!session?.user) {
    redirect("/login")
  }

  const projects = await getProjects()

  return (
    <SidebarProvider defaultOpen={true}>
      <AppSidebar
        user={session.user}
        projects={projects.map((p: { id: string; title: string; status: string }) => ({
          id: p.id,
          title: p.title,
          status: p.status,
        }))}
      />
      <AppSidebarInset>{children}</AppSidebarInset>
    </SidebarProvider>
  )
}
