import { createFileRoute, Link, Outlet, useLocation } from '@tanstack/react-router'

export const Route = createFileRoute('/dashboard/questions')({
  component: QuestionsLayout,
})

function QuestionsLayout() {
  const location = useLocation()

  // Hide tabs when on the answer view
  const showTabs = !location.pathname.includes('/answer/')

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Sub-navigation tabs */}
      {showTabs && (
        <div className="border-b border-border bg-card px-6 flex-shrink-0">
          <div className="flex gap-6">
            <Link
              to="/dashboard/questions/practice"
              className="py-4 px-2 text-sm font-medium text-muted-foreground hover:text-foreground border-b-2 border-transparent transition-colors cursor-pointer"
              activeProps={{
                className:
                  'py-4 px-2 text-sm font-medium text-primary border-b-2 border-primary',
              }}
            >
              Practice
            </Link>
            <Link
              to="/dashboard/questions/bank"
              className="py-4 px-2 text-sm font-medium text-muted-foreground hover:text-foreground border-b-2 border-transparent transition-colors cursor-pointer"
              activeProps={{
                className:
                  'py-4 px-2 text-sm font-medium text-primary border-b-2 border-primary',
              }}
            >
              Question Bank
            </Link>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        <Outlet />
      </div>
    </div>
  )
}
