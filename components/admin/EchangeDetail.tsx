'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { PropositionUpload } from './PropositionUpload'

interface Photo {
  id: string
  url: string
  urlWithoutBg: string
  createdAt: string
}

interface Proposition {
  id: string
  url: string
  productName: string
  productPrice: string
  productUrl: string
  status: string
  createdAt: string
}

interface EchangeDetailProps {
  userId: string
}

export function EchangeDetail({ userId }: EchangeDetailProps) {
  const [photos, setPhotos] = useState<Photo[]>([])
  const [propositions, setPropositions] = useState<Proposition[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch(`/api/photos/${userId}`).then(res => res.json()),
      fetch(`/api/propositions/${userId}`).then(res => res.json()),
    ])
      .then(([photosData, propositionsData]) => {
        setPhotos(photosData)
        setPropositions(propositionsData)
        setIsLoading(false)
      })
      .catch(err => {
        console.error(err)
        setIsLoading(false)
      })
  }, [userId])

  if (isLoading) {
    return <div className="text-center py-8">Chargement...</div>
  }

  return (
    <div className="w-full space-y-8">
      {/* Mobile: Stacked Layout */}
      <div className="md:hidden space-y-8">
        {/* Client Photos */}
        <div>
          <h2 className="text-2xl font-semibold text-text mb-4">Photos du client</h2>
          <div className="grid grid-cols-2 gap-4">
            {photos.map((photo) => (
              <div key={photo.id} className="relative aspect-square rounded-lg overflow-hidden">
                <Image
                  src={photo.urlWithoutBg || photo.url}
                  alt="Photo client"
                  fill
                  className="object-cover"
                />
              </div>
            ))}
          </div>
          {photos.length === 0 && (
            <p className="text-text/60 text-center py-8">Aucune photo uploadée</p>
          )}
        </div>

        {/* Admin Propositions */}
        <div>
          <h2 className="text-2xl font-semibold text-text mb-4">Mes propositions</h2>
          <div className="space-y-4">
            {propositions.map((proposition) => (
              <div key={proposition.id} className="border border-accent rounded-lg p-4">
                <div className="relative w-full aspect-square mb-4 rounded-lg overflow-hidden">
                  <Image
                    src={proposition.url}
                    alt={proposition.productName}
                    fill
                    className="object-cover"
                  />
                </div>
                <h3 className="font-semibold text-text mb-2">{proposition.productName}</h3>
                <p className="text-primary font-medium mb-2">{proposition.productPrice}</p>
                <a
                  href={proposition.productUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full px-4 py-2 bg-primary text-white rounded-lg hover:opacity-90 transition-opacity text-center mb-2 min-h-[44px] flex items-center justify-center"
                >
                  Voir le produit
                </a>
                <p className="text-sm text-text/60">
                  Statut: <span className="font-medium">{proposition.status}</span>
                </p>
              </div>
            ))}
          </div>
          {propositions.length === 0 && (
            <p className="text-text/60 text-center py-8">Aucune proposition pour le moment</p>
          )}
        </div>

        {/* Upload Form */}
        <PropositionUpload userId={userId} onUpload={() => {
          fetch(`/api/propositions/${userId}`)
            .then(res => res.json())
            .then(data => setPropositions(data))
        }} />
      </div>

      {/* Desktop: Side-by-side Layout */}
      <div className="hidden md:grid md:grid-cols-2 gap-8">
        {/* Left: Client Photos */}
        <div>
          <h2 className="text-2xl font-semibold text-text mb-4">Photos du client</h2>
          <div className="grid grid-cols-2 gap-4">
            {photos.map((photo) => (
              <div key={photo.id} className="relative aspect-square rounded-lg overflow-hidden">
                <Image
                  src={photo.urlWithoutBg || photo.url}
                  alt="Photo client"
                  fill
                  className="object-cover"
                />
              </div>
            ))}
          </div>
          {photos.length === 0 && (
            <p className="text-text/60 text-center py-8">Aucune photo uploadée</p>
          )}
        </div>

        {/* Right: Admin Propositions */}
        <div>
          <h2 className="text-2xl font-semibold text-text mb-4">Mes propositions</h2>
          <div className="space-y-4 mb-6">
            {propositions.map((proposition) => (
              <div key={proposition.id} className="border border-accent rounded-lg p-4">
                <div className="relative w-full aspect-square mb-4 rounded-lg overflow-hidden">
                  <Image
                    src={proposition.url}
                    alt={proposition.productName}
                    fill
                    className="object-cover"
                  />
                </div>
                <h3 className="font-semibold text-text mb-2">{proposition.productName}</h3>
                <p className="text-primary font-medium mb-2">{proposition.productPrice}</p>
                <a
                  href={proposition.productUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full px-4 py-2 bg-primary text-white rounded-lg hover:opacity-90 transition-opacity text-center mb-2 min-h-[44px] flex items-center justify-center"
                >
                  Voir le produit
                </a>
                <p className="text-sm text-text/60">
                  Statut: <span className="font-medium">{proposition.status}</span>
                </p>
              </div>
            ))}
          </div>
          {propositions.length === 0 && (
            <p className="text-text/60 text-center py-8">Aucune proposition pour le moment</p>
          )}

          {/* Upload Form */}
          <PropositionUpload userId={userId} onUpload={() => {
            fetch(`/api/propositions/${userId}`)
              .then(res => res.json())
              .then(data => setPropositions(data))
          }} />
        </div>
      </div>
    </div>
  )
}

