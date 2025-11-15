import { Link, Outlet, createFileRoute } from '@tanstack/react-router'
import { ShieldAlert } from 'lucide-react'
import { useRequireAdmin } from '../../../hooks/useRequireAdmin'

export const Route = createFileRoute('/_authenticated/dashboard/admin')({
  component: AdminLayout,
})

function AdminLayout() {
  const { isLoading, isAdmin } = useRequireAdmin()

  // Show loading state while checking admin access
  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
          <p className="mt-4 text-muted-foreground">Verifying access...</p>
        </div>
      </div>
    )
  }

  // Show access denied if not admin (before redirect completes)
  if (!isAdmin) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center max-w-md p-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-destructive/10 mb-4">
            <ShieldAlert className="w-8 h-8 text-destructive" />
          </div>
          <h2 className="text-2xl font-semibold text-foreground mb-2">
            Access Denied
          </h2>
          <p className="text-muted-foreground">
            You don't have permission to access the admin panel. Please contact
            an administrator if you believe this is an error.
          </p>
        </div>
      </div>
    )
  }

  // Render admin panel for authorized users
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
          <Link
            to="/dashboard/admin/users"
            className="py-4 px-2 text-sm font-medium text-muted-foreground hover:text-foreground border-b-2 border-transparent transition-colors cursor-pointer"
            activeProps={{
              className:
                'py-4 px-2 text-sm font-medium text-primary border-b-2 border-primary',
            }}
          >
            Users
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
