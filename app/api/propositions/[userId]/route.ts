import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET(
  request: Request,
  { params }: { params: { userId: string } }
) {
  const session = await getServerSession(authOptions)
  
  if (!session?.user) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
  }

  const { userId } = params

  // Only the user themselves can view their propositions
  if (session.user.id !== userId) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })
  }

  try {
    const propositions = await prisma.proposition.findMany({
      where: { userId },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json(propositions)
  } catch (error) {
    console.error('Error fetching propositions:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des propositions' },
      { status: 500 }
    )
  }
}

