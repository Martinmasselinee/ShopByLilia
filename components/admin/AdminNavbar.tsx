'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import { useState } from 'react'
import { useNotifications } from '@/lib/hooks/useNotifications'

const navItems = [
  { href: '/admin/clients', label: 'Clients' },
  { href: '/admin/notifications', label: 'Notifications' },
  { href: '/admin/echanges', label: 'Échanges' },
]

export function AdminNavbar() {
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { unreadCount } = useNotifications()

  return (
    <nav className="bg-white border-b border-accent sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/admin/clients" className="text-xl font-bold text-primary">
            PersoShop
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`px-3 py-2 rounded-lg font-medium transition-colors min-h-[44px] flex items-center relative ${
                  pathname === item.href
                    ? 'bg-primary text-white'
                    : 'text-text hover:bg-accent/50'
                }`}
              >
                {item.label}
                {item.href === '/admin/notifications' && unreadCount > 0 && (
                  <span className="ml-2 px-2 py-0.5 bg-red-500 text-white text-xs rounded-full min-w-[20px] text-center">
                    {unreadCount}
                  </span>
                )}
              </Link>
            ))}
            <button
              onClick={() => signOut({ callbackUrl: '/' })}
              className="px-3 py-2 rounded-lg font-medium text-text hover:bg-accent/50 transition-colors min-h-[44px] flex items-center"
            >
              Déconnexion
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-text hover:bg-accent/50 min-h-[44px] min-w-[44px] flex items-center justify-center"
            aria-label="Menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 space-y-2 border-t border-accent">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-4 py-3 rounded-lg font-medium transition-colors min-h-[44px] flex items-center ${
                  pathname === item.href
                    ? 'bg-primary text-white'
                    : 'text-text hover:bg-accent/50'
                }`}
              >
                {item.label}
                {item.href === '/admin/notifications' && unreadCount > 0 && (
                  <span className="ml-2 px-2 py-0.5 bg-red-500 text-white text-xs rounded-full min-w-[20px] text-center">
                    {unreadCount}
                  </span>
                )}
              </Link>
            ))}
            <button
              onClick={() => {
                setMobileMenuOpen(false)
                signOut({ callbackUrl: '/' })
              }}
              className="w-full text-left px-4 py-3 rounded-lg font-medium text-text hover:bg-accent/50 transition-colors min-h-[44px] flex items-center"
            >
              Déconnexion
            </button>
          </div>
        )}
      </div>
    </nav>
  )
}

