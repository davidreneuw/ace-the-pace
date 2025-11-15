import { TanStackDevtools } from '@tanstack/react-devtools'
import { HeadContent, Scripts, createRootRouteWithContext } from '@tanstack/react-router'
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'


import WorkOSProvider from '../integrations/workos/provider'

import ConvexProvider from '../integrations/convex/provider'

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
        content: 'Master the Canadian Physician Assistant Certification Exam (PACE) with comprehensive practice questions, detailed explanations, and performance tracking.',
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
})

function RootDocument({ children }: { children: React.ReactNode }) {

  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        <WorkOSProvider>
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
        </WorkOSProvider>
        <Scripts />
      </body>
    </html>
  )
}
