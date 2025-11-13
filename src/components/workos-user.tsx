import { useAuth } from '@workos-inc/authkit-react'

export default function SignInButton({ large }: { large?: boolean }) {
  const { user, isLoading, signIn, signOut } = useAuth()

  const buttonClasses = `${
    large ? 'px-6 py-3 text-base' : 'px-4 py-2 text-sm'
  } bg-primary hover:bg-primary/90 text-primary-foreground font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer`

  if (user) {
    return (
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          {user.profilePictureUrl && (
            <img
              src={user.profilePictureUrl}
              alt={`Avatar of ${user.firstName} ${user.lastName}`}
              className="w-8 h-8 rounded-full"
            />
          )}
          <span className="text-sm font-medium">{user.firstName} {user.lastName}</span>
        </div>
        <button onClick={() => signOut()} className={buttonClasses}>
          Sign Out
        </button>
      </div>
    )
  }

  return (
    <button
      onClick={() => {
        signIn()
      }}
      className={buttonClasses}
      disabled={isLoading}
    >
      Sign In {large && 'with AuthKit'}
    </button>
  )
}
