'use client'

import { useState } from 'react'
import { Button } from '@/components/shared/Button'
import { Input } from '@/components/shared/Input'

interface PropositionUploadProps {
  userId: string
  onUpload: () => void
}

export function PropositionUpload({ userId, onUpload }: PropositionUploadProps) {
  const [formData, setFormData] = useState({
    productName: '',
    productPrice: '',
    productUrl: '',
    photo: null as File | null,
  })
  const [preview, setPreview] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setFormData({ ...formData, photo: file })
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

    if (!formData.photo || !formData.productName || !formData.productPrice || !formData.productUrl) {
      setError('Tous les champs sont requis')
      setIsLoading(false)
      return
    }

    try {
      const formDataToSend = new FormData()
      formDataToSend.append('userId', userId)
      formDataToSend.append('productName', formData.productName)
      formDataToSend.append('productPrice', formData.productPrice)
      formDataToSend.append('productUrl', formData.productUrl)
      formDataToSend.append('photo', formData.photo)

      const response = await fetch('/api/propositions', {
        method: 'POST',
        body: formDataToSend,
      })

      if (!response.ok) {
        const data = await response.json()
        setError(data.error || 'Une erreur est survenue')
        setIsLoading(false)
        return
      }

      // Reset form
      setFormData({
        productName: '',
        productPrice: '',
        productUrl: '',
        photo: null,
      })
      setPreview(null)
      onUpload()
    } catch (err) {
      setError('Une erreur est survenue')
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 border border-accent rounded-lg bg-white">
      <h3 className="text-lg font-semibold text-text">Ajouter une proposition</h3>
      
      <div>
        <label className="block text-sm font-medium text-text mb-2">
          Photo du produit
        </label>
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="w-full text-sm text-text file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-primary file:text-white hover:file:opacity-90 cursor-pointer"
          required
        />
        {preview && (
          <div className="mt-2 relative w-full max-w-xs aspect-square rounded-lg overflow-hidden">
            <img src={preview} alt="Preview" className="w-full h-full object-cover" />
          </div>
        )}
      </div>

      <Input
        type="text"
        label="Nom du produit"
        value={formData.productName}
        onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
        required
        placeholder="Ex: Robe Zara"
      />

      <Input
        type="text"
        label="Prix"
        value={formData.productPrice}
        onChange={(e) => setFormData({ ...formData, productPrice: e.target.value })}
        required
        placeholder="Ex: 49,90 €"
      />

      <Input
        type="url"
        label="Lien d'achat"
        value={formData.productUrl}
        onChange={(e) => setFormData({ ...formData, productUrl: e.target.value })}
        required
        placeholder="https://www.zara.com/..."
      />

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
          {error}
        </div>
      )}

      <Button type="submit" isLoading={isLoading} className="w-full">
        Envoyer la proposition
      </Button>
    </form>
  )
}

