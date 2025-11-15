import { useAuth } from '@workos-inc/authkit-react'
import { ConvexProviderWithAuthKit } from '@convex-dev/workos'
import { ConvexReactClient } from 'convex/react'
import { useMemo } from 'react'

const CONVEX_URL = (import.meta as any).env.VITE_CONVEX_URL
if (!CONVEX_URL) {
  console.error('missing envar CONVEX_URL')
}

export default function AppConvexProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const convex = useMemo(
    () =>
      new ConvexReactClient(CONVEX_URL, {
        unsavedChangesWarning: false,
      }),
    [],
  )

  return (
    <ConvexProviderWithAuthKit client={convex} useAuth={useAuth}>
      {children}
    </ConvexProviderWithAuthKit>
  )
}
