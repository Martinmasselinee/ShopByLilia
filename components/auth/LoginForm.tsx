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
    console.log('[LOGIN] Starting login process...', { email, timestamp: new Date().toISOString() })
    setError('')
    setIsLoading(true)

    try {
      console.log('[LOGIN] Calling signIn...')
      
      // Add timeout to signIn to prevent infinite loading
      const signInPromise = signIn('credentials', {
        email,
        password,
        redirect: false,
      })
      
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => {
          reject(new Error('SignIn timeout after 10 seconds'))
        }, 10000)
      })
      
      const result = await Promise.race([signInPromise, timeoutPromise]) as any
      console.log('[LOGIN] signIn result:', { 
        ok: result?.ok, 
        error: result?.error, 
        status: result?.status,
        url: result?.url,
        timestamp: new Date().toISOString()
      })

      if (result?.error) {
        console.error('[LOGIN] signIn error:', result.error)
        setError('Email ou mot de passe incorrect')
        setIsLoading(false)
        return
      }

      if (!result?.ok) {
        console.error('[LOGIN] signIn not ok:', result)
        setError('Erreur de connexion')
        setIsLoading(false)
        return
      }

      console.log('[LOGIN] Waiting for session to be established...')
      // Wait a bit for session to be established, then fetch user role
      await new Promise(resolve => setTimeout(resolve, 200))
      
      try {
        console.log('[LOGIN] Fetching user role from /api/auth/user...')
        const userResponse = await fetch('/api/auth/user')
        console.log('[LOGIN] User API response:', { 
          ok: userResponse.ok, 
          status: userResponse.status, 
          statusText: userResponse.statusText,
          timestamp: new Date().toISOString()
        })
        
        if (!userResponse.ok) {
          const errorText = await userResponse.text()
          console.error('[LOGIN] User API error:', { 
            status: userResponse.status, 
            error: errorText 
          })
          // If API fails, try to redirect anyway - session should work
          // Middleware will handle redirect based on role
          setIsLoading(false)
          console.log('[LOGIN] Redirecting to /client/profile (fallback)')
          window.location.href = '/client/profile'
          return
        }
        
        const userData = await userResponse.json()
        console.log('[LOGIN] User data received:', { 
          id: userData?.id, 
          email: userData?.email, 
          role: userData?.role,
          timestamp: new Date().toISOString()
        })
        
        setIsLoading(false)
        
        if (userData?.role === 'ADMIN') {
          console.log('[LOGIN] Redirecting to /admin/clients')
          window.location.href = '/admin/clients'
        } else {
          console.log('[LOGIN] Redirecting to /client/profile')
          window.location.href = '/client/profile'
        }
      } catch (fetchError) {
        // If fetch fails, redirect to client profile as fallback
        // The session should still work and middleware will redirect if needed
        console.error('[LOGIN] Error fetching user role:', fetchError)
        setIsLoading(false)
        console.log('[LOGIN] Redirecting to /client/profile (catch fallback)')
        window.location.href = '/client/profile'
      }
    } catch (timeoutError: any) {
      console.error('[LOGIN] signIn timeout or error:', timeoutError)
      if (timeoutError?.message?.includes('timeout')) {
        setError('La connexion a pris trop de temps. Vérifiez votre connexion internet et les logs Vercel.')
      } else {
        setError('Une erreur est survenue lors de la connexion.')
      }
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

