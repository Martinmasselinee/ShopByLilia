'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'

interface Client {
  id: string
  email: string
  fullName: string
  phoneWhatsApp: string
  photosCount: number
  piecesProgress: string
  piecesPurchased: number
  piecesOrdered: number
  profilePhoto: string | null
}

export function ClientsTable() {
  const [clients, setClients] = useState<Client[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    console.log('[ClientsTable] Fetching clients from /api/users...')
    fetch('/api/users')
      .then(async res => {
        console.log('[ClientsTable] Response status:', res.status)
        const data = await res.json()
        console.log('[ClientsTable] Response data:', data)
        
        if (!res.ok) {
          console.error('[ClientsTable] API error:', data)
          setIsLoading(false)
          return
        }
        
        console.log(`[ClientsTable] Received ${data.length} clients`)
        setClients(data)
        setIsLoading(false)
      })
      .catch(err => {
        console.error('[ClientsTable] Fetch error:', err)
        setIsLoading(false)
      })
  }, [])

  if (isLoading) {
    return <div className="text-center py-8">Chargement...</div>
  }

  // Mobile: Card view
  // Desktop: Table view
  return (
    <div className="w-full">
      {/* Desktop Table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-accent">
              <th className="text-left py-4 px-4 font-semibold text-text">Client</th>
              <th className="text-left py-4 px-4 font-semibold text-text">Email</th>
              <th className="text-left py-4 px-4 font-semibold text-text">WhatsApp</th>
              <th className="text-left py-4 px-4 font-semibold text-text">Photos</th>
              <th className="text-left py-4 px-4 font-semibold text-text">Progression</th>
              <th className="text-left py-4 px-4 font-semibold text-text">Action</th>
            </tr>
          </thead>
          <tbody>
            {clients.map((client) => (
              <tr key={client.id} className="border-b border-accent hover:bg-accent/30">
                <td className="py-4 px-4">
                  <div className="flex items-center space-x-3">
                    {client.profilePhoto && (
                      <Image
                        src={client.profilePhoto}
                        alt={client.fullName}
                        width={40}
                        height={40}
                        className="rounded-full"
                      />
                    )}
                    <span className="font-medium">{client.fullName}</span>
                  </div>
                </td>
                <td className="py-4 px-4 text-text/80">{client.email}</td>
                <td className="py-4 px-4">
                  <a
                    href={`https://wa.me/${client.phoneWhatsApp.replace(/\D/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    {client.phoneWhatsApp}
                  </a>
                </td>
                <td className="py-4 px-4">{client.photosCount}</td>
                <td className="py-4 px-4 font-semibold">{client.piecesProgress}</td>
                <td className="py-4 px-4">
                  <Link
                    href={`/admin/echanges/${client.id}`}
                    className="px-4 py-2 bg-primary text-white rounded-lg hover:opacity-90 transition-opacity min-h-[44px] flex items-center justify-center"
                  >
                    Voir l&apos;échange
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-4">
        {clients.map((client) => (
          <div key={client.id} className="bg-white border border-accent rounded-lg p-4 space-y-3">
            <div className="flex items-center space-x-3">
              {client.profilePhoto && (
                <Image
                  src={client.profilePhoto}
                  alt={client.fullName}
                  width={50}
                  height={50}
                  className="rounded-full"
                />
              )}
              <div className="flex-1">
                <h3 className="font-semibold text-text">{client.fullName}</h3>
                <p className="text-sm text-text/60">{client.email}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-text/60">Photos: </span>
                <span className="font-medium">{client.photosCount}</span>
              </div>
              <div>
                <span className="text-text/60">Progression: </span>
                <span className="font-semibold">{client.piecesProgress}</span>
              </div>
            </div>
            <a
              href={`https://wa.me/${client.phoneWhatsApp.replace(/\D/g, '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="block text-sm text-primary hover:underline"
            >
              {client.phoneWhatsApp}
            </a>
            <Link
              href={`/admin/echanges/${client.id}`}
              className="block w-full px-4 py-3 bg-primary text-white rounded-lg hover:opacity-90 transition-opacity text-center font-medium min-h-[44px] flex items-center justify-center"
            >
              Voir l&apos;échange
            </Link>
          </div>
        ))}
      </div>

      {clients.length === 0 && (
        <div className="text-center py-12 text-text/60">
          Aucun client pour le moment
        </div>
      )}
    </div>
  )
}

