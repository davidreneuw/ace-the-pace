import { createRouter } from '@tanstack/react-router'

// Import the generated route tree
import { routeTree } from './routeTree.gen'
import { RouterContext } from './routes/__root'

// Create the router instance with default context
// The AuthContextSync component will update this with real auth state
export const router = createRouter({
  routeTree,
  context: {
    auth: {
      user: null,
      isLoading: true,
      signIn: () => {},
      signOut: () => {},
    },
  },
  scrollRestoration: true,
  defaultPreloadStaleTime: 0,
})

// Export as getRouter for TanStack Start compatibility
export const getRouter = () => router

// Register router type for type safety
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}
