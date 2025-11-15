import { createFileRoute } from '@tanstack/react-router'
import { BarChart } from 'lucide-react'

export const Route = createFileRoute('/dashboard/performance/')({
  component: PerformancePage,
})

function PerformancePage() {
  return (
    <div className="p-6 h-full overflow-y-auto">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <BarChart className="text-primary" size={32} />
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Performance Analytics
            </h1>
            <p className="text-muted-foreground">
              Detailed insights into your study progress
            </p>
          </div>
        </div>

        {/* Placeholder content */}
        <div className="bg-card border border-border rounded-lg p-12 text-center">
          <BarChart className="mx-auto mb-4 text-muted-foreground" size={64} />
          <h2 className="text-xl font-semibold text-foreground mb-2">
            Coming Soon
          </h2>
          <p className="text-muted-foreground">
            This page will show detailed performance metrics, charts, and study
            history.
          </p>
        </div>
      </div>
    </div>
  )
}
