'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/shared/Button'
import { Input } from '@/components/shared/Input'

export function LoginForm() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      console.log('Attempting login for:', email)
      
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })

      console.log('SignIn result:', result)

      if (result?.error) {
        console.error('Login error:', result.error)
        setError(`Erreur de connexion: ${result.error}`)
        setIsLoading(false)
        return
      }

      if (!result?.ok) {
        console.error('Login failed:', result)
        setError('Échec de la connexion. Vérifiez vos identifiants.')
        setIsLoading(false)
        return
      }

      // Fetch user role to redirect correctly
      try {
        const userResponse = await fetch('/api/auth/user')
        console.log('User API response status:', userResponse.status)
        
        if (!userResponse.ok) {
          throw new Error(`HTTP ${userResponse.status}`)
        }
        
        const userData = await userResponse.json()
        console.log('User data:', userData)
        
        if (userData?.role === 'ADMIN') {
          router.push('/admin/clients')
        } else {
          router.push('/client/profile')
        }
        router.refresh()
      } catch (userErr) {
        console.error('Error fetching user:', userErr)
        // Still redirect even if user fetch fails
        router.push('/client/profile')
        router.refresh()
      }
    } catch (err) {
      console.error('Login exception:', err)
      setError('Erreur de connexion. Vérifiez votre connexion internet.')
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-md space-y-6">
      <div className="space-y-4">
        <Input
          type="email"
          label="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          placeholder="votre@email.com"
          autoComplete="email"
        />
        <Input
          type="password"
          label="Mot de passe"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          placeholder="••••••••"
          autoComplete="current-password"
        />
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
          {error}
        </div>
      )}

      <Button type="submit" isLoading={isLoading} className="w-full">
        Se connecter
      </Button>
    </form>
  )
}

