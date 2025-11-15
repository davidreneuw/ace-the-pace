import { Link } from '@tanstack/react-router'
import { useAuth } from '@workos-inc/authkit-react'
import { GraduationCap } from 'lucide-react'

export default function Header() {
  const { signIn } = useAuth()

  return (
    <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 h-12 flex items-center justify-between">
        <Link
          to="/"
          className={`flex items-center gap-2 hover:opacity-80 transition-opacity`}
        >
          <GraduationCap size={24} className="text-primary" />
          <span className="text-lg font-bold text-foreground">Ace the PACE</span>
        </Link>

        <div className="flex items-center gap-4">
          <button
            onClick={() => {
              var returnTo = window.location.pathname + "/dashboard"
              signIn({ state: { returnTo } })
            }}
            className="px-4 py-2 text-sm bg-primary hover:bg-primary/90 text-primary-foreground font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            Get Started
          </button>
        </div>
      </div>
    </header>
  )
}
