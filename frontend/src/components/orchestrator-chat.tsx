"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"
import { MessageSquare, Send, Bot, User, Loader2, X } from "lucide-react"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
}

interface ActionLog {
  id: string
  tool: string
  arguments: Record<string, unknown>
  result: string
  timestamp: Date
}

interface OrchestratorChatProps {
  projectId: string
  className?: string
}

const COMMANDS = [
  { value: "ingest_and_extract", label: "Ingest & Extract", description: "Extract characters and locations from book" },
  { value: "generate_story_structure", label: "Generate Story", description: "Create story structure with scenes" },
  { value: "generate_script", label: "Write Script", description: "Generate script for a scene" },
  { value: "generate_vision_prompts", label: "Vision Prompts", description: "Create video generation prompts" },
]

export function OrchestratorChat({ projectId, className }: OrchestratorChatProps) {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [actionLog, setActionLog] = useState<ActionLog[]>([])
  const [showCommands, setShowCommands] = useState(true)

  async function handleCommand(command: string) {
    setIsLoading(true)
    setShowCommands(false)
    setMessages((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        role: "user",
        content: `Run ${command.replace(/_/g, " ")}`,
        timestamp: new Date(),
      },
    ])

    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
      const res = await fetch(`${baseUrl}/api/projects/${projectId}/orchestrate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          command,
          params: {},
        }),
      })

      const data = await res.json()

      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: data.message || data.results?.message || "Command executed",
          timestamp: new Date(),
        },
      ])

      if (data.results?.actions) {
        setActionLog(data.results.actions)
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: "Error executing command. Please try again.",
          timestamp: new Date(),
        },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  async function handleSend() {
    if (!input.trim() || isLoading) return

    const userMessage = input.trim()
    setInput("")
    setIsLoading(true)
    setShowCommands(false)

    setMessages((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        role: "user",
        content: userMessage,
        timestamp: new Date(),
      },
    ])

    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
      const res = await fetch(`${baseUrl}/api/projects/${projectId}/orchestrate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          command: "chat",
          params: { message: userMessage },
        }),
      })

      const data = await res.json()

      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: data.message || "Response received",
          timestamp: new Date(),
        },
      ])
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: "Error sending message. Please try again.",
          timestamp: new Date(),
        },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button size="icon" className={cn("fixed right-4 bottom-4 z-50 h-12 w-12 rounded-full shadow-lg", className)}>
          <MessageSquare className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent className="flex flex-col w-full sm:max-w-[540px] p-0">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <div className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-primary" />
            <span className="font-semibold">AI Orchestrator</span>
          </div>
          <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => setOpen(false)}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {showCommands && messages.length === 0 && (
          <div className="flex-1 overflow-y-auto p-4">
            <h3 className="mb-4 font-medium">Available Commands</h3>
            <div className="grid gap-3">
              {COMMANDS.map((cmd) => (
                <Card
                  key={cmd.value}
                  className="cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => handleCommand(cmd.value)}
                >
                  <CardHeader className="p-4 pb-2">
                    <CardTitle className="text-sm">{cmd.label}</CardTitle>
                    <CardDescription className="text-xs">
                      {cmd.description}
                    </CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </div>
        )}

        <ScrollArea className="flex-1 px-4">
          <div className="space-y-4 py-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  "flex gap-3",
                  message.role === "user" && "flex-row-reverse"
                )}
              >
                <Avatar className="h-8 w-8">
                  <AvatarFallback className={message.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"}>
                    {message.role === "user" ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                  </AvatarFallback>
                </Avatar>
                <div
                  className={cn(
                    "rounded-lg px-3 py-2 text-sm max-w-[80%]",
                    message.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  )}
                >
                  {message.content}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-muted">
                    <Bot className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
                <div className="rounded-lg bg-muted px-3 py-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {actionLog.length > 0 && (
          <div className="border-t px-4 py-3">
            <details className="mb-3">
              <summary className="cursor-pointer text-sm font-medium">
                Action Log ({actionLog.length})
              </summary>
              <div className="mt-2 space-y-2">
                {actionLog.map((action, i) => (
                  <div key={action.id || i} className="rounded bg-muted p-2 text-xs">
                    <span className="font-medium">{action.tool}</span>
                    <pre className="mt-1 overflow-x-auto text-muted-foreground">
                      {JSON.stringify(action.arguments, null, 2)}
                    </pre>
                  </div>
                ))}
              </div>
            </details>
          </div>
        )}

        <div className="border-t p-4">
          <div className="flex gap-2">
            <Input
              placeholder="Type a message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              disabled={isLoading}
            />
            <Button size="icon" onClick={handleSend} disabled={isLoading || !input.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
