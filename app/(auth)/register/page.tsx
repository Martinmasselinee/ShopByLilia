import Link from 'next/link'
import { RegisterForm } from '@/components/auth/RegisterForm'

export default function RegisterPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4 bg-white">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-primary mb-2">
            Créer un compte
          </h1>
          <p className="text-text/80">
            Rejoignez PersoShop et commencez votre shopping personnalisé
          </p>
        </div>

        <RegisterForm />

        <div className="text-center">
          <p className="text-sm text-text/60">
            Déjà un compte ?{' '}
            <Link href="/login" className="text-primary font-medium hover:underline">
              Se connecter
            </Link>
          </p>
        </div>
      </div>
    </main>
  )
}

