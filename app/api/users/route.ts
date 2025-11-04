import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
  }

  if (session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })
  }

  try {
    // Get all clients with their photo count and pieces progress
    const clients = await prisma.user.findMany({
      where: { role: 'CLIENT' },
      select: {
        id: true,
        email: true,
        fullName: true,
        phoneWhatsApp: true,
        piecesOrdered: true,
        profilePhoto: true,
        _count: {
          select: {
            photos: true,
          }
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    // Calculate pieces progress (X/Y) for each client
    const clientsWithProgress = await Promise.all(
      clients.map(async (client) => {
        const purchasedCount = await prisma.proposition.count({
          where: {
            userId: client.id,
            status: 'ACHETE',
          },
        })

        return {
          ...client,
          photosCount: client._count.photos,
          piecesProgress: `${purchasedCount}/${client.piecesOrdered}`,
          piecesPurchased: purchasedCount,
        }
      })
    )

    return NextResponse.json(clientsWithProgress)
  } catch (error) {
    console.error('Error fetching clients:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des clients' },
      { status: 500 }
    )
  }
}

