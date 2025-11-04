import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET() {
  console.log('[API /users] GET request received')
  console.log('[API /users] DATABASE_URL configured:', !!process.env.DATABASE_URL)
  console.log('[API /users] DATABASE_URL preview:', process.env.DATABASE_URL?.substring(0, 50) + '...')
  
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
    
    // OPTIMIZED: Get all clients with their photo count AND proposition count in ONE query
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
            propositions: {
              where: {
                status: 'ACHETE'
              }
            }
          }
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    console.log(`[API /users] Found ${clients.length} clients`)
    
    // Transform the data (no additional DB queries needed!)
    const clientsWithProgress = clients.map((client) => ({
      ...client,
      photosCount: client._count.photos,
      piecesPurchased: client._count.propositions,
      piecesProgress: `${client._count.propositions}/${client.piecesOrdered}`,
    }))

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

