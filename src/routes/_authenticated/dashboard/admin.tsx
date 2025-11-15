import { Link, Outlet, createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/dashboard/admin')({
  component: AdminLayout,
})

function AdminLayout() {
  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Sub-navigation tabs */}
      <div className="border-b border-border bg-card px-6 flex-shrink-0">
        <div className="flex gap-6">
          <Link
            to="/dashboard/admin/questions"
            className="py-4 px-2 text-sm font-medium text-muted-foreground hover:text-foreground border-b-2 border-transparent transition-colors cursor-pointer"
            activeProps={{
              className:
                'py-4 px-2 text-sm font-medium text-primary border-b-2 border-primary',
            }}
          >
            Questions
          </Link>
          <Link
            to="/dashboard/admin/categories"
            className="py-4 px-2 text-sm font-medium text-muted-foreground hover:text-foreground border-b-2 border-transparent transition-colors cursor-pointer"
            activeProps={{
              className:
                'py-4 px-2 text-sm font-medium text-primary border-b-2 border-primary',
            }}
          >
            Categories
          </Link>
        </div>
      </div>

      {/* Admin content */}
      <div className="flex-1 overflow-hidden">
        <Outlet />
      </div>
    </div>
  )
}
