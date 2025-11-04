import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { uploadImage } from '@/lib/cloudinary'

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)
  
  if (!session?.user) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
  }

  if (session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })
  }

  try {
    const formData = await request.formData()
    const userId = formData.get('userId') as string
    const productName = formData.get('productName') as string
    const productPrice = formData.get('productPrice') as string
    const productUrl = formData.get('productUrl') as string
    const photoFile = formData.get('photo') as File

    if (!userId || !productName || !productPrice || !productUrl || !photoFile) {
      return NextResponse.json(
        { error: 'Tous les champs sont requis' },
        { status: 400 }
      )
    }

    // Upload photo to Cloudinary
    const arrayBuffer = await photoFile.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    const uploadResult = await uploadImage(buffer, `persoshop/propositions/${userId}`)

    // Get admin user ID
    const admin = await prisma.user.findFirst({
      where: { role: 'ADMIN' },
      select: { id: true },
    })

    if (!admin) {
      return NextResponse.json(
        { error: 'Admin non trouvé' },
        { status: 500 }
      )
    }

    // Create proposition
    const proposition = await prisma.proposition.create({
      data: {
        userId,
        adminId: admin.id,
        cloudinaryId: uploadResult.public_id,
        url: uploadResult.secure_url,
        productName,
        productPrice,
        productUrl,
      },
    })

    // Create notification for client
    await prisma.notification.create({
      data: {
        userId,
        adminId: admin.id,
        type: 'PROPOSITION_RESPONSE',
        message: `Nouvelle proposition: ${productName}`,
      },
    })

    return NextResponse.json(proposition, { status: 201 })
  } catch (error) {
    console.error('Error creating proposition:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la création de la proposition' },
      { status: 500 }
    )
  }
}

