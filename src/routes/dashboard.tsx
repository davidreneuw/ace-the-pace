import { useUser } from '@/hooks/useUser'
import { createFileRoute, Outlet } from '@tanstack/react-router'
import DashboardSidebar from '../components/DashboardSidebar'

export const Route = createFileRoute('/dashboard')({
  component: DashboardLayout,
})

function DashboardLayout() {
  const user = useUser()
  // Show loading state while auth is initializing
  if (!user) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen">
      <DashboardSidebar />
      <main className="flex-1 lg:ml-0 h-full overflow-hidden">
        <Outlet />
      </main>
    </div>
  )
}
