import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET() {
  console.log('[API USER] Request received:', { timestamp: new Date().toISOString() })
  
  try {
    console.log('[API USER] Getting server session...')
    const session = await getServerSession(authOptions)
    console.log('[API USER] Session:', { 
      hasSession: !!session, 
      hasUser: !!session?.user, 
      email: session?.user?.email,
      role: (session?.user as any)?.role
    })
    
    if (!session?.user?.email) {
      console.error('[API USER] No session or email')
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    console.log('[API USER] Fetching user from database...')
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
      }
    })

    if (!user) {
      console.error('[API USER] User not found in database:', session.user.email)
      return NextResponse.json({ error: 'Utilisateur non trouvé' }, { status: 404 })
    }

    console.log('[API USER] User found:', { id: user.id, email: user.email, role: user.role })
    return NextResponse.json(user)
  } catch (error) {
    console.error('[API USER] Error:', error)
    console.error('[API USER] Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    })
    return NextResponse.json(
      { error: 'Erreur serveur', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

