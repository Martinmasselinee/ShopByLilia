'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/shared/Button'
import { Input } from '@/components/shared/Input'
import Image from 'next/image'

export function ProfileForm() {
  const { data: session, status } = useSession()
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phoneWhatsApp: '',
    expectations: '',
    piecesOrdered: 1,
    profilePhoto: null as string | null,
  })
  const [preview, setPreview] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    // Wait for session to be loaded before fetching
    if (status === 'loading') {
      return
    }

    if (!session?.user?.id) {
      setIsLoading(false)
      return
    }

    fetch(`/api/users/${session.user.id}`)
      .then(res => res.json())
      .then(data => {
        setFormData({
          fullName: data.fullName,
          email: data.email,
          phoneWhatsApp: data.phoneWhatsApp,
          expectations: data.expectations,
          piecesOrdered: data.piecesOrdered,
          profilePhoto: data.profilePhoto,
        })
        setIsLoading(false)
      })
      .catch(err => {
        console.error(err)
        setIsLoading(false)
      })
  }, [session, status])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
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
    setSuccess('')
    setIsSaving(true)

    try {
      const formDataToSend = new FormData()
      formDataToSend.append('expectations', formData.expectations)
      formDataToSend.append('piecesOrdered', formData.piecesOrdered.toString())
      
      if (preview) {
        // Convert preview back to File
        const response = await fetch(preview)
        const blob = await response.blob()
        const file = new File([blob], 'profile.jpg', { type: 'image/jpeg' })
        formDataToSend.append('profilePhoto', file)
      }

      const response = await fetch(`/api/users/${session?.user?.id}`, {
        method: 'PUT',
        body: formDataToSend,
      })

      if (!response.ok) {
        const data = await response.json()
        setError(data.error || 'Une erreur est survenue')
        setIsSaving(false)
        return
      }

      setSuccess('Profil mis à jour avec succès')
      setIsSaving(false)
      if (preview) {
        setFormData({ ...formData, profilePhoto: preview })
        setPreview(null)
      }
    } catch (err) {
      setError('Une erreur est survenue')
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return <div className="text-center py-8">Chargement...</div>
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
      <div className="space-y-4">
        <Input
          type="text"
          label="Nom complet"
          value={formData.fullName}
          readOnly
          className="bg-accent/30"
        />
        <Input
          type="email"
          label="Email"
          value={formData.email}
          readOnly
          className="bg-accent/30"
        />
        <Input
          type="tel"
          label="Numéro WhatsApp"
          value={formData.phoneWhatsApp}
          readOnly
          className="bg-accent/30"
        />

        <div>
          <label className="block text-sm font-medium text-text mb-2">
            Photo de profil
          </label>
          <div className="flex items-center space-x-4">
            {formData.profilePhoto && !preview && (
              <Image
                src={formData.profilePhoto}
                alt="Profile"
                width={100}
                height={100}
                className="rounded-full object-cover"
              />
            )}
            {preview && (
              <Image
                src={preview}
                alt="Preview"
                width={100}
                height={100}
                className="rounded-full object-cover"
              />
            )}
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="text-sm text-text file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-primary file:text-white hover:file:opacity-90 cursor-pointer"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-text mb-2">
            Vos attentes
          </label>
          <textarea
            value={formData.expectations}
            onChange={(e) => setFormData({ ...formData, expectations: e.target.value })}
            rows={4}
            className="w-full px-4 py-3 rounded-lg border border-accent focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-text bg-white min-h-[44px]"
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

      {success && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-green-600 text-sm">
          {success}
        </div>
      )}

      <Button type="submit" isLoading={isSaving}>
        Enregistrer les modifications
      </Button>
    </form>
  )
}

