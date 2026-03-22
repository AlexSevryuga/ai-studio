"use client"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Upload,
  FileText,
  Layers,
  PenTool,
  Wand2,
  Film,
  Check,
  Loader2,
  Lock,
  Play,
} from "lucide-react"

interface PipelineStep {
  id: string
  name: string
  icon: React.ElementType
  status?: "idle" | "ready" | "running" | "done"
  count?: number
}

interface PipelineViewProps {
  projectId: string
  currentStatus: string
  onRunNext: () => void
  isRunning?: boolean
}

const PIPELINE_STEPS: PipelineStep[] = [
  { id: "upload", name: "Upload Book", icon: Upload },
  { id: "parse", name: "Parse & Extract", icon: FileText },
  { id: "story", name: "Story Structure", icon: Layers },
  { id: "script", name: "Screenplay", icon: PenTool },
  { id: "vision", name: "Vision Prompts", icon: Wand2 },
  { id: "render", name: "Video Render", icon: Film },
  { id: "assembly", name: "Assembly", icon: Check },
]

const STATUS_TO_STEP_INDEX: Record<string, number> = {
  draft: 0,
  parsing: 1,
  scripting: 2,
  rendering: 3,
  complete: 6,
}

function getStepStatus(
  stepIndex: number,
  currentStatus: string,
  projectId: string,
  hasSourceText?: boolean
): "idle" | "ready" | "running" | "done" {
  const currentStepIndex = hasSourceText
    ? STATUS_TO_STEP_INDEX[currentStatus] ?? 0
    : 0

  if (stepIndex < currentStepIndex) return "done"
  if (stepIndex === currentStepIndex) {
    if (currentStatus === "parsing" || currentStatus === "scripting" || currentStatus === "rendering") {
      return "running"
    }
    return "ready"
  }
  return "idle"
}

export function PipelineView({
  projectId,
  currentStatus,
  onRunNext,
  isRunning,
}: PipelineViewProps) {
  const currentStepIndex = STATUS_TO_STEP_INDEX[currentStatus] ?? 0
  const hasSourceText = currentStepIndex > 0 || currentStatus !== "draft"

  return (
    <div className="space-y-6">
      {/* Pipeline Steps */}
      <div className="relative">
        <div className="flex overflow-x-auto pb-4 gap-2">
          {PIPELINE_STEPS.map((step, index) => {
            const Icon = step.icon
            const status = getStepStatus(
              index,
              currentStatus,
              projectId,
              hasSourceText
            )

            return (
              <div key={step.id} className="flex items-center">
                <div
                  className={cn(
                    "flex flex-col items-center gap-2 p-4 rounded-lg border min-w-[120px] transition-all duration-300",
                    status === "idle" &&
                      "bg-muted/30 border-muted text-muted-foreground cursor-not-allowed",
                    status === "ready" &&
                      "bg-card border-primary/50 text-foreground hover:border-primary hover:bg-primary/5 cursor-pointer",
                    status === "running" &&
                      "bg-primary/10 border-primary text-primary animate-pulse-ring",
                    status === "done" &&
                      "bg-green-500/10 border-green-500/50 text-green-500"
                  )}
                >
                  <div className="relative">
                    {status === "running" ? (
                      <Loader2 className="h-6 w-6 animate-spin" />
                    ) : status === "done" ? (
                      <Icon className="h-6 w-6" />
                    ) : status === "idle" ? (
                      <Icon className="h-6 w-6 opacity-50" />
                    ) : (
                      <Icon className="h-6 w-6" />
                    )}
                  </div>
                  <span
                    className={cn(
                      "text-xs font-medium text-center",
                      status === "idle" && "text-muted-foreground"
                    )}
                  >
                    {step.name}
                  </span>
                  {status === "done" && (
                    <div className="absolute -top-1 -right-1 h-4 w-4 bg-green-500 rounded-full flex items-center justify-center">
                      <Check className="h-2.5 w-2.5 text-white" />
                    </div>
                  )}
                  {status === "ready" && (
                    <div className="absolute -top-1 -right-1 h-4 w-4 bg-primary rounded-full flex items-center justify-center">
                      <Play className="h-2.5 w-2.5 text-primary-foreground" />
                    </div>
                  )}
                </div>

                {/* Connector */}
                {index < PIPELINE_STEPS.length - 1 && (
                  <div
                    className={cn(
                      "w-8 h-0.5 mx-1 flex-shrink-0",
                      index < currentStepIndex
                        ? "bg-green-500"
                        : "bg-muted"
                    )}
                  />
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex items-center gap-4">
        <Button
          onClick={onRunNext}
          disabled={isRunning || currentStatus === "complete"}
          className="gap-2"
        >
          {isRunning ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Running...
            </>
          ) : (
            <>
              <Play className="h-4 w-4" />
              Run Next Step
            </>
          )}
        </Button>
        <span className="text-sm text-muted-foreground">
          {currentStatus === "complete"
            ? "Pipeline complete!"
            : "Use the orchestrator chat to run specific commands"}
        </span>
      </div>
    </div>
  )
}

interface KPICardProps {
  label: string
  value: number
  icon: React.ElementType
  href?: string
}

export function KPICard({ label, value, icon: Icon, href }: KPICardProps) {
  const content = (
    <Card className="hover:bg-muted/30 transition-colors">
      <CardContent className="flex flex-row items-center justify-between py-4">
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="text-2xl font-bold">{value}</p>
        </div>
        <Icon className="h-8 w-8 text-muted-foreground/50" />
      </CardContent>
    </Card>
  )

  if (href) {
    return <a href={href}>{content}</a>
  }

  return content
}
