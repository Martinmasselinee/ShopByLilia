'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredRole?: 'ADMIN' | 'CLIENT'
}

export function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'loading') return

    if (!session) {
      console.log('[PROTECTED ROUTE] No session, redirecting to login')
      router.push('/login')
      return
    }

    if (requiredRole && session.user.role !== requiredRole) {
      console.log('[PROTECTED ROUTE] Wrong role, redirecting')
      if (session.user.role === 'ADMIN') {
        router.push('/admin/clients')
      } else {
        router.push('/client/profile')
      }
    }
  }, [session, status, router, requiredRole])

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-text-secondary">Chargement...</p>
        </div>
      </div>
    )
  }

  if (!session || (requiredRole && session.user.role !== requiredRole)) {
    return null
  }

  return <>{children}</>
}

