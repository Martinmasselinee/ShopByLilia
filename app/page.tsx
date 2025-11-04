'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

export default function Home() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e)
    }
    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const handleInstallClick = async () => {
    if (!deferredPrompt) return
    
    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    if (outcome === 'accepted') {
      setDeferredPrompt(null)
    }
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4 bg-white">
      <div className="text-center space-y-8 max-w-md w-full">
        <h1 className="text-4xl md:text-5xl font-bold text-primary">
          PersoShop
        </h1>
        <p className="text-lg text-text/80">
          Votre personal shopper premium
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
          <Link
            href="/register"
            className="px-6 py-3 bg-primary text-white rounded-lg font-medium hover:opacity-90 transition-opacity text-center min-h-[44px] flex items-center justify-center"
          >
            Créer un compte
          </Link>
          <Link
            href="/login"
            className="px-6 py-3 border-2 border-primary text-primary rounded-lg font-medium hover:bg-primary/5 transition-colors text-center min-h-[44px] flex items-center justify-center"
          >
            Se connecter
          </Link>
        </div>

        {deferredPrompt && (
          <button
            onClick={handleInstallClick}
            className="px-6 py-3 bg-accent text-text rounded-lg font-medium hover:bg-accent/80 transition-colors text-center min-h-[44px] w-full"
          >
            Télécharger l&apos;app
          </button>
        )}
        
        <p className="text-sm text-text/60 mt-8">
          {deferredPrompt 
            ? 'Cliquez sur le bouton ci-dessus pour installer l\'app' 
            : 'L\'app sera disponible après installation'}
        </p>
      </div>
    </main>
  )
}
