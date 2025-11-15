// Global auth state that can be accessed synchronously outside of React components
// This allows beforeLoad guards to check auth status

export interface AuthState {
  user: any | null
  isLoading: boolean
  signIn: (options?: { state?: any }) => void
  signOut: () => void
}

let currentAuthState: AuthState = {
  user: null,
  isLoading: true,
  signIn: () => {},
  signOut: () => {},
}

export const setAuthState = (state: AuthState) => {
  currentAuthState = state
}

export const getAuthState = (): AuthState => {
  return currentAuthState
}
