import Link from 'next/link'
import { LoginForm } from '@/components/auth/LoginForm'

export default function LoginPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4 bg-white">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-primary mb-2">
            Connexion
          </h1>
          <p className="text-text/80">
            Connectez-vous à votre compte PersoShop
          </p>
        </div>

        <LoginForm />

        <div className="text-center">
          <p className="text-sm text-text/60">
            Pas encore de compte ?{' '}
            <Link href="/register" className="text-primary font-medium hover:underline">
              Créer un compte
            </Link>
          </p>
        </div>
      </div>
    </main>
  )
}

