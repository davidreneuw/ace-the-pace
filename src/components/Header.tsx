import { Link, useLocation } from '@tanstack/react-router'
import WorkOSHeader from './workos-user.tsx'
import { GraduationCap } from 'lucide-react'

export default function Header() {
  const location = useLocation()
  const isDashboard = location.pathname.startsWith('/dashboard')

  return (
    <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 h-12 flex items-center justify-between">
        <Link
          to="/"
          className={`flex items-center gap-2 hover:opacity-80 transition-opacity ${isDashboard ? 'ml-11' : ''}`}
        >
          <GraduationCap size={24} className="text-primary" />
          <span className="text-lg font-bold text-foreground">Ace the PACE</span>
        </Link>

        <div className="flex items-center gap-4">
          <WorkOSHeader />
        </div>
      </div>
    </header>
  )
}
