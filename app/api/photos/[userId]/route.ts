import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  const session = await getServerSession(authOptions)
  
  if (!session?.user) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
  }

  const { userId } = await params

  // Only admin or the user themselves can view photos
  if (session.user.role !== 'ADMIN' && session.user.id !== userId) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })
  }

  try {
    const photos = await prisma.photo.findMany({
      where: { userId },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json(photos)
  } catch (error) {
    console.error('Error fetching photos:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des photos' },
      { status: 500 }
    )
  }
}

