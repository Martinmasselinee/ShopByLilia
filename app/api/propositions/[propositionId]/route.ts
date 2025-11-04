import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function PATCH(
  request: Request,
  { params }: { params: { propositionId: string } }
) {
  const session = await getServerSession(authOptions)
  
  if (!session?.user) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
  }

  const { propositionId } = params

  try {
    const body = await request.json()
    const { status } = body

    if (!['REFUSEE', 'INTERESSE', 'ACHETE'].includes(status)) {
      return NextResponse.json(
        { error: 'Statut invalide' },
        { status: 400 }
      )
    }

    // Get proposition to verify ownership
    const proposition = await prisma.proposition.findUnique({
      where: { id: propositionId },
      select: { userId: true },
    })

    if (!proposition) {
      return NextResponse.json(
        { error: 'Proposition non trouvée' },
        { status: 404 }
      )
    }

    if (proposition.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 403 }
      )
    }

    // Update proposition status
    const updatedProposition = await prisma.proposition.update({
      where: { id: propositionId },
      data: { status },
    })

    // Get admin user ID
    const admin = await prisma.user.findFirst({
      where: { role: 'ADMIN' },
      select: { id: true },
    })

    if (admin) {
      // Create notification for admin
      const statusMessages = {
        REFUSEE: 'a refusé',
        INTERESSE: 'est intéressé(e) par',
        ACHETE: 'a acheté',
      }

      await prisma.notification.create({
        data: {
          userId: session.user.id,
          adminId: admin.id,
          type: 'PROPOSITION_RESPONSE',
          message: `Client ${statusMessages[status as keyof typeof statusMessages]} la proposition: ${updatedProposition.productName}`,
          photoId: propositionId,
        },
      })
    }

    return NextResponse.json(updatedProposition)
  } catch (error) {
    console.error('Error updating proposition:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour de la proposition' },
      { status: 500 }
    )
  }
}

