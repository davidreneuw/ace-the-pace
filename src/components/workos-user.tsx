import { useAuth } from '@workos-inc/authkit-react'

export default function SignInButton({ large }: { large?: boolean }) {
  const { signIn } = useAuth()

  const buttonClasses = `${
    large ? 'px-6 py-3 text-base' : 'px-4 py-2 text-sm'
  } bg-primary hover:bg-primary/90 text-primary-foreground font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer`

  return (
    <button
      onClick={() => {
        const returnTo = '/dashboard'
        signIn({ state: { returnTo } })
      }}
      className={buttonClasses}
    >
      Get Started
    </button>
  )
}
