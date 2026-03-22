"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

interface EmptyStateProps {
  icon: React.ReactNode
  title: string
  description: string
  action?: {
    label: string
    href?: string
    onClick?: () => void
  }
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <Card className="border-dashed">
      <CardContent className="flex flex-col items-center justify-center py-16 px-8">
        <div className="text-muted-foreground mb-4">{icon}</div>
        <h3 className="text-lg font-semibold mb-2">{title}</h3>
        <p className="text-sm text-muted-foreground text-center max-w-sm mb-6">
          {description}
        </p>
        {action && (
          action.href ? (
            <Link href={action.href}>
              <Button>{action.label}</Button>
            </Link>
          ) : (
            <Button onClick={action.onClick}>{action.label}</Button>
          )
        )}
      </CardContent>
    </Card>
  )
}
