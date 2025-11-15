import { Outlet, createFileRoute, useRouter } from '@tanstack/react-router'
import { useAuth } from '@workos-inc/authkit-react'
import { useEffect } from 'react'

export const Route = createFileRoute('/_authenticated')({
  component: AuthenticatedLayout,
})

function AuthenticatedLayout() {
  const auth = useAuth()
  const router = useRouter()

  useEffect(() => {
    // Once auth has loaded, redirect to sign in if not authenticated
    if (!auth.isLoading && !auth.user) {
      // Get the current URL path that user was trying to access
      const returnTo = router.state.location.pathname

      // Redirect to WorkOS sign in with returnTo in state
      // After auth, WorkOS will redirect to /api/auth/callback
      // Then onRedirectCallback will extract returnTo from state and navigate there
      auth.signIn({ state: { returnTo } })
    }
  }, [auth.isLoading, auth.user, auth.signIn, router.state.location.pathname])

  // Show loading state while auth is initializing
  if (auth.isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  // If not authenticated, show loading while redirect to sign in happens
  if (!auth.user) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
          <p className="mt-4 text-muted-foreground">
            Redirecting to sign in...
          </p>
        </div>
      </div>
    )
  }

  // Render the child routes
  return <Outlet />
}
