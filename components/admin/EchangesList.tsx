'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import Image from 'next/image'

interface Client {
  id: string
  fullName: string
  email: string
  profilePhoto: string | null
  photosCount: number
  lastActivity: string
}

export function EchangesList() {
  const { data: session, status } = useSession()
  const [clients, setClients] = useState<Client[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Wait for session to be loaded before fetching
    if (status === 'loading') {
      return
    }

    if (!session) {
      setIsLoading(false)
      return
    }

    fetch('/api/users')
      .then(res => res.json())
      .then(data => {
        setClients(data.map((c: any) => ({
          id: c.id,
          fullName: c.fullName,
          email: c.email,
          profilePhoto: c.profilePhoto,
          photosCount: c.photosCount,
          lastActivity: new Date().toISOString(), // TODO: Get actual last activity
        })))
        setIsLoading(false)
      })
      .catch(err => {
        console.error(err)
        setIsLoading(false)
      })
  }, [session, status])

  if (isLoading) {
    return <div className="text-center py-8">Chargement...</div>
  }

  return (
    <div className="w-full">
      <h2 className="text-2xl font-semibold text-text mb-6">Échanges</h2>
      
      {/* Desktop Grid */}
      <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {clients.map((client) => (
          <Link
            key={client.id}
            href={`/admin/echanges/${client.id}`}
            className="bg-white border border-accent rounded-lg p-6 hover:shadow-lg transition-shadow cursor-pointer"
          >
            <div className="flex items-center space-x-4 mb-4">
              {client.profilePhoto ? (
                <Image
                  src={client.profilePhoto}
                  alt={client.fullName}
                  width={60}
                  height={60}
                  className="rounded-full"
                />
              ) : (
                <div className="w-15 h-15 bg-accent rounded-full flex items-center justify-center">
                  <span className="text-xl font-semibold text-text">
                    {client.fullName.charAt(0)}
                  </span>
                </div>
              )}
              <div>
                <h3 className="font-semibold text-text">{client.fullName}</h3>
                <p className="text-sm text-text/60">{client.email}</p>
              </div>
            </div>
            <div className="text-sm text-text/80">
              <p>{client.photosCount} photo(s) uploadée(s)</p>
            </div>
          </Link>
        ))}
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-4">
        {clients.map((client) => (
          <Link
            key={client.id}
            href={`/admin/echanges/${client.id}`}
            className="block bg-white border border-accent rounded-lg p-4 hover:bg-accent/30 transition-colors"
          >
            <div className="flex items-center space-x-3">
              {client.profilePhoto ? (
                <Image
                  src={client.profilePhoto}
                  alt={client.fullName}
                  width={50}
                  height={50}
                  className="rounded-full"
                />
              ) : (
                <div className="w-12 h-12 bg-accent rounded-full flex items-center justify-center">
                  <span className="text-lg font-semibold text-text">
                    {client.fullName.charAt(0)}
                  </span>
                </div>
              )}
              <div className="flex-1">
                <h3 className="font-semibold text-text">{client.fullName}</h3>
                <p className="text-sm text-text/60">{client.photosCount} photo(s)</p>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {clients.length === 0 && (
        <div className="text-center py-12 text-text/60">
          Aucun échange pour le moment
        </div>
      )}
    </div>
  )
}

