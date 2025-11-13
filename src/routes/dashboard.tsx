import { createFileRoute, Outlet } from '@tanstack/react-router'
import DashboardSidebar from '../components/DashboardSidebar'

export const Route = createFileRoute('/dashboard')({
  component: DashboardLayout,
})

function DashboardLayout() {
  return (
    <div className="flex h-screen">
      <DashboardSidebar />
      <main className="flex-1 lg:ml-0 h-full overflow-hidden">
        <Outlet />
      </main>
    </div>
  )
}
