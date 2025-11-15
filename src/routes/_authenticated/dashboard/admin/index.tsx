import { Navigate, createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/dashboard/admin/')({
  component: () => <Navigate to="/dashboard/admin/questions" />,
})
