'use client'

import { EchangeDetail } from '@/components/admin/EchangeDetail'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { use } from 'react'

export default function EchangeDetailPage({
  params,
}: {
  params: Promise<{ userId: string }>
}) {
  const { userId } = use(params)
  return (
    <ProtectedRoute requiredRole="ADMIN">
      <div>
        <h1 className="text-3xl font-bold text-primary mb-8">Échange</h1>
        <EchangeDetail userId={userId} />
      </div>
    </ProtectedRoute>
  )
}

