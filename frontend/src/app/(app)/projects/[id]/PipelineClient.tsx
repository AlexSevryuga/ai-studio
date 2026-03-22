"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PipelineView, KPICard } from "@/components/pipeline-view"
import { OrchestratorChat } from "@/components/orchestrator-chat"
import {
  FileText,
  MapPin,
  Clapperboard,
  PenTool,
  Film,
  BookOpen,
  ArrowRight,
} from "lucide-react"

interface ProjectClientProps {
  projectId: string
  projectTitle: string
  projectDescription?: string
  projectStatus: string
  projectSourceText?: string
  characters: number
  locations: number
  scenes: number
  scripts: number
  clips: number
}

export function ProjectClient({
  projectId,
  projectTitle,
  projectDescription,
  projectStatus,
  projectSourceText,
  characters,
  locations,
  scenes,
  scripts,
  clips,
}: ProjectClientProps) {
  const [isRunning, setIsRunning] = useState(false)

  async function handleRunNext() {
    setIsRunning(true)
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
      await fetch(`${baseUrl}/api/projects/${projectId}/orchestrate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          command: projectStatus === "draft" ? "ingest_and_extract" : "generate_story_structure",
          params: {},
        }),
      })
    } catch {
      console.error("Failed to run command")
    } finally {
      setIsRunning(false)
    }
  }

  const statusBadgeClass =
    projectStatus === "complete"
      ? "bg-green-500/10 text-green-500"
      : projectStatus === "parsing"
        ? "bg-blue-500/10 text-blue-500"
        : projectStatus === "scripting"
          ? "bg-yellow-500/10 text-yellow-500"
          : projectStatus === "rendering"
            ? "bg-purple-500/10 text-purple-500"
            : "bg-muted text-muted-foreground"

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold">{projectTitle}</h1>
          <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${statusBadgeClass}`}>
            {projectStatus}
          </span>
        </div>
        {projectDescription && (
          <p className="text-muted-foreground">{projectDescription}</p>
        )}
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <BookOpen className="h-4 w-4" />
            {projectSourceText ? "Text loaded" : "No text uploaded"}
          </span>
        </div>
      </div>

      {/* Pipeline View */}
      <PipelineView
        projectId={projectId}
        currentStatus={projectStatus}
        onRunNext={handleRunNext}
        isRunning={isRunning}
      />

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <KPICard
          label="Characters"
          value={characters}
          icon={FileText}
          href={`/projects/${projectId}/characters`}
        />
        <KPICard
          label="Locations"
          value={locations}
          icon={MapPin}
          href={`/projects/${projectId}/locations`}
        />
        <KPICard
          label="Scenes"
          value={scenes}
          icon={Clapperboard}
          href={`/projects/${projectId}/scenes`}
        />
        <KPICard
          label="Scripts"
          value={scripts}
          icon={PenTool}
          href={`/projects/${projectId}/scenes`}
        />
        <KPICard
          label="Clips"
          value={clips}
          icon={Film}
          href={`/projects/${projectId}/vision`}
        />
      </div>

      {/* Quick Navigation */}
      <div className="grid gap-4 md:grid-cols-3">
        <Link href={`/projects/${projectId}/story`}>
          <Card className="hover:bg-muted/30 transition-colors h-full">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Story</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">3 Acts</p>
              <p className="text-xs text-muted-foreground mt-1">View story structure</p>
            </CardContent>
          </Card>
        </Link>

        <Link href={`/projects/${projectId}/scenes`}>
          <Card className="hover:bg-muted/30 transition-colors h-full">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Scenes</CardTitle>
              <Clapperboard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{scenes}</p>
              <p className="text-xs text-muted-foreground mt-1">Browse all scenes</p>
            </CardContent>
          </Card>
        </Link>

        <Link href={`/projects/${projectId}/vision`}>
          <Card className="hover:bg-muted/30 transition-colors h-full">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Vision</CardTitle>
              <Film className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{clips}</p>
              <p className="text-xs text-muted-foreground mt-1">Generate video clips</p>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Orchestrator Chat */}
      <OrchestratorChat projectId={projectId} />
    </div>
  )
}
