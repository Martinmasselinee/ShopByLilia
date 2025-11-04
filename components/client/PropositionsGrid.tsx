'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import Image from 'next/image'
import { Button } from '@/components/shared/Button'

interface Proposition {
  id: string
  url: string
  productName: string
  productPrice: string
  productUrl: string
  status: string
  createdAt: string
}

export function PropositionsGrid() {
  const { data: session } = useSession()
  const [propositions, setPropositions] = useState<Proposition[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (session?.user?.id) {
      fetch(`/api/propositions/${session.user.id}`)
        .then(res => res.json())
        .then(data => {
          setPropositions(data)
          setIsLoading(false)
        })
        .catch(err => {
          console.error(err)
          setIsLoading(false)
        })
    }
  }, [session])

  const handleStatusChange = async (propositionId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/propositions/${propositionId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })

      if (response.ok) {
        setPropositions(prev =>
          prev.map(p => p.id === propositionId ? { ...p, status: newStatus } : p)
        )
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
      <h2 className="text-2xl font-semibold text-text">Propositions</h2>

      {propositions.length === 0 && (
        <div className="text-center py-12 text-text/60">
          Aucune proposition pour le moment
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {propositions.map((proposition) => (
          <div key={proposition.id} className="bg-white border border-accent rounded-lg overflow-hidden">
            <div className="relative w-full aspect-square">
              <Image
                src={proposition.url}
                alt={proposition.productName}
                fill
                className="object-cover"
              />
            </div>
            <div className="p-4 space-y-3">
              <h3 className="font-semibold text-text">{proposition.productName}</h3>
              <p className="text-primary font-medium">{proposition.productPrice}</p>
              <a
                href={proposition.productUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full px-4 py-2 bg-primary text-white rounded-lg hover:opacity-90 transition-opacity text-center font-medium min-h-[44px] flex items-center justify-center"
              >
                Voir le produit
              </a>
              <div className="flex flex-col gap-2">
                <Button
                  onClick={() => handleStatusChange(proposition.id, 'REFUSEE')}
                  variant={proposition.status === 'REFUSEE' ? 'primary' : 'outline'}
                  className="w-full text-sm"
                >
                  Refusée
                </Button>
                <Button
                  onClick={() => handleStatusChange(proposition.id, 'INTERESSE')}
                  variant={proposition.status === 'INTERESSE' ? 'primary' : 'outline'}
                  className="w-full text-sm"
                >
                  Intéressé
                </Button>
                <Button
                  onClick={() => handleStatusChange(proposition.id, 'ACHETE')}
                  variant={proposition.status === 'ACHETE' ? 'primary' : 'outline'}
                  className="w-full text-sm"
                >
                  Acheté
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

