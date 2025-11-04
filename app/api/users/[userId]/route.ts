import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { uploadImage } from '@/lib/cloudinary'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  const session = await getServerSession(authOptions)
  
  if (!session?.user) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
  }

  const { userId } = await params

  if (session.user.id !== userId) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        fullName: true,
        phoneWhatsApp: true,
        profilePhoto: true,
        expectations: true,
        piecesOrdered: true,
      },
    })

    if (!user) {
      return NextResponse.json({ error: 'Utilisateur non trouvé' }, { status: 404 })
    }

    return NextResponse.json(user)
  } catch (error) {
    console.error('Error fetching user:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des données' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  const session = await getServerSession(authOptions)
  
  if (!session?.user) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
  }

  const { userId } = await params

  if (session.user.id !== userId) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })
  }

  try {
    const formData = await request.formData()
    const expectations = formData.get('expectations') as string
    const piecesOrdered = formData.get('piecesOrdered') ? parseInt(formData.get('piecesOrdered') as string) : undefined
    const profilePhotoFile = formData.get('profilePhoto') as File | null

    // Get current user to check if piecesOrdered changed
    const currentUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { piecesOrdered: true, fullName: true },
    })

    let profilePhotoUrl: string | undefined = undefined
    if (profilePhotoFile) {
      const arrayBuffer = await profilePhotoFile.arrayBuffer()
      const buffer = Buffer.from(arrayBuffer)
      const uploadResult = await uploadImage(buffer, 'persoshop/profiles')
      profilePhotoUrl = uploadResult.secure_url
    }

    const updateData: any = {}
    if (expectations) updateData.expectations = expectations
    if (piecesOrdered !== undefined) updateData.piecesOrdered = piecesOrdered
    if (profilePhotoUrl) updateData.profilePhoto = profilePhotoUrl

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
    })

    // If piecesOrdered changed, notify admin
    if (piecesOrdered !== undefined && currentUser && piecesOrdered !== currentUser.piecesOrdered) {
      const admin = await prisma.user.findFirst({
        where: { role: 'ADMIN' },
        select: { id: true },
      })

      if (admin) {
        await prisma.notification.create({
          data: {
            userId,
            adminId: admin.id,
            type: 'PIECES_ORDER_UPDATED',
            message: `${currentUser.fullName} a modifié sa commande: ${piecesOrdered} pièce(s)`,
          },
        })
      }
    }

    return NextResponse.json(updatedUser)
  } catch (error) {
    console.error('Error updating user:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour' },
      { status: 500 }
    )
  }
}

