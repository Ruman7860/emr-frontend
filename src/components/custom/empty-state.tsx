"use client"

import { Button } from "@/components/ui/button"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { FileSearch } from "lucide-react"

interface EmptyStateProps {
  title?: string
  description?: string
  actionLabel?: string
  onAction?: () => void
  icon?: React.ReactNode
}

export function EmptyState({
  title = "No data",
  description = "There’s nothing to show here yet.",
  actionLabel,
  onAction,
  icon,
}: EmptyStateProps) {
  const Icon = icon || <FileSearch className="h-6 w-6 text-muted-foreground" />

  return (
    <div className="flex justify-center">
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">{Icon}</EmptyMedia>
        </EmptyHeader>

        <EmptyTitle>{title}</EmptyTitle>
        <EmptyDescription>{description}</EmptyDescription>

        {actionLabel && onAction && (
          <EmptyContent>
            <Button size="sm" onClick={onAction}>
              {actionLabel}
            </Button>
          </EmptyContent>
        )}
      </Empty>
    </div>
  )
}
