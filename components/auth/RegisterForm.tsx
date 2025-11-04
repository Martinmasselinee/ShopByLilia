'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/shared/Button'
import { Input } from '@/components/shared/Input'

interface RegisterData {
  email: string
  password: string
  fullName: string
  phoneWhatsApp: string
  expectations: string
  piecesOrdered: number
  profilePhoto: File | null
}

export function RegisterForm() {
  const router = useRouter()
  const [formData, setFormData] = useState<RegisterData>({
    email: '',
    password: '',
    fullName: '',
    phoneWhatsApp: '',
    expectations: '',
    piecesOrdered: 1,
    profilePhoto: null,
  })
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setFormData({ ...formData, profilePhoto: file })
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const formDataToSend = new FormData()
      formDataToSend.append('email', formData.email)
      formDataToSend.append('password', formData.password)
      formDataToSend.append('fullName', formData.fullName)
      formDataToSend.append('phoneWhatsApp', formData.phoneWhatsApp)
      formDataToSend.append('expectations', formData.expectations)
      formDataToSend.append('piecesOrdered', formData.piecesOrdered.toString())
      if (formData.profilePhoto) {
        formDataToSend.append('profilePhoto', formData.profilePhoto)
      }

      const response = await fetch('/api/auth/register', {
        method: 'POST',
        body: formDataToSend,
      })

      // Check if response is ok before parsing JSON
      if (!response.ok) {
        let errorMessage = 'Une erreur est survenue'
        try {
          const errorData = await response.json()
          errorMessage = errorData.error || errorMessage
        } catch {
          errorMessage = `Erreur ${response.status}: ${response.statusText}`
        }
        setError(errorMessage)
        setIsLoading(false)
        return
      }

      const data = await response.json()

      // Auto-login after registration
      router.push('/client/profile')
    } catch (err) {
      console.error('Registration error:', err)
      setError('Erreur de connexion. Vérifiez votre connexion internet.')
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-md space-y-6">
      <div className="space-y-4">
        <Input
          type="text"
          label="Nom complet"
          value={formData.fullName}
          onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
          required
          placeholder="Jean Dupont"
        />
        <Input
          type="email"
          label="Email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          required
          placeholder="votre@email.com"
          autoComplete="email"
        />
        <Input
          type="password"
          label="Mot de passe"
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          required
          minLength={8}
          placeholder="••••••••"
          autoComplete="new-password"
        />
        <Input
          type="tel"
          label="Numéro WhatsApp"
          value={formData.phoneWhatsApp}
          onChange={(e) => setFormData({ ...formData, phoneWhatsApp: e.target.value })}
          required
          placeholder="+33612345678"
        />
        <div>
          <label className="block text-sm font-medium text-text mb-2">
            Photo de profil
          </label>
          <div className="space-y-2">
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="w-full text-sm text-text file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-primary file:text-white hover:file:opacity-90 cursor-pointer"
              required
            />
            {preview && (
              <img src={preview} alt="Preview" className="w-32 h-32 object-cover rounded-lg" />
            )}
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-text mb-2">
            Vos attentes (3 questions)
          </label>
          <textarea
            value={formData.expectations}
            onChange={(e) => setFormData({ ...formData, expectations: e.target.value })}
            required
            rows={4}
            className="w-full px-4 py-3 rounded-lg border border-accent focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-text bg-white min-h-[44px]"
            placeholder="Décrivez vos attentes en répondant à 3 questions..."
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-text mb-2">
            Commander X pièce(s)
          </label>
          <select
            value={formData.piecesOrdered}
            onChange={(e) => setFormData({ ...formData, piecesOrdered: parseInt(e.target.value) })}
            className="w-full px-4 py-3 rounded-lg border border-accent focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-text bg-white min-h-[44px]"
          >
            <option value={1}>Commander 1 pièce</option>
            <option value={3}>Commander 3 pièces</option>
            <option value={5}>Commander 5 pièces</option>
            <option value={8}>Commander 8 pièces</option>
          </select>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
          {error}
        </div>
      )}

      <Button type="submit" isLoading={isLoading} className="w-full">
        Créer mon compte
      </Button>
    </form>
  )
}

