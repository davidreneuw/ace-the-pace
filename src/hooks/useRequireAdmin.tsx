import { useAuth } from '@workos-inc/authkit-react'
import { useQuery } from 'convex/react'
import { useEffect } from 'react'
import { useRouter } from '@tanstack/react-router'
import { api } from '../../convex/_generated/api'

/**
 * Hook that ensures the current user has admin role.
 * Redirects to dashboard if not admin.
 * Returns loading state and whether user is admin.
 */
export function useRequireAdmin() {
  const auth = useAuth()
  const router = useRouter()

  // Get user from Convex by WorkOS user ID
  const convexUser = useQuery(
    api.users.getUserByWorkosId,
    auth.user?.id ? { workosUserId: auth.user.id } : 'skip',
  )

  const isLoading = auth.isLoading || convexUser === undefined
  const isAdmin = convexUser?.roles.includes('admin') ?? false

  useEffect(() => {
    // Wait for both auth and convex user to load
    if (isLoading) return

    // If user exists in WorkOS but not admin in Convex, redirect
    if (auth.user && !isAdmin) {
      router.navigate({ to: '/dashboard' })
    }
  }, [isLoading, auth.user, isAdmin, router])

  return {
    isLoading,
    isAdmin,
    user: auth.user,
    convexUser,
  }
}
