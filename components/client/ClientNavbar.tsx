'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import { useNotifications } from '@/lib/hooks/useNotifications'

const navItems = [
  { href: '/client/profile', label: 'Profil', icon: '👤' },
  { href: '/client/mes-pieces', label: 'Mes Pièces', icon: '📸' },
  { href: '/client/propositions', label: 'Propositions', icon: '🛍️' },
]

export function ClientNavbar() {
  const pathname = usePathname()
  const { unreadCount } = useNotifications()

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="hidden md:block bg-white border-b border-accent sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/client/profile" className="text-xl font-bold text-primary">
              PersoShop
            </Link>
            <div className="flex space-x-8">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-3 py-2 rounded-lg font-medium transition-colors min-h-[44px] flex items-center ${
                    pathname === item.href
                      ? 'bg-primary text-white'
                      : 'text-text hover:bg-accent/50'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
              <button
                onClick={() => signOut({ callbackUrl: '/' })}
                className="px-3 py-2 rounded-lg font-medium text-text hover:bg-accent/50 transition-colors min-h-[44px] flex items-center"
              >
                Déconnexion
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-accent z-50">
        <div className="flex justify-around items-center h-16">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center flex-1 h-full min-h-[44px] transition-colors ${
                pathname === item.href
                  ? 'text-primary'
                  : 'text-text/60'
              }`}
            >
              <span className="text-2xl mb-1 relative">
                {item.icon}
                {item.href === '/client/propositions' && unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </span>
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          ))}
        </div>
      </nav>
    </>
  )
}

