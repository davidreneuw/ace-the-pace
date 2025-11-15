import { useNavigate } from '@tanstack/react-router'
import { AuthKitProvider, useAuth } from '@workos-inc/authkit-react'
import { useEffect } from 'react'
import { setAuthState } from '../../lib/auth-state'

const VITE_WORKOS_CLIENT_ID = import.meta.env.VITE_WORKOS_CLIENT_ID
if (!VITE_WORKOS_CLIENT_ID) {
  throw new Error('Add your WorkOS Client ID to the .env.local file')
}

const VITE_WORKOS_API_HOSTNAME = import.meta.env.VITE_WORKOS_API_HOSTNAME
if (!VITE_WORKOS_API_HOSTNAME) {
  throw new Error('Add your WorkOS API Hostname to the .env.local file')
}

const VITE_WORKOS_REDIRECT_URI = import.meta.env.VITE_WORKOS_REDIRECT_URI

// Component to sync WorkOS auth state with global auth state
function AuthStateSync({ children }: { children: React.ReactNode }) {
  const auth = useAuth()

  useEffect(() => {
    // Update global auth state whenever WorkOS auth changes
    setAuthState({
      user: auth.user,
      isLoading: auth.isLoading,
      signIn: auth.signIn,
      signOut: auth.signOut,
    })
  }, [auth.user, auth.isLoading, auth.signIn, auth.signOut])

  return <>{children}</>
}

export default function AppWorkOSProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const navigate = useNavigate()

  return (
    <AuthKitProvider
      clientId={VITE_WORKOS_CLIENT_ID}
      apiHostname={VITE_WORKOS_API_HOSTNAME}
      redirectUri={VITE_WORKOS_REDIRECT_URI}
      onRedirectCallback={({ state }) => {
        console.log('WorkOS redirect callback received:', { state })

        // Try to get returnTo from state first, then from sessionStorage
        let returnTo = state?.returnTo

        if (returnTo) {
          console.log('Navigating to:', returnTo)
          navigate({ to: returnTo, reloadDocument: true })
        } else {
          console.log('No returnTo found, navigating to dashboard')
          navigate({ to: '/dashboard' })
        }
      }}
    >
      <AuthStateSync>{children}</AuthStateSync>
    </AuthKitProvider>
  )
}
