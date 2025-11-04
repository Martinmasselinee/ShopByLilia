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

      console.log('[LOGIN] Login successful! Waiting for session to establish...')
      // Wait for session to be established server-side before redirecting
      // This prevents middleware from blocking the redirect
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      console.log('[LOGIN] Session should be established now, redirecting...')
      setIsLoading(false)
      console.log('[LOGIN] Redirecting to /admin/clients (middleware will redirect based on role)')
      window.location.href = '/admin/clients'
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

