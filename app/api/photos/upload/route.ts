import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { uploadImage, removeBackground } from '@/lib/cloudinary'

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)
  
  if (!session?.user) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
  }

  try {
    const formData = await request.formData()
    const imageFile = formData.get('image') as File
    const previewOnly = formData.get('previewOnly') === 'true'

    if (!imageFile) {
      return NextResponse.json(
        { error: 'Aucune image fournie' },
        { status: 400 }
      )
    }

    // Upload to Cloudinary
    const arrayBuffer = await imageFile.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    const uploadResult = await uploadImage(buffer, `persoshop/photos/${session.user.id}`)

    // If preview only, return the background removal URL
    if (previewOnly) {
      try {
        const urlWithoutBg = await removeBackground(uploadResult.secure_url)
        return NextResponse.json({
          url: uploadResult.secure_url,
          urlWithoutBg,
        })
      } catch (error) {
        // If background removal fails, return original
        return NextResponse.json({
          url: uploadResult.secure_url,
          urlWithoutBg: uploadResult.secure_url,
        })
      }
    }

    // Remove background
    let urlWithoutBg = uploadResult.secure_url
    try {
      urlWithoutBg = await removeBackground(uploadResult.secure_url)
    } catch (error) {
      console.error('Background removal failed:', error)
      // Continue with original URL if removal fails
    }

    // Save to database
    const photo = await prisma.photo.create({
      data: {
        userId: session.user.id,
        cloudinaryId: uploadResult.public_id,
        url: uploadResult.secure_url,
        urlWithoutBg,
      },
    })

    // Get admin user ID
    const admin = await prisma.user.findFirst({
      where: { role: 'ADMIN' },
      select: { id: true },
    })

    if (admin) {
      // Create notification for admin
      await prisma.notification.create({
        data: {
          userId: session.user.id,
          adminId: admin.id,
          type: 'NEW_PHOTO_UPLOADED',
          message: `Nouvelle photo uploadée par ${session.user.name || 'un client'}`,
          photoId: photo.id,
        },
      })
    }

    return NextResponse.json(photo, { status: 201 })
  } catch (error) {
    console.error('Error uploading photo:', error)
    return NextResponse.json(
      { error: 'Erreur lors de l\'upload de la photo' },
      { status: 500 }
    )
  }
}

