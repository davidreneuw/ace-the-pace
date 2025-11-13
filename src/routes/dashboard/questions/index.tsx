import { createFileRoute, Navigate } from '@tanstack/react-router'

export const Route = createFileRoute('/dashboard/questions/')({
  component: () => <Navigate to="/dashboard/questions/bank" />,
})
