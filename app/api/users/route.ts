import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET() {
  console.log('[API /users] GET request received')
  
  const session = await getServerSession(authOptions)
  console.log('[API /users] Session:', {
    hasSession: !!session,
    hasUser: !!session?.user,
    role: session?.user?.role,
    email: session?.user?.email
  })
  
  if (!session?.user) {
    console.error('[API /users] No session found - returning 401')
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
  }

  if (session.user.role !== 'ADMIN') {
    console.error('[API /users] Not admin role - returning 403')
    return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })
  }

  try {
    console.log('[API /users] Fetching clients from database...')
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

    console.log(`[API /users] Found ${clients.length} clients`)
    
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

    console.log(`[API /users] Returning ${clientsWithProgress.length} clients with progress`)
    return NextResponse.json(clientsWithProgress)
  } catch (error) {
    console.error('Error fetching clients:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des clients' },
      { status: 500 }
    )
  }
}

