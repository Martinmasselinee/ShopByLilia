import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
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

    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const adminOnly = searchParams.get('adminOnly') === 'true'

    let notifications

    // Add timeout to database query
    const queryPromise = (async () => {
    if (session.user.role === 'ADMIN') {
      // Admin sees all notifications or admin-specific ones
        return await prisma.notification.findMany({
        where: adminOnly ? { adminId: { not: null } } : {},
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
              email: true,
              profilePhoto: true,
            }
          }
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: 100,
      })
    } else if (userId && userId === session.user.id) {
      // Client sees only their notifications
        return await prisma.notification.findMany({
        where: { userId },
        orderBy: {
          createdAt: 'desc',
        },
      })
    } else {
        throw new Error('Unauthorized')
      }
    })()
    
    const dbTimeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Database query timeout')), 8000)
    )
    
    notifications = await Promise.race([queryPromise, dbTimeoutPromise])

    return NextResponse.json(notifications)
  } catch (error: any) {
    console.error('Error fetching notifications:', error.message)
    
    if (error.message.includes('timeout')) {
      return NextResponse.json(
        { error: 'Délai de requête dépassé. Veuillez réessayer.' },
        { status: 504 }
      )
    }
    
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })
    }

    return NextResponse.json(
      { error: 'Erreur lors de la récupération des notifications' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)
  
  if (!session?.user) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { userId, adminId, type, message, photoId } = body

    const notification = await prisma.notification.create({
      data: {
        userId: userId || null,
        adminId: adminId || null,
        type,
        message,
        photoId: photoId || null,
      },
    })

    return NextResponse.json(notification, { status: 201 })
  } catch (error) {
    console.error('Error creating notification:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la création de la notification' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: Request) {
  const session = await getServerSession(authOptions)
  
  if (!session?.user) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { id, read } = body

    const notification = await prisma.notification.update({
      where: { id },
      data: { read },
    })

    return NextResponse.json(notification)
  } catch (error) {
    console.error('Error updating notification:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour de la notification' },
      { status: 500 }
    )
  }
}

