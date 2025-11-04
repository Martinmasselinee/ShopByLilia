import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { uploadImage } from '@/lib/cloudinary'

export async function POST(request: NextRequest) {
  console.log('[API REGISTER] Request received:', { timestamp: new Date().toISOString() })
  try {
    console.log('[API REGISTER] Parsing formData...')
    const formData = await request.formData()
    console.log('[API REGISTER] FormData parsed')
    
    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const fullName = formData.get('fullName') as string
    const phoneWhatsApp = formData.get('phoneWhatsApp') as string
    const expectations = formData.get('expectations') as string
    const piecesOrdered = parseInt(formData.get('piecesOrdered') as string)
    const profilePhotoFile = formData.get('profilePhoto') as File | null

    console.log('[API REGISTER] Form data extracted:', {
      email,
      fullName,
      phoneWhatsApp,
      hasPassword: !!password,
      passwordLength: password?.length,
      expectationsLength: expectations?.length,
      piecesOrdered,
      hasPhoto: !!profilePhotoFile,
      photoSize: profilePhotoFile?.size,
      photoName: profilePhotoFile?.name
    })

    // Validation
    if (!email || !password || !fullName || !phoneWhatsApp || !expectations) {
      console.error('[API REGISTER] Validation failed: missing fields')
      return NextResponse.json(
        { error: 'Tous les champs sont requis' },
        { status: 400 }
      )
    }

    if (password.length < 8) {
      console.error('[API REGISTER] Validation failed: password too short')
      return NextResponse.json(
        { error: 'Le mot de passe doit contenir au moins 8 caractères' },
        { status: 400 }
      )
    }

    if (![1, 3, 5, 8].includes(piecesOrdered)) {
      console.error('[API REGISTER] Validation failed: invalid piecesOrdered', piecesOrdered)
      return NextResponse.json(
        { error: 'Nombre de pièces invalide' },
        { status: 400 }
      )
    }

    console.log('[API REGISTER] Checking if user exists...')
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      console.error('[API REGISTER] User already exists:', email)
      return NextResponse.json(
        { error: 'Cet email est déjà utilisé' },
        { status: 400 }
      )
    }

    console.log('[API REGISTER] Hashing password...')
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)
    console.log('[API REGISTER] Password hashed')

    // Upload profile photo to Cloudinary
    let profilePhotoUrl: string | null = null
    if (profilePhotoFile) {
      try {
        console.log('[API REGISTER] Uploading photo to Cloudinary...')
        const arrayBuffer = await profilePhotoFile.arrayBuffer()
        const buffer = Buffer.from(arrayBuffer)
        console.log('[API REGISTER] Photo buffer created:', { size: buffer.length })
        const uploadResult = await uploadImage(buffer, 'persoshop/profiles')
        profilePhotoUrl = uploadResult.secure_url
        console.log('[API REGISTER] Photo uploaded successfully:', profilePhotoUrl)
      } catch (uploadError) {
        console.error('[API REGISTER] Photo upload error:', uploadError)
        throw uploadError
      }
    }

    console.log('[API REGISTER] Creating user in database...')
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
    console.log('[API REGISTER] User created successfully:', { id: user.id, email: user.email })

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
    console.error('[API REGISTER] Registration error:', error)
    console.error('[API REGISTER] Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      name: error instanceof Error ? error.name : typeof error
    })
    return NextResponse.json(
      { 
        error: 'Une erreur est survenue lors de la création du compte',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

