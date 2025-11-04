import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { prisma } from './prisma'

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        console.log('[AUTH AUTHORIZE] Starting authorization...')
        console.log('[AUTH] authorize called:', { 
          email: credentials?.email, 
          hasPassword: !!credentials?.password,
          timestamp: new Date().toISOString()
        })
        
        if (!credentials?.email || !credentials?.password) {
          console.error('[AUTH] Missing credentials')
          return null
        }

        try {
          console.log('[AUTH] Searching for user in database...')
          console.log('[AUTH] DATABASE_URL configured:', !!process.env.DATABASE_URL)
          console.log('[AUTH] NEXTAUTH_SECRET configured:', !!process.env.NEXTAUTH_SECRET)
          
          // Query user directly - Prisma will handle connection pooling
          const user = await prisma.user.findUnique({
            where: { email: credentials.email }
          })

          if (!user) {
            console.error('[AUTH] User not found:', credentials.email)
            return null
          }

          console.log('[AUTH] User found:', { id: user.id, email: user.email, role: user.role })
          console.log('[AUTH] Comparing password...')
          console.log('[AUTH] Password provided length:', credentials.password.length)
          console.log('[AUTH] Stored password hash length:', user.password.length)
          console.log('[AUTH] Stored password hash preview:', user.password.substring(0, 20) + '...')
          
          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            user.password
          )

          console.log('[AUTH] Password comparison result:', isPasswordValid)

          if (!isPasswordValid) {
            console.error('[AUTH] Invalid password - hash does not match provided password')
            console.error('[AUTH] Expected password from env:', process.env.ADMIN_PASSWORD ? 'SET' : 'NOT SET')
            return null
          }

          console.log('[AUTH] Password valid, returning user')
          return {
            id: user.id,
            email: user.email,
            name: user.fullName,
            role: user.role,
          }
        } catch (error) {
          console.error('[AUTH] authorize error:', error)
          return null
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role
        token.id = user.id
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user = {
          ...session.user,
          role: token.role as 'ADMIN' | 'CLIENT',
          id: token.id as string,
        }
      }
      return session
    }
  },
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development',
  useSecureCookies: process.env.NEXTAUTH_URL?.startsWith('https://'),
  cookies: {
    sessionToken: {
      name: `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NEXTAUTH_URL?.startsWith('https://') ?? false,
      },
    },
  },
}

