'use client'

import { PhotosGrid } from '@/components/client/PhotosGrid'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'

export default function MesPiecesPage() {
  return (
    <ProtectedRoute requiredRole="CLIENT">
      <div>
        <PhotosGrid />
      </div>
    </ProtectedRoute>
  )
}

