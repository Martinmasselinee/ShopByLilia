import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const session = await getServerSession(authOptions)
  
  if (!session?.user) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const adminOnly = searchParams.get('adminOnly') === 'true'

    let notifications

    if (session.user.role === 'ADMIN') {
      // Admin sees all notifications or admin-specific ones
      notifications = await prisma.notification.findMany({
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
      notifications = await prisma.notification.findMany({
        where: { userId },
        orderBy: {
          createdAt: 'desc',
        },
      })
    } else {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })
    }

    return NextResponse.json(notifications)
  } catch (error) {
    console.error('Error fetching notifications:', error)
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

