'use client'

import { NotificationsList } from '@/components/admin/NotificationsList'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'

export default function NotificationsPage() {
  return (
    <ProtectedRoute requiredRole="ADMIN">
      <div>
        <NotificationsList />
      </div>
    </ProtectedRoute>
  )
}

