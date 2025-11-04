'use client'

import { useState } from 'react'
import { signIn, useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/shared/Button'
import { Input } from '@/components/shared/Input'

export function LoginForm() {
  const router = useRouter()
  const { update } = useSession()
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
      
      // Poll session API until session is established (max 10 attempts = 5 seconds)
      let sessionEstablished = false
      for (let i = 0; i < 10; i++) {
        await new Promise(resolve => setTimeout(resolve, 500))
        console.log(`[LOGIN] Checking session (attempt ${i + 1}/10)...`)
        
        try {
          const sessionCheck = await fetch('/api/auth/session')
          if (sessionCheck.ok) {
            const sessionData = await sessionCheck.json()
            console.log('[LOGIN] Session check response:', { hasUser: !!sessionData?.user })
            if (sessionData?.user) {
              sessionEstablished = true
              console.log('[LOGIN] Session established!')
              break
            }
          }
        } catch (e) {
          console.log('[LOGIN] Session check failed:', e)
        }
      }
      
      if (!sessionEstablished) {
        console.warn('[LOGIN] Session not established after 5 seconds, redirecting anyway...')
      }
      
      console.log('[LOGIN] Forcing session update...')
      // Force session update to ensure cookies are set
      await update()
      
      console.log('[LOGIN] Session updated, redirecting...')
      setIsLoading(false)
      
      // Use router.push instead of window.location to preserve session
      console.log('[LOGIN] Using router.push to /admin/clients')
      router.push('/admin/clients')
      router.refresh()
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

