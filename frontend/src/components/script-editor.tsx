"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ChevronDown, Save, RotateCcw, Plus, Loader2 } from "lucide-react"

interface Script {
  id: string
  version: number
  content: string
  created_at?: string
}

interface ScriptEditorProps {
  sceneId: string
  scripts: Script[]
  onSave?: (content: string) => Promise<void>
  onGenerate?: () => Promise<void>
}

export function ScriptEditor({ sceneId, scripts, onSave, onGenerate }: ScriptEditorProps) {
  const [content, setContent] = useState(scripts[0]?.content || "")
  const [isSaving, setIsSaving] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [selectedVersion, setSelectedVersion] = useState(scripts[0]?.id || "")

  async function handleSave() {
    if (!onSave) return
    setIsSaving(true)
    try {
      await onSave(content)
    } finally {
      setIsSaving(false)
    }
  }

  async function handleGenerate() {
    if (!onGenerate) return
    setIsGenerating(true)
    try {
      await onGenerate()
    } finally {
      setIsGenerating(false)
    }
  }

  function handleRevert() {
    const script = scripts.find(s => s.id === selectedVersion)
    if (script) {
      setContent(script.content)
    }
  }

  function formatScreenplay(text: string) {
    // Simple formatting hints for screenplay style
    const lines = text.split("\n")
    return lines.map((line, i) => {
      const trimmed = line.trim()
      if (trimmed.startsWith("INT.") || trimmed.startsWith("EXT.") || trimmed.startsWith("INT/EXT")) {
        return <p key={i} className="font-bold uppercase text-primary my-2">{trimmed}</p>
      }
      if (trimmed.startsWith("(") && trimmed.endsWith(")")) {
        return <p key={i} className="italic text-muted-foreground ml-8 my-1">{trimmed}</p>
      }
      if (trimmed === trimmed.toUpperCase() && trimmed.length > 0 && !trimmed.includes(".")) {
        return <p key={i} className="text-center font-bold my-2">{trimmed}</p>
      }
      return <p key={i} className="ml-4 my-0.5">{line || "\u00A0"}</p>
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold">Script</h3>
          {scripts.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger className="inline-flex items-center justify-center rounded-md border border-input bg-background px-3 py-1.5 text-sm gap-1 hover:bg-muted">
                Version {scripts.find(s => s.id === selectedVersion)?.version || 1}
                <ChevronDown className="h-4 w-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {scripts.map((script) => (
                  <DropdownMenuItem
                    key={script.id}
                    onClick={() => {
                      setSelectedVersion(script.id)
                      setContent(script.content)
                    }}
                  >
                    Version {script.version}
                    {script.created_at && (
                      <span className="ml-2 text-xs text-muted-foreground">
                        {new Date(script.created_at).toLocaleDateString()}
                      </span>
                    )}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRevert}
            disabled={!selectedVersion}
            className="gap-1"
          >
            <RotateCcw className="h-4 w-4" />
            Revert
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleGenerate}
            disabled={isGenerating}
            className="gap-1"
          >
            {isGenerating ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Plus className="h-4 w-4" />
            )}
            Generate New
          </Button>
          <Button
            size="sm"
            onClick={handleSave}
            disabled={isSaving}
            className="gap-1"
          >
            {isSaving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            Save Draft
          </Button>
        </div>
      </div>

      <Textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        className="min-h-[400px] font-mono text-sm leading-relaxed"
        placeholder="Write your screenplay content here...

INT. COFFEE SHOP - DAY

JOHN sits alone at a table, staring at his phone.

SARAH
(approaching)
Mind if I join you?

JOHN
Please, sit."
      />

      {/* Preview Section */}
      {content && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Preview</CardTitle>
            <CardDescription className="text-xs">Screenplay-style formatting</CardDescription>
          </CardHeader>
          <CardContent className="font-mono text-sm leading-relaxed">
            {formatScreenplay(content)}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
