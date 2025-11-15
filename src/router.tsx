import { createRouter } from '@tanstack/react-router'

// Import the generated route tree
import { routeTree } from './routeTree.gen'
import { RouterContext } from './routes/__root'

// Default context for SSR or when auth is not yet initialized
const defaultContext: RouterContext = {
  auth: {
    user: null,
    isLoading: true,
    signIn: () => {},
    signOut: () => {},
  },
}

// Create a new router instance with optional auth context
// This allows the router to be created on the server (with default context)
// and updated on the client (with actual auth context)
export const getRouter = (context?: RouterContext) => {
  const router = createRouter({
    routeTree,
    context: context || defaultContext,
    scrollRestoration: true,
    defaultPreloadStaleTime: 0,
  })

  return router
}
