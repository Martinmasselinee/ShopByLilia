'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import Image from 'next/image'
import { PhotoUpload } from './PhotoUpload'
import { Button } from '@/components/shared/Button'

interface Photo {
  id: string
  url: string
  urlWithoutBg: string
  createdAt: string
}

export function PhotosGrid() {
  const { data: session, status } = useSession()
  const [photos, setPhotos] = useState<Photo[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showUpload, setShowUpload] = useState(false)

  const fetchPhotos = () => {
    if (session?.user?.id) {
      fetch(`/api/photos/${session.user.id}`)
        .then(res => res.json())
        .then(data => {
          setPhotos(data)
          setIsLoading(false)
        })
        .catch(err => {
          console.error(err)
          setIsLoading(false)
        })
    }
  }

  useEffect(() => {
    // Wait for session to be loaded before fetching
    if (status === 'loading') {
      return
    }

    if (!session) {
      setIsLoading(false)
      return
    }

    fetchPhotos()
  }, [session, status])

  const handleDelete = async (photoId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette photo ?')) {
      return
    }

    try {
      const response = await fetch(`/api/photos/${photoId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        fetchPhotos()
      }
    } catch (err) {
      console.error(err)
    }
  }

  if (isLoading) {
    return <div className="text-center py-8">Chargement...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold text-text">Mes Pièces</h2>
        <Button
          onClick={() => setShowUpload(!showUpload)}
          className="min-h-[44px]"
        >
          {showUpload ? 'Annuler' : 'Uploader une photo'}
        </Button>
      </div>

      {showUpload && (
        <PhotoUpload onUploadComplete={() => {
          fetchPhotos()
          setShowUpload(false)
        }} />
      )}

      {photos.length === 0 && !showUpload && (
        <div className="text-center py-12 text-text/60">
          <p className="mb-4">Aucune photo uploadée</p>
          <Button onClick={() => setShowUpload(true)}>
            Uploader ma première photo
          </Button>
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {photos.map((photo) => (
          <div key={photo.id} className="relative group aspect-square rounded-lg overflow-hidden">
            <Image
              src={photo.urlWithoutBg || photo.url}
              alt="Photo"
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <button
                onClick={() => handleDelete(photo.id)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors min-h-[44px]"
              >
                Supprimer
              </button>
            </div>
            <div className="absolute bottom-2 left-2 text-xs text-white bg-black/50 px-2 py-1 rounded">
              {new Date(photo.createdAt).toLocaleDateString('fr-FR')}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
