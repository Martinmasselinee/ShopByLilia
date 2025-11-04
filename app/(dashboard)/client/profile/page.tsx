'use client'

import { ProfileForm } from '@/components/client/ProfileForm'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'

export default function ProfilePage() {
  return (
    <ProtectedRoute requiredRole="CLIENT">
      <div>
        <h1 className="text-3xl font-bold text-primary mb-8">Mon Profil</h1>
        <ProfileForm />
      </div>
    </ProtectedRoute>
  )
}

