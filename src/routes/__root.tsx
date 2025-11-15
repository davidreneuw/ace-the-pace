import { TanStackDevtools } from '@tanstack/react-devtools'
import {
  HeadContent,
  Outlet,
  Scripts,
  createRootRouteWithContext,
} from '@tanstack/react-router'
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'
import { useAuth } from '@workos-inc/authkit-react'
import { useEffect } from 'react'

import ConvexProvider from '../integrations/convex/provider'
import WorkOSProvider from '../integrations/workos/provider'

import { router } from '../router'
import appCss from '../styles.css?url'

// Define router context interface for type-safe auth state
export interface RouterContext {
  auth: {
    user: any | null
    isLoading: boolean
    signIn: (options?: { state?: any }) => void
    signOut: () => void
  }
}

export const Route = createRootRouteWithContext<RouterContext>()({
  head: () => ({
    meta: [
      {
        charSet: 'utf-8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      {
        title: 'Ace the PACE - Canadian Physician Assistant Exam Practice',
      },
      {
        name: 'description',
        content:
          'Master the Canadian Physician Assistant Certification Exam (PACE) with comprehensive practice questions, detailed explanations, and performance tracking.',
      },
    ],
    links: [
      {
        rel: 'stylesheet',
        href: appCss,
      },
      {
        rel: 'icon',
        href: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">🎓</text></svg>',
      },
    ],
  }),

  shellComponent: RootDocument,
  component: RootComponent,
})

// Component to sync auth context to router
function AuthContextSync({ children }: { children: React.ReactNode }) {
  const auth = useAuth()

  useEffect(() => {
    // Update router context with auth state
    // This makes auth available to all route beforeLoad hooks
    router.update({
      context: {
        auth: {
          user: auth.user,
          isLoading: auth.isLoading,
          signIn: auth.signIn,
          signOut: auth.signOut,
        },
      },
    })
  }, [auth.user, auth.isLoading, auth.signIn, auth.signOut])

  return <>{children}</>
}

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        <WorkOSProvider>
          <AuthContextSync>
            <ConvexProvider>
              {children}
              <TanStackDevtools
                config={{
                  position: 'bottom-right',
                }}
                plugins={[
                  {
                    name: 'Tanstack Router',
                    render: <TanStackRouterDevtoolsPanel />,
                  },
                ]}
              />
            </ConvexProvider>
          </AuthContextSync>
        </WorkOSProvider>
        <Scripts />
      </body>
    </html>
  )
}

function RootComponent() {
  // This component is rendered inside WorkOSProvider
  // so we can access auth state from WorkOS
  // The auth context is available to child routes via useRouteContext()
  return <Outlet />
}
