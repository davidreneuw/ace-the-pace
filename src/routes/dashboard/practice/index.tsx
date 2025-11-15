import { createFileRoute } from '@tanstack/react-router'
import { BookOpen } from 'lucide-react'

export const Route = createFileRoute('/dashboard/practice/')({
  component: PracticePage,
})

function PracticePage() {
  return (
    <div className="p-6 h-full overflow-y-auto">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <BookOpen className="text-primary" size={32} />
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Practice Sessions
            </h1>
            <p className="text-muted-foreground">
              Start a new practice session
            </p>
          </div>
        </div>

        {/* Placeholder content */}
        <div className="bg-card border border-border rounded-lg p-12 text-center">
          <BookOpen className="mx-auto mb-4 text-muted-foreground" size={64} />
          <h2 className="text-xl font-semibold text-foreground mb-2">
            Coming Soon
          </h2>
          <p className="text-muted-foreground">
            This page will allow you to start practice sessions with customizable
            question sets.
          </p>
        </div>
      </div>
    </div>
  )
}
