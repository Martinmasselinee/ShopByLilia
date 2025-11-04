'use client'

import { EchangesList } from '@/components/admin/EchangesList'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'

export default function EchangesPage() {
  return (
    <ProtectedRoute requiredRole="ADMIN">
      <div>
        <EchangesList />
      </div>
    </ProtectedRoute>
  )
}

