import { Outlet, createFileRoute } from '@tanstack/react-router'
import DashboardSidebar from '../../components/DashboardSidebar'

export const Route = createFileRoute('/_authenticated/dashboard')({
  component: DashboardLayout,
})

function DashboardLayout() {
  // Authentication is handled by parent _authenticated route
  return (
    <div className="flex h-screen">
      <DashboardSidebar />
      <main className="flex-1 lg:ml-0 h-full overflow-hidden">
        <Outlet />
      </main>
    </div>
  )
}
