'use client'

import { ClientsTable } from '@/components/admin/ClientsTable'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'

export default function ClientsPage() {
  return (
    <ProtectedRoute requiredRole="ADMIN">
      <div>
        <h1 className="text-3xl font-bold text-primary mb-8">Clients</h1>
        <ClientsTable />
      </div>
    </ProtectedRoute>
  )
}

