'use client'

import { PropositionsGrid } from '@/components/client/PropositionsGrid'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'

export default function PropositionsPage() {
  return (
    <ProtectedRoute requiredRole="CLIENT">
      <div>
        <PropositionsGrid />
      </div>
    </ProtectedRoute>
  )
}

