import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { cloudinary } from '@/lib/cloudinary'

export async function DELETE(
  request: Request,
  { params }: { params: { photoId: string } }
) {
  const session = await getServerSession(authOptions)
  
  if (!session?.user) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
  }

  const { photoId } = params

  try {
    // Get photo to verify ownership
    const photo = await prisma.photo.findUnique({
      where: { id: photoId },
      select: { userId: true, cloudinaryId: true },
    })

    if (!photo) {
      return NextResponse.json(
        { error: 'Photo non trouvée' },
        { status: 404 }
      )
    }

    if (photo.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 403 }
      )
    }

    // Delete from Cloudinary
    try {
      await cloudinary.uploader.destroy(photo.cloudinaryId)
    } catch (error) {
      console.error('Error deleting from Cloudinary:', error)
    }

    // Delete from database
    await prisma.photo.delete({
      where: { id: photoId },
    })

    return NextResponse.json({ message: 'Photo supprimée' })
  } catch (error) {
    console.error('Error deleting photo:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la suppression' },
      { status: 500 }
    )
  }
}

