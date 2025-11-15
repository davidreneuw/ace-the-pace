import { Link } from '@tanstack/react-router'
import { useAuth } from '@workos-inc/authkit-react'
import {
  BarChart,
  BookOpen,
  ChevronUp,
  FolderTree,
  GraduationCap,
  Home,
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
  Play,
  Settings,
} from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  {
    name: 'Practice Sessions',
    href: '/dashboard/practice',
    icon: Play,
  },
  { name: 'Question Bank', href: '/dashboard/questions', icon: BookOpen },
  { name: 'Categories', href: '/dashboard/categories', icon: FolderTree },
  { name: 'Performance', href: '/dashboard/performance', icon: BarChart },
]

const adminNavigation = {
  name: 'Admin Panel',
  href: '/dashboard/admin',
  icon: Settings,
}

export default function DashboardSidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const userMenuRef = useRef<HTMLDivElement>(null)

  const { user, signOut } = useAuth()

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(event.target as Node)
      ) {
        setIsUserMenuOpen(false)
      }
    }

    if (isUserMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isUserMenuOpen])

  return (
    <>
      {/* Mobile menu button - only visible on mobile when sidebar is hidden */}
      {!isMobileOpen && (
        <button
          onClick={() => setIsMobileOpen(true)}
          className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-card border border-border hover:bg-muted text-foreground rounded-lg transition-colors cursor-pointer shadow-lg"
          aria-label="Open menu"
        >
          <PanelLeftOpen size={20} />
        </button>
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:sticky top-0 left-0 h-screen bg-card border-r border-border
          transition-all duration-300 ease-in-out z-40
          ${isUserMenuOpen && isCollapsed ? 'overflow-visible' : 'overflow-x-hidden overflow-y-hidden'}
          ${isCollapsed ? 'lg:w-20' : 'lg:w-64'}
          ${isMobileOpen ? 'translate-x-0 w-64' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        <div
          className={`flex flex-col h-full ${isUserMenuOpen && isCollapsed ? 'overflow-visible' : 'overflow-x-hidden overflow-y-hidden'}`}
        >
          {/* Header with Logo and Menu Toggle */}
          <div className="px-4 py-[9px] border-b border-border flex-shrink-0">
            <div className="flex items-center gap-3">
              {/* Menu Toggle Button - Always in same position */}
              <button
                onClick={() => {
                  // On mobile, close the mobile menu
                  if (isMobileOpen) {
                    setIsMobileOpen(false)
                  } else {
                    // On desktop, toggle collapse
                    setIsCollapsed(!isCollapsed)
                  }
                }}
                className="flex items-center justify-center gap-3 px-3 py-2 rounded-lg hover:bg-muted transition-colors cursor-pointer flex-shrink-0"
                aria-label={
                  isMobileOpen
                    ? 'Close menu'
                    : isCollapsed
                      ? 'Expand sidebar'
                      : 'Collapse sidebar'
                }
              >
                {isMobileOpen || !isCollapsed ? (
                  <PanelLeftClose size={20} className="flex-shrink-0" />
                ) : (
                  <PanelLeftOpen size={20} className="flex-shrink-0" />
                )}
              </button>

              {/* Logo - Fades out when collapsed */}
              <Link
                to="/"
                className={`flex items-center gap-2 text-foreground hover:text-primary transition-all cursor-pointer flex-1 min-w-0 ${isCollapsed ? 'opacity-0 pointer-events-none' : 'opacity-100'
                  }`}
              >
                <GraduationCap
                  size={24}
                  className="text-primary flex-shrink-0"
                />
                <span className="font-bold text-lg whitespace-nowrap">
                  Ace the PACE
                </span>
              </Link>
            </div>
          </div>
          {/* Navigation items */}
          <nav className="flex-1 p-4 space-y-2 overflow-y-auto overflow-x-hidden">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                onClick={() => setIsMobileOpen(false)}
                className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground cursor-pointer"
                activeProps={{
                  className:
                    'flex items-center gap-3 px-3 py-2 rounded-lg bg-primary/10 text-primary font-medium',
                }}
                activeOptions={{
                  exact: item.href === '/dashboard',
                }}
              >
                <item.icon size={20} className="flex-shrink-0" />
                <span
                  className={`text-sm whitespace-nowrap transition-opacity ${isCollapsed ? 'opacity-0' : 'opacity-100'
                    }`}
                >
                  {item.name}
                </span>
              </Link>
            ))}
          </nav>

          {/* Admin Panel - At Bottom */}
          <div className="p-4 border-border flex-shrink-0">
            <Link
              to={adminNavigation.href}
              onClick={() => setIsMobileOpen(false)}
              className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground cursor-pointer"
              activeProps={{
                className:
                  'flex items-center gap-3 px-3 py-2 rounded-lg bg-primary/10 text-primary font-medium',
              }}
            >
              <adminNavigation.icon size={20} className="flex-shrink-0" />
              <span
                className={`text-sm whitespace-nowrap transition-opacity ${isCollapsed ? 'opacity-0' : 'opacity-100'
                  }`}
              >
                {adminNavigation.name}
              </span>
            </Link>
          </div>

          {/* User Section */}
          {user && (
            <div
              className="border-t border-border p-4 flex-shrink-0 relative"
              ref={userMenuRef}
            >
              {/* User Menu Popup */}
              {isUserMenuOpen && (
                <div
                  className={`bg-card border border-border rounded-lg shadow-lg overflow-hidden z-50 ${isCollapsed
                      ? 'fixed left-[5.5rem] bottom-5'
                      : 'absolute bottom-full left-4 right-4 mb-2'
                    }`}
                >
                  <button
                    onClick={() => {
                      signOut()
                      setIsUserMenuOpen(false)
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-muted transition-colors text-left cursor-pointer whitespace-nowrap"
                  >
                    <LogOut size={18} className="text-muted-foreground" />
                    <span className="text-sm text-foreground">Sign Out</span>
                  </button>
                </div>
              )}

              {/* User Info Button */}
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="w-full flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-muted transition-colors cursor-pointer"
              >
                {user.profilePictureUrl && (
                  <img
                    src={user.profilePictureUrl}
                    alt={`${user.firstName} ${user.lastName}`}
                    className="w-8 h-8 min-w-[2rem] min-h-[2rem] rounded-full object-cover flex-shrink-0"
                  />
                )}
                <div
                  className={`flex-1 text-left min-w-0 transition-all overflow-hidden ${isCollapsed
                      ? 'opacity-0 pointer-events-none w-0 min-w-0'
                      : 'opacity-100'
                    }`}
                >
                  <p className="text-sm font-medium text-foreground truncate whitespace-nowrap">
                    {user.firstName} {user.lastName}
                  </p>
                </div>
                <ChevronUp
                  size={16}
                  className={`transition-all flex-shrink-0 text-muted-foreground ${isUserMenuOpen ? 'rotate-180' : ''
                    } ${isCollapsed ? 'opacity-0 pointer-events-none w-0 min-w-0' : 'opacity-100'}`}
                />
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* Mobile overlay */}
      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-background/80 backdrop-blur-sm z-30"
          onClick={() => setIsMobileOpen(false)}
        />
      )}
    </>
  )
}
