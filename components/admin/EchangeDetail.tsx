'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import Image from 'next/image'
import Link from 'next/link'
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

interface ClientInfo {
  id: string
  fullName: string
  email: string
  phoneWhatsApp: string
  profilePhoto: string | null
  piecesOrdered: number
  photosCount: number
  piecesPurchased: number
  piecesProgress: string
}

interface EchangeDetailProps {
  userId: string
}

export function EchangeDetail({ userId }: EchangeDetailProps) {
  const { data: session, status } = useSession()
  const [clientInfo, setClientInfo] = useState<ClientInfo | null>(null)
  const [photos, setPhotos] = useState<Photo[]>([])
  const [propositions, setPropositions] = useState<Proposition[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Wait for session to be loaded before fetching
    if (status === 'loading') {
      return
    }

    if (!session) {
      setIsLoading(false)
      return
    }

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 15000) // 15 second total timeout

    Promise.all([
      fetch(`/api/users`, { signal: controller.signal }).then(res => res.json()),
      fetch(`/api/photos/${userId}`, { signal: controller.signal }).then(res => res.json()),
      fetch(`/api/propositions/${userId}`, { signal: controller.signal }).then(res => res.json()),
    ])
      .then(([usersData, photosData, propositionsData]) => {
        clearTimeout(timeoutId)
        
        // Find the specific client from users data
        const client = Array.isArray(usersData) 
          ? usersData.find((u: ClientInfo) => u.id === userId)
          : null
        
        if (client) {
          setClientInfo(client)
        }
        
        setPhotos(Array.isArray(photosData) ? photosData : [])
        setPropositions(Array.isArray(propositionsData) ? propositionsData : [])
        setIsLoading(false)
      })
      .catch(err => {
        clearTimeout(timeoutId)
        console.error('Error fetching exchange data:', err)
        setError(err.name === 'AbortError' ? 'Délai dépassé' : 'Erreur de chargement')
        setIsLoading(false)
      })
  }, [userId, session, status])

  if (isLoading) {
    return <div className="text-center py-8">Chargement...</div>
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500 mb-4">{error}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="px-4 py-2 bg-primary text-white rounded-lg"
        >
          Réessayer
        </button>
      </div>
    )
  }

  return (
    <div className="w-full space-y-8">
      {/* Client Info Header */}
      {clientInfo && (
        <div className="bg-white border border-accent rounded-lg p-6">
          <div className="flex items-center space-x-4">
            {clientInfo.profilePhoto && (
              <Image
                src={clientInfo.profilePhoto}
                alt={clientInfo.fullName}
                width={80}
                height={80}
                className="rounded-full"
              />
            )}
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-text">{clientInfo.fullName}</h2>
              <p className="text-text/60">{clientInfo.email}</p>
              <a
                href={`https://wa.me/${clientInfo.phoneWhatsApp.replace(/\D/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline text-sm"
              >
                {clientInfo.phoneWhatsApp}
              </a>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-primary">{clientInfo.piecesProgress}</div>
              <p className="text-sm text-text/60">Pièces commandées</p>
              <p className="text-xs text-text/60 mt-1">{clientInfo.photosCount} photo(s) uploadée(s)</p>
            </div>
          </div>
        </div>
      )}
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

