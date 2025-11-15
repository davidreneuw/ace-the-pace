import { useAuth } from '@workos-inc/authkit-react'
import { useQuery } from 'convex/react'
import { api } from '../../convex/_generated/api'

/**
 * Hook that checks if the current user has admin role.
 * Does NOT redirect - use for conditional rendering only.
 * For protected routes, use useRequireAdmin instead.
 */
export function useIsAdmin() {
  const auth = useAuth()

  // Get user from Convex by WorkOS user ID
  const convexUser = useQuery(
    api.users.getUserByWorkosId,
    auth.user?.id ? { workosUserId: auth.user.id } : 'skip',
  )

  const isLoading = auth.isLoading || convexUser === undefined
  const isAdmin = convexUser?.roles.includes('admin') ?? false

  return {
    isLoading,
    isAdmin,
    user: auth.user,
    convexUser,
  }
}
