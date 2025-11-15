import { useRouter } from '@tanstack/react-router'
import { AuthKitProvider } from '@workos-inc/authkit-react'

const VITE_WORKOS_CLIENT_ID = import.meta.env.VITE_WORKOS_CLIENT_ID
if (!VITE_WORKOS_CLIENT_ID) {
  throw new Error('Add your WorkOS Client ID to the .env.local file')
}

const VITE_WORKOS_API_HOSTNAME = import.meta.env.VITE_WORKOS_API_HOSTNAME
if (!VITE_WORKOS_API_HOSTNAME) {
  throw new Error('Add your WorkOS API Hostname to the .env.local file')
}

const VITE_WORKOS_REDIRECT_URI = import.meta.env.VITE_WORKOS_REDIRECT_URI

// Validate that the redirect URL is safe (prevents open redirect attacks)
function isValidRedirectUrl(url: string): boolean {
  try {
    // Must start with / (internal path)
    if (!url.startsWith('/')) {
      return false
    }

    // Must not contain double slashes (could be protocol://domain)
    if (url.includes('//')) {
      return false
    }

    // Verify it's a valid internal URL
    const fullUrl = new URL(url, window.location.origin)
    return fullUrl.origin === window.location.origin
  } catch {
    return false
  }
}

// Inner component that has access to router
function WorkOSProviderWithRouter({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  return (
    <AuthKitProvider
      clientId={VITE_WORKOS_CLIENT_ID}
      apiHostname={VITE_WORKOS_API_HOSTNAME}
      redirectUri={VITE_WORKOS_REDIRECT_URI}
      onRedirectCallback={({ state }) => {
        let returnTo = state?.returnTo || '/dashboard'

        if (!isValidRedirectUrl(returnTo)) {
          returnTo = '/dashboard'
        }

        setTimeout(() => {
          router.navigate({ to: returnTo })
        }, 0)
      }}
    >
      {children}
    </AuthKitProvider>
  )
}

export default function AppWorkOSProvider({
  children,
}: {
  children: React.ReactNode
}) {
  return <WorkOSProviderWithRouter>{children}</WorkOSProviderWithRouter>
}
