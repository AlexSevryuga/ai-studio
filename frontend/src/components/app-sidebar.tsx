"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { signOut } from "next-auth/react"
import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuSkeleton,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import {
  LayoutDashboard,
  FolderOpen,
  Plus,
  Settings,
  LogOut,
  ChevronDown,
  Sparkles,
  FileText,
  MapPin,
  Clapperboard,
  Film,
  Palette,
  Layers,
} from "lucide-react"

interface Project {
  id: string
  title: string
  status: string
}

interface AppSidebarProps {
  user: {
    name?: string | null
    email?: string | null
    image?: string | null
  }
  projects?: Project[]
}

const NAV_ITEMS = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "New Project", href: "/projects/new", icon: Plus },
]

const PROJECT_SUB_ITEMS = [
  { name: "Overview", href: "/projects/[id]", icon: Sparkles },
  { name: "Characters", href: "/projects/[id]/characters", icon: FileText },
  { name: "Locations", href: "/projects/[id]/locations", icon: MapPin },
  { name: "Story", href: "/projects/[id]/story", icon: Layers },
  { name: "Scenes", href: "/projects/[id]/scenes", icon: Clapperboard },
  { name: "Vision", href: "/projects/[id]/vision", icon: Palette },
  { name: "Assembly", href: "/projects/[id]/assembly", icon: Film },
]

function NavButton({ href, icon: Icon, label, isActive }: { href: string; icon: React.ElementType; label: string; isActive: boolean }) {
  return (
    <Link href={href}>
      <SidebarMenuItem>
        <button
          className={cn(
            "flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
            isActive
              ? "bg-sidebar-accent text-sidebar-accent-foreground"
              : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          )}
        >
          <Icon className="h-4 w-4" />
          <span>{label}</span>
        </button>
      </SidebarMenuItem>
    </Link>
  )
}

export function AppSidebar({ user, projects = [] }: AppSidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [projectsOpen, setProjectsOpen] = useState(true)

  const isProjectRoute = pathname?.startsWith("/projects/")
  const currentProjectId = pathname?.split("/")[2]

  function getInitials(name?: string | null, email?: string | null) {
    if (name) return name.slice(0, 2).toUpperCase()
    if (email) return email.slice(0, 2).toUpperCase()
    return "U"
  }

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      <SidebarHeader className="border-b border-sidebar-border">
        <Link href="/dashboard" className="flex items-center gap-2 px-3 py-2">
          <Sparkles className="h-5 w-5 text-sidebar-primary" />
          <span className="font-semibold text-sidebar-foreground">AI Studio</span>
        </Link>
      </SidebarHeader>

      <SidebarContent className="px-2">
        {/* Main Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-muted-foreground px-3">Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {NAV_ITEMS.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href
                return (
                  <NavButton
                    key={item.href}
                    href={item.href}
                    icon={Icon}
                    label={item.name}
                    isActive={isActive}
                  />
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Projects Section */}
        <SidebarGroup>
          <button
            onClick={() => setProjectsOpen(!projectsOpen)}
            className="flex w-full items-center gap-1 px-3 py-2 text-muted-foreground hover:text-sidebar-foreground transition"
          >
            <FolderOpen className="h-3.5 w-3.5" />
            <span className="flex-1 text-left text-xs font-medium">Projects</span>
            <ChevronDown
              className={cn(
                "h-3.5 w-3.5 transition-transform",
                projectsOpen && "rotate-180"
              )}
            />
          </button>

          {projectsOpen && (
            <SidebarGroupContent>
              <SidebarMenu>
                {projects.length === 0 ? (
                  <SidebarMenuItem>
                    <SidebarMenuSkeleton />
                  </SidebarMenuItem>
                ) : (
                  projects.map((project) => {
                    const isActive = currentProjectId === project.id
                    return (
                      <Link key={project.id} href={`/projects/${project.id}`}>
                        <SidebarMenuItem>
                          <button
                            className={cn(
                              "flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors truncate",
                              isActive
                                ? "bg-sidebar-accent text-sidebar-accent-foreground"
                                : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                            )}
                          >
                            <FolderOpen className="h-4 w-4 shrink-0" />
                            <span className="truncate">{project.title}</span>
                          </button>
                        </SidebarMenuItem>
                      </Link>
                    )
                  })
                )}
              </SidebarMenu>
            </SidebarGroupContent>
          )}
        </SidebarGroup>

        {/* Project Sub-Navigation */}
        {isProjectRoute && currentProjectId && (
          <SidebarGroup>
            <SidebarGroupLabel className="text-muted-foreground px-3">Project Menu</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {PROJECT_SUB_ITEMS.map((item) => {
                  const Icon = item.icon
                  const href = item.href.replace("[id]", currentProjectId)
                  const isActive = pathname === href || pathname?.startsWith(href + "/")

                  return (
                    <NavButton
                      key={item.name}
                      href={href}
                      icon={Icon}
                      label={item.name}
                      isActive={isActive}
                    />
                  )
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border">
        <DropdownMenu>
          <DropdownMenuTrigger className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition">
            <Avatar className="h-6 w-6">
              <AvatarFallback className="bg-sidebar-primary text-sidebar-primary-foreground text-xs">
                {getInitials(user.name, user.email)}
              </AvatarFallback>
            </Avatar>
            <span className="truncate text-sm">{user.name || user.email}</span>
          </DropdownMenuTrigger>
          <DropdownMenuContent side="top" className="w-56">
            <div className="px-2 py-1.5 text-sm font-medium">{user.name}</div>
            <div className="px-2 py-1.5 text-xs text-muted-foreground">{user.email}</div>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => router.push("/settings")}
              className="flex items-center gap-2 cursor-pointer"
            >
              <Settings className="h-4 w-4" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => signOut({ callbackUrl: "/" })}
              className="text-destructive focus:text-destructive cursor-pointer"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarFooter>
    </Sidebar>
  )
}

export function AppSidebarInset({ children }: { children: React.ReactNode }) {
  return (
    <SidebarInset className="flex flex-col">
      <header className="flex h-14 shrink-0 items-center gap-2 border-b border-border px-4">
        <SidebarTrigger className="-ml-1" />
      </header>
      <div className="flex-1 overflow-auto">{children}</div>
    </SidebarInset>
  )
}
