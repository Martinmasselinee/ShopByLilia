import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    // Add timeout for session check
    const sessionPromise = getServerSession(authOptions)
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Session timeout')), 5000)
    )
    
    const session = await Promise.race([sessionPromise, timeoutPromise]) as any
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const { userId } = await params

    // Only admin or the user themselves can view photos
    if (session.user.role !== 'ADMIN' && session.user.id !== userId) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })
    }

    // Add timeout to database query
    const queryPromise = prisma.photo.findMany({
      where: { userId },
      orderBy: {
        createdAt: 'desc',
      },
    })
    
    const dbTimeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Database query timeout')), 8000)
    )
    
    const photos = await Promise.race([queryPromise, dbTimeoutPromise])

    return NextResponse.json(photos)
  } catch (error: any) {
    console.error('Error fetching photos:', error.message)
    
    if (error.message.includes('timeout')) {
      return NextResponse.json(
        { error: 'Délai de requête dépassé. Veuillez réessayer.' },
        { status: 504 }
      )
    }
    
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des photos' },
      { status: 500 }
    )
  }
}

