import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { uploadImage } from '@/lib/cloudinary'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    
    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const fullName = formData.get('fullName') as string
    const phoneWhatsApp = formData.get('phoneWhatsApp') as string
    const expectations = formData.get('expectations') as string
    const piecesOrdered = parseInt(formData.get('piecesOrdered') as string)
    const profilePhotoFile = formData.get('profilePhoto') as File | null

    // Validation
    if (!email || !password || !fullName || !phoneWhatsApp || !expectations) {
      return NextResponse.json(
        { error: 'Tous les champs sont requis' },
        { status: 400 }
      )
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Le mot de passe doit contenir au moins 8 caractères' },
        { status: 400 }
      )
    }

    if (![1, 3, 5, 8].includes(piecesOrdered)) {
      return NextResponse.json(
        { error: 'Nombre de pièces invalide' },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'Cet email est déjà utilisé' },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Upload profile photo to Cloudinary
    let profilePhotoUrl: string | null = null
    if (profilePhotoFile) {
      const arrayBuffer = await profilePhotoFile.arrayBuffer()
      const buffer = Buffer.from(arrayBuffer)
      const uploadResult = await uploadImage(buffer, 'persoshop/profiles')
      profilePhotoUrl = uploadResult.secure_url
    }

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        fullName,
        phoneWhatsApp,
        expectations,
        piecesOrdered,
        profilePhoto: profilePhotoUrl,
        role: 'CLIENT',
      }
    })

    return NextResponse.json(
      { 
        message: 'Compte créé avec succès',
        user: {
          id: user.id,
          email: user.email,
          fullName: user.fullName,
        }
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de la création du compte' },
      { status: 500 }
    )
  }
}

