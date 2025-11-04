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
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        setError('Email ou mot de passe incorrect')
        setIsLoading(false)
        return
      }

      if (!result?.ok) {
        setError('Erreur de connexion')
        setIsLoading(false)
        return
      }

      // Wait a bit for session to be established, then fetch user role
      await new Promise(resolve => setTimeout(resolve, 200))
      
      try {
        const userResponse = await fetch('/api/auth/user')
        if (!userResponse.ok) {
          // If API fails, try to redirect anyway - session should work
          // Middleware will handle redirect based on role
          setIsLoading(false)
          window.location.href = '/client/profile'
          return
        }
        
        const userData = await userResponse.json()
        
        setIsLoading(false)
        
        if (userData?.role === 'ADMIN') {
          window.location.href = '/admin/clients'
        } else {
          window.location.href = '/client/profile'
        }
      } catch (fetchError) {
        // If fetch fails, redirect to client profile as fallback
        // The session should still work and middleware will redirect if needed
        console.error('Error fetching user role:', fetchError)
        setIsLoading(false)
        window.location.href = '/client/profile'
      }
    } catch (err) {
      console.error('Login error:', err)
      setError('Une erreur est survenue')
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

